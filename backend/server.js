import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { generateVeoVideo } from "./veo.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    app: "LongShot AI",
    status: "running"
  });
});

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio = "9:16" } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const operation = await generateVeoVideo(
      prompt,
      aspectRatio
    );

    const operationName = operation.name;

    if (!operationName) {
      return res.status(500).json({
        error: "Veo did not return an operation name."
      });
    }

    let statusResponse;

    while (true) {

      const response = await fetch(
        `${"https://generativelanguage.googleapis.com/v1beta"}/${operationName}`,
        {
          headers: {
            "x-goog-api-key": process.env.GEMINI_API_KEY
          }
        }
      );

      statusResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          statusResponse.error?.message ||
          "Failed to check video status."
        );
      }

      if (statusResponse.done === true) {
        break;
      }

      await new Promise(resolve =>
        setTimeout(resolve, 10000)
      );
    }

    if (statusResponse.error) {
      throw new Error(
        statusResponse.error.message ||
        "Video generation failed."
      );
    }

    const videoUri =
      statusResponse.response
        ?.generateVideoResponse
        ?.generatedSamples?.[0]
        ?.video?.uri;

    if (!videoUri) {
      return res.status(500).json({
        error: "Video generated but download URL was not returned."
      });
    }

    res.json({
      status: "completed",
      videoUrl: videoUri
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`LongShot AI running on port ${PORT}`);
});
