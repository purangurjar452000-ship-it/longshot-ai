const DEFAULT_PROVIDER = "mock";

const RUNWAY_API_URL =
  "https://api.dev.runwayml.com/v1/text_to_video";

function getProviderName(value) {
  return String(value || DEFAULT_PROVIDER)
    .trim()
    .toLowerCase();
}

function getSceneId(job) {
  return job.scene_id || job.sceneId || "";
}

function getPrompt(job) {
  return String(
    job.prompt ||
      job.visual_prompt ||
      job.request?.prompt ||
      job.request?.visual_prompt ||
      ""
  ).trim();
}

function getDuration(job) {
  const value = Number(
    job.duration_seconds ||
      job.duration ||
      job.request?.duration_seconds ||
      5
  );

  return Math.min(10, Math.max(5, Math.round(value)));
}

function getRatio(job) {
  const ratio =
    job.aspect_ratio ||
    job.aspectRatio ||
    job.request?.aspect_ratio ||
    "9:16";

  if (ratio === "16:9") {
    return "1280:720";
  }

  if (ratio === "1:1") {
    return "960:960";
  }

  return "720:1280";
}

function validateJob(job) {
  if (!job || typeof job !== "object") {
    throw new Error("Video job is required.");
  }

  if (!getSceneId(job)) {
    throw new Error("Video job scene ID is missing.");
  }

  if (!getPrompt(job)) {
    throw new Error("Video job prompt is missing.");
  }

  return true;
}

async function runMockProvider(job) {
  return {
    provider: "mock",
    status: "completed",
    scene_id: getSceneId(job),
    video_url: null,
    message: "Mock provider completed the pipeline test.",
    generated_at: new Date().toISOString()
  };
}

async function runRunwayProvider(job) {
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RUNWAY_API_KEY is not configured on the server."
    );
  }

  const response = await fetch(RUNWAY_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06"
    },
    body: JSON.stringify({
      model: "gen4.5",
      promptText: getPrompt(job),
      ratio: getRatio(job),
      duration: getDuration(job)
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Runway request failed with status ${response.status}.`
    );
  }

  return {
    provider: "runway",
    status: "submitted",
    scene_id: getSceneId(job),
    task_id: data.id || data.taskId || null,
    video_url: null,
    message: "Runway video generation task submitted.",
    runway_response: data
  };
}

export async function generateVideoFromJob(
  job,
  options = {}
) {
  validateJob(job);

  const provider = getProviderName(
    options.provider || job.provider
  );

  if (
    provider === "mock" ||
    provider === "provider-neutral"
  ) {
    return runMockProvider(job);
  }

  if (provider === "runway") {
    return runRunwayProvider(job);
  }

  throw new Error(
    `Unsupported video provider: ${provider}`
  );
}

export async function getRunwayTaskStatus(taskId) {
  const apiKey = process.env.RUNWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "RUNWAY_API_KEY is not configured."
    );
  }

  if (!taskId) {
    throw new Error("Runway task ID is required.");
  }

  const response = await fetch(
    `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06"
      }
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `Runway task check failed with status ${response.status}.`
    );
  }

  let videoUrl = null;

  if (Array.isArray(data.output)) {
    videoUrl = data.output[0] || null;
  } else if (typeof data.output === "string") {
    videoUrl = data.output;
  }

  return {
    provider: "runway",
    task_id: taskId,
    status: data.status || "UNKNOWN",
    video_url: videoUrl,
    raw: data
  };
}

export function getAvailableVideoProviders() {
  return [
    "mock",
    "runway"
  ];
}
