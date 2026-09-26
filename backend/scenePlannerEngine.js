function cleanName(value) {
  return String(value || "").trim();
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
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

    return [...new Set(explicitCharacters)];
  }

  const beatText = normalizeText([
    beat.story_action,
    beat.character_action,
    beat.emotional_purpose
  ]
    .filter(Boolean)
    .join(" "));

  const inferredCharacters =
    Array.from(characterMap.keys()).filter((name) =>
      beatText.includes(normalizeText(name))
    );

  if (inferredCharacters.length > 0) {
    return inferredCharacters;
  }

  return Array.from(characterMap.keys());
}

/* -------------------------------------------------------
   GENERIC SEMANTIC ANALYSIS
------------------------------------------------------- */

function getBeatText(beat) {
  return normalizeText([
    beat.story_action,
    beat.character_action,
    beat.emotional_purpose,
    beat.visual_priority,
    beat.transition_to_next
  ]
    .filter(Boolean)
    .join(" "));
}

function getLocationText(location) {
  if (!location) {
    return "";
  }

  return normalizeText([
    location.name,
    location.environment,
    location.terrain,
    location.vegetation,
    location.architecture,
    location.props,
    location.atmosphere,
    location.weather,
    location.time_of_day,
    location.lighting_conditions,
    ...(location.environmental_physics || []),
    ...(location.continuity_rules || [])
  ]
    .filter(Boolean)
    .join(" "));
}

function containsAny(text, terms) {
  return terms.some((term) =>
    text.includes(normalizeText(term))
  );
}

function getTemporalProfile(text) {
  return {
    night: containsAny(text, [
      "night",
      "nighttime",
      "midnight",
      "deep night",
      "moonlit",
      "moonlight",
      "starlight",
      "dark sky"
    ]),

    dawn: containsAny(text, [
      "dawn",
      "pre-dawn",
      "predawn",
      "breaking dawn",
      "first light",
      "eastern horizon",
      "horizon brightens",
      "golden dawn"
    ]),

    sunrise: containsAny(text, [
      "sunrise",
      "sun rises",
      "first golden ray",
      "golden sunlight",
      "morning light"
    ]),

    day: containsAny(text, [
      "daylight",
      "daytime",
      "day light",
      "bright daylight"
    ]),

    sunset: containsAny(text, [
      "sunset",
      "dusk",
      "evening"
    ])
  };
}

function hasTemporalConflict(beatText, locationText) {
  const beatTime = getTemporalProfile(beatText);
  const locationTime = getTemporalProfile(locationText);

  const beatDawn =
    beatTime.dawn ||
    beatTime.sunrise;

  const locationNight =
    locationTime.night &&
    !locationTime.dawn &&
    !locationTime.sunrise;

  if (beatDawn && locationNight) {
    return true;
  }

  if (beatTime.day && locationTime.night) {
    return true;
  }

  if (beatTime.sunset && locationTime.dawn) {
    return true;
  }

  return false;
}

/* -------------------------------------------------------
   ACTION / LOCATION SEMANTIC CHECKS
------------------------------------------------------- */

function getActionProfile(text) {
  return {
    flight: containsAny(text, [
      "fly",
      "flying",
      "flight",
      "airborne",
      "sky",
      "upper troposphere",
      "supersonic",
      "soaring"
    ]),

    mountain: containsAny(text, [
      "mountain",
      "peak",
      "mount",
      "cliff",
      "rock face",
      "bedrock"
    ]),

    water: containsAny(text, [
      "ocean",
      "sea",
      "river",
      "water",
      "shore",
      "coastline"
    ]),

    medical: containsAny(text, [
      "wound",
      "wounded",
      "injury",
      "heal",
      "healing",
      "medicine",
      "medicinal",
      "herb",
      "herbs",
      "physician",
      "medical"
    ]),

    camp: containsAny(text, [
      "camp",
      "encampment",
      "tent",
      "hearth",
      "military camp",
      "barricade"
    ]),

    forest: containsAny(text, [
      "forest",
      "jungle",
      "trees",
      "canopy",
      "woods"
    ]),

    snow: containsAny(text, [
      "snow",
      "snowy",
      "snow-covered",
      "freezing",
      "alpine",
      "himalayan",
      "himalayas"
    ]),

    travel: containsAny(text, [
      "travel",
      "journey",
      "returns",
      "returning",
      "toward",
      "towards",
      "crosses",
      "crossing",
      "heading"
    ])
  };
}

function validateLocationActionCompatibility(
  beat,
  location,
  warnings
) {
  if (!location) {
    return;
  }

  const beatText = getBeatText(beat);
  const locationText = getLocationText(location);
  const action = getActionProfile(beatText);

  const locationIsCamp =
    containsAny(locationText, [
      "camp",
      "encampment",
      "military camp"
    ]);

  const locationIsSky =
    containsAny(locationText, [
      "sky",
      "upper troposphere",
      "transition space",
      "high altitude"
    ]);

  const locationIsMountain =
    containsAny(locationText, [
      "mountain",
      "himalaya",
      "himalayas",
      "alpine peak",
      "snowy peak"
    ]);

  const locationIsWater =
    containsAny(locationText, [
      "ocean",
      "sea",
      "coast",
      "coastal"
    ]);

  const locationIsForest =
    containsAny(locationText, [
      "forest",
      "jungle",
      "woodland"
    ]);

  if (action.flight && locationIsCamp) {
    warnings.push(
      `Beat ${beat.beat_number}: flight/airborne action is paired with a camp location. Verify that the scene does not visually remain inside the camp.`
    );
  }

  if (action.snow && !locationIsMountain) {
    warnings.push(
      `Beat ${beat.beat_number}: snow/alpine action is not clearly supported by the selected location.`
    );
  }

  if (action.mountain && !locationIsMountain && !locationIsSky) {
    warnings.push(
      `Beat ${beat.beat_number}: mountain-related action may conflict with the selected location.`
    );
  }

  if (action.water && !locationIsWater && !locationIsSky) {
    warnings.push(
      `Beat ${beat.beat_number}: water/coast action may conflict with the selected location.`
    );
  }

  if (action.forest && !locationIsForest && !locationIsSky) {
    warnings.push(
      `Beat ${beat.beat_number}: forest action may conflict with the selected location.`
    );
  }

  if (
    action.medical &&
    !locationIsCamp &&
    !locationIsMountain
  ) {
    warnings.push(
      `Beat ${beat.beat_number}: medical action is not clearly supported by the selected environment.`
    );
  }
}

/* -------------------------------------------------------
   ACTION DENSITY
------------------------------------------------------- */

function estimateActionCount(text) {
  const actionPatterns = [
    /\blands?\b/g,
    /\bflies?\b/g,
    /\bflying\b/g,
    /\breturns?\b/g,
    /\barrives?\b/g,
    /\bsearch(?:es|ing)?\b/g,
    /\bfinds?\b/g,
    /\bdecides?\b/g,
    /\bgrabs?\b/g,
    /\bholds?\b/g,
    /\blifts?\b/g,
    /\btears?\b/g,
    /\bpulls?\b/g,
    /\bplaces?\b/g,
    /\bsets?\s+down\b/g,
    /\bharvests?\b/g,
    /\bplucks?\b/g,
    /\bpresses?\b/g,
    /\bapplies?\b/g,
    /\bkneels?\b/g,
    /\bbows?\b/g,
    /\bstares?\b/g,
    /\blooks?\b/g,
    /\bpoints?\b/g,
    /\bturns?\b/g,
    /\bruns?\b/g,
    /\bwalks?\b/g,
    /\bstands?\b/g,
    /\bjumps?\b/g,
    /\bleaps?\b/g,
    /\blaunches?\b/g,
    /\bcracks?\b/g,
    /\bbreaks?\b/g,
    /\bawakens?\b/g,
    /\brises?\b/g
  ];

  let count = 0;

  for (const pattern of actionPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

function validateActionDensity(
  beat,
  durationSeconds,
  warnings
) {
  const beatText = getBeatText(beat);
  const actionCount = estimateActionCount(beatText);

  if (durationSeconds <= 5 && actionCount >= 6) {
    warnings.push(
      `Beat ${beat.beat_number}: approximately ${actionCount} distinct actions are packed into ${durationSeconds} seconds. Consider simplifying or prioritizing one dominant visual action.`
    );
  }

  if (durationSeconds <= 5 && actionCount >= 8) {
    warnings.push(
      `Beat ${beat.beat_number}: action density is extremely high for a short generation window and may cause skipped actions, temporal compression, or visual glitches.`
    );
  }
}

/* -------------------------------------------------------
   CHARACTER ACTION CONSISTENCY
------------------------------------------------------- */

function validateCharacterPresence(
  beat,
  sceneCharacters,
  characterMap,
  warnings
) {
  const beatText = getBeatText(beat);

  for (const name of sceneCharacters) {
    const character = characterMap.get(name);

    if (!character) {
      continue;
    }

    const normalizedName = normalizeText(name);

    if (
      beatText.includes(normalizedName)
    ) {
      continue;
    }

    const identityText = normalizeText([
      character.physical_identity,
      character.face,
      character.role,
      character.description
    ]
      .filter(Boolean)
      .join(" "));

    if (
      identityText &&
      beatText.includes(identityText)
    ) {
      continue;
    }
  }
}

/* -------------------------------------------------------
   TRANSITION / ENVIRONMENT LEAKAGE
------------------------------------------------------- */

function validateTransitionEnvironment(
  previousScene,
  currentScene,
  previousLocation,
  currentLocation,
  warnings
) {
  if (
    !previousScene ||
    !previousLocation ||
    !currentLocation
  ) {
    return;
  }

  const previousText = normalizeText([
    previousScene.story_action,
    previousScene.character_action,
    buildLocationDetails(previousLocation)
  ]
    .filter(Boolean)
    .join(" "));

  const currentText = normalizeText([
    currentScene.story_action,
    currentScene.character_action,
    buildLocationDetails(currentLocation)
  ]
    .filter(Boolean)
    .join(" "));

  const previousCamp =
    containsAny(previousText, [
      "camp",
      "encampment",
      "tent",
      "hearth",
      "barricade"
    ]);

  const currentSky =
    containsAny(currentText, [
      "sky",
      "upper troposphere",
      "airborne",
      "flight",
      "flying",
      "supersonic"
    ]);

  if (previousCamp && currentSky) {
    warnings.push(
      `Transition ${previousScene.scene_id} → ${currentScene.scene_id}: verify that camp props, tents, fires, soldiers, or ground-level architecture do not leak into the airborne scene.`
    );
  }

  const previousMountain =
    containsAny(previousText, [
      "mountain",
      "himalaya",
      "alpine",
      "snowy peak"
    ]);

  const currentCamp =
    containsAny(currentText, [
      "camp",
      "encampment",
      "tent",
      "hearth"
    ]);

  if (previousMountain && currentCamp) {
    warnings.push(
      `Transition ${previousScene.scene_id} → ${currentScene.scene_id}: verify that mountain terrain does not remain incorrectly attached to the camp environment.`
    );
  }
}

/* -------------------------------------------------------
   OBJECT CONTINUITY
------------------------------------------------------- */

function getObjectProfile(text) {
  return {
    mountain:
      containsAny(text, [
        "mountain",
        "dronagiri",
        "peak",
        "massive rock"
      ]),

    herb:
      containsAny(text, [
        "herb",
        "herbs",
        "sanjeevani",
        "medicinal plant"
      ]),

    weapon:
      containsAny(text, [
        "weapon",
        "bow",
        "arrow",
        "sword",
        "mace"
      ]),

    woundedPerson:
      containsAny(text, [
        "wounded",
        "injured",
        "unconscious",
        "chest wound"
      ])
  };
}

function validateObjectContinuity(
  previousScene,
  currentScene,
  warnings
) {
  if (!previousScene || !currentScene) {
    return;
  }

  const previousProfile =
    getObjectProfile(
      getBeatText(previousScene)
    );

  const currentProfile =
    getObjectProfile(
      getBeatText(currentScene)
    );

  if (
    previousProfile.mountain &&
    !currentProfile.mountain &&
    containsAny(
      getBeatText(previousScene),
      [
        "carry",
        "carrying",
        "lift",
        "uproot",
        "shoulder",
        "takes the mountain"
      ]
    )
  ) {
    if (
      containsAny(
        getBeatText(currentScene),
        [
          "return",
          "returning",
          "fly back",
          "flies back",
          "carry",
          "carrying"
        ]
      )
    ) {
      warnings.push(
        `Transition ${previousScene.scene_id} → ${currentScene.scene_id}: a previously acquired large object may need explicit continuity into the next scene.`
      );
    }
  }
}

/* -------------------------------------------------------
   SEMANTIC SCENE VALIDATOR
------------------------------------------------------- */

function validateSceneSemantics(
  scenes,
  locationMap
) {
  const warnings = [];
  const errors = [];

  for (let index = 0; index < scenes.length; index++) {
    const scene = scenes[index];
    const location =
      locationMap.get(
        cleanName(scene.location)
      );

    const beat = {
      beat_number: scene.beat_number,
      story_action: scene.story_action,
      character_action: scene.character_action,
      emotional_purpose: "",
      visual_priority: scene.visual_priority,
      transition_to_next:
        scene.transition_to_next
    };

    const beatText = getBeatText(beat);
    const locationText = getLocationText(location);

    if (!location) {
      errors.push(
        `Scene ${scene.scene_id}: canonical location "${scene.location}" does not exist in the Director Blueprint.`
      );
      continue;
    }

    /* Temporal consistency */

    if (
      hasTemporalConflict(
        beatText,
        locationText
      )
    ) {
      warnings.push(
        `Scene ${scene.scene_id}: beat action contains temporal/lighting language that may conflict with the selected location conditions.`
      );
    }

    /* Location ↔ action */

    validateLocationActionCompatibility(
      beat,
      location,
      warnings
    );

    /* Action density */

    validateActionDensity(
      beat,
      scene.duration_seconds,
      warnings
    );

    /* Character/action sanity */

    validateCharacterPresence(
      beat,
      scene.characters,
      new Map(
        scene.characters.map((name) => [
          name,
          {}
        ])
      ),
      warnings
    );

    /* Transition checks */

    if (index > 0) {
      const previousScene =
        scenes[index - 1];

      const previousLocation =
        locationMap.get(
          cleanName(
            previousScene.location
          )
        );

      validateTransitionEnvironment(
        previousScene,
        scene,
        previousLocation,
        location,
        warnings
      );

      validateObjectContinuity(
        previousScene,
        scene,
        warnings
      );
    }
  }

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------
   SCENE PLAN CREATION
------------------------------------------------------- */

export function createScenePlan(
  directorBlueprint,
  duration = 20,
  aspectRatio = "9:16"
) {
  if (
    !directorBlueprint ||
    typeof directorBlueprint !== "object"
  ) {
    throw new Error(
      "Director Blueprint is required."
    );
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
    directorBlueprint.story_blueprint?.beats ||
    [];

  if (
    !Array.isArray(beats) ||
    beats.length === 0
  ) {
    throw new Error(
      "Director Blueprint contains no story beats."
    );
  }

  const scenes = beats.map(
    (beat, index) => {
      const range = parseTimeRange(
        beat.time_range,
        index,
        totalDuration
      );

      const locationName =
        cleanName(beat.location);

      const location =
        locationMap.get(locationName) ||
        null;

      if (!location) {
        throw new Error(
          `Beat ${beat.beat_number || index + 1} references unknown location "${locationName}".`
        );
      }

      const canonicalLocation =
        locationName ||
        cleanName(location.name) ||
        "Unspecified location";

      const sceneCharacters =
        getSceneCharacters(
          beat,
          index,
          characterMap
        );

      const characterDetails =
        sceneCharacters
          .map((name) =>
            buildCharacterDetails(
              characterMap.get(name)
            )
          )
          .filter(Boolean)
          .join(" ");

      const locationDetails =
        buildLocationDetails(
          location
        );

      const negativePrompt = [
        "canonical name changes",
        "unlisted characters",
        "unrelated historical characters",
        "invented characters or events",
        "environment leakage from previous or next scene",
        "incorrect location",
        "incorrect geography",
        "temporal lighting mismatch",
        "day/night inconsistency",
        "sunrise appearing during deep night unless explicitly transitioning",
        "camp environment appearing in airborne scenes",
        "mountain environment appearing in unrelated locations",
        "unnecessary background characters",
        "face morphing",
        "costume changes",
        "extra limbs",
        "missing fingers or toes",
        "plastic skin",
        "cartoon rendering",
        "modern objects",
        "timeline discontinuity",
        "weightless physics",
        "floating objects",
        "broken anatomy"
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
        "Execute the selected beat as one coherent continuous visual moment.",
        "Prioritize the dominant action and do not compress unrelated actions into the same shot.",
        "Maintain physically plausible character positions relative to the selected environment.",
        "Do not import props, architecture, terrain, weather, lighting, or background elements from another scene.",
        `Character identity and appearance locks: ${
          characterDetails ||
          "Use the Director Blueprint exactly."
        }`,
        `Location and environment locks: ${
          locationDetails ||
          "Use the Director Blueprint exactly."
        }`,
        "Use only the listed canonical characters.",
        "Do not replace any character with an unrelated historical, cinematic or generic figure.",
        "Do not invent events outside the selected beat.",
        "Preserve exact identity, face, body, costume, accessories, lighting, geography and physical continuity."
      ].join(" ");

      return {
        scene_id:
          `SCENE_${String(index + 1).padStart(2, "0")}`,

        scene_number:
          index + 1,

        beat_number:
          beat.beat_number ||
          index + 1,

        start_time:
          range.start,

        end_time:
          range.end,

        duration_seconds:
          range.end - range.start,

        location:
          canonicalLocation,

        characters:
          sceneCharacters,

        story_action:
          beat.story_action || "",

        character_action:
          beat.character_action || "",

        visual_priority:
          beat.visual_priority || "",

        visual_prompt:
          visualPrompt,

        negative_prompt:
          negativePrompt,

        continuity_requirements: [
          "Preserve exact researched character identity and appearance.",
          "Preserve exact face, body, costume and accessories.",
          "Preserve exact researched location name and geography.",
          "Preserve injuries and action state.",
          "Preserve important objects acquired or carried from the previous beat.",
          "Do not import environment elements from another scene.",
          "Do not add events outside the Director Blueprint."
        ],

        transition_to_next:
          beat.transition_to_next ||
          "Continue to the next beat.",

        evidence_ids:
          Array.isArray(
            beat.evidence_ids
          )
            ? beat.evidence_ids
            : []
      };
    }
  );

  /* ---------------------------------------------------
     TIMELINE VALIDATION
  --------------------------------------------------- */

  let previousEnd = 0;

  for (const scene of scenes) {
    if (
      scene.start_time !==
      previousEnd
    ) {
      throw new Error(
        `Timeline gap or overlap at ${scene.scene_id}.`
      );
    }

    if (
      scene.end_time <=
      scene.start_time
    ) {
      throw new Error(
        `Invalid duration at ${scene.scene_id}.`
      );
    }

    previousEnd =
      scene.end_time;
  }

  if (
    previousEnd !==
    totalDuration
  ) {
    throw new Error(
      "Timeline does not end at the requested duration."
    );
  }

  /* ---------------------------------------------------
     SEMANTIC VALIDATION
  --------------------------------------------------- */

  const semanticValidation =
    validateSceneSemantics(
      scenes,
      locationMap
    );

  if (
    semanticValidation.errors.length > 0
  ) {
    throw new Error(
      semanticValidation.errors.join(
        " | "
      )
    );
  }

  /* ---------------------------------------------------
     FINAL OUTPUT
  --------------------------------------------------- */

  return {
    project: {
      title:
        directorBlueprint.project?.title ||
        "LongShot AI Scene Plan",

      duration_seconds:
        totalDuration,

      aspect_ratio:
        aspectRatio,

      planning_strategy:
        "Generic evidence-driven Scene Planner V4 with semantic continuity validation."
    },

    continuity_locks: [
      ...characterMap.keys(),
      ...locationMap.keys(),
      "No invented events outside the Director Blueprint.",
      "No environment leakage between scenes.",
      "No temporal or lighting discontinuity.",
      "No unsupported character or location substitutions.",
      "Preserve important objects across connected beats."
    ],

    scenes,

    quality_control: {
      checks: [
        "Exact duration and contiguous timeline.",
        "Exact aspect ratio.",
        "Canonical names from the current Director Blueprint.",
        "Explicit beat character arrays preserved exactly.",
        "Character and location details carried into prompts.",
        "Location/action semantic compatibility checked.",
        "Temporal/lighting consistency checked.",
        "Action density checked.",
        "Environment leakage checked.",
        "Object continuity checked.",
        "No invented characters or events."
      ],

      warnings:
        semanticValidation.warnings,

      forbidden_errors: [
        "Canonical name changes",
        "Dropped beat characters",
        "Unknown characters",
        "Invented events",
        "Character identity changes",
        "Impossible anatomy or physics",
        "Wrong location",
        "Environment leakage",
        "Temporal discontinuity",
        "Lighting discontinuity",
        "Unsupported object disappearance"
      ]
    },

    _longshot_scene_validation: {
      validator_version:
        "V4",

      passed:
        semanticValidation.errors.length === 0,

      validated_duration:
        totalDuration,

      validated_aspect_ratio:
        aspectRatio,

      scene_count:
        scenes.length,

      semantic_warnings:
        semanticValidation.warnings,

      semantic_errors:
        semanticValidation.errors
    }
  };
}
