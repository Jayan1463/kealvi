import { closePoll } from "@/lib/polls";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/polls/[id]">
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (body.action !== "close" || !body.creatorId) {
      return Response.json({ error: "Invalid poll update" }, { status: 400 });
    }
    await closePoll(id, String(body.creatorId));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not update poll" },
      { status: 403 }
    );
  }
}
