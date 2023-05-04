import { Octokit } from '@octokit/rest';
import { isBefore, isAfter, subDays, format, parse } from 'date-fns';
import { load } from "ts-dotenv";
import { formatEvent } from './events';
import { groupBy } from './group';
import { nl } from 'date-fns/locale';
import { EventType } from './types';
import parseLinkHeader from "parse-link-header";

const env = load({
    GH_TOKEN: String,
    GH_USERNAME: String
});

const main = async ({ days, to_date }: { days ?: number, to_date?: Date }) => {
    days = days ?? 1;

    const to = to_date ?? new Date();
    const from = subDays(new Date(to).setHours(0, 0, 0, 0), Math.max(days - 1, 0));

    let last: Date|null = null;
    let data: EventType[] = [];
    let page = 1;
    let last_page = Number.MAX_SAFE_INTEGER;

    while((last === null || last > from) && page <= last_page) {
        const response = await new Octokit({
            auth: env.GH_TOKEN, 
        }).request('GET /users/{username}/events', {
            username: env.GH_USERNAME,
            per_page: 100,
            page: page++,
        });
    
        last = new Date(response.data[response.data.length - 1].created_at ?? '');
        last_page = parseInt(parseLinkHeader(response.headers.link)?.last?.page ?? String(last_page));
        data = [
            ...data,
            ...response.data,
        ];
    }

    const events = data.filter(event => 
        event.created_at 
        && isBefore(new Date(event.created_at), to)
        && isAfter(new Date(event.created_at), from)
    ).map(formatEvent).filter(Boolean);

    const grouped = groupBy<typeof events[0]>(
        events,
        (event) => event?.timestamp ? format(new Date(event?.timestamp), 'yyyy-MM-dd', {locale: nl}) : ''
    );
    for (const group of Object.values(grouped)) {
        console.table(group);
    }
};

const days = parseInt(process.argv[2] ?? 1);

if (isNaN(days)) {
    throw new Error('Parameter 1 (days) is not an integer');
}

const input_date = process.argv[3] ?? undefined;
const to_date = input_date !== undefined ?
    parse(input_date, 'yyyy-MM-dd', new Date()) :
    input_date;

void main({ days: days, to_date: to_date });