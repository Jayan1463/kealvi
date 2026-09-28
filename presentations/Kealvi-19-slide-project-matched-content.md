# Kealvi Project-Matched PPT Content

This version keeps the 19-slide academic structure from the supplied PPT text and aligns the claims with the current Kealvi source code.

## Slide 1 - Title

**COIMBATORE INSTITUTE OF TECHNOLOGY**  
(Government Aided Autonomous Institution Affiliated to Anna University)  
COIMBATORE - 641014

**Design and Implementation of Web Applications**

**Project Title:** Kealvi - Live Polling Workspace  
**Name:** M. Mrithyunjayan  
**Register No.:** 2403717610421033  
**Branch:** B.E. Computer Science  
**Institution:** Coimbatore Institute of Technology, Coimbatore  
**Live Link:** https://kealvi-beta.vercel.app

## Slide 2 - Agenda

1. Introduction
2. Problem Statement
3. Objectives of the Proposed System
4. Tech Stack
5. System Architecture
6. Database Design
7. Modules
8. Implementation and Screenshots
9. Results and Discussion
10. Conclusion and Future Scope

## Slide 3 - Introduction

Kealvi is a live polling and audience engagement web platform developed as an academic project.

It allows a host to publish a poll quickly and lets participants vote from the same browser-based workspace.

Each poll contains a question, optional context, category, answer options, vote-change setting and optional closing time.

The platform includes an optional Google Gemini integration that can draft a poll question and answer options from a short topic entered by the host.

Results update after voting, after publishing and through a 15-second client refresh, so viewers can follow poll activity during a session.

Kealvi is built with Next.js, React and Supabase PostgreSQL, with server-side API routes handling validation and database access.

## Slide 4 - Problem Statement

Live sessions, lectures and events need a quick way to collect audience opinion while the session is still running.

Manual feedback methods such as show-of-hands and chat messages are difficult to count, compare and preserve for later review.

Organisers need poll results, participation history and category-level summaries in one place rather than scattered across separate tools.

Drafting a balanced poll question can take time, especially when the organiser needs clear options quickly.

Many lightweight polling workflows do not include saved polls, shareable poll links or exportable results.

## Slide 5 - Objectives of the Proposed System

1. To build a poll workspace where users can compose, publish, vote on and close polls.
2. To show vote counts and percentage bars for every answer option.
3. To support optional vote changes while a poll remains open.
4. To provide an optional Google Gemini draft assistant for poll questions and answer options.
5. To provide overview metrics, leaderboard ranking, category insights and an activity feed.
6. To support All, My polls, Voted and Saved collections, with search, status filters and sorting.
7. To support direct poll links and JSON result downloads.
8. To deliver a responsive interface for desktop and mobile browsers.

## Slide 6 - Tech Stack

**Frontend**

- Next.js 16 and React 19
- Client components for the interactive poll workspace
- Tailwind CSS setup with custom responsive CSS
- Browser localStorage for display identity and saved polls

**Backend**

- Next.js Route Handlers for poll creation, voting, closing and AI drafts
- Server-side validation for poll data, vote state and duplicate questions
- Supabase service role access kept on the server

**Database**

- Supabase PostgreSQL
- Tables for `polls`, `poll_options` and `poll_votes`
- Indexes for created date, status, expiry, category and duplicate poll titles

**AI Layer**

- Optional Google Gemini API
- `GEMINI_API_KEY` and `GEMINI_MODEL` configured through environment variables
- Manual poll creation and templates work without Gemini

**Hosting and Tooling**

- Vercel deployment
- Git and GitHub for version control
- ESLint, Next.js build checks and Playwright feature verification

## Slide 7 - System Architecture

**Browser UI**

The user interacts with the dashboard, composer, poll cards, leaderboard, insights and activity tabs.

**Next.js Application**

The page loads workspace data on the server, then the client dashboard refreshes and handles user actions.

**API Routes**

Route handlers process poll creation, voting, closing and Gemini draft requests.

**Supabase PostgreSQL**

The database stores polls, answer options and votes. Browser calls do not access the database directly.

**Google Gemini API**

The AI draft route calls Gemini only when the API key is configured and the user requests a draft.

**Browser Storage**

The browser stores a local voter ID, display name and saved poll IDs. These do not sync across devices.

## Slide 8 - Database Design

**polls**

- `id` - UUID primary key
- `title` - poll question
- `description` - optional context
- `creator_name`, `creator_id`
- `category`, `status`
- `allow_vote_changes`
- `expires_at`, `closed_at`, `created_at`

**poll_options**

- `id` - UUID primary key
- `poll_id` - foreign key to `polls`
- `label` - option text
- `position` - display order

**poll_votes**

- `id` - UUID primary key
- `poll_id` - foreign key to `polls`
- `option_id` - foreign key to `poll_options`
- `voter_id`, `voter_name`
- `created_at`, `updated_at`

**Relationships and Rules**

One poll has many options and many votes.

One browser voter can have only one vote per poll.

A database trigger checks that a vote's option belongs to the same poll.

Saved polls are not a database table in this project. They are stored in browser localStorage for the current browser.

## Slide 9 - Modules

**Poll Composer Module**

- Question, context, category and closing time
- Two to eight distinct answer options
- Templates for Team check-in, Feature priority and Session feedback
- Toggle for allowing participants to change their vote

**Voting Module**

- One-choice voting on open polls
- Vote counts and percentage bars
- Optional vote change while the poll is open
- Manual close action for polls created in the same browser

**Poll Library Module**

- All polls, My polls, Voted and Saved collections
- Search by question, category or creator
- Status filter and sorting by newest, most votes or closing soon
- Save, copy link and download results actions

**AI Assistant Module**

- Gemini draft topic entered by the host
- Generated question and answer options filled into the composer
- Draft remains editable before publishing
- Manual creation remains available when Gemini is not configured

**Leaderboard, Insights and Activity Module**

- Five points per poll created and one point per named vote
- Votes per poll, open rate, top category and named people
- Category response distribution
- Recent publishes, votes and polls nearing expiry

## Slide 10 - Implementation: Workspace Overview

- Summary cards report active polls, total responses, named participants and poll library size.
- The momentum panel highlights the poll with the highest vote count.
- The activity list shows recent poll and vote signals.
- The display name is stored in the browser and attached to created polls and votes.

The screenshot should show:

- Active polls
- Total responses
- Participants
- Poll library
- Most active poll
- Activity feed

## Slide 11 - Implementation: Poll Composer

- Templates pre-fill a question and answer options for common scenarios.
- The Gemini draft field sends a short topic to the server-side AI route.
- Category and closing time are selected before publishing.
- Options can be added or removed before publishing, with a minimum of two and a maximum of eight.
- The vote-change toggle controls whether a participant can update their vote later.

The screenshot should show:

- Team check-in template
- Feature priority template
- Session feedback template
- AI draft topic
- Generate with Gemini
- Question field
- Context field
- Category
- Voting closing time
- Answer options
- Allow participants to change their vote
- Publish poll

## Slide 12 - Implementation: Live Voting and Results

- A recorded vote shows a confirmation message and refreshes the workspace data.
- Each option displays an absolute vote count and a rounded percentage.
- Open polls accept votes until they are manually closed or reach their expiry time.
- Closed polls keep their final result distribution visible.
- The creator can close a poll from the same browser that created it.

The screenshot should show:

- All polls
- My polls
- Voted
- Saved
- Search
- Status filter
- Sorting
- Save
- Copy link
- Download results
- Close poll

## Slide 13 - Implementation: Poll Library and Filters

**Tabs, search and filters**

**Empty state for a query with no match**

- Four collections organize the library into All polls, My polls, Voted and Saved.
- Search matches poll text, category and creator name.
- Status and sort controls help users find relevant polls.
- A dedicated empty state appears when a filter or query returns no polls.
- The workspace currently loads the newest 100 polls.

The empty-state screenshot should show:

**No polls found**

"Try a different filter or publish the first poll."

## Slide 14 - Results: Leaderboard and Insights

**Leaderboard**

- Five points per poll created plus one point per named vote.
- Poll and vote counts are shown beside each contributor's score.
- Anonymous votes do not increase a named contributor's score.

**Insights**

- Votes per poll
- Open rate
- Top category votes
- Named people
- Response distribution across categories

The screenshot can show example leaderboard and insight values from the current verification data.

## Slide 15 - Results: Activity and Alerts

- The activity feed is generated from current poll and vote data.
- It shows recent publish and vote activity with relative timestamps.
- It also surfaces active polls that are close to expiry.
- The overview page shows a shorter version of the same activity feed.

This is not an immutable audit-log table in the database. It is a dashboard feed derived from the loaded polls and votes.

The screenshot can show activity such as:

- Workspace verification - voted
- Workspace verification - poll published
- Fav food - voted
- Fav food - poll published
- Which feature should we ship next? - voted
- Which feature should we ship next? - poll published

## Slide 16 - Responsive Mobile Interface

**Overview**

**Poll room**

**Activity**

- The desktop sidebar becomes a horizontal tab bar on narrow screens.
- Summary cards stack vertically.
- Composer, voting controls and filters reflow into a single column.
- Percentage bars and vote counts remain readable on mobile.
- The same deployed web application works on desktop and mobile browsers.

The slide can use three mobile screenshots for Overview, Polls and Activity.

## Slide 17 - Use Cases

**Classrooms and Lectures**

Quick comprehension checks and topic preference polls, with results visible during the session.

**Product Teams**

Feature prioritisation and design decisions captured as recorded votes.

**Meetings and Reviews**

Consensus captured quickly, with JSON results available for follow-up notes.

**Conferences and Events**

Session feedback collected from attendees using their own phones.

**Team Culture Check-ins**

Weekly sentiment polls reviewed through the Insights dashboard.

**Community and Clubs**

Lightweight decisions such as event dates or topic choices, with a leaderboard to encourage named participation.

## Slide 18 - Conclusion and Future Scope

**Conclusion**

Kealvi delivers a working live polling workspace covering poll creation, voting, results, search, collections and analytics.

AI-assisted drafting reduces the effort needed to create a clear poll, while keeping the final question editable.

The Leaderboard and Insights views turn raw vote data into a readable picture of participation.

The interface is responsive and requires no installation.

**Future Scope**

- WebSocket or Supabase Realtime updates so results change without client polling.
- Authenticated accounts and private team workspaces.
- Additional question types such as ranking, rating scales and open text.
- Quiz mode with scored answers and timed rounds.
- Scheduled polls and reminders.
- Cross-device saved polls after account support is added.

## Slide 19 - Thank You

**THANK YOU**

