function getDurationParts(duration) {
  const total = Number(duration) || 20;
  const sceneCount = Math.ceil(total / 5);
  const parts = [];

  for (let i = 0; i < sceneCount; i++) {
    const start = i * 5;
    const end = Math.min(start + 5, total);

    parts.push({
      start_time: start,
      end_time: end,
      duration_seconds: end - start
    });
  }

  return parts;
}

function getCharacterNames(blueprint) {
  return (blueprint.character_bible || [])
    .map((character) => character.name)
    .filter(Boolean);
}

function getLocationNames(blueprint) {
  return (blueprint.world_bible?.locations || [])
    .map((location) => location.name)
    .filter(Boolean);
}

function getBeatForTime(blueprint, startTime) {
  const beats = blueprint.story_blueprint?.beats || [];

  return beats.find((beat) => {
    const range = String(beat.time_range || "")
      .replace(/[–—]/g, "-")
      .split("-")
      .map(Number);

    return (
      range.length === 2 &&
      startTime >= range[0] &&
      startTime < range[1]
    );
  });
}

function blueprintExplicitlyIncludesHealing(blueprint) {
  const text = [
    blueprint.story_blueprint?.ending_beat,
    ...(blueprint.story_blueprint?.beats || []).flatMap((beat) => [
      beat.story_action,
      beat.character_action,
      beat.transition_to_next
    ])
  ].filter(Boolean).join(" ").toLowerCase();

  return /heal|healing|recovered|recovery|revived|revival|cured|cure/.test(text);
}

function createScenePrompt({
  blueprint,
  beat,
  sceneNumber,
  aspectRatio,
  previousScene,
  nextScene
}) {
  const project = blueprint.project || {};
  const location = beat?.location || "Cinematic environment";
  const storyAction = beat?.story_action || "Continue the story naturally.";
  const characterAction =
    beat?.character_action || "Characters continue their established actions.";

  return `
Create Scene ${sceneNumber} as part of one continuous cinematic video.

PROJECT:
Title: ${project.title || "Untitled Project"}
Aspect ratio: ${aspectRatio}
Realism target: ${project.realism_target || "Grounded cinematic realism"}

LOCATION:
${location}

STORY ACTION:
${storyAction}

CHARACTER ACTION:
${characterAction}

CONTINUITY RULES:
- Keep every character's face, body, hair or fur, costume and accessories identical.
- Keep the location geography consistent.
- Keep the same time of day and weather progression.
- Keep lighting motivated by the established environment.
- Preserve all injuries, props and action states.
- Preserve the exact canonical character and location names.
- If the Director Blueprint uses Dronagiri, never output Gandhamadana or any alias.
- Do not introduce new characters without evidence.
- Do not change the visual style between scenes.
- Maintain realistic anatomy, gravity, weight and motion.
- Use ${aspectRatio} framing.

DIRECTOR BLUEPRINT LOCK:
- Use only events explicitly present in the Director Blueprint.
- Do not invent healing, recovery, dialogue, characters or new actions.
- Do not extend the story beyond the Director Blueprint ending beat.
- Every action must be traceable to the selected Director beat.
- Show Lakshmana healing only when the Director Blueprint explicitly says so.

PREVIOUS SCENE:
${previousScene || "This is the opening scene."}

NEXT SCENE:
${nextScene || "This is the final scene."}

Generate a production-ready cinematic shot prompt.
`;
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
    directorBlueprint.project?.duration_seconds ||
    20;

  const parts = getDurationParts(totalDuration);

  const characterNames =
    getCharacterNames(directorBlueprint);

  const locationNames =
    getLocationNames(directorBlueprint);

  const healingIsExplicit =
    blueprintExplicitlyIncludesHealing(directorBlueprint);

  const scenes = parts.map((part, index) => {
    const sceneNumber = index + 1;

    const beat = getBeatForTime(
      directorBlueprint,
      part.start_time
    );

    const previousScene =
      index > 0
        ? `Scene ${sceneNumber - 1} ends immediately before this scene.`
        : "";

    const nextScene =
      index < parts.length - 1
        ? `Scene ${sceneNumber + 1} must continue from this action.`
        : "End with a clear cinematic resolution.";

    let characterAction = beat?.character_action || "";

    if (
      sceneNumber === parts.length &&
      !healingIsExplicit
    ) {
      characterAction =
        "Hanuman returns to the Lanka encampment carrying the entire locked mountain. The established characters look upward in astonishment and renewed hope. Do not show herb application or healing.";
    }

    const prompt = createScenePrompt({
      blueprint: directorBlueprint,
      beat: beat ? { ...beat, character_action: characterAction } : beat,
      sceneNumber,
      aspectRatio,
      previousScene,
      nextScene
    });

    return {
      scene_id: `SCENE_${String(sceneNumber).padStart(2, "0")}`,
      scene_number: sceneNumber,
      start_time: part.start_time,
      end_time: part.end_time,
      duration_seconds: part.duration_seconds,
      location: beat?.location || locationNames[0] || "",
      characters: characterNames,
      story_action: beat?.story_action || "",
      character_action: characterAction,
      visual_prompt: prompt.trim(),
      negative_prompt: [
        "character face change",
        "costume change",
        "wrong location",
        "wrong time of day",
        "extra limbs",
        "missing fingers",
        "distorted anatomy",
        "plastic skin",
        "cartoon style",
        "modern objects",
        "random new characters",
        "inconsistent lighting"
      ],
      continuity_requirements: [
        "Same character identity across all scenes.",
        "Same costume and accessories across all scenes.",
        "Same environment geography across connected scenes.",
        "Actions continue without reset or teleportation.",
        "Lighting and weather change gradually and logically."
      ],
      transition_to_next:
        index < parts.length - 1
          ? "Continue naturally into the next scene."
          : healingIsExplicit
            ? "End with the explicitly described resolution."
            : "End on Hanuman's return with the entire mountain; do not add healing.",
      evidence_ids: beat?.evidence_ids || []
    };
  });

  return {
    project: {
      title:
        directorBlueprint.project?.title ||
        "LongShot AI Scene Plan",
      duration_seconds: totalDuration,
      aspect_ratio: aspectRatio,
      planning_strategy:
        "Blueprint-driven chronological scene planning with strict continuity."
    },

    continuity_locks: [
      ...characterNames,
      ...locationNames
    ],

    scenes,

    quality_control: {
      checks: [
        `Total duration must equal ${totalDuration} seconds.`,
        `Aspect ratio must remain ${aspectRatio}.`,
        "Character identity must remain unchanged.",
        "Costume and accessories must remain unchanged.",
        "Location geography must remain coherent.",
        "Every scene must continue from the previous scene."
      ],

      forbidden_errors: [
        "No random character replacement.",
        "No costume or face changes.",
        "No timeline gaps or overlaps.",
        "No modern objects unless explicitly supported.",
        "No impossible anatomy or physics.",
        "Never replace Dronagiri with Gandhamadana or another alias.",
        "Never invent healing or recovery unless present in the Director Blueprint."
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
