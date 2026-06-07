import { getSupabase, hasSupabaseEnv } from "@/lib/supabase";

export type PollOption = {
  id: string;
  label: string;
  votes: number;
  percentage: number;
};
//sd
export type Poll = {
  id: string;
  title: string;
  description: string | null;
  creatorName: string;
  creatorId: string;
  category: string;
  status: "active" | "closed";
  allowVoteChanges: boolean;
  expiresAt: string | null;
  createdAt: string;
  totalVotes: number;
  viewerVoteOptionId: string | null;
  options: PollOption[];
};

export type WorkspaceData = {
  polls: Poll[];
  configured: boolean;
  metrics: {
    activePolls: number;
    totalPolls: number;
    totalVotes: number;
    participants: number;
    engagement: number;
  };
  leaderboard: Array<{
    name: string;
    pollsCreated: number;
    votesCast: number;
    score: number;
  }>;
  categories: Array<{ name: string; polls: number; votes: number }>;
  activity: Array<{
    id: string;
    type: "created" | "voted" | "closing";
    title: string;
    detail: string;
    at: string;
  }>;
};

type PollRow = {
  id: string;
  title: string;
  description: string | null;
  creator_name: string;
  creator_id: string;
  category: string;
  status: "active" | "closed";
  allow_vote_changes: boolean;
  expires_at: string | null;
  created_at: string;
  poll_options?: Array<{
    id: string;
    label: string;
    position: number;
    poll_votes?: Array<{
      id: string;
      voter_id: string;
      voter_name: string | null;
      created_at: string;
    }>;
  }>;
};

const now = Date.now();
const demoRows: PollRow[] = [
  {
    id: "demo-product",
    title: "Which feature should we ship next?",
    description: "Help the product team choose the next Kealvi milestone.",
    creator_name: "Maya",
    creator_id: "demo-maya",
    category: "Product",
    status: "active",
    allow_vote_changes: true,
    expires_at: new Date(now + 1000 * 60 * 60 * 22).toISOString(),
    created_at: new Date(now - 1000 * 60 * 37).toISOString(),
    poll_options: [
      { id: "demo-1", label: "Live word clouds", position: 0, poll_votes: Array.from({ length: 18 }, (_, i) => ({ id: `a${i}`, voter_id: `a${i}`, voter_name: i === 0 ? "Aarav" : null, created_at: new Date(now - i * 60000).toISOString() })) },
      { id: "demo-2", label: "Audience quiz mode", position: 1, poll_votes: Array.from({ length: 12 }, (_, i) => ({ id: `b${i}`, voter_id: `b${i}`, voter_name: null, created_at: new Date(now - i * 80000).toISOString() })) },
      { id: "demo-3", label: "Team workspaces", position: 2, poll_votes: Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, voter_id: `c${i}`, voter_name: null, created_at: new Date(now - i * 90000).toISOString() })) },
    ],
  },
  {
    id: "demo-stack",
    title: "What is your preferred frontend stack?",
    description: "A quick pulse check for the engineering guild.",
    creator_name: "Noah",
    creator_id: "demo-noah",
    category: "Engineering",
    status: "active",
    allow_vote_changes: false,
    expires_at: new Date(now + 1000 * 60 * 60 * 72).toISOString(),
    created_at: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    poll_options: [
      { id: "demo-4", label: "Next.js", position: 0, poll_votes: Array.from({ length: 14 }, (_, i) => ({ id: `d${i}`, voter_id: `d${i}`, voter_name: i < 2 ? ["Isha", "Dev"][i] : null, created_at: new Date(now - i * 100000).toISOString() })) },
      { id: "demo-5", label: "Vue / Nuxt", position: 1, poll_votes: Array.from({ length: 7 }, (_, i) => ({ id: `e${i}`, voter_id: `e${i}`, voter_name: null, created_at: new Date(now - i * 100000).toISOString() })) },
      { id: "demo-6", label: "SvelteKit", position: 2, poll_votes: Array.from({ length: 5 }, (_, i) => ({ id: `f${i}`, voter_id: `f${i}`, voter_name: null, created_at: new Date(now - i * 100000).toISOString() })) },
    ],
  },
  {
    id: "demo-retro",
    title: "How useful was this week's all-hands?",
    description: null,
    creator_name: "Priya",
    creator_id: "demo-priya",
    category: "Culture",
    status: "closed",
    allow_vote_changes: false,
    expires_at: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    created_at: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
    poll_options: [
      { id: "demo-7", label: "Very useful", position: 0, poll_votes: Array.from({ length: 20 }, (_, i) => ({ id: `g${i}`, voter_id: `g${i}`, voter_name: null, created_at: new Date(now - i * 120000).toISOString() })) },
      { id: "demo-8", label: "Somewhat useful", position: 1, poll_votes: Array.from({ length: 11 }, (_, i) => ({ id: `h${i}`, voter_id: `h${i}`, voter_name: null, created_at: new Date(now - i * 120000).toISOString() })) },
      { id: "demo-9", label: "Needs improvement", position: 2, poll_votes: Array.from({ length: 4 }, (_, i) => ({ id: `j${i}`, voter_id: `j${i}`, voter_name: null, created_at: new Date(now - i * 120000).toISOString() })) },
    ],
  },
];

function normalizePoll(row: PollRow, voterId?: string): Poll {
  const sortedOptions = [...(row.poll_options ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const totalVotes = sortedOptions.reduce(
    (sum, option) => sum + (option.poll_votes?.length ?? 0),
    0
  );
  const expired = row.expires_at
    ? new Date(row.expires_at).getTime() <= Date.now()
    : false;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    creatorName: row.creator_name || "Anonymous",
    creatorId: row.creator_id,
    category: row.category,
    status: row.status === "closed" || expired ? "closed" : "active",
    allowVoteChanges: row.allow_vote_changes,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    totalVotes,
    viewerVoteOptionId:
      sortedOptions.find((option) =>
        option.poll_votes?.some((vote) => vote.voter_id === voterId)
      )?.id ?? null,
    options: sortedOptions.map((option) => {
      const votes = option.poll_votes?.length ?? 0;
      return {
        id: option.id,
        label: option.label,
        votes,
        percentage: totalVotes ? Math.round((votes / totalVotes) * 100) : 0,
      };
    }),
  };
}
//new func
function buildWorkspace(rows: PollRow[], voterId?: string): WorkspaceData {
  const polls = rows.map((row) => normalizePoll(row, voterId));
  const people = new Set<string>();
  const score = new Map<string, { pollsCreated: number; votesCast: number }>();

  for (const row of rows) {
    const creator = row.creator_name || "Anonymous";
    people.add(creator);
    const creatorScore = score.get(creator) ?? { pollsCreated: 0, votesCast: 0 };
    creatorScore.pollsCreated += 1;
    score.set(creator, creatorScore);

    for (const option of row.poll_options ?? []) {
      for (const vote of option.poll_votes ?? []) {
        const name = vote.voter_name?.trim();
        if (!name) continue;
        people.add(name);
        const voterScore = score.get(name) ?? { pollsCreated: 0, votesCast: 0 };
        voterScore.votesCast += 1;
        score.set(name, voterScore);
      }
    }
  }

  const totalVotes = polls.reduce((sum, poll) => sum + poll.totalVotes, 0);
  const categoryMap = new Map<string, { polls: number; votes: number }>();
  for (const poll of polls) {
    const entry = categoryMap.get(poll.category) ?? { polls: 0, votes: 0 };
    entry.polls += 1;
    entry.votes += poll.totalVotes;
    categoryMap.set(poll.category, entry);
  }

  const activity: WorkspaceData["activity"] = [];
  for (const poll of polls.slice(0, 6)) {
    activity.push({
      id: `created-${poll.id}`,
      type: "created",
      title: poll.title,
      detail: `${poll.creatorName} published a poll in ${poll.category}`,
      at: poll.createdAt,
    });
    if (
      poll.status === "active" &&
      poll.expiresAt &&
      new Date(poll.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
    ) {
      activity.push({
        id: `closing-${poll.id}`,
        type: "closing",
        title: poll.title,
        detail: "Voting closes within 24 hours",
        at: poll.expiresAt,
      });
    }
  }

  return {
    polls,
    configured: hasSupabaseEnv(),
    metrics: {
      activePolls: polls.filter((poll) => poll.status === "active").length,
      totalPolls: polls.length,
      totalVotes,
      participants: people.size,
      engagement: polls.length ? Math.round(totalVotes / polls.length) : 0,
    },
    leaderboard: [...score.entries()]
      .map(([name, entry]) => ({
        name,
        ...entry,
        score: entry.pollsCreated * 5 + entry.votesCast,
      }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 10),
    categories: [...categoryMap.entries()]
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.votes - a.votes),
    activity: activity
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 10),
  };
}

export async function getWorkspace(voterId?: string): Promise<WorkspaceData> {
  const supabase = getSupabase();
  if (!supabase) return buildWorkspace(demoRows, voterId);

  const { data, error } = await supabase
    .from("polls")
    .select(
      "id,title,description,creator_name,creator_id,category,status,allow_vote_changes,expires_at,created_at,poll_options(id,label,position,poll_votes(id,voter_id,voter_name,created_at))"
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return buildWorkspace((data ?? []) as PollRow[], voterId);
}

export async function createPoll(input: {
  title: string;
  description?: string;
  creatorName: string;
  creatorId: string;
  category: string;
  options: string[];
  allowVoteChanges: boolean;
  expiresAt?: string | null;
}) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .insert({
      title: input.title,
      description: input.description || null,
      creator_name: input.creatorName,
      creator_id: input.creatorId,
      category: input.category,
      allow_vote_changes: input.allowVoteChanges,
      expires_at: input.expiresAt || null,
    })
    .select("id")
    .single();

  if (pollError) throw new Error(pollError.message);

  const { error: optionsError } = await supabase.from("poll_options").insert(
    input.options.map((label, position) => ({
      poll_id: poll.id,
      label,
      position,
    }))
  );

  if (optionsError) {
    await supabase.from("polls").delete().eq("id", poll.id);
    throw new Error(optionsError.message);
  }
  return poll.id as string;
}

export async function voteOnPoll(input: {
  pollId: string;
  optionId: string;
  voterId: string;
  voterName?: string;
}) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("status,allow_vote_changes,expires_at,poll_options!inner(id)")
    .eq("id", input.pollId)
    .eq("poll_options.id", input.optionId)
    .single();

  if (pollError || !poll) throw new Error("Poll or option not found");
  if (
    poll.status === "closed" ||
    (poll.expires_at && new Date(poll.expires_at).getTime() <= Date.now())
  ) {
    throw new Error("This poll is closed");
  }

  const { data: existing } = await supabase
    .from("poll_votes")
    .select("id,option_id")
    .eq("poll_id", input.pollId)
    .eq("voter_id", input.voterId)
    .maybeSingle();

  if (existing && !poll.allow_vote_changes) {
    throw new Error("You already voted in this poll");
  }

  const payload = {
    poll_id: input.pollId,
    option_id: input.optionId,
    voter_id: input.voterId,
    voter_name: input.voterName?.trim() || null,
  };

  const result = existing
    ? await supabase.from("poll_votes").update(payload).eq("id", existing.id)
    : await supabase.from("poll_votes").insert(payload);
  if (result.error) throw new Error(result.error.message);
}

export async function closePoll(pollId: string, creatorId: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("polls")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("id", pollId)
    .eq("creator_id", creatorId)
    .select("id")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Only the poll creator can close this poll");
}
