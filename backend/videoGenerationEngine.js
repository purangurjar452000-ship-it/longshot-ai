export function createVideoGenerationJobs(scenePlan, options = {}) {
  if (!scenePlan || typeof scenePlan !== "object") {
    throw new Error("Scene Plan is required.");
  }

  if (!Array.isArray(scenePlan.scenes) || scenePlan.scenes.length === 0) {
    throw new Error("Scene Plan contains no scenes.");
  }

  const provider = options.provider || "provider-neutral";
  const jobs = [];
  let previousEnd = 0;

  for (const scene of scenePlan.scenes) {
    const negativePrompt = Array.isArray(scene.negative_prompt)
      ? scene.negative_prompt.join(", ")
      : String(scene.negative_prompt || "");

    const locks = Array.isArray(scenePlan.continuity_locks)
      ? scenePlan.continuity_locks.map((item) => `- ${item}`).join("\n")
      : "";

    const requirements = Array.isArray(scene.continuity_requirements)
      ? scene.continuity_requirements.map((item) => `- ${item}`).join("\n")
      : "";

    const prompt = [
      scene.visual_prompt || "",
      "",
      "CONTINUITY LOCKS:",
      locks,
      "SHOT REQUIREMENTS:",
      requirements,
      "Do not alter identity, costume, location, action state or canonical names.",
      `Negative prompt: ${negativePrompt}`
    ].join("\n");

    const startTime = Number(scene.start_time);
    const endTime = Number(scene.end_time);
    const duration = Number(scene.duration_seconds);

    if (startTime !== previousEnd) {
      throw new Error(`Timeline gap or overlap at ${scene.scene_id}.`);
    }

    if (!prompt.trim() || duration <= 0) {
      throw new Error(`Incomplete video job: ${scene.scene_id}.`);
    }

    jobs.push({
      job_id: `VIDEO_JOB_${scene.scene_id}`,
      scene_id: scene.scene_id,
      provider,
      model: options.model || null,
      status: "queued",
      start_time: startTime,
      end_time: endTime,
      duration_seconds: duration,
      location: scene.location,
      characters: scene.characters || [],
      evidence_ids: scene.evidence_ids || [],
      audio: scene.audio || null,
      request: {
        prompt,
        negative_prompt: negativePrompt,
        aspect_ratio: scenePlan.project.aspect_ratio,
        duration_seconds: duration,
        start_time: startTime,
        end_time: endTime
      }
    });

    previousEnd = endTime;
  }

  if (previousEnd !== Number(scenePlan.project.duration_seconds)) {
    throw new Error("Video jobs do not cover the complete project duration.");
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
