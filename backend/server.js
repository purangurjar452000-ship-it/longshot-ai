import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { researchTopic } from "./researchEngine.js";
import { createDirectorBlueprint } from "./directorEngine.js";
import { createScenePlan } from "./scenePlannerEngine.js";
import { createVideoGenerationJobs } from "./videoGenerationEngine.js";

import {
  generateVideoFromJob,
  getRunwayTaskStatus
} from "./videoProviderAdapter.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

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
VIDEO JOBS ENGINE
========================================================= */

app.post("/api/video-jobs", (req, res) => {
  try {
    const {
      scenePlan,
      directorBlueprint,
      provider,
      model
    } = req.body;

    if (!scenePlan) {
      return res.status(400).json({
        error: "Scene Plan is required"
      });
    }

    if (!directorBlueprint) {
      return res.status(400).json({
        error: "Director Blueprint is required"
      });
    }

    const videoJobs = createVideoGenerationJobs(
      scenePlan,
      {
        directorBlueprint,
        provider: provider || "provider-neutral",
        model: model || null
      }
    );

    res.json({
      status: "video_jobs_created",
      videoJobs
    });
  } catch (error) {
    console.error("Video Job Error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
VIDEO PROVIDER ADAPTER
========================================================= */

app.post("/api/generate-video", async (req, res) => {
  try {
    const {
      job,
      provider
    } = req.body;

    if (!job) {
      return res.status(400).json({
        error: "Video job is required"
      });
    }

    const result = await generateVideoFromJob(
      job,
      {
        provider: provider || job.provider || "mock"
      }
    );

    res.json({
      status: "video_generation_submitted",
      result
    });
  } catch (error) {
    console.error("Video Generation Error:", error);

    res.status(500).json({
      error: error.message
    });
  }
});

/* =========================================================
RUNWAY TASK STATUS
========================================================= */

app.get("/api/runway-task/:taskId", async (req, res) => {
  try {
    const result = await getRunwayTaskStatus(
      req.params.taskId
    );

    res.json({
      status: "runway_task_status",
      result
    });
  } catch (error) {
    console.error("Runway Task Error:", error);

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
  console.log(`LongShot AI running on port ${PORT}`);
});
