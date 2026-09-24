const API_KEY = process.env.GEMINI_API_KEY;

const BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta";

export async function generateVeoVideo(prompt, aspectRatio = "9:16") {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `${BASE_URL}/models/veo-3.1-generate-preview:predictLongRunning`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        instances: [
          {
            prompt
          }
        ],
        parameters: {
          aspectRatio,
          numberOfVideos: 1
        }
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || "Veo generation request failed"
    );
  }

  return data;
}
