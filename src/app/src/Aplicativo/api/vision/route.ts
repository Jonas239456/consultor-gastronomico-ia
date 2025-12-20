import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64, language } = body;

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64.replace(/^data:image\/\w+;base64,/, "") },
              features: [{ type: "TEXT_DETECTION" }],
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

    const fullText =
      result.responses?.[0]?.fullTextAnnotation?.text || "";

    // 👉 SIMPLES PARSER (depois você pode evoluir)
    const lines = fullText
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    const items = lines.map(line => {
      let category: "entrada" | "principal" | "bebida" | "sobremesa" = "principal";

      const lower = line.toLowerCase();

      if (lower.includes("suco") || lower.includes("cerveja") || lower.includes("vinho")) {
        category = "bebida";
      } else if (lower.includes("bolo") || lower.includes("doce")) {
        category = "sobremesa";
      } else if (lower.includes("entrada")) {
        category = "entrada";
      }

      return {
        name: line,
        category,
      };
    });

    return NextResponse.json({
      items,
      rawText: fullText, // útil para debug
      language: language || "pt",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
