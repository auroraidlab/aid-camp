import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "산책의 시선" });
});

// Instagram Image Proxy API (CORS bypass for Canvas drawing)
app.get("/api/instagram/proxy-image", async (req, res) => {
  try {
    const imageUrl = req.query.url as string;
    if (!imageUrl) {
      return res.status(400).send("Missing url parameter");
    }

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.instagram.com/",
      },
    });

    if (!response.ok) {
      return res.status(response.status).send("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (error: any) {
    console.error("Proxy image error:", error);
    res.status(500).send("Error proxying image");
  }
});

// Instagram Single Post Fetch & Analysis API
app.post("/api/instagram/fetch-post", async (req, res) => {
  try {
    const { url, shortcode: rawShortcode, manualCaption, manualLocation, manualImage } = req.body;

    let cleanUrl = (url || "").trim();
    let shortcode = rawShortcode || "";

    // Extract shortcode from URL if present
    if (cleanUrl) {
      const match = cleanUrl.match(/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        shortcode = match[1];
      }
    } else if (shortcode) {
      cleanUrl = `https://www.instagram.com/p/${shortcode}/`;
    }

    if (!cleanUrl && !shortcode) {
      return res.status(400).json({ success: false, error: "인스타그램 게시물 URL 또는 고유 코드를 입력해주세요." });
    }

    let fetchedData: any = {
      url: cleanUrl || `https://www.instagram.com/p/${shortcode}/`,
      shortcode: shortcode || "post",
      caption: manualCaption || "",
      imageUrl: manualImage || "",
      authorHandle: "@duweon_choo",
      authorName: "추두원 (Duweon Choo)",
      date: new Date().toISOString().slice(0, 10),
      locationName: manualLocation || "서울 어딘가의 공간",
      likesCount: Math.floor(Math.random() * 80) + 40,
      commentsCount: Math.floor(Math.random() * 10) + 2,
    };

    // Attempt to fetch public oEmbed or scrape metadata
    try {
      const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const oembedRes = await fetch(oembedUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (oembedRes.ok) {
        const oembedJson: any = await oembedRes.json();
        if (oembedJson.title) fetchedData.caption = oembedJson.title;
        if (oembedJson.author_name) fetchedData.authorHandle = `@${oembedJson.author_name}`;
        if (oembedJson.thumbnail_url) fetchedData.imageUrl = oembedJson.thumbnail_url;
        if (oembedJson.html) fetchedData.embedHtml = oembedJson.html;
      }
    } catch (e) {
      console.log("oEmbed fetch skipped or rate-limited, proceeding with AI parser...");
    }

    // If no image or caption was retrieved from oembed, use fallback or user-supplied image
    if (!fetchedData.imageUrl && manualImage) {
      fetchedData.imageUrl = manualImage;
    }

    // Now run Gemini Spatial Analysis on the fetched Instagram caption & content
    const ai = getGenAI();
    let spatialAnalysis;

    if (ai) {
      const prompt = `인스타그램 게시물 정보:
- 인스타그램 계정: ${fetchedData.authorHandle}
- 게시물 본문/캡션: "${fetchedData.caption || manualCaption || "골목과 공간을 산책하며 발견한 빛과 물성"}"
- 위치: "${fetchedData.locationName || manualLocation || "도심 공간"}"

위 인스타그램 게시물을 감각적인 15년 차 '공간컨설팅 디렉터 & 공간디자이너'의 관점에서 분석하여,
1. 핵심 공간 키워드 3~5개 (#태그)
2. 분위기(mood), 빛과 그림자(lightAndShadow), 소재와 색채(materialsAndColors), 형태와 자연(formAndNature), 건축적 특징(architecturalFeature)
3. 3가지 맞춤 문장: 감성 문장(emotional), 전문가 문장(expert), 스토리 짧은 카피(storyShort)
를 JSON으로 생성해주세요.`;

      const aiRes = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              mood: { type: Type.STRING },
              lightAndShadow: { type: Type.STRING },
              materialsAndColors: { type: Type.STRING },
              formAndNature: { type: Type.STRING },
              architecturalFeature: { type: Type.STRING },
              copies: {
                type: Type.OBJECT,
                properties: {
                  emotional: { type: Type.STRING },
                  expert: { type: Type.STRING },
                  storyShort: { type: Type.STRING },
                },
                required: ["emotional", "expert", "storyShort"],
              },
            },
            required: ["keywords", "mood", "lightAndShadow", "materialsAndColors", "formAndNature", "architecturalFeature", "copies"],
          },
        },
      });

      try {
        spatialAnalysis = JSON.parse(aiRes.text || "{}");
      } catch {
        spatialAnalysis = generateFallbackAnalysis(fetchedData.caption, fetchedData.locationName);
      }
    } else {
      spatialAnalysis = generateFallbackAnalysis(fetchedData.caption, fetchedData.locationName);
    }

    return res.json({
      success: true,
      data: {
        post: fetchedData,
        spatialAnalysis,
      },
    });
  } catch (error: any) {
    console.error("Instagram post fetch error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "인스타그램 게시물을 가져오는 중 오류가 발생했습니다.",
    });
  }
});

// AI Spatial Analysis & Copywriting API
app.post("/api/analyze-walk", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", note = "", location = "", date = "" } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Fallback mock analysis if no API key is set
      const fallbackAnalysis = generateFallbackAnalysis(note, location);
      return res.json({
        success: true,
        isFallback: true,
        data: fallbackAnalysis,
      });
    }

    const systemInstruction = `당신은 감각적인 시선과 깊은 통찰력을 지닌 15년 차 '공간컨설팅 디렉터 & 공간디자이너'입니다.
사용자가 매일 산책하며 발견한 도시, 건축, 공간, 빛, 그림자, 소재, 식물의 사진과 짧은 관찰 메모를 분석합니다.

[역할 및 원칙]
1. 사용자의 짧은 메모와 사진에서 드러나는 공간적 의미, 물성, 빛의 각도, 시간성, 감정적 여백을 해석합니다.
2. 지나치게 과장된 광고 카피나 현학적인 난해한 용어를 피하고, 담백하면서도 깊은 여백이 느껴지는 세련된 언어를 구사합니다.
3. 다음 3가지 관점의 문장을 반드시 생성합니다:
   - A. 감성 문장 (emotional): 산책자의 내면적 감정과 순간의 온도, 계절감을 시적으로 포착한 문장 (1~2문장)
   - B. 공간전문가 문장 (expert): 공간의 비례, 소재(텍스처), 빛과 그림자의 음영, 건축적 디테일을 전문적이면서도 감각적으로 짚어낸 문장 (1~2문장)
   - C. Story용 짧은 문장 (storyShort): 인스타그램 스토리에 큰 타이포로 임팩트 있게 얹을 수 있는 절제된 1줄 카피 (15~25자 내외)
4. 공간 핵심 키워드는 3~5개를 #태그 형태로 추출합니다. (예: #빛의사선, #오래된벽돌, #텍스처의기억, #시간의중첩)
5. 공간적 특징 상세 분석(분위기, 빛과 그림자, 소재와 색, 형태와 식물, 건축적 시선)을 명확히 제시합니다.`;

    const promptText = `[산책 기록 정보]
- 촬영 일자: ${date || "오늘"}
- 촬영 장소: ${location || "도심의 한 골목"}
- 사용자의 짧은 메모: "${note || "공간에서 느껴진 특별한 순간"}"

위 정보와 첨부된 사진을 바탕으로 공간 분석과 3가지 문장(감성, 전문가, 스토리 짧은 문장)을 JSON 형식으로 작성해주세요.`;

    const contents: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }
    contents.push({
      text: promptText,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents.length === 1 ? contents[0].text : { parts: contents },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "핵심 공간 키워드 3~5개 (#포함)",
            },
            mood: {
              type: Type.STRING,
              description: "공간의 전체적인 무드 및 분위기",
            },
            lightAndShadow: {
              type: Type.STRING,
              description: "빛과 그림자의 뉘앙스 및 음영 분석",
            },
            materialsAndColors: {
              type: Type.STRING,
              description: "사용된 소재(콘크리트, 벽돌, 유리, 나무 등)와 색채 조합",
            },
            formAndNature: {
              type: Type.STRING,
              description: "형태적 특징과 식물/자연 요소의 결합",
            },
            architecturalFeature: {
              type: Type.STRING,
              description: "공간디자인 및 건축적 관점에서의 해석",
            },
            copies: {
              type: Type.OBJECT,
              properties: {
                emotional: {
                  type: Type.STRING,
                  description: "감성적인 문장 (1~2문장)",
                },
                expert: {
                  type: Type.STRING,
                  description: "공간전문가의 시선으로 해석한 문장 (1~2문장)",
                },
                storyShort: {
                  type: Type.STRING,
                  description: "Instagram Story용 짧은 문장 (15~25자 내외)",
                },
              },
              required: ["emotional", "expert", "storyShort"],
            },
          },
          required: [
            "keywords",
            "mood",
            "lightAndShadow",
            "materialsAndColors",
            "formAndNature",
            "architecturalFeature",
            "copies",
          ],
        },
      },
    });

    const text = response.text || "{}";
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch {
      parsedData = generateFallbackAnalysis(note, location);
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    // Graceful fallback to guarantee smooth user experience
    const fallback = generateFallbackAnalysis(req.body.note, req.body.location);
    return res.json({
      success: true,
      isFallback: true,
      error: error?.message,
      data: fallback,
    });
  }
});

// Helper for contextual fallback responses
function generateFallbackAnalysis(note: string = "", location: string = "") {
  const defaultKeywords = ["#빛의각도", "#물성의기억", "#골목의여백", "#시간의흔적"];
  return {
    keywords: defaultKeywords,
    mood: "시간의 결이 고스란히 내려앉은 고요하고 밀도 있는 도심의 여백",
    lightAndShadow: "낮게 드리운 자연광이 표면의 거친 요철을 따라 부드러운 음영을 직조하는 순간",
    materialsAndColors: "오래된 벽면의 따뜻한 웜그레이 톤과 자연스러운 물성의 대비",
    formAndNature: "직선적인 인공 구조물 틈새로 스며든 미세한 유기적 생명력",
    architecturalFeature: "일상의 시선이 머무는 소박한 모서리에서 발견한 균형감과 건축적 안식",
    copies: {
      emotional: note
        ? `${note} — 무심히 지나치던 일상의 골목이 빛을 머금는 찰나의 안식.`
        : "발걸음이 멈추는 곳마다 오래된 공간이 건네는 조용한 빛의 위로.",
      expert: note
        ? `물성의 거친 질감과 입사각이 만들어내는 음영의 비례감이 시각적 리듬을 완성한다.`
        : "공간의 물리적 경계를 넘어 빛과 소재가 호흡하는 순간의 구조적 미학.",
      storyShort: "빛이 머무는 틈, 일상의 공간 언어.",
    },
  };
}

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
