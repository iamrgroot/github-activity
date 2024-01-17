import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods"
import { components } from "@octokit/openapi-types/types"

export type Actitivy = {
    timestamp: string|null,
    repo: string,
    action: string,
    reference: string,
}

// Add missing types from Oktocit
export type EventType = RestEndpointMethodTypes["activity"]["listEventsForAuthenticatedUser"]["response"]['data'][0]

export type PullRequestEvent = EventType & {
    pull_request: components["schemas"]["pull-request-simple"]
}
export type ReviewEvent = EventType & {
    pull_request: components["schemas"]["pull-request"],
    review: components["schemas"]["pull-request-review"]
}
export type IssueEvent = EventType & {
    issue: components["schemas"]["issue"]
}
export type BranchEvent = EventType &  components["schemas"]["git-ref"];
export type ReleaseEvent = EventType & {
    release: components["schemas"]["release"]
};
export type GollumEvent = EventType & {
    pages: components["schemas"]["webhook-gollum"]["pages"],
}
