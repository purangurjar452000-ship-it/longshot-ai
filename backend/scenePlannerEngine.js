function parseTimeRange(value) {
  const cleaned = String(value || "")
    .replace(/[–—−]/g, "-")
    .trim();

  const clockMatch = cleaned.match(
    /^(\d+):(\d{1,2})\s*(?:-|to)\s*(\d+):(\d{1,2})$/i
  );

  if (clockMatch) {
    return {
      start:
        Number(clockMatch[1]) * 60 +
        Number(clockMatch[2]),

      end:
        Number(clockMatch[3]) * 60 +
        Number(clockMatch[4])
    };
  }

  const match = cleaned.match(
    /^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)$/i
  );

  if (!match) {
    return null;
  }

  return {
    start: Number(match[1]),
    end: Number(match[2])
  };
}

function getCharacters(blueprint) {
  return (blueprint.character_bible || [])
    .map((item) => String(item.name || "").trim())
    .filter(Boolean);
}

function getLocations(blueprint) {
  return (blueprint.world_bible?.locations || [])
    .map((item) => String(item.name || "").trim())
    .filter(Boolean);
}

function resolveLocation(beatLocation, locations) {
  const requested = String(beatLocation || "").trim();

  const exact = locations.find(
    (name) => name.toLowerCase() === requested.toLowerCase()
  );

  if (exact) return exact;

  const dronagiri = locations.find((name) =>
    name.toLowerCase().includes("dronagiri")
  );

  if (
    dronagiri &&
    /gandhamadana|mahodaya|sanjeevani mountain/i.test(requested)
  ) {
    return dronagiri;
  }

  return requested || locations[0] || "Unspecified location";
}

function getRelevantCharacters(beat, characters) {
  const text = [
    beat?.story_action,
    beat?.character_action,
    beat?.emotional_purpose
  ].filter(Boolean).join(" ").toLowerCase();

  const matched = characters.filter((name) =>
    text.includes(name.toLowerCase())
  );

  return matched.length > 0 ? matched : characters;
}

function buildVisualPrompt({ blueprint, beat, location, characters, aspectRatio }) {
  const visual = blueprint.visual_language || {};
  const characterText = characters.join(", ") || "established characters";

  return [
    `Production-ready cinematic shot from the Director Blueprint.`,
    `Vertical ${aspectRatio} composition.`,
    `Location: ${location}.`,
    `Characters: ${characterText}.`,
    `Story action: ${beat?.story_action || "Continue the selected beat exactly."}`,
    `Character action: ${beat?.character_action || "Preserve the established action state."}`,
    `Visual priority: ${beat?.visual_priority || "Maintain grounded cinematic realism."}`,
    `Camera language: ${visual.capture_system || "cinematic digital camera"}; ${visual.lens_policy || "natural lens rendering"}.`,
    `Lighting: ${visual.lighting || "motivated naturalistic lighting"}.`,
    `Texture and motion: ${visual.texture_detail || "realistic textures"}; ${visual.motion_rendering || "natural motion blur"}.`,
    `Use only the characters, location, action and facts present in this Director Blueprint.`,
    `Do not add healing, recovery, dialogue, props or events absent from the selected beat.`
  ].join(" ");
}

function buildNegativePrompt() {
  return [
    "canonical name changes",
    "Dronagiri renamed as Gandhamadana",
    "invented healing or recovery",
    "invented characters or events",
    "face morphing",
    "costume changes",
    "extra limbs",
    "missing fingers or toes",
    "plastic skin",
    "cartoon rendering",
    "modern objects",
    "wrong location",
    "timeline discontinuity",
    "weightless physics"
  ];
}

function validateScenePlan(plan, blueprint, expectedDuration, aspectRatio) {
  const errors = [];
  const scenes = plan.scenes;
  const locations = getLocations(blueprint);
  const blueprintText = [
    blueprint.story_blueprint?.logline,
    blueprint.story_blueprint?.opening_hook,
    blueprint.story_blueprint?.ending_beat,
    ...(blueprint.story_blueprint?.beats || []).flatMap((beat) => [
      beat.story_action,
      beat.character_action,
      beat.transition_to_next
    ])
  ].filter(Boolean).join(" ").toLowerCase();

  const planText = scenes.map((scene) => [
    scene.location,
    scene.story_action,
    scene.character_action
  ].filter(Boolean).join(" ")).join(" ").toLowerCase();

  if (!Array.isArray(scenes) || scenes.length === 0) {
    errors.push("Scene plan contains no scenes.");
    return errors;
  }

  const total = scenes.reduce(
    (sum, scene) => sum + Number(scene.duration_seconds || 0),
    0
  );

  if (total !== expectedDuration) {
    errors.push(`Duration mismatch: expected ${expectedDuration}, got ${total}.`);
  }

  let previousEnd = 0;

  for (const scene of scenes) {
    if (Number(scene.start_time) !== previousEnd) {
      errors.push(`Timeline gap or overlap at ${scene.scene_id}.`);
    }

    previousEnd = Number(scene.end_time);

    if (!locations.includes(scene.location)) {
      errors.push(`Unknown or non-canonical location: ${scene.location}.`);
    }
  }

  if (previousEnd !== expectedDuration) {
    errors.push("Timeline does not end at the requested duration.");
  }

  if (plan.project?.aspect_ratio !== aspectRatio) {
    errors.push(`Aspect ratio mismatch: expected ${aspectRatio}.`);
  }

  if (
    blueprintText.includes("dronagiri") &&
    planText.includes("gandhamadana")
  ) {
    errors.push("Dronagiri was replaced by the Gandhamadana alias.");
  }

  if (
    !/heal|healing|recovery|recovered|revived|cure/.test(blueprintText) &&
    /heal|healing|recovery|recovered|revived|cure/.test(planText)
  ) {
    errors.push("Scene Planner invented healing or recovery.");
  }

  return errors;
}

export function createScenePlan(
  directorBlueprint,
  duration = 20,
  aspectRatio = "9:16"
) {
  if (!directorBlueprint || typeof directorBlueprint !== "object") {
    throw new Error("Director Blueprint is required.");
  }

  const expectedDuration = Number(duration) ||
    Number(directorBlueprint.project?.duration_seconds) || 20;

  const characters = getCharacters(directorBlueprint);
  const locations = getLocations(directorBlueprint);
  const beats = Array.isArray(directorBlueprint.story_blueprint?.beats)
    ? directorBlueprint.story_blueprint.beats
    : [];

  if (beats.length === 0) {
    throw new Error("Director Blueprint contains no story beats.");
  }

  const scenes = beats.map((beat, index) => {
    const parsed = parseTimeRange(beat.time_range);
    const start = parsed ? parsed.start : Math.min(index * 5, expectedDuration);
    const end = parsed ? parsed.end : Math.min(start + 5, expectedDuration);
    const location = resolveLocation(beat.location, locations);
    const sceneCharacters = getRelevantCharacters(beat, characters);

    return {
      scene_id: `SCENE_${String(index + 1).padStart(2, "0")}`,
      scene_number: index + 1,
      beat_number: beat.beat_number || index + 1,
      start_time: start,
      end_time: end,
      duration_seconds: end - start,
      location,
      characters: sceneCharacters,
      story_action: beat.story_action || "",
      character_action: beat.character_action || "",
      visual_prompt: buildVisualPrompt({
        blueprint: directorBlueprint,
        beat,
        location,
        characters: sceneCharacters,
        aspectRatio
      }),
      negative_prompt: buildNegativePrompt(),
      continuity_requirements: [
        "Preserve exact character identity and appearance.",
        "Preserve exact costume, accessories, injuries and action state.",
        "Preserve exact canonical location name and geography.",
        "Continue directly from the previous beat without restarting.",
        "Do not add events absent from the Director Blueprint."
      ],
      transition_to_next: beat.transition_to_next || "Continue to the next beat.",
      evidence_ids: Array.isArray(beat.evidence_ids) ? beat.evidence_ids : []
    };
  });

  const scenePlan = {
    project: {
      title: directorBlueprint.project?.title || "LongShot AI Scene Plan",
      duration_seconds: expectedDuration,
      aspect_ratio: aspectRatio,
      planning_strategy: "Deterministic Director Blueprint to Scene Plan V2."
    },
    continuity_locks: [
      ...characters,
      ...locations,
      "No invented events outside the Director Blueprint."
    ],
    scenes,
    quality_control: {
      checks: [
        "Exact duration and contiguous timeline.",
        "Exact aspect ratio.",
        "Canonical character and location names.",
        "No invented healing or recovery.",
        "No invented characters, dialogue or events."
      ],
      forbidden_errors: buildNegativePrompt()
    },
    _longshot_scene_validation: {
      validator_version: "V2",
      passed: true,
      validated_duration: expectedDuration,
      validated_aspect_ratio: aspectRatio,
      scene_count: scenes.length
    }
  };

  const errors = validateScenePlan(
    scenePlan,
    directorBlueprint,
    expectedDuration,
    aspectRatio
  );

  if (errors.length > 0) {
    throw new Error(`Scene Plan failed validation: ${errors.join(" | ")}`);
  }

  return scenePlan;
}
