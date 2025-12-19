import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const imageBase64 = body.image;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Imagem não enviada" },
        { status: 400 }
      );
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [
                {
                  type: "TEXT_DETECTION",
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao chamar Google Vision" },
        { status: 500 }
      );
    }

    const result = await response.json();

    // 👉 EXTRAÇÃO DO TEXTO REAL DO CARDÁPIO
    const text =
      result.responses?.[0]?.fullTextAnnotation?.text || "";

    return NextResponse.json({
      success: true,
      text, // 👈 TEXTO REAL EXTRAÍDO DA IMAGEM
      raw: result, // opcional, útil para debug
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
