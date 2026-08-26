# Project Instructions

## Delivery policy

For every feature or fix:

1. Check existing GitHub issues first. Reuse a matching issue, or create one before implementation.
2. Work on a dedicated feature or fix branch.
3. Write tests first. Maintain unit and integration coverage, plus Playwright end-to-end tests for user-facing flows.
4. Run all relevant validation and tests.
5. Open a pull request linked to the issue.
6. Deploy to a testing environment before QA.
7. When ready, notify the configured product Slack channel and tag the configured QA people.

Never guess unavailable integrations, credentials, deployment environments, the product Slack channel, or the QA roster. Report what is unavailable and the resulting blocked delivery step.

Keep the domain core framework-agnostic. Browser, terminal, database, and hosted-service details belong behind ports or in separate adapters. The sibling NoteDude PWA is read-only from this project.
