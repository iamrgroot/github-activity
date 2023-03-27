import { Octokit } from '@octokit/rest';
import { isBefore, isAfter, subDays } from 'date-fns';
import { load } from "ts-dotenv";
import { formatEvent } from './events';

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
    });

    const from = subDays(new Date().setHours(0, 0, 0, 0), Math.max(days - 1, 0));
    const to = new Date();

    const events = data.data.filter(event => 
        event.created_at 
        && isBefore(new Date(event.created_at), to)
        && isAfter(new Date(event.created_at), from)
    );

    console.table(events.map(formatEvent).filter(Boolean));
};

void main({
    days: parseInt(process.argv[2] ?? 1)
});