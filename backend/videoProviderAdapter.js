const DEFAULT_PROVIDER = "mock";

function getProviderName(value) {
  return String(value || DEFAULT_PROVIDER)
    .trim()
    .toLowerCase();
}

function validateJob(job) {
  if (!job || typeof job !== "object") {
    throw new Error("Video job is required.");
  }

  if (!job.scene_id && !job.sceneId) {
    throw new Error("Video job scene ID is missing.");
  }

  if (!job.prompt && !job.request?.prompt) {
    throw new Error("Video job prompt is missing.");
  }

  return true;
}

async function runMockProvider(job) {
  const sceneId = job.scene_id || job.sceneId;

  return {
    provider: "mock",
    status: "completed",
    scene_id: sceneId,
    video_url: null,
    message: "Mock provider completed the pipeline test.",
    generated_at: new Date().toISOString()
  };
}

export async function generateVideoFromJob(job, options = {}) {
  validateJob(job);

  const provider = getProviderName(
    options.provider || job.provider
  );

  if (provider === "mock" || provider === "provider-neutral") {
    return runMockProvider(job);
  }

  if (provider === "huggingface") {
    throw new Error(
      "Hugging Face provider is not connected yet."
    );
  }

  if (provider === "runway") {
    throw new Error(
      "Runway provider is not connected yet."
    );
  }

  if (provider === "veo") {
    throw new Error(
      "Veo provider is not connected yet."
    );
  }

  throw new Error(
    `Unsupported video provider: ${provider}`
  );
}

export function getAvailableVideoProviders() {
  return [
    "mock",
    "huggingface",
    "runway",
    "veo"
  ];
}
