function assertScenePlan(scenePlan) {
  if (!scenePlan || typeof scenePlan !== "object") {
    throw new Error("Scene Plan is required.");
  }

  if (!Array.isArray(scenePlan.scenes) || scenePlan.scenes.length === 0) {
    throw new Error("Scene Plan contains no scenes.");
  }
}

function buildContinuityPrompt(scenePlan, scene) {
  const locks = Array.isArray(scenePlan.continuity_locks)
    ? scenePlan.continuity_locks
    : [];

  const requirements = Array.isArray(scene.continuity_requirements)
    ? scene.continuity_requirements
    : [];

  return [
    "CONTINUITY LOCKS:",
    ...locks.map((item) => `- ${item}`),
    "SHOT REQUIREMENTS:",
    ...requirements.map((item) => `- ${item}`),
    "Do not alter identity, costume, location, action state or canonical names."
  ].join("\n");
}

function buildProviderPrompt(scenePlan, scene) {
  const negativePrompt = Array.isArray(scene.negative_prompt)
    ? scene.negative_prompt.join(", ")
    : String(scene.negative_prompt || "");

  return {
    prompt: [
      scene.visual_prompt,
      "",
      buildContinuityPrompt(scenePlan, scene),
      "",
      `Negative prompt: ${negativePrompt}`
    ].join("\n"),
    negative_prompt: negativePrompt,
    aspect_ratio: scenePlan.project.aspect_ratio,
    duration_seconds: scene.duration_seconds,
    start_time: scene.start_time,
    end_time: scene.end_time
  };
}

function validateJobs(jobs, scenePlan) {
  const errors = [];
  let previousEnd = 0;

  for (const job of jobs) {
    if (job.start_time !== previousEnd) {
      errors.push(`Timeline gap or overlap at ${job.scene_id}.`);
    }

    previousEnd = job.end_time;

    if (!job.prompt || !job.duration_seconds) {
    if (!job.request?.prompt || !job.duration_seconds) {
      errors.push(`Incomplete video job: ${job.scene_id}.`);
    }
  }

  if (previousEnd !== scenePlan.project.duration_seconds) {
    errors.push("Video jobs do not cover the complete project duration.");
  }

  return errors;
}

export function createVideoGenerationJobs(scenePlan, options = {}) {
  assertScenePlan(scenePlan);

  const provider = options.provider || "provider-neutral";

  const jobs = scenePlan.scenes.map((scene) => ({
    job_id: `VIDEO_JOB_${scene.scene_id}`,
    scene_id: scene.scene_id,
    provider,
    model: options.model || null,
    status: "queued",
    start_time: Number(scene.start_time),
    end_time: Number(scene.end_time),
    duration_seconds: Number(scene.duration_seconds),
    location: scene.location,
    characters: scene.characters || [],
    evidence_ids: scene.evidence_ids || [],
    audio: scene.audio || null,
    request: buildProviderPrompt(scenePlan, scene)
  }));

  const errors = validateJobs(jobs, scenePlan);

  if (errors.length > 0) {
    throw new Error(`Video jobs failed validation: ${errors.join(" | ")}`);
  }

  return {
    project: scenePlan.project,
    provider,
    jobs,
    _longshot_video_validation: {
      validator_version: "V1",
      passed: true,
      job_count: jobs.length,
      validated_duration: scenePlan.project.duration_seconds,
      validated_aspect_ratio: scenePlan.project.aspect_ratio
    }
  };
}
