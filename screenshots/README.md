# Feature screenshots

Captured from the locally running app connected to Supabase, using desktop Chrome (1440 × 1000) and mobile viewport (390 × 844). Full-page images can be taller than the viewport.

| Screenshot | Feature |
| --- | --- |
| [01-overview.png](01-overview.png) | Dashboard, summary metrics, featured poll, activity |
| [02-poll-templates.png](02-poll-templates.png) | Templates, editable question, category, deadline, options |
| [03-live-voting.png](03-live-voting.png) | Recorded vote and changed vote, live percentages |
| [04-saved-polls.png](04-saved-polls.png) | Saved collection |
| [05-shared-poll.png](05-shared-poll.png) | Direct poll link |
| [06-my-polls.png](06-my-polls.png) | Polls created in this browser |
| [07-vote-history.png](07-vote-history.png) | Voted collection |
| [08-closed-results.png](08-closed-results.png) | Closed poll with disabled voting |
| [09-leaderboard.png](09-leaderboard.png) | Contributor rankings |
| [10-insights.png](10-insights.png) | Category distribution and participation metrics |
| [11-activity.png](11-activity.png) | Activity and closing alerts |
| [12-mobile-overview.png](12-mobile-overview.png) | Mobile dashboard and display name |
| [13-mobile-polls.png](13-mobile-polls.png) | Mobile poll creation and collections |
| [14-mobile-activity.png](14-mobile-activity.png) | Mobile activity |
| [15-search-empty-state.png](15-search-empty-state.png) | Search with no matches |

[results-example.json](results-example.json) was downloaded through the results button. Gemini generation is not configured and is not represented as a working feature in these captures.

Regenerate with `npm run verify:features` while the local server is running. Each run creates and closes a labeled verification poll; it does not delete workspace records.
