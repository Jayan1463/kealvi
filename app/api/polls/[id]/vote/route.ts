import { voteOnPoll } from "@/lib/polls";

export async function POST(
  request: Request,
  context: RouteContext<"/api/polls/[id]/vote">
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const optionId = String(body.optionId ?? "");
    const voterId = String(body.voterId ?? "");

    if (!optionId || !voterId) {
      return Response.json({ error: "Missing vote details" }, { status: 400 });
    }

    await voteOnPoll({
      pollId: id,
      optionId,
      voterId,
      voterName: String(body.voterName ?? "").slice(0, 80),
    });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not vote";
    const status = /closed|already voted|not found/i.test(message) ? 409 : 500;
    return Response.json({ error: message }, { status });
  }
}
