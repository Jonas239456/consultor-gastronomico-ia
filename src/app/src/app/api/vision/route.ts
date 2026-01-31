import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    const apiKey = process.env.GOOGLE_VISION_API_KEY;

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [
                { type: "LABEL_DETECTION", maxResults: 10 },
                { type: "TEXT_DETECTION" }
              ],
            },
          ],
        }),
      }
    );

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao processar imagem" },
      { status: 500 }
    );
  }
}
