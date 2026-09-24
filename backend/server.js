import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { researchTopic } from "./researchEngine.js";

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

app.post("/api/research", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required"
      });
    }

    const research = await researchTopic(prompt);

    res.json({
      status: "research_completed",
      research
    });

  } catch (error) {

    console.error("Research Error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`LongShot AI running on port ${PORT}`);
});
