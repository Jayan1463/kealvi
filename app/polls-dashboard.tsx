"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Poll, WorkspaceData } from "@/lib/polls";

type Tab = "overview" | "polls" | "leaderboard" | "insights" | "activity";
const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "polls", label: "Polls" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "insights", label: "Insights" },
  { id: "activity", label: "Activity" },
];
const categories = ["General", "Product", "Engineering", "Culture", "Learning", "Fun"];

function getIdentity() {
  let voterId = localStorage.getItem("kealvi_voter_id");
  if (!voterId) {
    voterId = crypto.randomUUID();
    localStorage.setItem("kealvi_voter_id", voterId);
  }
  return voterId;
}

function relativeTime(value: string) {
  const delta = new Date(value).getTime() - Date.now();
  const minutes = Math.round(Math.abs(delta) / 60000);
  if (minutes < 60) return delta > 0 ? `in ${minutes}m` : `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return delta > 0 ? `in ${hours}h` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  return delta > 0 ? `in ${days}d` : `${days}d ago`;
}

export default function PollsDashboard({ initialData }: { initialData: WorkspaceData }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const voterId = useRef("");

  async function refresh() {
    if (!voterId.current) return;
    const response = await fetch(`/api/polls?voterId=${encodeURIComponent(voterId.current)}`, {
      cache: "no-store",
    });
    if (response.ok) setData(await response.json());
  }

  useEffect(() => {
    voterId.current = getIdentity();
    const savedName = localStorage.getItem("kealvi_name") ?? "";
    const hydrationTimer = window.setTimeout(() => setName(savedName), 0);
    void refresh();
    const interval = window.setInterval(() => void refresh(), 15000);
    return () => {
      window.clearTimeout(hydrationTimer);
      window.clearInterval(interval);
    };
  }, []);

  function saveName(value: string) {
    setName(value);
    localStorage.setItem("kealvi_name", value);
  }

  const filteredPolls = useMemo(() => {
    const lowered = query.toLowerCase();
    return data.polls
      .filter((poll) => status === "all" || poll.status === status)
      .filter(
        (poll) =>
          poll.title.toLowerCase().includes(lowered) ||
          poll.category.toLowerCase().includes(lowered) ||
          poll.creatorName.toLowerCase().includes(lowered)
      )
      .sort((a, b) => {
        if (sort === "popular") return b.totalVotes - a.totalVotes;
        if (sort === "closing") {
          return (a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity) -
            (b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [data.polls, query, status, sort]);

  async function vote(poll: Poll, optionId: string) {
    if (!data.configured) {
      setNotice("Connect Supabase to enable real voting. Demo results are read-only.");
      return;
    }
    setBusy(poll.id);
    const response = await fetch(`/api/polls/${poll.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        optionId,
        voterId: voterId.current,
        voterName: name,
      }),
    });
    const result = await response.json();
    setNotice(response.ok ? "Vote recorded. Results are live." : result.error);
    await refresh();
    setBusy(null);
  }

  async function close(poll: Poll) {
    setBusy(poll.id);
    const response = await fetch(`/api/polls/${poll.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", creatorId: voterId.current }),
    });
    const result = await response.json();
    setNotice(response.ok ? "Poll closed." : result.error);
    await refresh();
    setBusy(null);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">K</div>
        <nav aria-label="Primary navigation">
          {tabs.map((item) => (
            <button
              key={item.id}
              className={`side-button ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
              title={item.label}
            >
              <span>{item.id === "overview" ? "⌂" : item.id === "polls" ? "▤" : item.id === "leaderboard" ? "◇" : item.id === "insights" ? "⌁" : "◉"}</span>
            </button>
          ))}
        </nav>
        <div className={`connection-dot ${data.configured ? "online" : ""}`} title={data.configured ? "Supabase connected" : "Demo mode"} />
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Live audience workspace</p>
            <h1>Kealvi</h1>
          </div>
          <div className="topbar-actions">
            <label className="identity-field">
              <span>Your display name</span>
              <input value={name} onChange={(event) => saveName(event.target.value)} placeholder="Anonymous" />
            </label>
            <button className="primary-button" onClick={() => setTab("polls")}>+ Create poll</button>
          </div>
        </header>

        <div className="mobile-tabs">
          {tabs.map((item) => (
            <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        {!data.configured && (
          <div className="setup-banner">
            <strong>Demo mode</strong>
            <span>Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run `supabase/schema.sql` to enable persistence.</span>
          </div>
        )}
        {notice && <button className="notice" onClick={() => setNotice(null)}>{notice}<span>×</span></button>}

        {tab === "overview" && <Overview data={data} openPolls={() => setTab("polls")} />}
        {tab === "polls" && (
          <PollsPanel
            data={data}
            polls={filteredPolls}
            query={query}
            setQuery={setQuery}
            status={status}
            setStatus={setStatus}
            sort={sort}
            setSort={setSort}
            name={name}
            voterId={voterId}
            busy={busy}
            vote={vote}
            close={close}
            refresh={refresh}
            notify={setNotice}
          />
        )}
        {tab === "leaderboard" && <Leaderboard data={data} />}
        {tab === "insights" && <Insights data={data} />}
        {tab === "activity" && <Activity data={data} />}
      </section>
    </main>
  );
}

function Overview({ data, openPolls }: { data: WorkspaceData; openPolls: () => void }) {
  const topPoll = [...data.polls].sort((a, b) => b.totalVotes - a.totalVotes)[0];
  return (
    <div className="content-stack">
      <section className="hero-card">
        <div>
          <span className="live-pill"><i /> Live now</span>
          <h2>Turn every opinion into a clear next move.</h2>
          <p>Create focused polls, watch results update, and understand what your audience cares about.</p>
          <button className="light-button" onClick={openPolls}>Launch a poll</button>
        </div>
        <div className="hero-visual">
          <div className="pulse-ring ring-one" />
          <div className="pulse-ring ring-two" />
          <div className="pulse-core">{data.metrics.totalVotes}<small>votes</small></div>
        </div>
      </section>
      <section className="metric-grid">
        <Metric label="Active polls" value={data.metrics.activePolls} change="Open for voting" />
        <Metric label="Total responses" value={data.metrics.totalVotes} change={`${data.metrics.engagement} avg. per poll`} />
        <Metric label="Participants" value={data.metrics.participants} change="Named contributors" />
        <Metric label="Poll library" value={data.metrics.totalPolls} change="All-time polls" />
      </section>
      <section className="split-grid">
        <div className="panel overview-panel featured-panel">
          <div className="panel-heading"><div><p className="eyebrow">Momentum</p><h3>Most active poll</h3></div><span className="tag">Trending</span></div>
          {topPoll ? <PollCard poll={topPoll} busy={false} vote={() => {}} close={() => {}} preview /> : <EmptyState />}
        </div>
        <div className="panel overview-panel activity-summary">
          <div className="panel-heading"><div><p className="eyebrow">Latest signals</p><h3>Activity feed</h3></div></div>
          <ActivityList items={data.activity.slice(0, 5)} />
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, change }: { label: string; value: number; change: string }) {
  return <article className="metric-card"><span>{label}</span><strong>{value}</strong><small>{change}</small></article>;
}

function PollsPanel(props: {
  data: WorkspaceData;
  polls: Poll[];
  query: string;
  setQuery: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  sort: string;
  setSort: (value: string) => void;
  name: string;
  voterId: React.MutableRefObject<string>;
  busy: string | null;
  vote: (poll: Poll, optionId: string) => void;
  close: (poll: Poll) => void;
  refresh: () => Promise<void>;
  notify: (message: string) => void;
}) {
  const [showComposer, setShowComposer] = useState(true);
  return (
    <div className="content-stack">
      <div className="section-title">
        <div><p className="eyebrow">Create, vote, decide</p><h2>Poll room</h2></div>
        <button className="secondary-button" onClick={() => setShowComposer(!showComposer)}>{showComposer ? "Hide composer" : "+ New poll"}</button>
      </div>
      {showComposer && <PollComposer {...props} />}
      <div className="filter-row">
        <input value={props.query} onChange={(e) => props.setQuery(e.target.value)} placeholder="Search polls, categories, or creators…" />
        <select value={props.status} onChange={(e) => props.setStatus(e.target.value)}><option value="all">All status</option><option value="active">Active</option><option value="closed">Closed</option></select>
        <select value={props.sort} onChange={(e) => props.setSort(e.target.value)}><option value="newest">Newest</option><option value="popular">Most votes</option><option value="closing">Closing soon</option></select>
      </div>
      <div className="poll-grid">
        {props.polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} busy={props.busy === poll.id} vote={(optionId) => props.vote(poll, optionId)} close={() => props.close(poll)} canClose={poll.creatorId === props.voterId.current} />
        ))}
      </div>
      {!props.polls.length && <EmptyState />}
    </div>
  );
}

function PollComposer(props: {
  data: WorkspaceData;
  name: string;
  voterId: React.MutableRefObject<string>;
  refresh: () => Promise<void>;
  notify: (message: string) => void;
}) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("24");
  const [allowChanges, setAllowChanges] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    const expiresAt = duration === "none" ? null : new Date(Date.now() + Number(duration) * 3600000).toISOString();
    const response = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, category, options, allowVoteChanges: allowChanges, expiresAt, creatorName: props.name, creatorId: props.voterId.current }),
    });
    const result = await response.json();
    props.notify(response.ok ? "Poll published and ready for votes." : result.error);
    if (response.ok) {
      setTitle(""); setDescription(""); setOptions(["", ""]);
      await props.refresh();
    }
    setSubmitting(false);
  }

  async function generateDraft() {
    setAiLoading(true);
    const response = await fetch("/api/ai/poll-draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: aiTopic, category }),
    });
    const result = await response.json();
    if (response.ok) {
      setTitle(result.draft.title);
      setDescription(result.draft.description);
      setCategory(result.draft.category);
      setOptions(result.draft.options);
      props.notify("AI draft added to the composer.");
    } else {
      props.notify(result.error ?? "Could not generate an AI draft.");
    }
    setAiLoading(false);
  }

  return (
    <section className="composer panel">
      <div className="composer-head"><div><span className="composer-icon">+</span><div><h3>Start a new poll</h3><p>Ask one clear question and offer distinct choices.</p></div></div><span className="tag">{props.data.configured ? "Database ready" : "Setup required"}</span></div>
      <div className="ai-draft">
        <label><span>AI draft topic</span><input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Example: next workshop topic for students" maxLength={180} /></label>
        <button className="secondary-button" disabled={aiLoading || aiTopic.trim().length < 3} onClick={generateDraft}>{aiLoading ? "Drafting..." : "Generate with Gemini"}</button>
      </div>
      <div className="form-grid">
        <label className="wide"><span>Question</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What should we prioritize next?" maxLength={180} /></label>
        <label className="wide"><span>Context <em>optional</em></span><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add a little context to help people choose…" maxLength={500} /></label>
        <label><span>Category</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Voting closes</span><select value={duration} onChange={(e) => setDuration(e.target.value)}><option value="1">In 1 hour</option><option value="24">In 24 hours</option><option value="72">In 3 days</option><option value="168">In 1 week</option><option value="none">No deadline</option></select></label>
        <div className="wide option-editor">
          <span>Answer options</span>
          {options.map((option, index) => <div className="option-input" key={index}><b>{String.fromCharCode(65 + index)}</b><input value={option} onChange={(e) => setOptions((current) => current.map((item, i) => i === index ? e.target.value : item))} placeholder={`Option ${index + 1}`} /><button onClick={() => options.length > 2 && setOptions((current) => current.filter((_, i) => i !== index))} disabled={options.length <= 2}>×</button></div>)}
          {options.length < 8 && <button className="text-button" onClick={() => setOptions((current) => [...current, ""])}>+ Add another option</button>}
        </div>
      </div>
      <div className="composer-footer"><label className="check-row"><input type="checkbox" checked={allowChanges} onChange={(e) => setAllowChanges(e.target.checked)} /><span>Allow participants to change their vote</span></label><button className="primary-button" disabled={submitting || !title.trim() || options.filter((item) => item.trim()).length < 2} onClick={submit}>{submitting ? "Publishing…" : "Publish poll"}</button></div>
    </section>
  );
}

function PollCard({ poll, busy, vote, close, canClose = false, preview = false }: { poll: Poll; busy: boolean; vote: (optionId: string) => void; close: () => void; canClose?: boolean; preview?: boolean }) {
  const closed = poll.status === "closed";
  return (
    <article className={`poll-card ${closed ? "closed" : ""} ${preview ? "preview-card" : ""}`}>
      <div className="poll-meta"><div><span className="category-dot" />{poll.category}</div><span>{closed ? "Closed" : poll.expiresAt ? `Closes ${relativeTime(poll.expiresAt)}` : "No deadline"}</span></div>
      <h3>{poll.title}</h3>
      {poll.description && <p>{poll.description}</p>}
      <div className="option-list">
        {poll.options.map((option) => {
          const selected = poll.viewerVoteOptionId === option.id;
          return (
            <button key={option.id} disabled={closed || busy || preview} className={`result-option ${selected ? "selected" : ""}`} onClick={() => vote(option.id)}>
              <span className="result-fill" style={{ width: `${option.percentage}%` }} />
              <span className="option-copy"><i>{selected ? "✓" : ""}</i><b>{option.label}</b></span>
              <span className="option-score"><b>{option.percentage}%</b><small>{option.votes} votes</small></span>
            </button>
          );
        })}
      </div>
      <footer><span>By {poll.creatorName} · {poll.totalVotes} total votes</span>{canClose && !closed && <button className="text-button danger" onClick={close}>Close poll</button>}</footer>
    </article>
  );
}

function Leaderboard({ data }: { data: WorkspaceData }) {
  return <div className="content-stack"><div className="section-title"><div><p className="eyebrow">Community energy</p><h2>Leaderboard</h2><p>Five points per poll created, plus one point per named vote.</p></div></div><div className="leaderboard panel">{data.leaderboard.map((person, index) => <div className="leader-row" key={person.name}><span className={`rank rank-${index + 1}`}>{index + 1}</span><div className="avatar">{person.name.slice(0, 2).toUpperCase()}</div><div className="leader-name"><b>{person.name}</b><small>{person.pollsCreated} polls · {person.votesCast} votes</small></div><strong>{person.score}<small> pts</small></strong></div>)}</div></div>;
}

function Insights({ data }: { data: WorkspaceData }) {
  const maxVotes = Math.max(...data.categories.map((item) => item.votes), 1);
  return <div className="content-stack"><div className="section-title"><div><p className="eyebrow">Decision intelligence</p><h2>Insights</h2><p>See where attention and participation are concentrated.</p></div></div><section className="metric-grid"><Metric label="Votes per poll" value={data.metrics.engagement} change="Average engagement" /><Metric label="Open rate" value={data.metrics.totalPolls ? Math.round(data.metrics.activePolls / data.metrics.totalPolls * 100) : 0} change="Percent still active" /><Metric label="Top category votes" value={data.categories[0]?.votes ?? 0} change={data.categories[0]?.name ?? "No data"} /><Metric label="Named people" value={data.metrics.participants} change="Creators and voters" /></section><section className="panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Categories</p><h3>Response distribution</h3></div></div>{data.categories.map((category) => <div className="bar-row" key={category.name}><div><b>{category.name}</b><span>{category.polls} polls</span></div><div className="bar-track"><i style={{ width: `${category.votes / maxVotes * 100}%` }} /></div><strong>{category.votes}</strong></div>)}</section></div>;
}

function Activity({ data }: { data: WorkspaceData }) {
  return <div className="content-stack"><div className="section-title"><div><p className="eyebrow">Stay in the loop</p><h2>Activity & alerts</h2><p>Recent launches and polls that need attention.</p></div></div><section className="panel activity-panel"><ActivityList items={data.activity} /></section></div>;
}

function ActivityList({ items }: { items: WorkspaceData["activity"] }) {
  return <div className="activity-list">{items.map((item) => <div className="activity-row" key={item.id}><span className={`activity-icon ${item.type}`}>{item.type === "created" ? "+" : item.type === "closing" ? "!" : "✓"}</span><div><b>{item.title}</b><p>{item.detail}</p></div><time>{relativeTime(item.at)}</time></div>)}</div>;
}

function EmptyState() {
  return <div className="empty-state"><span>◎</span><h3>No polls found</h3><p>Try a different filter or publish the first poll.</p></div>;
}
