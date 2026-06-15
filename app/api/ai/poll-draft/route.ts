type GeminiPart = { text?: string };
type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
};

const fallbackCategories = ["General", "Product", "Engineering", "Culture", "Learning", "Fun"];

export const dynamic = "force-dynamic";

function cleanString(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function parseDraft(text: string) {
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0] ?? text;
  const parsed = JSON.parse(jsonText) as {
    title?: unknown;
    description?: unknown;
    category?: unknown;
    options?: unknown;
  };
  const options = Array.isArray(parsed.options)
    ? [...new Set(parsed.options.map((option) => cleanString(option, 120)).filter(Boolean))]
    : [];

  return {
    title: cleanString(parsed.title, 180),
    description: cleanString(parsed.description, 500),
    category: fallbackCategories.includes(cleanString(parsed.category, 40))
      ? cleanString(parsed.category, 40)
      : "General",
    options: options.slice(0, 8),
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Add GEMINI_API_KEY to enable AI poll drafts" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const topic = cleanString(body.topic, 180);
    const category = cleanString(body.category, 40) || "General";

    if (topic.length < 3) {
      return Response.json({ error: "Enter a topic for the AI draft" }, { status: 400 });
    }

    const prompt = [
      "Create one useful live-poll draft for Kealvi.",
      "Return only JSON with this shape:",
      '{"title":"...","description":"...","category":"General","options":["...","...","...","..."]}',
      `Allowed categories: ${fallbackCategories.join(", ")}.`,
      "Use 3 to 5 short, mutually exclusive options.",
      "Keep the title under 90 characters and the description under 180 characters.",
      `Topic: ${topic}`,
      `Preferred category: ${category}`,
    ].join("\n");

    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      }
    );

    const payload = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      return Response.json(
        { error: payload.error?.message ?? "Gemini could not generate a draft" },
        { status: response.status }
      );
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!text) {
      return Response.json({ error: "Gemini returned an empty draft" }, { status: 502 });
    }

    const draft = parseDraft(text);
    if (!draft.title || draft.options.length < 2) {
      return Response.json({ error: "Gemini returned an incomplete draft" }, { status: 502 });
    }

    return Response.json({ draft });
  } catch (error) {
    const message = error instanceof SyntaxError
      ? "Gemini returned a draft that could not be parsed"
      : error instanceof Error
        ? error.message
        : "Could not create AI draft";
    return Response.json({ error: message }, { status: 500 });
  }
}
