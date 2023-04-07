import { Octokit } from '@octokit/rest';
import { isBefore, isAfter, subDays, format } from 'date-fns';
import { load } from "ts-dotenv";
import { formatEvent } from './events';
import { groupBy } from './group';
import { nl } from 'date-fns/locale';

const env = load({
    GH_TOKEN: String,
    GH_USERNAME: String
});

const main = async ({ days }: { days ?: number }) => {
    days = days ?? 1;

    const data = await new Octokit({
        auth: env.GH_TOKEN, 
    }).request('GET /users/{username}/events', {
        username: env.GH_USERNAME,
        per_page: 100,
    });

    const from = subDays(new Date().setHours(0, 0, 0, 0), Math.max(days - 1, 0));
    const to = new Date();

    const events = data.data.filter(event => 
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

void main({ days: days });