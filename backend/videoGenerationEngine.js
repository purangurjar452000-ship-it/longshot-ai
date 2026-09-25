function collectEvidenceIds(value, ids = new Set()) {
  if (!value || typeof value !== "object") return ids;
  if (Array.isArray(value)) {
    value.forEach((item) => collectEvidenceIds(item, ids));
    return ids;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "evidence_ids" && Array.isArray(child)) {
      child.forEach((id) => {
        if (typeof id === "string") ids.add(id);
      });
    }
    collectEvidenceIds(child, ids);
  }
  return ids;
}

function getDirectorNames(blueprint) {
  return {
    characters: (blueprint.character_bible || [])
      .map((item) => item.name)
      .filter(Boolean),
    locations: (blueprint.world_bible?.locations || [])
      .map((item) => item.name)
      .filter(Boolean)
  };
}

function validateAgainstDirector(scenePlan, blueprint) {
  const errors = [];
  const names = getDirectorNames(blueprint);
  const evidenceIds = collectEvidenceIds(blueprint);

  for (const scene of scenePlan.scenes) {
    if (!names.locations.includes(scene.location)) {
      errors.push(`Scene ${scene.scene_id} uses non-canonical location: ${scene.location}.`);
    }
    for (const character of scene.characters || []) {
      if (!names.characters.includes(character)) {
        errors.push(`Scene ${scene.scene_id} uses unknown character: ${character}.`);
      }
    }
    for (const id of scene.evidence_ids || []) {
      if (!evidenceIds.has(id)) {
        errors.push(`Scene ${scene.scene_id} uses unknown evidence ID: ${id}.`);
      }
    }
  }

  return errors;
}

export function createVideoGenerationJobs(scenePlan, options = {}) {
  if (!scenePlan || !Array.isArray(scenePlan.scenes)) {
    throw new Error("Scene Plan with scenes is required.");
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

  const jobs = [];
  let previousEnd = 0;

  for (const scene of scenePlan.scenes) {
    const duration = Number(scene.duration_seconds);
    const startTime = Number(scene.start_time);
    const endTime = Number(scene.end_time);
    const negativePrompt = Array.isArray(scene.negative_prompt)
      ? scene.negative_prompt.join(", ")
      : String(scene.negative_prompt || "");

    if (startTime !== previousEnd) {
      throw new Error(`Timeline gap or overlap at ${scene.scene_id}.`);
    }
    if (!scene.visual_prompt || duration <= 0) {
      throw new Error(`Incomplete video job: ${scene.scene_id}.`);
    }

    jobs.push({
      job_id: `VIDEO_JOB_${scene.scene_id}`,
      scene_id: scene.scene_id,
      provider: options.provider || "provider-neutral",
      model: options.model || null,
      status: "queued",
      start_time: startTime,
      end_time: endTime,
      duration_seconds: duration,
      location: scene.location,
      characters: scene.characters || [],
      evidence_ids: scene.evidence_ids || [],
      request: {
        prompt: `${scene.visual_prompt}\n\nDo not alter Director-approved identity, location, action or evidence.\nNegative prompt: ${negativePrompt}`,
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
    provider: options.provider || "provider-neutral",
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
