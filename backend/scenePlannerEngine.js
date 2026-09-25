export function createScenePlan(
  directorBlueprint,
  duration = 20,
  aspectRatio = "9:16"
) {
  if (!directorBlueprint || typeof directorBlueprint !== "object") {
    throw new Error("Director Blueprint is required.");
  }

  const totalDuration = Number(duration) ||
    Number(directorBlueprint.project?.duration_seconds) || 20;

  const characters = (directorBlueprint.character_bible || [])
    .map((item) => String(item.name || "").trim())
    .filter(Boolean);

  const locations = (directorBlueprint.world_bible?.locations || [])
    .map((item) => String(item.name || "").trim())
    .filter(Boolean);

  const beats = directorBlueprint.story_blueprint?.beats || [];

  if (!Array.isArray(beats) || beats.length === 0) {
    throw new Error("Director Blueprint contains no story beats.");
  }

  const parseRange = (value, index) => {
    const text = String(value || "")
      .replace(/[–—−]/g, "-")
      .trim();

    const clock = text.match(
      /^(\d+):(\d{1,2})\s*(?:-|to)\s*(\d+):(\d{1,2})$/i
    );

    if (clock) {
      return {
        start: Number(clock[1]) * 60 + Number(clock[2]),
        end: Number(clock[3]) * 60 + Number(clock[4])
      };
    }

    const plain = text.match(
      /^(\d+(?:\.\d+)?)\s*(?:-|to)\s*(\d+(?:\.\d+)?)$/i
    );

    if (plain) {
      return {
        start: Number(plain[1]),
        end: Number(plain[2])
      };
    }

    const start = Math.min(index * 5, totalDuration);
    return {
      start,
      end: Math.min(start + 5, totalDuration)
    };
  };

  const scenes = beats.map((beat, index) => {
    const range = parseRange(beat.time_range, index);
    const location = locations.includes(beat.location)
      ? beat.location
      : String(beat.location || locations[0] || "Unspecified location");

    const beatText = [
      beat.story_action,
      beat.character_action,
      beat.emotional_purpose
    ].filter(Boolean).join(" ").toLowerCase();

    const sceneCharacters = characters.filter((name) =>
      beatText.includes(name.toLowerCase())
    );

    if (sceneCharacters.length === 0) {
      sceneCharacters.push(...characters);
    }

    const negativePrompt = [
      "canonical name changes",
      "invented characters or events",
      "face morphing",
      "costume changes",
      "extra limbs",
      "missing fingers or toes",
      "plastic skin",
      "cartoon rendering",
      "modern objects",
      "timeline discontinuity",
      "weightless physics"
    ];

    const visualPrompt = [
      "Production-ready cinematic shot from the Director Blueprint.",
      `Vertical ${aspectRatio} composition.`,
      `Location: ${location}.`,
      `Characters: ${sceneCharacters.join(", ")}.`,
      `Story action: ${beat.story_action || "Follow this beat exactly."}`,
      `Character action: ${beat.character_action || "Preserve the established action state."}`,
      `Visual priority: ${beat.visual_priority || "Grounded cinematic realism."}`,
      "Use only researched characters, locations, actions and facts from the Director Blueprint.",
      "Do not invent events outside the selected beat."
    ].join(" ");

    return {
      scene_id: `SCENE_${String(index + 1).padStart(2, "0")}`,
      scene_number: index + 1,
      beat_number: beat.beat_number || index + 1,
      start_time: range.start,
      end_time: range.end,
      duration_seconds: range.end - range.start,
      location,
      characters: sceneCharacters,
      story_action: beat.story_action || "",
      character_action: beat.character_action || "",
      visual_prompt: visualPrompt,
      negative_prompt: negativePrompt,
      continuity_requirements: [
        "Preserve exact researched character identity and appearance.",
        "Preserve exact costume, accessories, injuries and action state.",
        "Preserve exact researched location name and geography.",
        "Do not add events outside the Director Blueprint."
      ],
      transition_to_next: beat.transition_to_next || "Continue to the next beat.",
      evidence_ids: Array.isArray(beat.evidence_ids)
        ? beat.evidence_ids
        : []
    };
  });

  let previousEnd = 0;

  for (const scene of scenes) {
    if (scene.start_time !== previousEnd) {
      throw new Error(`Timeline gap or overlap at ${scene.scene_id}.`);
    }
    previousEnd = scene.end_time;
  }

  if (previousEnd !== totalDuration) {
    throw new Error("Timeline does not end at the requested duration.");
  }

  return {
    project: {
      title: directorBlueprint.project?.title || "LongShot AI Scene Plan",
      duration_seconds: totalDuration,
      aspect_ratio: aspectRatio,
      planning_strategy: "Generic evidence-driven Scene Planner V2."
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
        "Canonical names from the current Director Blueprint.",
        "No invented characters or events."
      ],
      forbidden_errors: [
        "Canonical name changes",
        "Invented events",
        "Character identity changes",
        "Impossible anatomy or physics"
      ]
    },
    _longshot_scene_validation: {
      validator_version: "V2",
      passed: true,
      validated_duration: totalDuration,
      validated_aspect_ratio: aspectRatio,
      scene_count: scenes.length
    }
  };
}
