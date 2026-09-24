import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY
});

const researchSchema = {
  type: "object",
  properties: {
    topic: {
      type: "string"
    },
    domain: {
      type: "string",
      enum: [
        "mythology",
        "history",
        "science",
        "space",
        "wildlife",
        "geography",
        "fiction",
        "general"
      ]
    },
    research_required: {
      type: "boolean"
    },
    research_summary: {
      type: "string"
    },
    verified_facts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          fact: {
            type: "string"
          },
          source_title: {
            type: "string"
          },
          source_url: {
            type: "string"
          },
          confidence: {
            type: "string",
            enum: [
              "high",
              "medium",
              "low"
            ]
          }
        },
        required: [
          "fact",
          "source_title",
          "source_url",
          "confidence"
        ]
      }
    },
    creative_reconstruction: {
      type: "array",
      items: {
        type: "string"
      }
    },
    visual_research_notes: {
      type: "array",
      items: {
        type: "string"
      }
    },
    authenticity_warnings: {
      type: "array",
      items: {
        type: "string"
      }
    }
  },
  required: [
    "topic",
    "domain",
    "research_required",
    "research_summary",
    "verified_facts",
    "creative_reconstruction",
    "visual_research_notes",
    "authenticity_warnings"
  ]
};

export async function researchTopic(userPrompt) {

  if (!userPrompt || !userPrompt.trim()) {
    throw new Error("Research prompt is required.");
  }

  const researchInstruction = `
You are the Research Director of LongShot AI,
an AI cinematic video production system.

The user has provided this short video idea:

"${userPrompt}"

Your job is NOT to write the final video prompt.

First research and understand the topic deeply.

IMPORTANT RULES:

1. Determine the correct domain:
   mythology, history, science, space, wildlife,
   geography, fiction, or general.

2. Use Google Search whenever research can improve
   factual accuracy.

3. Prefer authoritative and primary sources.

4. For mythology:
   distinguish clearly between:
   - explicitly described traditional/scriptural facts
   - later interpretations
   - popular beliefs
   - cinematic reconstruction

5. For history:
   prefer museums, universities, government archives,
   academic/reference sources and primary historical material.

6. For science:
   prefer scientific institutions, universities,
   peer-reviewed/reference material and official sources.

7. Never invent a fact and present it as verified.

8. If visual details are not explicitly documented,
   put them under creative_reconstruction.

9. Research visual details that would help a professional
   filmmaker:
   environment, architecture, clothing, weapons,
   vehicles, animals, landscape, weather, period details,
   lighting conditions and historically appropriate
   visual elements.

10. Identify contradictions between sources when relevant.

11. Keep the research useful for later cinematic
   scene generation.

12. Every important factual claim must have a source.

Return ONLY valid JSON matching the supplied schema.
`;

  const response = await ai.interactions.create({
    model: "gemini-3.5-flash-lite",
    input: researchInstruction,

    tools: [
      {
        type: "google_search"
      }
    ],

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: researchSchema
    }
  });

  if (!response.output_text) {
    throw new Error("Research engine returned empty output.");
  }

  try {
    return JSON.parse(response.output_text);
  } catch (error) {
    throw new Error(
      "Research engine returned invalid JSON."
    );
  }
}
