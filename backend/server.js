import express from "express";
import cors from "cors";
import { generateVeoVideo } from "./veo.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
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

    const operation = await generateVeoVideo(prompt, aspectRatio);

    res.json({
      status: "processing",
      operation
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
