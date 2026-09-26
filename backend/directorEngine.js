import { GoogleGenAI } from "@google/genai";

/* =========================================================
   LONGSHOT AI — DIRECTOR ENGINE V5.1
   =========================================================
   Purpose:
   Research → Fact Lock → Director Blueprint

   V5.1 hardening:
   - Canonical character identity locks
   - Apparent age lock
   - Face/body/costume continuity
   - Location/action compatibility
   - Physical character presence
   - Temporal deadline vs actual time-state separation
   - Temporal transition handling
   - Geographic continuity
   - Environment compatibility
   - Carried-object protection
   - Action-density validation
   - Causal continuity
   - Evidence traceability
   - Exact duration / timeline validation
   - Exact aspect-ratio validation
   - Camera consistency
   - Automatic correction
   - Beat splitting allowed during correction
   ========================================================= */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});


/* =========================================================
   1. DIRECTOR SCHEMA
========================================================= */

const directorSchema = {

  type: "object",

  properties: {

    project: {
      type: "object",
      properties: {
        title: { type: "string" },
        user_prompt: { type: "string" },
        duration_seconds: { type: "number" },
        aspect_ratio: { type: "string" },
        visual_goal: { type: "string" }
      },
      required: [
        "title",
        "user_prompt",
        "duration_seconds",
        "aspect_ratio",
        "visual_goal"
      ]
    },

    evidence_policy: {
      type: "object",
      properties: {
        verified_facts_are_immutable: {
          type: "boolean"
        },
        creative_reconstruction_allowed: {
          type: "boolean"
        },
        unknowns_must_not_be_invented_as_facts: {
          type: "boolean"
        },
        evidence_ids_must_be_preserved: {
          type: "boolean"
        }
      },
      required: [
        "verified_facts_are_immutable",
        "creative_reconstruction_allowed",
        "unknowns_must_not_be_invented_as_facts",
        "evidence_ids_must_be_preserved"
      ]
    },

    character_bible: {
      type: "array",
      items: {
        type: "object",
        properties: {

          name: { type: "string" },

          identity_type: {
            type: "string"
          },

          apparent_age: {
            type: "string"
          },

          identity_status: {
            type: "string"
          },

          visual_design_status: {
            type: "string"
          },

          face_identity: {
            type: "string"
          },

          facial_structure: {
            type: "string"
          },

          eyes: {
            type: "string"
          },

          hair_or_fur: {
            type: "string"
          },

          skin_or_body_texture: {
            type: "string"
          },

          body_type: {
            type: "string"
          },

          height_or_scale: {
            type: "string"
          },

          body_proportions: {
            type: "string"
          },

          musculature: {
            type: "string"
          },

          anatomy: {
            type: "string"
          },

          hands_and_fingers: {
            type: "string"
          },

          feet_and_toes: {
            type: "string"
          },

          breathing: {
            type: "string"
          },

          micro_expressions: {
            type: "string"
          },

          costume: {
            type: "string"
          },

          costume_colors: {
            type: "string"
          },

          costume_material: {
            type: "string"
          },

          costume_physics: {
            type: "string"
          },

          accessories: {
            type: "string"
          },

          signature_features: {
            type: "string"
          },

          movement_signature: {
            type: "string"
          },

          evidence_ids: {
            type: "array",
            items: {
              type: "string"
            }
          },

          visual_claims: {
            type: "array",
            items: {
              type: "object",
              properties: {
                claim: { type: "string" },
                classification: { type: "string" },
                evidence_ids: {
                  type: "array",
                  items: {
                    type: "string"
                  }
                }
              },
              required: [
                "claim",
                "classification",
                "evidence_ids"
              ]
            }
          },

          character_identity_lock: {
            type: "object",
            properties: {

              canonical_name: {
                type: "string"
              },

              identity_type: {
                type: "string"
              },

              apparent_age: {
                type: "string"
              },

              face_identity: {
                type: "string"
              },

              facial_structure: {
                type: "string"
              },

              eyes: {
                type: "string"
              },

              hair_or_fur: {
                type: "string"
              },

              skin_or_body_texture: {
                type: "string"
              },

              body_type: {
                type: "string"
              },

              height_or_scale: {
                type: "string"
              },

              body_proportions: {
                type: "string"
              },

              musculature: {
                type: "string"
              },

              anatomy: {
                type: "string"
              },

              costume: {
                type: "string"
              },

              costume_colors: {
                type: "string"
              },

              costume_material: {
                type: "string"
              },

              costume_physics: {
                type: "string"
              },

              accessories: {
                type: "string"
              },

              signature_features: {
                type: "string"
              },

              movement_signature: {
                type: "string"
              },

              forbidden_substitutions: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            },

            required: [
              "canonical_name",
              "identity_type",
              "apparent_age",
              "face_identity",
              "facial_structure",
              "eyes",
              "hair_or_fur",
              "skin_or_body_texture",
              "body_type",
              "height_or_scale",
              "body_proportions",
              "musculature",
              "anatomy",
              "costume",
              "costume_colors",
              "costume_material",
              "costume_physics",
              "accessories",
              "signature_features",
              "movement_signature",
              "forbidden_substitutions"
            ]
          }

        },

        required: [
          "name",
          "identity_type",
          "apparent_age",
          "identity_status",
          "visual_design_status",
          "face_identity",
          "facial_structure",
          "eyes",
          "hair_or_fur",
          "skin_or_body_texture",
          "body_type",
          "height_or_scale",
          "body_proportions",
          "musculature",
          "anatomy",
          "hands_and_fingers",
          "feet_and_toes",
          "breathing",
          "micro_expressions",
          "costume",
          "costume_colors",
          "costume_material",
          "costume_physics",
          "accessories",
          "signature_features",
          "movement_signature",
          "evidence_ids",
          "visual_claims",
          "character_identity_lock"
        ]
      }
    },

    world_bible: {
      type: "object",
      properties: {

        locations: {
          type: "array",
          items: {
            type: "object",
            properties: {

              name: {
                type: "string"
              },

              location_type: {
                type: "string"
              },

              geography: {
                type: "string"
              },

              environment: {
                type: "string"
              },

              terrain: {
                type: "string"
              },

              architecture: {
                type: "string"
              },

              weather: {
                type: "string"
              },

              lighting: {
                type: "string"
              },

              evidence_status: {
                type: "string"
              },

              evidence_ids: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              visual_claims: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    claim: { type: "string" },
                    classification: { type: "string" },
                    evidence_ids: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    }
                  },
                  required: [
                    "claim",
                    "classification",
                    "evidence_ids"
                  ]
                }
              }
            },

            required: [
              "name",
              "location_type",
              "geography",
              "environment",
              "terrain",
              "architecture",
              "weather",
              "lighting",
              "evidence_status",
              "evidence_ids",
              "visual_claims"
            ]
          }
        },

        geography_rules: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },

      required: [
        "locations",
        "geography_rules"
      ]
    },

    visual_language: {
      type: "object",
      properties: {

        realism: {
          type: "string"
        },

        visual_emulation: {
          type: "string"
        },

        capture_system: {
          type: "string"
        },

        lens_language: {
          type: "string"
        },

        camera_movement: {
          type: "string"
        },

        lighting_language: {
          type: "string"
        },

        color_grade: {
          type: "string"
        },

        texture_language: {
          type: "string"
        },

        motion_physics: {
          type: "string"
        },

        negative_visual_rules: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },

      required: [
        "realism",
        "visual_emulation",
        "capture_system",
        "lens_language",
        "camera_movement",
        "lighting_language",
        "color_grade",
        "texture_language",
        "motion_physics",
        "negative_visual_rules"
      ]
    },

    story_blueprint: {
      type: "object",
      properties: {

        premise: {
          type: "string"
        },

        causal_chain: {
          type: "array",
          items: {
            type: "string"
          }
        },

        beats: {
          type: "array",
          items: {

            type: "object",

            properties: {

              beat_number: {
                type: "number"
              },

              time_range: {
                type: "string"
              },

              duration_seconds: {
                type: "number"
              },

              story_action: {
                type: "string"
              },

              character_action: {
                type: "string"
              },

              characters: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              location: {
                type: "string"
              },

              time_of_day: {
                type: "string"
              },

              lighting: {
                type: "string"
              },

              emotional_purpose: {
                type: "string"
              },

              visual_priority: {
                type: "string"
              },

              camera: {
                type: "string"
              },

              transition_to_next: {
                type: "string"
              },

              continuity_notes: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              visual_claims: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    claim: { type: "string" },
                    classification: { type: "string" },
                    evidence_ids: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    }
                  },
                  required: [
                    "claim",
                    "classification",
                    "evidence_ids"
                  ]
                }
              },

              evidence_ids: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            },

            required: [
              "beat_number",
              "time_range",
              "duration_seconds",
              "story_action",
              "character_action",
              "characters",
              "location",
              "time_of_day",
              "lighting",
              "emotional_purpose",
              "visual_priority",
              "camera",
              "transition_to_next",
              "continuity_notes",
              "visual_claims",
              "evidence_ids"
            ]
          }
        }
      },

      required: [
        "premise",
        "causal_chain",
        "beats"
      ]
    },

    continuity_system: {
      type: "object",
      properties: {

        character_continuity: {
          type: "array",
          items: { type: "string" }
        },

        face_continuity: {
          type: "array",
          items: { type: "string" }
        },

        body_continuity: {
          type: "array",
          items: { type: "string" }
        },

        costume_continuity: {
          type: "array",
          items: { type: "string" }
        },

        accessory_continuity: {
          type: "array",
          items: { type: "string" }
        },

        environment_continuity: {
          type: "array",
          items: { type: "string" }
        },

        lighting_continuity: {
          type: "array",
          items: { type: "string" }
        },

        temporal_continuity: {
          type: "array",
          items: { type: "string" }
        },

        geography_continuity: {
          type: "array",
          items: { type: "string" }
        },

        action_state_continuity: {
          type: "array",
          items: { type: "string" }
        },

        physics_continuity: {
          type: "array",
          items: { type: "string" }
        }
      },

      required: [
        "character_continuity",
        "face_continuity",
        "body_continuity",
        "costume_continuity",
        "accessory_continuity",
        "environment_continuity",
        "lighting_continuity",
        "temporal_continuity",
        "geography_continuity",
        "action_state_continuity",
        "physics_continuity"
      ]
    },

    directing_rules: {
      type: "array",
      items: {
        type: "string"
      }
    },

    quality_control: {
      type: "object",
      properties: {

        realism_checks: {
          type: "array",
          items: { type: "string" }
        },

        continuity_checks: {
          type: "array",
          items: { type: "string" }
        },

        authenticity_checks: {
          type: "array",
          items: { type: "string" }
        },

        negative_checks: {
          type: "array",
          items: { type: "string" }
        }
      },

      required: [
        "realism_checks",
        "continuity_checks",
        "authenticity_checks",
        "negative_checks"
      ]
    }

  },

  required: [
    "project",
    "evidence_policy",
    "character_bible",
    "world_bible",
    "visual_language",
    "story_blueprint",
    "continuity_system",
    "directing_rules",
    "quality_control"
  ]
};


/* =========================================================
   2. MASTER DIRECTOR INSTRUCTIONS
========================================================= */

const MASTER_DIRECTOR_INSTRUCTIONS = `

You are the MASTER DIRECTOR ENGINE of LongShot AI.

Your job is NOT merely to divide a story into scenes.

You must create a production-grade cinematic Director Blueprint
that can safely be passed to a downstream Scene Planner and video
generation system.

=========================================================
CORE PRINCIPLE
=========================================================

RESEARCH → FACT LOCK → CHARACTER LOCK → WORLD LOCK →
CAUSAL STORY → GEOGRAPHY → TIME → CINEMATOGRAPHY →
CONTINUITY → VALIDATION

Do not invent factual claims when research does not support them.

Creative reconstruction is allowed only when explicitly marked
as inferred or creative reconstruction.

=========================================================
CANONICAL CHARACTER IDENTITY
=========================================================

Every named canonical character is IMMUTABLE.

Never replace a canonical character with:

generic warrior
generic soldier
generic commander
generic king
generic monk
generic physician
generic man
generic woman
unnamed warrior
unnamed soldier
random commander
injured soldier
injured warrior
Alexander's commander
Alexander-era soldier

The exact canonical name must remain unchanged.

The character identity fingerprint must remain unchanged:

- apparent age
- face identity
- facial structure
- eyes
- hair/fur
- skin/body texture
- body type
- height/scale
- body proportions
- musculature
- anatomy
- costume
- costume colors
- costume material
- costume physics
- accessories
- signature features
- movement signature

Do NOT age a character up or down between beats.

Do NOT replace a mythological character with a historical-looking
generic person.

=========================================================
REAL HUMAN / CREATURE APPEARANCE
=========================================================

Characters must look physically believable.

No plastic skin.

No wax skin.

No cartoon anatomy.

No rubber limbs.

No malformed hands.

No extra fingers.

No fused fingers.

No distorted feet.

No floating body parts.

No inconsistent body proportions.

Maintain realistic:

skin texture
pores
muscle movement
hair/fur
breathing
facial micro-expressions
cloth behavior
weight
gravity
momentum
contact shadows
physical interaction

=========================================================
FACT LOCK
=========================================================

Verified facts are immutable.

Do not alter:

canonical names
locations
events
relationships
sequence of documented events
research-supported objects
research-supported identities

If exact visual details are unknown, use restrained cinematic
reconstruction rather than presenting invented details as verified fact.

=========================================================
LOCATION RULE
=========================================================

A beat location means the physical environment in which the visible
characters are actually acting.

If a character is flying through the sky, do NOT place the beat inside:

camp
medical tent
palace
room
temple
hut
battlefield
mountain interior

unless the action explicitly depicts departure or arrival.

A flying character requires a physically credible travel/sky corridor.

=========================================================
GEOGRAPHY RULE
=========================================================

Never teleport characters.

A location change must have a credible:

departure
travel
arrival
or explicit transition

Do not place geographically distant environments in the same beat
unless the beat explicitly establishes the transition.

=========================================================
TEMPORAL RULE
=========================================================

IMPORTANT:

"before sunrise"
"before dawn"
"by sunrise"
"by dawn"
"before first light"

are DEADLINES.

They are NOT actual sunrise lighting.

"approaching dawn"
"toward dawn"
"towards dawn"
"as dawn approaches"
"night fades"
"night gives way"

are TRANSITIONS.

They do NOT automatically mean full daylight.

Only treat sunrise/dawn as an actual visual time state when the beat
explicitly depicts:

sunrise
first light
golden sunrise light
daybreak
sun rising
sky visibly brightening as the actual event

Night + sunrise is allowed only when the beat explicitly depicts
the transition.

=========================================================
ACTION DENSITY
=========================================================

A 5–6 second beat should normally contain ONE dominant action.

Do NOT compress:

arrival
mountain lifting
return flight
medicine preparation
healing
revival

into one beat.

Causal actions must be distributed across multiple beats.

The downstream generator needs enough time to visually execute each
important action.

=========================================================
CAUSAL CONTINUITY
=========================================================

Never jump:

searching
→ possessing a major object

without acquisition.

Never jump:

medicine search
→ revival

without treatment.

Never jump:

travel
→ arrival

without credible movement/departure.

Every major physical state change must have a cause.

=========================================================
ENVIRONMENT CONTINUITY
=========================================================

Do not leak:

mountain scenery into camp
camp architecture into open sky
ocean scenery into mountain
forest scenery into unrelated fixed locations
palace architecture into wilderness
snowfield scenery into tropical camp

IMPORTANT:

A carried object is NOT automatically an environmental location.

For example:

"Hanuman carries a mountain into the camp"

does NOT mean the camp suddenly becomes a mountain environment.

=========================================================
CINEMATOGRAPHY
=========================================================

Use:

cinematic camera movement
physically plausible lenses
natural depth of field
realistic motion blur
motivated framing
credible perspective
professional composition
cinematic lighting
natural atmospheric depth
consistent visual language

Avoid random camera changes.

=========================================================
AUTHENTICITY
=========================================================

For mythology:

respect the research evidence.

Do not fabricate scripture quotations.

Do not introduce unsupported named characters.

Do not replace canonical figures with generic substitutes.

=========================================================
FINAL SELF CHECK
=========================================================

Before returning JSON verify:

1. Exact duration.
2. Exact aspect ratio.
3. Exact canonical character names.
4. Character identity locks.
5. Apparent ages.
6. Face continuity.
7. Body continuity.
8. Costume continuity.
9. Location validity.
10. Geographic continuity.
11. Temporal continuity.
12. Deadline language not mistaken for sunrise.
13. Environment compatibility.
14. Carried objects not mistaken for environments.
15. Action density.
16. Causal sequence.
17. Character physical presence.
18. Evidence IDs.
19. Visual claim traceability.
20. Camera consistency.
21. No generic canonical substitutions.

Return ONLY JSON.
`;


/* =========================================================
   3. RESEARCH NORMALIZATION
========================================================= */

function normalizeResearch(data) {

  if (!data) {
    throw new Error("Research data is missing.");
  }

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {
        topic: data,
        locked_facts: [],
        visual_notes: [],
        creative_reconstructions: [],
        sources: []
      };
    }
  }

  return data;
}


/* =========================================================
   4. FACT LOCK
========================================================= */

function buildFactLock(research) {

  return {

    locked_facts:
      Array.isArray(research?.locked_facts)
        ? research.locked_facts
        : Array.isArray(research?.facts)
          ? research.facts
          : [],

    visual_notes:
      Array.isArray(research?.visual_notes)
        ? research.visual_notes
        : [],

    creative_reconstructions:
      Array.isArray(research?.creative_reconstructions)
        ? research.creative_reconstructions
        : [],

    unknowns:
      Array.isArray(research?.unknowns)
        ? research.unknowns
        : [],

    sources:
      Array.isArray(research?.sources)
        ? research.sources
        : []
  };
}


/* =========================================================
   5. GENERATE INITIAL BLUEPRINT
========================================================= */

async function runDirector(
  research,
  factLock,
  duration,
  aspectRatio
) {

  const instruction = `

${MASTER_DIRECTOR_INSTRUCTIONS}

=========================================================
REQUEST
=========================================================

Create a Director Blueprint for:

Duration: ${duration} seconds
Aspect ratio: ${aspectRatio}

=========================================================
RESEARCH
=========================================================

${JSON.stringify(
  research,
  null,
  2
)}

=========================================================
FACT LOCK
=========================================================

${JSON.stringify(
  factLock,
  null,
  2
)}

=========================================================
DURATION REQUIREMENT
=========================================================

The beat count is flexible.

Do NOT force a fixed number of beats.

Use as many beats as necessary to preserve:

causal continuity
action readability
geographic continuity
temporal continuity
character continuity

For 20 seconds, 25 seconds and 30 seconds, practical beat counts
may be approximately 4–7 depending on complexity.

Every beat must have a real duration.

All beat durations together must equal EXACTLY ${duration} seconds.

The timeline must be contiguous from 0 to ${duration}.

=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON matching the provided schema.
`;

  const response =
    await ai.interactions.create({

      model:
        "gemini-3.5-flash-lite",

      input:
        instruction,

      response_format: {

        type: "text",

        mime_type:
          "application/json",

        schema:
          directorSchema
      }
    });

  if (!response?.output_text) {
    throw new Error(
      "Director Engine returned empty output."
    );
  }

  try {

    return JSON.parse(
      response.output_text
    );

  } catch {

    throw new Error(
      "Director Engine returned invalid JSON."
    );
  }
}


/* =========================================================
   6. GENERAL UTILITIES
========================================================= */

function collectAllStrings(value) {

  const output = [];

  function walk(item) {

    if (typeof item === "string") {
      output.push(item);
      return;
    }

    if (Array.isArray(item)) {
      for (const child of item) {
        walk(child);
      }
      return;
    }

    if (
      item &&
      typeof item === "object"
    ) {
      for (const child of Object.values(item)) {
        walk(child);
      }
    }
  }

  walk(value);

  return output;
}


function collectEvidenceIds(value) {

  const ids = new Set();

  function walk(item) {

    if (!item) {
      return;
    }

    if (Array.isArray(item)) {
      for (const child of item) {
        walk(child);
      }
      return;
    }

    if (
      typeof item === "object"
    ) {

      if (
        Array.isArray(
          item.evidence_ids
        )
      ) {

        for (
          const id
          of item.evidence_ids
        ) {

          if (id) {
            ids.add(id);
          }
        }
      }

      for (
        const child
        of Object.values(item)
      ) {

        walk(child);
      }
    }
  }

  walk(value);

  return [...ids];
}


function normalizeSemanticText(value) {

  return String(value || "")
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function containsTerm(
  text,
  term
) {

  const source =
    normalizeSemanticText(text);

  const target =
    normalizeSemanticText(term);

  if (!target) {
    return false;
  }

  return source.includes(target);
}


function containsAny(
  text,
  terms
) {

  return terms.some(
    term =>
      containsTerm(
        text,
        term
      )
  );
}


function countMatches(
  text,
  terms
) {

  const source =
    normalizeSemanticText(text);

  return terms.reduce(
    (
      total,
      term
    ) =>
      source.includes(
        normalizeSemanticText(term)
      )
        ? total + 1
        : total,
    0
  );
}


/* =========================================================
   7. BEAT TEXT HELPERS
========================================================= */

/*
  IMPORTANT:
  transition_to_next is intentionally excluded from action analysis.
*/

function buildBeatActionText(
  beat
) {

  return [
    beat?.story_action,
    beat?.character_action,
    beat?.emotional_purpose,
    beat?.visual_priority,
    beat?.time_of_day,
    beat?.lighting
  ]
    .filter(Boolean)
    .join(" ");
}


function buildBeatTransitionText(
  beat
) {

  return String(
    beat?.transition_to_next || ""
  );
}


function buildBeatText(
  beat
) {

  return [
    buildBeatActionText(beat),
    buildBeatTransitionText(beat),
    beat?.location,
    ...(Array.isArray(beat?.continuity_notes)
      ? beat.continuity_notes
      : [])
  ]
    .filter(Boolean)
    .join(" ");
}


function textForBeat(
  beat
) {

  return buildBeatActionText(
    beat
  );
}


/* =========================================================
   8. CHARACTER IDENTITY VALIDATION
========================================================= */

function validateCharacterIdentityLocks(
  blueprint
) {

  const errors = [];

  const forbiddenGenericTerms = [

    "generic warrior",
    "generic soldier",
    "generic commander",
    "generic king",
    "generic monk",
    "generic physician",
    "generic man",
    "generic woman",
    "unnamed warrior",
    "unnamed soldier",
    "random commander",
    "injured soldier",
    "injured warrior",
    "alexander's commander",
    "alexander era soldier",
    "alexander-era soldier"
  ];

  for (
    const character
    of blueprint.character_bible || []
  ) {

    const name =
      String(
        character?.name || ""
      ).trim();

    if (!name) {

      errors.push(
        "Character bible contains an unnamed character."
      );

      continue;
    }

    const lock =
      character.character_identity_lock;

    if (!lock) {

      errors.push(
        `Character "${name}" is missing character_identity_lock.`
      );

      continue;
    }

    const requiredLockFields = [

      "canonical_name",
      "identity_type",
      "apparent_age",
      "face_identity",
      "facial_structure",
      "eyes",
      "hair_or_fur",
      "skin_or_body_texture",
      "body_type",
      "height_or_scale",
      "body_proportions",
      "musculature",
      "anatomy",
      "costume",
      "costume_colors",
      "costume_material",
      "costume_physics",
      "accessories",
      "signature_features",
      "movement_signature"
    ];

    for (
      const field
      of requiredLockFields
    ) {

      if (
        !String(
          lock[field] || ""
        ).trim()
      ) {

        errors.push(
          `Character "${name}" identity lock missing field: ${field}.`
        );
      }
    }

    if (
      normalizeSemanticText(
        lock.canonical_name
      ) !==
      normalizeSemanticText(name)
    ) {

      errors.push(
        `Character "${name}" identity lock canonical_name mismatch.`
      );
    }

    if (
      normalizeSemanticText(
        lock.apparent_age
      ) !==
      normalizeSemanticText(
        character.apparent_age
      )
    ) {

      errors.push(
        `Character "${name}" identity lock apparent_age mismatch.`
      );
    }

    const identityText =
      [
        character.name,
        character.identity_type,
        character.apparent_age,
        character.face_identity,
        character.facial_structure,
        character.eyes,
        character.hair_or_fur,
        character.skin_or_body_texture,
        character.body_type,
        character.height_or_scale,
        character.body_proportions,
        character.musculature,
        character.anatomy,
        character.costume,
        character.costume_colors,
        character.costume_material,
        character.costume_physics,
        character.accessories,
        character.signature_features,
        character.movement_signature
      ]
        .join(" ")
        .toLowerCase();

    for (
      const forbidden
      of forbiddenGenericTerms
    ) {

      if (
        identityText.includes(
          forbidden
        )
      ) {

        errors.push(
          `Character "${name}" contains forbidden generic identity substitution: "${forbidden}".`
        );
      }
    }
  }

  return errors;
}


/* =========================================================
   9. TEMPORAL ANALYSIS
========================================================= */

const temporalDeadlineTerms = [

  "before sunrise",
  "before dawn",
  "before first light",
  "by sunrise",
  "by dawn",
  "by first light",
  "prior to sunrise",
  "prior to dawn"
];


const temporalTransitionTerms = [

  "approaching dawn",
  "approaching sunrise",
  "as dawn approaches",
  "as sunrise approaches",
  "toward dawn",
  "towards dawn",
  "toward sunrise",
  "towards sunrise",
  "night fades",
  "night fading",
  "night gives way",
  "night gives way to dawn",
  "night recedes",
  "sky gradually brightens",
  "first light appears",
  "dawn begins",
  "dawn breaks",
  "sunrise begins",
  "daybreak begins",
  "lighting gradually changes"
];


const temporalActualStateTerms = {

  night: [
    "night",
    "midnight",
    "deep night",
    "dark sky",
    "moonlit",
    "moonlight"
  ],

  dawn: [
    "dawn",
    "sunrise",
    "sunrise light",
    "golden sunrise light",
    "golden first light",
    "daybreak",
    "sun rising",
    "sun has risen",
    "first light of day"
  ],

  morning: [
    "morning",
    "morning light",
    "daylight",
    "bright morning"
  ],

  evening: [
    "evening",
    "sunset",
    "dusk",
    "twilight"
  ]
};


function stripTemporalMetaLanguage(
  text
) {

  let cleaned =
    normalizeSemanticText(text);

  for (
    const phrase
    of temporalDeadlineTerms
  ) {

    cleaned =
      cleaned.replace(
        normalizeSemanticText(phrase),
        " "
      );
  }

  for (
    const phrase
    of temporalTransitionTerms
  ) {

    cleaned =
      cleaned.replace(
        normalizeSemanticText(phrase),
        " "
      );
  }

  return cleaned
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


function getTemporalStates(
  text
) {

  const actualText =
    stripTemporalMetaLanguage(
      text
    );

  const states = new Set();

  for (
    const [state, terms]
    of Object.entries(
      temporalActualStateTerms
    )
  ) {

    if (
      containsAny(
        actualText,
        terms
      )
    ) {

      states.add(state);
    }
  }

  return states;
}


function hasExplicitTemporalTransition(
  text
) {

  return containsAny(
    text,
    temporalTransitionTerms
  );
}


function hasTemporalConflict(
  beat,
  location
) {

  if (!location) {
    return false;
  }

  const actionText =
    buildBeatActionText(
      beat
    );

  const beatStates =
    getTemporalStates(
      actionText
    );

  const locationText =
    [
      location.name,
      location.environment,
      location.lighting,
      location.weather,
      location.terrain
    ]
      .filter(Boolean)
      .join(" ");

  const locationStates =
    getTemporalStates(
      locationText
    );

  if (
    hasExplicitTemporalTransition(
      actionText
    )
  ) {

    return false;
  }

  if (
    beatStates.has("night") &&
    (
      locationStates.has("dawn") ||
      locationStates.has("morning")
    )
  ) {

    return true;
  }

  if (
    beatStates.has("morning") &&
    (
      locationStates.has("night") ||
      locationStates.has("evening")
    )
  ) {

    return true;
  }

  return false;
}


/* =========================================================
   10. ENVIRONMENT COMPATIBILITY
========================================================= */

const environmentCompatibility = [

  {
    terms: [
      "ocean",
      "sea",
      "open sea",
      "ocean water"
    ],

    compatible: [
      "ocean",
      "sea",
      "coast",
      "coastal",
      "beach",
      "shore",
      "water"
    ]
  },

  {
    terms: [
      "desert",
      "sand",
      "dune",
      "desert terrain"
    ],

    compatible: [
      "desert",
      "sand",
      "dune",
      "arid"
    ]
  },

  {
    terms: [
      "mountain peak",
      "mountain slope",
      "snow-covered mountain",
      "snowfield",
      "mountain",
      "himalayan peak"
    ],

    compatible: [
      "mountain",
      "peak",
      "himalayan",
      "snow",
      "alpine",
      "slope",
      "dronagiri"
    ]
  },

  {
    terms: [
      "dense jungle",
      "forest",
      "jungle",
      "woodland"
    ],

    compatible: [
      "forest",
      "jungle",
      "wood",
      "woodland",
      "trees",
      "wilderness"
    ]
  },

  {
    terms: [
      "battlefield",
      "war field"
    ],

    compatible: [
      "battlefield",
      "war",
      "army",
      "front",
      "battle"
    ]
  },

  {
    terms: [
      "camp",
      "encampment",
      "military camp"
    ],

    compatible: [
      "camp",
      "encampment",
      "military camp",
      "army camp",
      "medical camp"
    ]
  },

  {
    terms: [
      "palace"
    ],

    compatible: [
      "palace",
      "royal",
      "court"
    ]
  },

  {
    terms: [
      "temple"
    ],

    compatible: [
      "temple",
      "shrine",
      "sanctum"
    ]
  },

  {
    terms: [
      "cave"
    ],

    compatible: [
      "cave",
      "cavern",
      "mountain cave"
    ]
  }

];


function isEnvironmentCompatible(
  environmentTerm,
  locationText
) {

  const normalizedLocation =
    normalizeSemanticText(
      locationText
    );

  const group =
    environmentCompatibility.find(
      item =>
        item.terms.some(
          term =>
            normalizeSemanticText(
              environmentTerm
            ) ===
            normalizeSemanticText(
              term
            )
        )
    );

  if (!group) {
    return true;
  }

  return group.compatible.some(
    term =>
      normalizedLocation.includes(
        normalizeSemanticText(term)
      )
  );
}


function beatContainsCarriedMountain(
  text
) {

  const carryTerms = [
    "carry",
    "carries",
    "carrying",
    "carried",
    "holding",
    "holds",
    "bear",
    "bearing",
    "bringing",
    "brings",
    "returns with",
    "returning with",
    "lifted",
    "uprooted"
  ];

  return (
    containsAny(
      text,
      carryTerms
    ) &&
    containsAny(
      text,
      [
        "mountain",
        "mountain peak",
        "dronagiri",
        "hill"
      ]
    )
  );
}


/* =========================================================
   11. BEAT SEMANTIC VALIDATION
========================================================= */

function validateBeatSemanticContinuity(
  blueprint
) {

  const errors = [];
  const warnings = [];

  const beats =
    blueprint?.story_blueprint?.beats ||
    [];

  const locations =
    blueprint?.world_bible?.locations ||
    [];

  const locationMap =
    new Map(
      locations.map(
        location => [
          normalizeSemanticText(
            location?.name
          ),
          location
        ]
      )
    );

  const travelTerms = [
    "fly",
    "flying",
    "flight",
    "travels",
    "travel",
    "journey",
    "journeys",
    "crosses",
    "crossing",
    "returns",
    "returning",
    "depart",
    "departs",
    "departure",
    "leaves",
    "leave",
    "moves toward",
    "moves towards",
    "heads toward",
    "heads towards"
  ];

  const airborneTerms = [
    "flying",
    "flight",
    "airborne",
    "in the sky",
    "through the sky",
    "soars",
    "soaring",
    "midair",
    "mid-air",
    "sky corridor"
  ];

  const fixedLocationTerms = [
    "camp",
    "medical tent",
    "tent",
    "palace",
    "room",
    "temple",
    "hut",
    "cave",
    "battlefield",
    "encampment"
  ];

  const destinationTerms = [
    "toward",
    "towards",
    "arrives",
    "arrival",
    "reaches",
    "reach",
    "lands",
    "landing",
    "returns to",
    "return to"
  ];

  const actionGroups = [

    [
      "travel",
      "traveling",
      "travelling",
      "journey",
      "flight",
      "flying",
      "crossing",
      "crosses",
      "returns",
      "returning",
      "departs",
      "departure"
    ],

    [
      "arrive",
      "arrival",
      "arrives",
      "reaches",
      "reach",
      "lands",
      "landing"
    ],

    [
      "search",
      "searching",
      "look for",
      "looking for",
      "seeking",
      "seek"
    ],

    [
      "acquire",
      "acquires",
      "acquisition",
      "finds",
      "find",
      "lifts",
      "lift",
      "uproots",
      "uproot",
      "grabs",
      "takes"
    ],

    [
      "carry",
      "carries",
      "carrying",
      "carried",
      "holding",
      "holds",
      "brings",
      "bringing",
      "returns with"
    ],

    [
      "fight",
      "fights",
      "fighting",
      "battle",
      "attacks",
      "attacking",
      "strikes",
      "striking"
    ],

    [
      "heal",
      "heals",
      "healing",
      "treat",
      "treating",
      "administer",
      "administering",
      "medicine"
    ],

    [
      "revive",
      "revives",
      "revival",
      "awakens",
      "awakens again",
      "regains consciousness",
      "recovers"
    ],

    [
      "climb",
      "climbing",
      "descend",
      "descending",
      "ascend",
      "ascending"
    ]

  ];

  for (
    let index = 0;
    index < beats.length;
    index++
  ) {

    const beat =
      beats[index];

    const locationName =
      String(
        beat?.location || ""
      ).trim();

    const location =
      locationMap.get(
        normalizeSemanticText(
          locationName
        )
      );

    const actionText =
      buildBeatActionText(
        beat
      );

    const fullText =
      buildBeatText(
        beat
      );

    if (!location) {

      errors.push(
        `Beat ${beat?.beat_number} references unknown location "${locationName}".`
      );

      continue;
    }

    const travelScore =
      countMatches(
        actionText,
        travelTerms
      );

    const airborneScore =
      countMatches(
        actionText,
        airborneTerms
      );

    const fixedScore =
      countMatches(
        normalizeSemanticText(
          locationTextForValidation(
            location
          )
        ),
        fixedLocationTerms
      );

    const destinationScore =
      countMatches(
        actionText,
        destinationTerms
      );

    /*
      Airborne action inside fixed location is a real contradiction
      unless it is explicitly departure/arrival.
    */

    if (
      airborneScore > 0 &&
      fixedScore > 0 &&
      destinationScore === 0
    ) {

      errors.push(
        `Beat ${beat.beat_number} places airborne/flying action inside fixed location "${location.name}" without explicit departure/arrival.`
      );
    }

    /*
      Same location + travel language is allowed when travel happens
      within or from that location, unless the beat explicitly says
      destination elsewhere.
    */

    if (
      travelScore >= 2 &&
      fixedScore > 0 &&
      destinationScore === 0 &&
      airborneScore > 0
    ) {

      warnings.push(
        `Beat ${beat.beat_number} contains strong travel language while its selected location is a fixed environment "${location.name}".`
      );
    }

    /*
      Named world locations must not leak into unrelated beats.
    */

    for (
      const worldLocation
      of locations
    ) {

      const worldName =
        normalizeSemanticText(
          worldLocation?.name
        );

      if (
        !worldName ||
        worldName ===
          normalizeSemanticText(
            location.name
          )
      ) {
        continue;
      }

      if (
        fullText.includes(
          worldName
        ) &&
        !containsAny(
          actionText,
          destinationTerms.concat(
            travelTerms
          )
        )
      ) {

        warnings.push(
          `Beat ${beat.beat_number} mentions another world location "${worldLocation.name}" without explicit travel/transition language.`
        );
      }
    }

    /*
      Temporal validation.
    */

    if (
      hasTemporalConflict(
        beat,
        location
      )
    ) {

      errors.push(
        `Beat ${beat.beat_number} has a temporal/lighting conflict with location "${location.name}".`
      );
    }

    /*
      Environment leakage.
    */

    const carriedMountain =
      beatContainsCarriedMountain(
        actionText
      );

    const environmentalTerms = [

      "ocean",
      "sea",
      "desert",
      "snowfield",
      "snow-covered mountain",
      "mountain peak",
      "mountain slope",
      "dense jungle",
      "forest",
      "battlefield",
      "camp",
      "encampment",
      "palace",
      "temple",
      "cave"

    ];

    for (
      const environmentTerm
      of environmentalTerms
    ) {

      if (
        !containsTerm(
          actionText,
          environmentTerm
        )
      ) {
        continue;
      }

      /*
        A mountain being carried is an object/action, not the
        environmental setting.
      */

      if (
        carriedMountain &&
        (
          environmentTerm === "mountain peak" ||
          environmentTerm === "mountain slope" ||
          environmentTerm === "snow-covered mountain" ||
          environmentTerm === "mountain"
        )
      ) {

        continue;
      }

      if (
        !isEnvironmentCompatible(
          environmentTerm,
          locationTextForValidation(
            location
          )
        )
      ) {

        errors.push(
          `Beat ${beat.beat_number} contains environment "${environmentTerm}" that is not compatible with selected location "${location.name}".`
        );
      }
    }

    /*
      Action density.
      transition_to_next is intentionally NOT counted.
    */

    const majorActionGroups =
      actionGroups.filter(
        group =>
          containsAny(
            actionText,
            group
          )
      );

    if (
      majorActionGroups.length >= 4
    ) {

      errors.push(
        `Beat ${beat.beat_number} is overloaded: ${majorActionGroups.length} independent major action groups are compressed into ${beat.duration_seconds}s.`
      );

    } else if (
      majorActionGroups.length === 3 &&
      Number(
        beat.duration_seconds
      ) <= 6
    ) {

      errors.push(
        `Beat ${beat.beat_number} contains 3 major action groups in only ${beat.duration_seconds}s.`
      );
    }

    /*
      Physical character presence.
    */

    const listedCharacters =
      Array.isArray(
        beat.characters
      )
        ? beat.characters
        : [];

    for (
      const character
      of listedCharacters
    ) {

      if (
        !containsTerm(
          fullText,
          character
        )
      ) {

        /*
          Names may only be in the characters[] field.
          Do not fail solely because the prose omits the name.
        */

        continue;
      }
    }

    /*
      Adjacent geographic continuity.
    */

    if (
      index > 0
    ) {

      const previous =
        beats[index - 1];

      const previousLocation =
        String(
          previous?.location || ""
        ).trim();

      const currentLocation =
        String(
          beat?.location || ""
        ).trim();

      if (
        normalizeSemanticText(
          previousLocation
        ) !==
        normalizeSemanticText(
          currentLocation
        )
      ) {

        const transitionText =
          [
            buildBeatActionText(
              previous
            ),
            buildBeatTransitionText(
              previous
            ),
            buildBeatActionText(
              beat
            )
          ].join(" ");

        const hasMovement =
          containsAny(
            transitionText,
            travelTerms.concat(
              destinationTerms
            )
          );

        if (!hasMovement) {

          errors.push(
            `Geographic continuity failure between beat ${previous.beat_number} and beat ${beat.beat_number}: location changes without explicit travel/departure/arrival.`
          );
        }

        /*
          Environment leakage across transitions is checked only when
          the current beat itself actually describes that environment.
        */

        const previousLocationObject =
          locationMap.get(
            normalizeSemanticText(
              previousLocation
            )
          );

        if (
          previousLocationObject
        ) {

          const previousEnv =
            normalizeSemanticText(
              locationTextForValidation(
                previousLocationObject
              )
            );

          const currentAction =
            normalizeSemanticText(
              actionText
            );

          if (
            previousEnv.includes(
              "camp"
            ) &&
            (
              currentAction.includes(
                "tent"
              ) ||
              currentAction.includes(
                "campfire"
              ) ||
              currentAction.includes(
                "soldiers"
              )
            ) &&
            airborneScore > 0
          ) {

            warnings.push(
              `Environment leakage risk from previous camp into airborne beat ${beat.beat_number}.`
            );
          }
        }
      }
    }
  }

  return {
    errors,
    warnings
  };
}


function locationTextForValidation(
  location
) {

  return [
    location?.name,
    location?.location_type,
    location?.geography,
    location?.environment,
    location?.terrain,
    location?.architecture,
    location?.weather,
    location?.lighting
  ]
    .filter(Boolean)
    .join(" ");
}


/* =========================================================
   12. CAUSAL VALIDATION
========================================================= */

function validateCausalBeatContinuity(
  blueprint
) {

  const errors = [];
  const warnings = [];

  const beats =
    blueprint?.story_blueprint?.beats ||
    [];

  const carryOutcomeTerms = [
    "carry",
    "carries",
    "carrying",
    "carried",
    "holding",
    "holds",
    "brings",
    "bringing",
    "returns with",
    "returning with"
  ];

  const mountainObjectTerms = [
    "mountain",
    "mountain peak",
    "dronagiri",
    "hill"
  ];

  const acquisitionTerms = [
    "acquire",
    "acquires",
    "finds",
    "find",
    "lifts",
    "lift",
    "uproots",
    "uproot",
    "grabs",
    "takes",
    "obtains"
  ];

  const healingOutcomeTerms = [
    "revive",
    "revives",
    "revival",
    "awakens",
    "recovers",
    "regains consciousness"
  ];

  const treatmentTerms = [
    "heal",
    "healing",
    "treat",
    "treating",
    "administer",
    "administering",
    "medicine",
    "herb",
    "herbs",
    "remedy"
  ];

  const arrivalTerms = [
    "arrive",
    "arrival",
    "arrives",
    "reaches",
    "reach",
    "lands",
    "landing",
    "returns to",
    "return to"
  ];

  const travelTerms = [
    "fly",
    "flying",
    "flight",
    "travel",
    "travels",
    "journey",
    "cross",
    "crosses",
    "crossing",
    "return",
    "returns",
    "returning",
    "depart",
    "departure",
    "leave",
    "leaves"
  ];

  for (
    let index = 0;
    index < beats.length;
    index++
  ) {

    const current =
      beats[index];

    const previous =
      index > 0
        ? beats[index - 1]
        : null;

    const currentText =
      textForBeat(
        current
      );

    const previousText =
      previous
        ? textForBeat(
            previous
          )
        : "";

    /*
      A. OBJECT ACQUISITION → CARRY
    */

    const currentCarriesMountain =
      containsAny(
        currentText,
        carryOutcomeTerms
      ) &&
      containsAny(
        currentText,
        mountainObjectTerms
      );

    if (
      currentCarriesMountain
    ) {

      let acquisitionFound =
        false;

      for (
        let back =
          Math.max(
            0,
            index - 4
          );

        back < index;

        back++
      ) {

        const earlierText =
          textForBeat(
            beats[back]
          );

        if (
          containsAny(
            earlierText,
            acquisitionTerms
          ) &&
          containsAny(
            earlierText,
            mountainObjectTerms
          )
        ) {

          acquisitionFound =
            true;

          break;
        }
      }

      if (
        !acquisitionFound
      ) {

        errors.push(
          `Causal continuity failure at beat ${current.beat_number}: character carries/returns with a mountain, but no preceding acquisition/lifting/uprooting event is represented.`
        );
      }
    }

    /*
      B. REVIVAL → TREATMENT
    */

    const currentRevives =
      containsAny(
        currentText,
        healingOutcomeTerms
      );

    if (
      currentRevives
    ) {

      let treatmentFound =
        false;

      for (
        let back =
          Math.max(
            0,
            index - 4
          );

        back < index;

        back++
      ) {

        const earlierText =
          textForBeat(
            beats[back]
          );

        if (
          containsAny(
            earlierText,
            treatmentTerms
          )
        ) {

          treatmentFound =
            true;

          break;
        }
      }

      if (
        !treatmentFound
      ) {

        errors.push(
          `Causal continuity failure at beat ${current.beat_number}: revival/recovery occurs without a preceding treatment action.`
        );
      }
    }

    /*
      C. ARRIVAL → TRAVEL
    */

    const currentArrives =
      containsAny(
        currentText,
        arrivalTerms
      );

    if (
      currentArrives &&
      previous
    ) {

      const locationsChanged =
        normalizeSemanticText(
          previous.location
        ) !==
        normalizeSemanticText(
          current.location
        );

      if (
        locationsChanged
      ) {

        const previousTravel =
          containsAny(
            previousText,
            travelTerms
          );

        if (
          !previousTravel
        ) {

          errors.push(
            `Causal continuity failure at beat ${current.beat_number}: arrival at a new location occurs without a preceding travel/departure action.`
          );
        }
      }
    }

    /*
      D. SEARCH → MAJOR OBJECT OUTCOME
    */

    const currentHasOutcome =
      containsAny(
        currentText,
        carryOutcomeTerms
      );

    const previousSearch =
      containsAny(
        previousText,
        [
          "search",
          "searching",
          "look",
          "looking",
          "seek",
          "seeking"
        ]
      );

    if (
      currentHasOutcome &&
      previousSearch &&
      containsAny(
        currentText,
        mountainObjectTerms
      )
    ) {

      const hasAcquisitionVerb =
        containsAny(
          currentText,
          acquisitionTerms
        );

      if (
        !hasAcquisitionVerb
      ) {

        errors.push(
          `Causal gap between beat ${previous.beat_number} and beat ${current.beat_number}: search is followed by possession of a major object without explicit acquisition.`
        );
      }
    }
  }

  return {
    errors,
    warnings
  };
}


/* =========================================================
   13. SEMANTIC VISUAL EVIDENCE
========================================================= */

function extractSemanticEvidenceTerms(
  text
) {

  return normalizeSemanticText(
    text
  )
    .split(/\s+/)
    .filter(
      word =>
        word.length >= 4
    )
    .filter(
      word =>
        ![
          "this",
          "that",
          "with",
          "from",
          "into",
          "their",
          "they",
          "them",
          "very",
          "visual",
          "scene",
          "character",
          "location",
          "action",
          "appears",
          "shown"
        ].includes(word)
    )
    .slice(0, 30);
}


function validateSemanticEvidence(
  blueprint,
  factLock
) {

  const errors = [];

  const allowedClassifications =
    new Set([
      "VERIFIED",
      "INFERRED",
      "CREATIVE_RECONSTRUCTION",
      "UNKNOWN"
    ]);

  const evidenceById =
    new Map();

  for (
    const item
    of factLock?.locked_facts || []
  ) {

    if (
      item?.evidence_id
    ) {

      evidenceById.set(
        item.evidence_id,
        {
          kind: "LOCKED_FACT",
          text:
            item.claim || ""
        }
      );
    }
  }

  for (
    const item
    of factLock?.visual_notes || []
  ) {

    if (
      item?.evidence_id
    ) {

      evidenceById.set(
        item.evidence_id,
        {
          kind: "VISUAL_NOTE",
          text:
            item.description || ""
        }
      );
    }
  }

  for (
    const item
    of factLock?.creative_reconstructions || []
  ) {

    if (
      item?.evidence_id
    ) {

      evidenceById.set(
        item.evidence_id,
        {
          kind:
            "CREATIVE_RECONSTRUCTION",
          text:
            item.description || ""
        }
      );
    }
  }

  function inspectClaims(
    entity,
    label
  ) {

    if (
      !Array.isArray(
        entity.visual_claims
      )
    ) {

      errors.push(
        `${label} is missing visual_claims.`
      );

      return;
    }

    for (
      const item
      of entity.visual_claims
    ) {

      const claim =
        String(
          item?.claim || ""
        ).trim();

      const classification =
        String(
          item?.classification || ""
        )
          .trim()
          .toUpperCase();

      const ids =
        Array.isArray(
          item?.evidence_ids
        )
          ? item.evidence_ids
          : [];

      if (!claim) {

        errors.push(
          `${label} contains an empty visual claim.`
        );

        continue;
      }

      if (
        !allowedClassifications.has(
          classification
        )
      ) {

        errors.push(
          `${label} contains invalid visual claim classification "${classification}".`
        );

        continue;
      }

      if (
        classification !==
        "VERIFIED"
      ) {

        continue;
      }

      const linkedRecords =
        ids
          .map(
            id =>
              evidenceById.get(id)
          )
          .filter(Boolean);

      const directEvidence =
        linkedRecords.filter(
          record =>
            record.kind ===
              "LOCKED_FACT" ||
            record.kind ===
              "VISUAL_NOTE"
        );

      if (
        directEvidence.length === 0
      ) {

        errors.push(
          `${label} marks a visual claim VERIFIED without direct locked fact/visual-note evidence.`
        );

        continue;
      }

      const claimTerms =
        extractSemanticEvidenceTerms(
          claim
        );

      const evidenceTerms =
        new Set(
          directEvidence.flatMap(
            record =>
              extractSemanticEvidenceTerms(
                record.text
              )
          )
        );

      const matchedTerms =
        claimTerms.filter(
          term =>
            evidenceTerms.has(
              term
            )
        );

      const coverage =
        claimTerms.length === 0
          ? 0
          : matchedTerms.length /
            claimTerms.length;

      if (
        coverage < 0.60
      ) {

        errors.push(
          `${label} has a VERIFIED visual claim insufficiently supported by cited evidence.`
        );
      }
    }
  }

  for (
    const character
    of blueprint.character_bible || []
  ) {

    const label =
      `Character "${character?.name || "(unnamed)"}"`;

    inspectClaims(
      character || {},
      label
    );

    if (
      character?.visual_design_status ===
      "VERIFIED"
    ) {

      const claims =
        Array.isArray(
          character.visual_claims
        )
          ? character.visual_claims
          : [];

      if (
        claims.length === 0 ||
        claims.some(
          item =>
            String(
              item?.classification || ""
            ).toUpperCase() !==
            "VERIFIED"
        )
      ) {

        errors.push(
          `${label} has visual_design_status VERIFIED but not all visual claims are VERIFIED.`
        );
      }
    }
  }

  for (
    const location
    of blueprint.world_bible?.locations || []
  ) {

    inspectClaims(
      location || {},
      `Location "${location?.name || "(unnamed)"}"`
    );
  }

  return errors;
}


/* =========================================================
   14. BEAT CHARACTER COVERAGE
========================================================= */

function validateBeatCharacterCoverage(
  blueprint
) {

  const errors = [];

  const characterNames =
    new Set(
      (
        blueprint.character_bible ||
        []
      )
        .map(
          item =>
            String(
              item?.name || ""
            ).trim()
        )
        .filter(Boolean)
    );

  const beats =
    blueprint.story_blueprint?.beats ||
    [];

  for (
    const beat
    of beats
  ) {

    const listedCharacters =
      Array.isArray(
        beat.characters
      )
        ? beat.characters
        : [];

    if (
      listedCharacters.length === 0
    ) {

      errors.push(
        `Beat ${beat.beat_number} has no explicit characters array.`
      );

      continue;
    }

    for (
      const name
      of listedCharacters
    ) {

      if (
        !characterNames.has(
          name
        )
      ) {

        errors.push(
          `Beat ${beat.beat_number} uses character "${name}" without matching character_bible entry.`
        );
      }
    }
  }

  return errors;
}


/* =========================================================
   15. IMPORTANT TERM EXTRACTION
========================================================= */

function extractImportantTerms(
  text
) {

  const stopWords =
    new Set([

      "the",
      "and",
      "was",
      "were",
      "with",
      "from",
      "that",
      "this",
      "when",
      "during",
      "using",
      "into",
      "back",
      "over",
      "under",
      "after",
      "before",
      "their",
      "they",
      "them",
      "which",
      "specific",
      "powerful",
      "entire",
      "massive",
      "critical",
      "severely",
      "needed",
      "mentioned",
      "identified",
      "according",
      "described"
    ]);

  return String(
    text || ""
  )
    .replace(
      /[^a-z0-9\s-]/gi,
      " "
    )
    .split(/\s+/)
    .filter(
      word =>
        word.length >= 5 &&
        !stopWords.has(
          word.toLowerCase()
        )
    )
    .slice(0, 12);
}


/* =========================================================
   16. TIME RANGE PARSER
========================================================= */

function parseTimeRange(
  value
) {

  if (
    typeof value !==
    "string"
  ) {

    return null;
  }

  const cleaned =
    value
      .trim()
      .replace(
        /[–—−]/g,
        "-"
      )
      .replace(
        /\s+/g,
        " "
      );

  let match =
    cleaned.match(
      /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/
    );

  if (match) {

    return {

      start:
        Number(match[1]) *
          60 +
        Number(match[2]),

      end:
        Number(match[3]) *
          60 +
        Number(match[4])
    };
  }

  match =
    cleaned.match(
      /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/
    );

  if (match) {

    return {

      start:
        Number(match[1]),

      end:
        Number(match[2])
    };
  }

  return null;
}


/* =========================================================
   17. PROGRAMMATIC VALIDATOR
========================================================= */

function validateBlueprint(
  blueprint,
  research,
  factLock,
  duration,
  aspectRatio
) {

  const errors = [];
  const warnings = [];

  if (
    !blueprint ||
    typeof blueprint !==
      "object"
  ) {

    return {
      passed: false,
      errors: [
        "Blueprint is missing or invalid."
      ],
      warnings: []
    };
  }

  const requiredRootSections = [

    "project",
    "evidence_policy",
    "character_bible",
    "world_bible",
    "visual_language",
    "story_blueprint",
    "continuity_system",
    "directing_rules",
    "quality_control"

  ];

  for (
    const section
    of requiredRootSections
  ) {

    if (
      blueprint[section] ===
        undefined ||
      blueprint[section] ===
        null
    ) {

      errors.push(
        `Missing required section: ${section}`
      );
    }
  }

  /*
    PROJECT
  */

  if (
    blueprint.project?.duration_seconds !==
    duration
  ) {

    errors.push(
      `Duration mismatch. Expected ${duration}, got ${blueprint.project?.duration_seconds}.`
    );
  }

  if (
    blueprint.project?.aspect_ratio !==
    aspectRatio
  ) {

    errors.push(
      `Aspect ratio mismatch. Expected ${aspectRatio}, got ${blueprint.project?.aspect_ratio}.`
    );
  }

  /*
    FACT LOCK
  */

  const lockedFacts =
    factLock?.locked_facts ||
    [];

  const allBlueprintText =
    collectAllStrings(
      blueprint
    )
      .join("\n")
      .toLowerCase();

  for (
    const fact
    of lockedFacts
  ) {

    const claim =
      String(
        fact?.claim || ""
      )
        .trim()
        .toLowerCase();

    if (!claim) {
      continue;
    }

    const importantTerms =
      extractImportantTerms(
        claim
      );

    for (
      const term
      of importantTerms
    ) {

      if (
        !allBlueprintText.includes(
          term
        )
      ) {

        warnings.push(
          `Locked fact term "${term}" from ${fact.evidence_id} is not directly visible in blueprint text.`
        );
      }
    }
  }

  /*
    EVIDENCE IDS
  */

  const validEvidenceIds =
    new Set([

      ...lockedFacts
        .map(
          item =>
            item?.evidence_id
        )
        .filter(Boolean),

      ...(factLock?.creative_reconstructions || [])
        .map(
          item =>
            item?.evidence_id
        )
        .filter(Boolean),

      ...(factLock?.visual_notes || [])
        .map(
          item =>
            item?.evidence_id
        )
        .filter(Boolean)

    ]);

  const usedEvidenceIds =
    collectEvidenceIds(
      blueprint
    );

  for (
    const id
    of usedEvidenceIds
  ) {

    if (
      !validEvidenceIds.has(
        id
      )
    ) {

      errors.push(
        `Unknown evidence ID used: ${id}.`
      );
    }
  }

  /*
    CHARACTER TRACEABILITY
  */

  for (
    const character
    of blueprint.character_bible || []
  ) {

    if (
      !Array.isArray(
        character.evidence_ids
      )
    ) {

      errors.push(
        `Character "${character.name}" has no evidence_ids array.`
      );
    }
  }

  errors.push(
    ...validateCharacterIdentityLocks(
      blueprint
    )
  );

  /*
    WORLD TRACEABILITY
  */

  const locations =
    blueprint.world_bible?.locations ||
    [];

  for (
    const location
    of locations
  ) {

    if (
      !Array.isArray(
        location.evidence_ids
      )
    ) {

      errors.push(
        `Location "${location.name}" has no evidence_ids array.`
      );
    }

    const status =
      String(
        location.evidence_status ||
          ""
      ).toLowerCase();

    if (
      status.includes("verified") &&
      (
        !location.evidence_ids ||
        location.evidence_ids.length === 0
      )
    ) {

      errors.push(
        `Location "${location.name}" is marked verified without evidence.`
      );
    }
  }

  /*
    SEMANTIC EVIDENCE
  */

  errors.push(
    ...validateSemanticEvidence(
      blueprint,
      factLock
    )
  );

  /*
    BEAT SEMANTICS
  */

  const semanticValidation =
    validateBeatSemanticContinuity(
      blueprint
    );

  errors.push(
    ...semanticValidation.errors
  );

  warnings.push(
    ...semanticValidation.warnings
  );

  /*
    CAUSAL VALIDATION
  */

  const causalValidation =
    validateCausalBeatContinuity(
      blueprint
    );

  errors.push(
    ...causalValidation.errors
  );

  warnings.push(
    ...causalValidation.warnings
  );

  /*
    CAMERA CONSISTENCY
  */

  const visual =
    blueprint.visual_language ||
    {};

  const capture =
    String(
      visual.capture_system ||
        ""
    ).toLowerCase();

  const emulation =
    String(
      visual.visual_emulation ||
        ""
    ).toLowerCase();

  const digitalCameraTerms = [

    "arri alexa",
    "red camera",
    "sony venice",
    "digital cinema",
    "large-format digital"

  ];

  const literalFilmTerms = [

    "shot on 35mm film",
    "captured on 35mm film",
    "shot on 65mm film",
    "captured on 65mm film",
    "physical 35mm film stock"

  ];

  const digitalCapture =
    digitalCameraTerms.some(
      term =>
        capture.includes(
          term
        )
    );

  const literalFilm =
    literalFilmTerms.some(
      term =>
        capture.includes(
          term
        )
    );

  if (
    digitalCapture &&
    literalFilm &&
    !emulation.includes(
      "emulation"
    )
  ) {

    errors.push(
      "Camera contradiction: digital capture is combined with literal physical film capture."
    );
  }

  /*
    TIMELINE
  */

  const beats =
    blueprint.story_blueprint?.beats ||
    [];

  if (
    !Array.isArray(beats) ||
    beats.length === 0
  ) {

    errors.push(
      "Story blueprint contains no beats."
    );

  } else {

    const totalBeatDuration =
      beats.reduce(
        (
          sum,
          beat
        ) =>
          sum +
          Number(
            beat?.duration_seconds ||
              0
          ),
        0
      );

    if (
      Math.abs(
        totalBeatDuration -
        duration
      ) > 0.01
    ) {

      errors.push(
        `Beat duration mismatch. Expected ${duration}s, got ${totalBeatDuration}s.`
      );
    }

    let previousEnd = 0;

    for (
      const beat
      of beats
    ) {

      const range =
        parseTimeRange(
          beat?.time_range
        );

      if (!range) {

        errors.push(
          `Could not parse time range for beat ${beat?.beat_number}.`
        );

        continue;
      }

      if (
        range.end <=
        range.start
      ) {

        errors.push(
          `Beat ${beat.beat_number} has invalid time range.`
        );
      }

      if (
        Math.abs(
          range.start -
          previousEnd
        ) > 0.01
      ) {

        errors.push(
          `Timeline gap/overlap around beat ${beat.beat_number}.`
        );
      }

      const declaredDuration =
        Number(
          beat.duration_seconds
        );

      const rangeDuration =
        range.end -
        range.start;

      if (
        Math.abs(
          declaredDuration -
          rangeDuration
        ) > 0.01
      ) {

        errors.push(
          `Beat ${beat.beat_number} duration_seconds does not match its time_range.`
        );
      }

      previousEnd =
        range.end;
    }

    if (
      Math.abs(
        previousEnd -
        duration
      ) > 0.01
    ) {

      errors.push(
        "Timeline does not end exactly at requested duration."
      );
    }
  }

  /*
    CONTINUITY SYSTEM
  */

  const continuity =
    blueprint.continuity_system ||
    {};

  const continuityFields = [

    "character_continuity",
    "face_continuity",
    "body_continuity",
    "costume_continuity",
    "accessory_continuity",
    "environment_continuity",
    "lighting_continuity",
    "temporal_continuity",
    "geography_continuity",
    "action_state_continuity",
    "physics_continuity"

  ];

  for (
    const field
    of continuityFields
  ) {

    if (
      !Array.isArray(
        continuity[field]
      ) ||
      continuity[field].length === 0
    ) {

      errors.push(
        `Continuity system missing: ${field}.`
      );
    }
  }

  /*
    CHARACTER REALISM
  */

  const characters =
    blueprint.character_bible ||
    [];

  for (
    const character
    of characters
  ) {

    const requiredRealismFields = [

      "anatomy",
      "hands_and_fingers",
      "feet_and_toes",
      "breathing",
      "micro_expressions",
      "costume_physics",
      "movement_signature"

    ];

    for (
      const field
      of requiredRealismFields
    ) {

      if (
        !String(
          character?.[field] ||
            ""
        ).trim()
      ) {

        errors.push(
          `Character "${character?.name}" missing realism field: ${field}.`
        );
      }
    }

    const lock =
      character?.character_identity_lock;

    if (lock) {

      if (
        normalizeSemanticText(
          lock.canonical_name
        ) !==
        normalizeSemanticText(
          character.name
        )
      ) {

        errors.push(
          `Character "${character.name}" identity fingerprint name mismatch.`
        );
      }

      if (
        normalizeSemanticText(
          lock.apparent_age
        ) !==
        normalizeSemanticText(
          character.apparent_age
        )
      ) {

        errors.push(
          `Character "${character.name}" identity fingerprint age mismatch.`
        );
      }
    }
  }

  /*
    BEAT CHARACTER COVERAGE
  */

  errors.push(
    ...validateBeatCharacterCoverage(
      blueprint
    )
  );

  /*
    CRITICAL WARNINGS
  */

  const criticalWarningPatterns = [

    /environment leakage risk/i,
    /geographic continuity/i,
    /generic identity substitution/i

  ];

  for (
    const warning
    of warnings
  ) {

    if (
      criticalWarningPatterns.some(
        pattern =>
          pattern.test(
            warning
          )
      )
    ) {

      errors.push(
        `CRITICAL SEMANTIC WARNING PROMOTED TO ERROR: ${warning}`
      );
    }
  }

  return {

    passed:
      errors.length === 0,

    errors,

    warnings
  };
}


/* =========================================================
   18. AUTO CORRECTION ENGINE
========================================================= */

async function autoCorrectBlueprint(
  blueprint,
  validation,
  research,
  factLock,
  duration,
  aspectRatio
) {

  const correctionInstruction = `

You are the CORRECTION DIRECTOR of LongShot AI.

The supplied Director Blueprint failed programmatic validation.

Your task is to return a corrected production-ready blueprint.

DO NOT merely rewrite wording.

You MUST correct the actual semantic structure.

=========================================================
ABSOLUTE CHARACTER IDENTITY
=========================================================

Never replace canonical characters with:

generic warrior
generic soldier
generic commander
generic king
generic monk
generic physician
generic man
generic woman
unnamed warrior
unnamed soldier
random commander
injured soldier
injured warrior
Alexander's commander
Alexander-era soldier

Preserve exact canonical names.

Preserve exactly:

apparent age
face
facial structure
eyes
hair/fur
skin/body texture
body type
height/scale
body proportions
musculature
anatomy
costume
costume colors
costume material
costume physics
accessories
signature features
movement signature

=========================================================
LOCATION
=========================================================

The location is the physical environment where the visible action
actually occurs.

Flying characters must be in:

sky
air corridor
open air
credible travel corridor

unless the beat is explicitly:

departure
landing
arrival

Do NOT place a flying action inside:

camp
medical tent
palace
room
temple
hut
cave

=========================================================
TEMPORAL LOGIC
=========================================================

IMPORTANT:

"before sunrise"
"before dawn"
"by sunrise"
"by dawn"

are deadlines.

They are NOT sunrise lighting.

"approaching dawn"
"toward dawn"
"towards dawn"
"as dawn approaches"

are transitions.

They are NOT automatically daylight.

Do not create a temporal conflict merely because a beat says
"save him before sunrise" while the visual state is night.

=========================================================
ENVIRONMENT LOGIC
=========================================================

"Himalayan Peak" is compatible with:

mountain peak
mountain
snow-covered mountain
snowfield
alpine terrain
Dronagiri

A mountain carried into a camp is an OBJECT,
not a mountain ENVIRONMENT.

Do not reject a beat because a character is carrying a mountain
while physically located at a camp.

=========================================================
ACTION DENSITY
=========================================================

ONE dominant action per 5–6 second beat.

IMPORTANT:

You ARE ALLOWED to change the number of beats.

You ARE ALLOWED to split an overloaded beat into multiple beats.

You ARE ALLOWED to redistribute durations.

The final total MUST remain exactly:

${duration} seconds.

Example:

30 sec may use:

5 × 6 sec

or

6 × 5 sec

or

4 + 5 + 5 + 6 + 5 + 5

etc.

as long as:

- timeline starts at 0
- no gaps
- no overlaps
- timeline ends at ${duration}
- each beat has matching duration_seconds
- causal order is preserved.

=========================================================
CAUSAL CONTINUITY
=========================================================

Never:

search
→ mountain carried

without:

search
→ acquisition/lifting/uprooting
→ carry/return

Never:

medicine search
→ revival

without treatment.

Never:

travel
→ arrival

without travel/departure.

=========================================================
ENVIRONMENT LEAKAGE
=========================================================

Do not leak:

camp into sky
mountain scenery into camp
ocean into mountain
palace into forest
forest into unrelated fixed location

Again:

A carried object does NOT automatically become the environment.

=========================================================
EVIDENCE
=========================================================

Preserve all valid evidence IDs.

Never create new evidence IDs.

=========================================================
RESEARCH
=========================================================

${JSON.stringify(
  research,
  null,
  2
)}

=========================================================
FACT LOCK
=========================================================

${JSON.stringify(
  factLock,
  null,
  2
)}

=========================================================
CLOSED EVIDENCE IDS
=========================================================

${JSON.stringify(
  [
    ...(factLock?.locked_facts || [])
      .map(
        item =>
          item?.evidence_id
      )
      .filter(Boolean),

    ...(factLock?.creative_reconstructions || [])
      .map(
        item =>
          item?.evidence_id
      )
      .filter(Boolean),

    ...(factLock?.visual_notes || [])
      .map(
        item =>
          item?.evidence_id
      )
      .filter(Boolean)

  ],
  null,
  2
)}

=========================================================
CURRENT BLUEPRINT
=========================================================

${JSON.stringify(
  blueprint,
  null,
  2
)}

=========================================================
VALIDATION ERRORS
=========================================================

${JSON.stringify(
  validation.errors,
  null,
  2
)}

=========================================================
VALIDATION WARNINGS
=========================================================

${JSON.stringify(
  validation.warnings,
  null,
  2
)}

=========================================================
MANDATORY CORRECTIONS
=========================================================

1. Preserve all canonical names.
2. Preserve all identity locks.
3. Preserve all apparent ages.
4. Preserve face continuity.
5. Preserve body continuity.
6. Preserve costume continuity.
7. Preserve research-supported facts.
8. Preserve valid evidence IDs.
9. Correct location/action mismatch.
10. Correct geography.
11. Correct temporal logic.
12. Treat deadlines as deadlines.
13. Treat temporal phrases as transitions when appropriate.
14. Correct environment leakage.
15. Do not treat carried objects as environments.
16. Correct causal gaps.
17. Correct action density.
18. Split overloaded beats when necessary.
19. Keep exact total duration ${duration}s.
20. Keep exact aspect ratio ${aspectRatio}.
21. Keep contiguous timeline.
22. Every visible character must appear in characters[].
23. Every beat must have a real physical location.
24. No generic canonical character substitution.
25. Return ONLY corrected JSON.

`;

  const response =
    await ai.interactions.create({

      model:
        "gemini-3.5-flash-lite",

      input:
        correctionInstruction,

      response_format: {

        type: "text",

        mime_type:
          "application/json",

        schema:
          directorSchema
      }
    });

  if (
    !response?.output_text
  ) {

    throw new Error(
      "Correction Engine returned empty output."
    );
  }

  try {

    return JSON.parse(
      response.output_text
    );

  } catch {

    throw new Error(
      "Correction Engine returned invalid JSON."
    );
  }
}


/* =========================================================
   19. FINAL PUBLIC DIRECTOR FUNCTION
========================================================= */

export async function createDirectorBlueprint(
  researchData,
  duration = 20,
  aspectRatio = "9:16"
) {

  if (
    ![20, 25, 30].includes(
      Number(duration)
    )
  ) {

    throw new Error(
      `Unsupported duration ${duration}. LongShot Director Engine supports only 20, 25 or 30 seconds.`
    );
  }

  const allowedAspectRatios = [
    "9:16",
    "16:9",
    "1:1"
  ];

  if (
    !allowedAspectRatios.includes(
      aspectRatio
    )
  ) {

    throw new Error(
      `Unsupported aspect ratio "${aspectRatio}".`
    );
  }

  const research =
    normalizeResearch(
      researchData
    );

  const factLock =
    buildFactLock(
      research
    );

  /*
    FIRST GENERATION
  */

  let blueprint =
    await runDirector(
      research,
      factLock,
      duration,
      aspectRatio
    );

  /*
    FIRST VALIDATION
  */

  let validation =
    validateBlueprint(
      blueprint,
      research,
      factLock,
      duration,
      aspectRatio
    );

  let autoCorrected =
    false;

  /*
    AUTO-CORRECTION PASS 1
  */

  if (
    !validation.passed
  ) {

    blueprint =
      await autoCorrectBlueprint(

        blueprint,

        validation,

        research,

        factLock,

        duration,

        aspectRatio

      );

    autoCorrected =
      true;

    validation =
      validateBlueprint(

        blueprint,

        research,

        factLock,

        duration,

        aspectRatio

      );
  }

  /*
    AUTO-CORRECTION PASS 2
  */

  if (
    !validation.passed
  ) {

    blueprint =
      await autoCorrectBlueprint(

        blueprint,

        validation,

        research,

        factLock,

        duration,

        aspectRatio

      );

    autoCorrected =
      true;

    validation =
      validateBlueprint(

        blueprint,

        research,

        factLock,

        duration,

        aspectRatio

      );
  }

  /*
    HARD FAILURE
  */

  if (
    !validation.passed
  ) {

    const errorMessage =
      validation.errors.join(
        " | "
      );

    throw new Error(
      `Director Blueprint failed validation after auto-correction: ${errorMessage}`
    );
  }

  /*
    FINAL MACHINE VALIDATION
  */

  const finalCheck =
    validateBlueprint(

      blueprint,

      research,

      factLock,

      duration,

      aspectRatio

    );

  if (
    !finalCheck.passed
  ) {

    throw new Error(
      `Director Blueprint failed final machine validation: ${finalCheck.errors.join(" | ")}`
    );
  }

  /*
    FINAL VALIDATION METADATA
  */

  blueprint._longshot_validation = {

    validator_version:
      "V5.1",

    passed:
      true,

    auto_corrected:
      autoCorrected,

    errors_after_validation:
      [],

    warnings:
      finalCheck.warnings,

    validated_duration:
      duration,

    validated_aspect_ratio:
      aspectRatio

  };

  return blueprint;
}
