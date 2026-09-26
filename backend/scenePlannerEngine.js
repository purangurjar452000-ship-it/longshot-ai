function cleanName(value) {
  return String(value || "").trim();
}

function getCharacterMap(blueprint) {
  return new Map(
    (blueprint.character_bible || [])
      .map((character) => [
        cleanName(character.name),
        character
      ])
      .filter(([name]) => name)
  );
}

function getLocationMap(blueprint) {
  return new Map(
    (blueprint.world_bible?.locations || [])
      .map((location) => [
        cleanName(location.name),
        location
      ])
      .filter(([name]) => name)
  );
}

function parseTimeRange(value, index, totalDuration) {
  const text = String(value || "")
    .replace(/[–—−]/g, "-")
    .trim();

  const clock = text.match(
    /^(\d+):(\d{1,2})\s*(?:-|to)\s*(\d+):(\d{1,2})$/i
  );

  if (clock) {
    return {
      start:
        Number(clock[1]) * 60 +
        Number(clock[2]),
      end:
        Number(clock[3]) * 60 +
        Number(clock[4])
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

  const fallbackStart = Math.min(
    index * 5,
    totalDuration
  );

  return {
    start: fallbackStart,
    end: Math.min(
      fallbackStart + 5,
      totalDuration
    )
  };
}

function buildCharacterDetails(character) {
  if (!character) {
    return "";
  }

  return [
    `Identity: ${character.physical_identity || ""}`,
    `Face: ${character.face || ""}`,
    `Eyes: ${character.eyes || ""}`,
    `Hair or fur: ${character.hair_or_fur || ""}`,
    `Body: ${character.body_proportions || ""}`,
    `Anatomy: ${character.anatomy || ""}`,
    `Musculature: ${character.musculature || ""}`,
    `Costume: ${character.costume || ""}`,
    `Accessories: ${character.accessories || ""}`,
    `Movement: ${character.movement_signature || ""}`,
    `Emotion: ${character.emotional_behavior || ""}`,
    `Continuity rules: ${(character.continuity_rules || []).join("; ")}`,
    `Forbidden changes: ${(character.forbidden_changes || []).join("; ")}`
  ]
    .filter((value) => value.trim().length > 0)
    .join(". ");
}

function buildLocationDetails(location) {
  if (!location) {
    return "";
  }

  return [
    `Environment: ${location.environment || ""}`,
    `Terrain: ${location.terrain || ""}`,
    `Vegetation: ${location.vegetation || ""}`,
    `Architecture: ${location.architecture || ""}`,
    `Props: ${location.props || ""}`,
    `Atmosphere: ${location.atmosphere || ""}`,
    `Weather: ${location.weather || ""}`,
    `Time: ${location.time_of_day || ""}`,
    `Lighting: ${location.lighting_conditions || ""}`,
    `Physics: ${(location.environmental_physics || []).join("; ")}`,
    `Continuity rules: ${(location.continuity_rules || []).join("; ")}`
  ]
    .filter((value) => value.trim().length > 0)
    .join(". ");
}

function validateSceneCharacters(
  sceneCharacters,
  characterMap,
  beatNumber
) {
  for (const name of sceneCharacters) {
    if (!characterMap.has(name)) {
      throw new Error(
        `Beat ${beatNumber} uses unknown character "${name}".`
      );
    }
  }
}

function getSceneCharacters(
  beat,
  index,
  characterMap
) {
  const explicitCharacters =
    Array.isArray(beat.characters) &&
    beat.characters.length > 0
      ? beat.characters
          .map(cleanName)
          .filter(Boolean)
      : null;

  if (explicitCharacters) {
    validateSceneCharacters(
      explicitCharacters,
      characterMap,
      beat.beat_number || index + 1
    );

    return explicitCharacters;
  }

  const beatText = [
    beat.story_action,
    beat.character_action,
    beat.emotional_purpose
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const inferredCharacters =
    Array.from(characterMap.keys()).filter((name) =>
      beatText.includes(name.toLowerCase())
    );

  if (inferredCharacters.length > 0) {
    return inferredCharacters;
  }

  return Array.from(characterMap.keys());
}

export function createScenePlan(
  directorBlueprint,
  duration = 20,
  aspectRatio = "9:16"
) {
  if (
    !directorBlueprint ||
    typeof directorBlueprint !== "object"
  ) {
    throw new Error("Director Blueprint is required.");
  }

  const totalDuration =
    Number(duration) ||
    Number(
      directorBlueprint.project?.duration_seconds
    ) ||
    20;

  const characterMap =
    getCharacterMap(directorBlueprint);

  const locationMap =
    getLocationMap(directorBlueprint);

  const beats =
    directorBlueprint.story_blueprint?.beats || [];

  if (!Array.isArray(beats) || beats.length === 0) {
    throw new Error(
      "Director Blueprint contains no story beats."
    );
  }

  const scenes = beats.map((beat, index) => {
    const range = parseTimeRange(
      beat.time_range,
      index,
      totalDuration
    );

    const locationName = cleanName(beat.location);

    const location =
      locationMap.get(locationName) ||
      directorBlueprint.world_bible?.locations?.[0] ||
      null;

    const canonicalLocation =
      locationName ||
      cleanName(location?.name) ||
      "Unspecified location";

    const sceneCharacters = getSceneCharacters(
      beat,
      index,
      characterMap
    );

    const characterDetails = sceneCharacters
      .map((name) =>
        buildCharacterDetails(
          characterMap.get(name)
        )
      )
      .filter(Boolean)
      .join(" ");

    const locationDetails =
      buildLocationDetails(location);

    const negativePrompt = [
      "canonical name changes",
      "unlisted characters",
      "unrelated historical characters",
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
      `Canonical location: ${canonicalLocation}.`,
      `Canonical characters: ${sceneCharacters.join(", ")}.`,
      `Story action: ${
        beat.story_action ||
        "Follow this beat exactly."
      }`,
      `Character action: ${
        beat.character_action ||
        "Preserve the established action state."
      }`,
      `Visual priority: ${
        beat.visual_priority ||
        "Grounded cinematic realism."
      }`,
      `Character identity and appearance locks: ${
        characterDetails || "Use the Director Blueprint exactly."
      }`,
      `Location and environment locks: ${
        locationDetails || "Use the Director Blueprint exactly."
      }`,
      "Use only the listed canonical characters.",
      "Do not replace any character with an unrelated historical, cinematic or generic warrior figure.",
      "Do not invent events outside the selected beat.",
      "Preserve exact identity, face, body, costume, accessories, lighting, geography and physical continuity."
    ].join(" ");

    return {
      scene_id: `SCENE_${String(index + 1).padStart(2, "0")}`,
      scene_number: index + 1,
      beat_number: beat.beat_number || index + 1,
      start_time: range.start,
      end_time: range.end,
      duration_seconds: range.end - range.start,
      location: canonicalLocation,
      characters: sceneCharacters,
      story_action: beat.story_action || "",
      character_action: beat.character_action || "",
      visual_prompt: visualPrompt,
      negative_prompt: negativePrompt,
      continuity_requirements: [
        "Preserve exact researched character identity and appearance.",
        "Preserve exact face, body, costume and accessories.",
        "Preserve exact researched location name and geography.",
        "Preserve injuries and action state.",
        "Do not add events outside the Director Blueprint."
      ],
      transition_to_next:
        beat.transition_to_next ||
        "Continue to the next beat.",
      evidence_ids: Array.isArray(beat.evidence_ids)
        ? beat.evidence_ids
        : []
    };
  });

  let previousEnd = 0;

  for (const scene of scenes) {
    if (scene.start_time !== previousEnd) {
      throw new Error(
        `Timeline gap or overlap at ${scene.scene_id}.`
      );
    }

    if (scene.end_time <= scene.start_time) {
      throw new Error(
        `Invalid duration at ${scene.scene_id}.`
      );
    }

    previousEnd = scene.end_time;
  }

  if (previousEnd !== totalDuration) {
    throw new Error(
      "Timeline does not end at the requested duration."
    );
  }

  return {
    project: {
      title:
        directorBlueprint.project?.title ||
        "LongShot AI Scene Plan",
      duration_seconds: totalDuration,
      aspect_ratio: aspectRatio,
      planning_strategy:
        "Generic evidence-driven Scene Planner V3."
    },

    continuity_locks: [
      ...characterMap.keys(),
      ...locationMap.keys(),
      "No invented events outside the Director Blueprint."
    ],

    scenes,

    quality_control: {
      checks: [
        "Exact duration and contiguous timeline.",
        "Exact aspect ratio.",
        "Canonical names from the current Director Blueprint.",
        "Explicit beat character arrays preserved exactly.",
        "Character and location details carried into prompts.",
        "No invented characters or events."
      ],
      forbidden_errors: [
        "Canonical name changes",
        "Dropped beat characters",
        "Unknown characters",
        "Invented events",
        "Character identity changes",
        "Impossible anatomy or physics"
      ]
    },

    _longshot_scene_validation: {
      validator_version: "V3",
      passed: true,
      validated_duration: totalDuration,
      validated_aspect_ratio: aspectRatio,
      scene_count: scenes.length
    }
  };
}
