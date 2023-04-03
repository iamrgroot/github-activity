import {
    Actitivy,
    IssueEvent,
    PullRequestEvent,
    BranchEvent,
    ReviewEvent,
    EventType,
    ReleaseEvent,
} from './types'
import { nl } from 'date-fns/locale';
import { format } from 'date-fns';

export const formatEvent = (event: EventType): Actitivy|null => {
    let action = 'TODO';
    let reference = event.type ?? event.id;
    let payload = null;

    switch (event.type) {
        case 'PullRequestEvent':
            action = `pull request ${event.payload.action}`;
            reference = (event.payload as PullRequestEvent).pull_request.title;
            break;
        case 'IssuesEvent':
            action = `issue ${event.payload.action}`;
            reference = (event.payload as IssueEvent).issue.title;
            break;
        case 'IssueCommentEvent':
            action = `comment ${event.payload.action}`;
            reference = (event.payload as IssueEvent).issue.title;
            break;
        case 'PushEvent':
            action = 'branch pushed';
            reference = (event.payload as BranchEvent).ref;
            break;
        case 'CreateEvent':
            action = 'branch created';
            reference = (event.payload as BranchEvent).ref;
            break;
        case 'DeleteEvent':
            action = 'branch deleted';
            reference = (event.payload as BranchEvent).ref;
            break;
        case 'PullRequestReviewEvent':
            payload = (event.payload as ReviewEvent);
            action = 'pr ' + payload.review.state;
            reference = payload.pull_request.title;
            break;
        case 'PullRequestReviewCommentEvent':
            payload = (event.payload as ReviewEvent);
            action = 'pr comment';
            reference = payload.pull_request.title;
            break;
        case 'ReleaseEvent':
            payload = (event.payload as ReleaseEvent);
            action = 'released';
            reference = payload.release.tag_name;
            break;
        case 'WatchEvent':
            return null;
        case 'PublicEvent':
            return null;
        case 'ForkEvent':
            return null;
        default:
            console.log(event);
    }

    return {
        timestamp: event.created_at ? format(new Date(event.created_at), 'yyyy-MM-dd HH:mm:ss', {locale: nl}) : '',
        repo: event.repo.name,
        action: action,
        reference: reference,
    };
};