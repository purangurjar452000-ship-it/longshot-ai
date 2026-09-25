import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { researchTopic } from "./researchEngine.js";
import { createDirectorBlueprint } from "./directorEngine.js";
import { createScenePlan } from "./scenePlannerEngine.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

/* =========================================================
   STATUS
========================================================= */

app.get("/api/status", (req, res) => {
  res.json({
    app: "LongShot AI",
    status: "running"
  });
});

/* =========================================================
   RESEARCH ENGINE
========================================================= */

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

/* =========================================================
   DIRECTOR ENGINE
========================================================= */

app.post("/api/director", async (req, res) => {
  try {
    const {
      research,
      duration,
      aspectRatio
    } = req.body;

    if (!research) {
      return res.status(400).json({
        error: "Research data is required"
      });
    }

    const blueprint = await createDirectorBlueprint(
      research,
      duration || 20,
      aspectRatio || "9:16"
    );

    res.json({
      status: "director_completed",
      blueprint
    });

  } catch (error) {
    console.error("Director Error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
   SCENE PLANNER ENGINE
========================================================= */

app.post("/api/scene-planner", async (req, res) => {
  try {
    const {
      directorBlueprint,
      duration,
      aspectRatio
    } = req.body;

    if (!directorBlueprint) {
      return res.status(400).json({
        error: "Director blueprint is required"
      });
    }

    const scenePlan = await createScenePlan(
      directorBlueprint,
      duration || 20,
      aspectRatio || "9:16"
    );

    res.json({
      status: "scene_plan_completed",
      scenePlan
    });

  } catch (error) {
    console.error("Scene Planner Error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `LongShot AI running on port ${PORT}`
  );
});
