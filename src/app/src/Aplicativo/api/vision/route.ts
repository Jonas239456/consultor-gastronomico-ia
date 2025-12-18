import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const imageBase64 = body.image;

  const apiKey = process.env.GOOGLE_VISION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GOOGLE_VISION_API_KEY não definida" },
      { status: 500 }
    );
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
