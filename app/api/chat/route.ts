// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

interface ChatResponse {
  reply: string;
  suggestions?: string[];
}

function coffeeBot(message: string): ChatResponse {
  const text = message.toLowerCase().trim();

  let reply = "Got it! Tell me if you want espresso, filter, or capsules.";
  let suggestions: string[] = [];

  if (text.includes("start") || text.includes("hello") || text.includes("hi")) {
    reply = "Hey 👋 I’m your coffee bot. Espresso, filter, or capsules today?";
    suggestions = ["Espresso", "Filter", "Capsules"];
    return { reply, suggestions };
  }

  if (text.includes("espresso")) {
    reply =
      "Nice, espresso! I recommend our Espresso Roast 1kg. Type 'filter' or 'capsules' if you want to see other options.";
    suggestions = ["Filter", "Capsules"];
    return { reply, suggestions };
  }

  if (text.includes("filter") || text.includes("v60") || text.includes("chemex")) {
    reply =
      "For filter coffee, our Light Roast is perfect. You can also ask about 'espresso' or 'capsules'.";
    suggestions = ["Espresso", "Capsules"];
    return { reply, suggestions };
  }

  if (text.includes("capsule") || text.includes("capsules") || text.includes("pods")) {
    reply =
      "We have Nespresso-compatible capsules in Classic and Intense. Want 'espresso' or 'filter' beans too?";
    suggestions = ["Espresso", "Filter"];
    return { reply, suggestions };
  }

  if (text.includes("help") || text.includes("how") || text.includes("order")) {
    reply =
      "Tell me what you like (espresso/filter/capsules) and I’ll recommend something. Later we’ll add checkout so you can buy directly here.";
    suggestions = ["Espresso", "Filter", "Capsules"];
    return { reply, suggestions };
  }

  return { reply, suggestions };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = typeof body.message === "string" ? body.message : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const { reply, suggestions } = coffeeBot(message);

    return NextResponse.json<ChatResponse>({
      reply,
      suggestions,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
