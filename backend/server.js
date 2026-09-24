import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    app: "LongShot AI",
    status: "running"
  });
});

app.post("/api/generate", (req, res) => {
  const { prompt, duration, aspectRatio } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: "Prompt is required"
    });
  }

  res.json({
    status: "received",
    prompt,
    duration: duration || 20,
    aspectRatio: aspectRatio || "9:16"
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`LongShot AI running on port ${PORT}`);
});
