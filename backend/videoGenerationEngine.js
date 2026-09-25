function getDirectorNames(directorBlueprint) {
  const characters = (directorBlueprint.character_bible || [])
    .map((item) => item.name)
    .filter(Boolean);

  const locations = (directorBlueprint.world_bible?.locations || [])
    .map((item) => item.name)
    .filter(Boolean);

  return { characters, locations };
}

function getDirectorEvidenceIds(directorBlueprint) {
  const ids = new Set();
  const policy = directorBlueprint.evidence_policy || {};

  for (const item of policy.locked_facts || []) {
    if (item.evidence_id) ids.add(item.evidence_id);
  }

  for (const item of policy.visual_notes || []) {
    if (item.evidence_id) ids.add(item.evidence_id);
  }

  for (const item of policy.creative_reconstructions || []) {
    if (item.evidence_id) ids.add(item.evidence_id);
  }

  return ids;
}

function validateAgainstDirector(scenePlan, directorBlueprint) {
  const errors = [];
  const { characters, locations } = getDirectorNames(directorBlueprint);
  const evidenceIds = getDirectorEvidenceIds(directorBlueprint);

  for (const scene of scenePlan.scenes) {
    if (!locations.includes(scene.location)) {
      errors.push(`Scene ${scene.scene_id} uses non-canonical location: ${scene.location}.`);
    }

    for (const character of scene.characters || []) {
      if (!characters.includes(character)) {
        errors.push(`Scene ${scene.scene_id} uses unknown character: ${character}.`);
      }
    }

    for (const evidenceId of scene.evidence_ids || []) {
      if (!evidenceIds.has(evidenceId)) {
        errors.push(`Scene ${scene.scene_id} uses unknown evidence ID: ${evidenceId}.`);
      }
    }
  }

  return errors;
}

export function createVideoGenerationJobs(scenePlan, options = {}) {
  if (!scenePlan || typeof scenePlan !== "object") {
    throw new Error("Scene Plan is required.");
  }

  if (!Array.isArray(scenePlan.scenes) || scenePlan.scenes.length === 0) {
    throw new Error("Scene Plan contains no scenes.");
  }

  if (!options.directorBlueprint) {
    throw new Error("Director Blueprint is required for cross-checking.");
  }

  const directorErrors = validateAgainstDirector(
    scenePlan,
    options.directorBlueprint
  );

  if (directorErrors.length > 0) {
    throw new Error(`Director cross-check failed: ${directorErrors.join(" | ")}`);
  }

  const provider = options.provider || "provider-neutral";
  const jobs = [];
  let previousEnd = 0;

  for (const scene of scenePlan.scenes) {
    const negativePrompt = Array.isArray(scene.negative_prompt)
      ? scene.negative_prompt.join(", ")
      : String(scene.negative_prompt || "");

    const locks = (scenePlan.continuity_locks || [])
      .map((item) => `- ${item}`)
      .join("\n");

    const requirements = (scene.continuity_requirements || [])
      .map((item) => `- ${item}`)
      .join("\n");

    const prompt = [
      scene.visual_prompt || "",
      "CONTINUITY LOCKS:",
      locks,
      "SHOT REQUIREMENTS:",
      requirements,
      "Do not alter Director-approved identity, location, action or evidence.",
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
      validator_version: "V2",
      passed: true,
      director_cross_checked: true,
      job_count: jobs.length,
      validated_duration: scenePlan.project.duration_seconds,
      validated_aspect_ratio: scenePlan.project.aspect_ratio
    }
  };
}
