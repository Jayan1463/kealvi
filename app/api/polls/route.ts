import { createPoll, getWorkspace } from "@/lib/polls";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const voterId = new URL(request.url).searchParams.get("voterId") ?? undefined;
    return Response.json(await getWorkspace(voterId));
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not load polls" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim().replace(/\s+/g, " ");
    const creatorName = String(body.creatorName ?? "").trim() || "Anonymous";
    const creatorId = String(body.creatorId ?? "").trim();
    const category = String(body.category ?? "General").trim();
    const options: string[] = Array.isArray(body.options)
      ? [...new Set<string>(body.options.map((item: unknown) => String(item).trim()))].filter(Boolean)
      : [];

    if (title.length < 3 || title.length > 180) {
      return Response.json({ error: "Title must be 3 to 180 characters" }, { status: 400 });
    }
    if (!creatorId) {
      return Response.json({ error: "Missing creator identity" }, { status: 400 });
    }
    if (options.length < 2 || options.length > 8) {
      return Response.json({ error: "Add between 2 and 8 unique options" }, { status: 400 });
    }
    if (new Set(options.map((option) => option.toLowerCase())).size !== options.length || options.some((option) => option.length > 120)) {
      return Response.json({ error: "Options must be distinct and at most 120 characters" }, { status: 400 });
    }
    if (String(body.description ?? "").trim().length > 500) {
      return Response.json({ error: "Context must be at most 500 characters" }, { status: 400 });
    }
    if (body.expiresAt && (!Number.isFinite(Date.parse(String(body.expiresAt))) || Date.parse(String(body.expiresAt)) <= Date.now())) {
      return Response.json({ error: "Choose a valid future voting deadline" }, { status: 400 });
    }

    const id = await createPoll({
      title,
      description: String(body.description ?? "").trim(),
      creatorName: creatorName.slice(0, 80),
      creatorId,
      category: category.slice(0, 40) || "General",
      options: options.map((option) => option.slice(0, 120)),
      allowVoteChanges: body.allowVoteChanges !== false,
      expiresAt: body.expiresAt ? String(body.expiresAt) : null,
    });
    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create poll";
    const status = error instanceof SyntaxError ? 400 : /already exists/i.test(message) ? 409 : 500;
    return Response.json(
      { error: message },
      { status }
    );
  }
}
