import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY
});


/* =========================================================
   LONGSHOT AI — DIRECTOR ENGINE V4
   Research → Fact Lock → Director → Validator → Correction
========================================================= */


/* =========================================================
   1. RESEARCH NORMALIZATION
========================================================= */

function normalizeResearch(researchData) {

  if (!researchData || typeof researchData !== "object") {
    throw new Error("Invalid research data.");
  }

  return {
    topic: researchData.topic || "",
    domain: researchData.domain || "general",

    research_required:
      Boolean(researchData.research_required),

    research_summary:
      researchData.research_summary || "",

    verified_facts:
      Array.isArray(researchData.verified_facts)
        ? researchData.verified_facts
        : [],

    creative_reconstruction:
      Array.isArray(researchData.creative_reconstruction)
        ? researchData.creative_reconstruction
        : [],

    visual_research_notes:
      Array.isArray(researchData.visual_research_notes)
        ? researchData.visual_research_notes
        : [],

    authenticity_warnings:
      Array.isArray(researchData.authenticity_warnings)
        ? researchData.authenticity_warnings
        : []
  };
}


/* =========================================================
   2. FACT LOCK
========================================================= */

function buildFactLock(research) {

  return {

    locked_facts:
      research.verified_facts.map((item, index) => ({

        evidence_id:
          `FACT_${String(index + 1).padStart(3, "0")}`,

        claim:
          item.fact || "",

        source_title:
          item.source_title || "",

        source_url:
          item.source_url || "",

        confidence:
          item.confidence || "unknown",

        status:
          "VERIFIED_LOCKED"

      })),

    creative_reconstructions:
      research.creative_reconstruction.map(
        (item, index) => ({

          evidence_id:
            `CREATIVE_${String(index + 1).padStart(3, "0")}`,

          description:
            item,

          status:
            "CREATIVE_RECONSTRUCTION"

        })
      ),

    visual_notes:
      research.visual_research_notes.map(
        (item, index) => ({

          evidence_id:
            `VISUAL_${String(index + 1).padStart(3, "0")}`,

          description:
            item,

          status:
            "RESEARCH_VISUAL_NOTE"

        })
      ),

    authenticity_warnings:
      research.authenticity_warnings.map(
        (item, index) => ({

          warning_id:
            `WARNING_${String(index + 1).padStart(3, "0")}`,

          description:
            item

        })
      )
  };
}/* =========================================================
   3. DIRECTOR SCHEMA
========================================================= */

const directorSchema = {

  type: "object",

  properties: {

    project: {
      type: "object",
      properties: {
        title: { type: "string" },
        concept: { type: "string" },
        domain: { type: "string" },
        duration_seconds: { type: "number" },
        aspect_ratio: { type: "string" },
        creative_intent: { type: "string" },
        realism_target: { type: "string" }
      },
      required: [
        "title",
        "concept",
        "domain",
        "duration_seconds",
        "aspect_ratio",
        "creative_intent",
        "realism_target"
      ]
    },

    evidence_policy: {
      type: "object",
      properties: {

        locked_facts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              evidence_id: { type: "string" },
              claim: { type: "string" },
              status: { type: "string" }
            },
            required: [
              "evidence_id",
              "claim",
              "status"
            ]
          }
        },

        inferred_details: {
          type: "array",
          items: { type: "string" }
        },

        creative_reconstructions: {
          type: "array",
          items: { type: "string" }
        },

        unknown_details: {
          type: "array",
          items: { type: "string" }
        },

        contradictions_detected: {
          type: "array",
          items: { type: "string" }
        },

        fact_lock_rules: {
          type: "array",
          items: { type: "string" }
        }
      },

      required: [
        "locked_facts",
        "inferred_details",
        "creative_reconstructions",
        "unknown_details",
        "contradictions_detected",
        "fact_lock_rules"
      ]
    },

    character_bible: {
      type: "array",

      items: {
        type: "object",

        properties: {

          name: { type: "string" },

          identity_status: {
            type: "string"
          },

          evidence_ids: {
            type: "array",
            items: { type: "string" }
          },

          physical_identity: {
            type: "string"
          },

          body_proportions: {
            type: "string"
          },

          facial_structure: {
            type: "string"
          },

          face: {
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

          anatomy: {
            type: "string"
          },

          musculature: {
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

          costume_material: {
            type: "string"
          },

          costume_physics: {
            type: "string"
          },

          accessories: {
            type: "string"
          },

          accessory_physics: {
            type: "string"
          },

          movement_signature: {
            type: "string"
          },

          emotional_behavior: {
            type: "string"
          },

          continuity_rules: {
            type: "array",
            items: { type: "string" }
          },

          forbidden_changes: {
            type: "array",
            items: { type: "string" }
          }
        },

        required: [
          "name",
          "identity_status",
          "evidence_ids",
          "physical_identity",
          "body_proportions",
          "facial_structure",
          "face",
          "eyes",
          "hair_or_fur",
          "skin_or_body_texture",
          "anatomy",
          "musculature",
          "hands_and_fingers",
          "feet_and_toes",
          "breathing",
          "micro_expressions",
          "costume",
          "costume_material",
          "costume_physics",
          "accessories",
          "accessory_physics",
          "movement_signature",
          "emotional_behavior",
          "continuity_rules",
          "forbidden_changes"
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

              evidence_status: {
                type: "string"
              },

              evidence_ids: {
                type: "array",
                items: { type: "string" }
              },

              environment: {
                type: "string"
              },

              terrain: {
                type: "string"
              },

              vegetation: {
                type: "string"
              },

              architecture: {
                type: "string"
              },

              props: {
                type: "string"
              },

              atmosphere: {
                type: "string"
              },

              weather: {
                type: "string"
              },

              time_of_day: {
                type: "string"
              },

              celestial_conditions: {
                type: "string"
              },

              environmental_physics: {
                type: "array",
                items: { type: "string" }
              },

              lighting_conditions: {
                type: "string"
              },

              continuity_rules: {
                type: "array",
                items: { type: "string" }
              }
            },

            required: [
              "name",
              "evidence_status",
              "evidence_ids",
              "environment",
              "terrain",
              "vegetation",
              "architecture",
              "props",
              "atmosphere",
              "weather",
              "time_of_day",
              "celestial_conditions",
              "environmental_physics",
              "lighting_conditions",
              "continuity_rules"
            ]
          }
        },

        global_physical_rules: {
          type: "array",
          items: { type: "string" }
        },

        global_visual_rules: {
          type: "array",
          items: { type: "string" }
        }
      },

      required: [
        "locations",
        "global_physical_rules",
        "global_visual_rules"
      ]
    },

    visual_language: {
      type: "object",

      properties: {

        realism_target: {
          type: "string"
        },

        capture_system: {
          type: "string"
        },

        visual_emulation: {
          type: "string"
        },

        lens_policy: {
          type: "string"
        },

        focal_length_strategy: {
          type: "string"
        },

        framing: {
          type: "string"
        },

        camera_height: {
          type: "string"
        },

        camera_movement: {
          type: "string"
        },

        focus_behavior: {
          type: "string"
        },

        depth_of_field: {
          type: "string"
        },

        shutter_motion_behavior: {
          type: "string"
        },

        lighting: {
          type: "string"
        },

        practical_lighting: {
          type: "string"
        },

        shadow_behavior: {
          type: "string"
        },

        color_science: {
          type: "string"
        },

        contrast_strategy: {
          type: "string"
        },

        texture_detail: {
          type: "string"
        },

        atmospheric_depth: {
          type: "string"
        },

        motion_rendering: {
          type: "string"
        },

        vfx_philosophy: {
          type: "string"
        }
      },

      required: [
        "realism_target",
        "capture_system",
        "visual_emulation",
        "lens_policy",
        "focal_length_strategy",
        "framing",
        "camera_height",
        "camera_movement",
        "focus_behavior",
        "depth_of_field",
        "shutter_motion_behavior",
        "lighting",
        "practical_lighting",
        "shadow_behavior",
        "color_science",
        "contrast_strategy",
        "texture_detail",
        "atmospheric_depth",
        "motion_rendering",
        "vfx_philosophy"
      ]
    },    story_blueprint: {
      type: "object",

      properties: {

        logline: {
          type: "string"
        },

        opening_hook: {
          type: "string"
        },

        emotional_arc: {
          type: "string"
        },

        escalation: {
          type: "string"
        },

        climax: {
          type: "string"
        },

        ending_beat: {
          type: "string"
        },

        pacing_strategy: {
          type: "string"
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

              location: {
                type: "string"
              },

              evidence_ids: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              story_action: {
                type: "string"
              },

              character_action: {
                type: "string"
              },

              emotional_purpose: {
                type: "string"
              },

              visual_priority: {
                type: "string"
              },

              transition_to_next: {
                type: "string"
              }
            },

            required: [
              "beat_number",
              "time_range",
              "duration_seconds",
              "location",
              "evidence_ids",
              "story_action",
              "character_action",
              "emotional_purpose",
              "visual_priority",
              "transition_to_next"
            ]
          }
        }
      },

      required: [
        "logline",
        "opening_hook",
        "emotional_arc",
        "escalation",
        "climax",
        "ending_beat",
        "pacing_strategy",
        "beats"
      ]
    },


    /* =====================================================
       CONTINUITY SYSTEM
    ===================================================== */

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


    /* =====================================================
       DIRECTING RULES
    ===================================================== */

    directing_rules: {
      type: "array",
      items: {
        type: "string"
      }
    },


    /* =====================================================
       QUALITY CONTROL
    ===================================================== */

    quality_control: {

      type: "object",

      properties: {

        mandatory_checks: {
          type: "array",
          items: { type: "string" }
        },

        forbidden_errors: {
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

        realism_checks: {
          type: "array",
          items: { type: "string" }
        }
      },

      required: [
        "mandatory_checks",
        "forbidden_errors",
        "continuity_checks",
        "authenticity_checks",
        "realism_checks"
      ]
    }

  },


  /* =====================================================
     ROOT REQUIRED FIELDS
  ===================================================== */

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
};/* =========================================================
   4. MASTER DIRECTOR INSTRUCTIONS
========================================================= */

const MASTER_DIRECTOR_INSTRUCTIONS = `

You are the MASTER DIRECTOR of LongShot AI.

Your responsibility is to transform researched factual
material into a production-ready cinematic blueprint.

You are NOT the final video generator.

You are the creative director, continuity supervisor,
visual realism supervisor, story architect and
fact-integrity supervisor.

=========================================================
CORE PIPELINE
=========================================================

RESEARCH
→ FACT LOCK
→ DIRECTOR
→ PROGRAMMATIC VALIDATOR
→ AUTO CORRECTION IF REQUIRED
→ FINAL BLUEPRINT

=========================================================
1. FACT LOCK — ABSOLUTE PRIORITY
=========================================================

The supplied FACT LOCK is authoritative.

Every item marked VERIFIED_LOCKED is immutable.

You MUST NOT:

- rename a verified person
- rename a verified location
- replace a verified object
- change a verified relationship
- change a verified event
- change a verified sequence
- introduce a contradictory fact
- silently replace one traditional version with another

If the research says:

Dronagiri

you MUST NOT output:

Gandhamadana

unless the research itself explicitly contains a
documented contradiction that must be represented.

When sources disagree, preserve the disagreement rather
than silently selecting one version.

=========================================================
2. EVIDENCE CLASSIFICATION
=========================================================

Every important factual or visual claim must belong to
one of these categories:

VERIFIED
INFERRED
CREATIVE_RECONSTRUCTION
UNKNOWN

Use VERIFIED only when supported by the supplied
locked evidence.

Use INFERRED only when logically derived from evidence.

Use CREATIVE_RECONSTRUCTION for cinematic details that
are not explicitly established by the evidence.

Use UNKNOWN when the available material does not support
a reliable conclusion.

Never present creative reconstruction as historical,
scientific or scriptural fact.

=========================================================
3. EVIDENCE TRACEABILITY
=========================================================

Important claims must reference evidence IDs.

Examples:

FACT_001
FACT_002
CREATIVE_001
VISUAL_001

Character and world details should reference the
evidence that supports them whenever possible.

Do NOT create fake evidence IDs.

Only use IDs supplied by the FACT LOCK.

=========================================================
4. CHARACTER DIRECTING
=========================================================

Build a complete character bible.

Every major character must have a stable visual identity.

Maintain:

- facial structure
- body proportions
- musculature
- skin or fur characteristics
- hair or fur pattern
- eye characteristics
- hands
- fingers
- nails
- feet
- toes
- body weight
- posture
- breathing
- blinking
- micro-expressions
- movement signature
- costume
- costume materials
- accessory placement

Physical appearance must remain consistent between
all scenes.

Do not randomly change:

- face
- body size
- hairstyle
- fur pattern
- costume
- jewelry
- armor
- age appearance
- skin/fur texture

=========================================================
5. HUMAN / CREATURE REALISM
=========================================================

Characters must look physically present in the real world.

Avoid:

- plastic skin
- wax-like faces
- artificial CGI appearance
- perfectly smooth skin
- frozen expressions
- weightless movement
- rubber-like limbs
- impossible joints
- deformed hands
- missing fingers
- extra fingers
- malformed feet

Include realistic:

- skin pores
- fine texture
- natural imperfections
- muscle tension
- tendon movement
- breathing
- blinking
- eye moisture
- natural weight transfer
- joint mechanics
- cloth interaction
- environmental interaction

For non-human mythological beings, preserve their
traditional identity while keeping physical rendering
convincingly tangible.

=========================================================
6. MOVEMENT PHYSICS
=========================================================

All physical movement must respect:

- gravity
- inertia
- momentum
- acceleration
- deceleration
- balance
- weight transfer
- contact forces
- collision
- environmental resistance

If supernatural movement is required by the story,
the supernatural element should be intentional and
visually coherent.

Do not accidentally create physically inconsistent motion.

=========================================================
7. HANDS AND FEET
=========================================================

Hands and feet require special attention.

Maintain:

- correct anatomy
- correct finger count
- correct toe count
- believable joints
- natural gripping
- realistic pressure
- realistic contact with objects
- realistic nails
- realistic skin folds

Avoid distorted fingers and impossible grips.

=========================================================
8. COSTUME AND MATERIAL REALISM
=========================================================

Costumes must behave like real physical materials.

Specify where useful:

- fabric type
- thickness
- weight
- weave
- folds
- wrinkles
- tension
- friction
- dirt
- moisture
- wear
- damage

Jewelry, armor and weapons must respond naturally
to movement.

Do not allow accessories to randomly disappear,
change position or change design between scenes.

=========================================================
9. WORLD BUILDING
=========================================================

Create a stable world bible.

For every important location define:

- geography
- terrain
- vegetation
- architecture
- props
- atmosphere
- weather
- time
- celestial conditions
- lighting
- environmental physics

Separate documented facts from cinematic reconstruction.

Do not invent historical or scriptural details and label
them as verified.

=========================================================
10. ENVIRONMENTAL PHYSICS
=========================================================

Environment must react naturally.

Consider:

- wind
- dust
- smoke
- rain
- water
- mud
- vegetation
- fire
- cloth
- hair/fur
- debris
- shadows
- atmospheric haze

Environmental reactions must follow the action.

For example:

A powerful movement should affect nearby dust,
cloth, vegetation or loose objects when physically
appropriate.

=========================================================
11. TIME CONTINUITY
=========================================================

Choose one coherent temporal state.

Do not create contradictory descriptions such as:

"midnight"

and simultaneously:

"pre-dawn sunrise"

unless the story explicitly depicts that transition.

Time progression must be intentional.

Maintain consistency of:

- moon position
- sky brightness
- shadows
- artificial light
- atmospheric color
- sunrise/sunset state

=========================================================
12. GEOGRAPHY CONTINUITY
=========================================================

Locations must remain geographically coherent.

Do not silently change:

- mountain identity
- city
- battlefield
- forest
- direction of travel
- environmental type

If the story requires rapid supernatural travel,
represent the transition deliberately.

=========================================================
13. STORY DIRECTING
=========================================================

Create a strong cinematic narrative.

The sequence should contain:

- opening hook
- setup
- escalation
- emotional development
- climax
- ending beat

Every beat must contribute to the story.

Do not waste the limited duration on unnecessary
establishing shots.

=========================================================
14. DURATION MANAGEMENT
=========================================================

Respect the requested duration exactly.

For:

20 seconds → total beats must equal 20 seconds.

25 seconds → total beats must equal 25 seconds.

30 seconds → total beats must equal 30 seconds.

Do not create hidden extra time.

Avoid forcing multiple major actions into a single
very short beat unless the action is intentionally
compressed by the story.

=========================================================
15. CINEMATOGRAPHY
=========================================================

Direct the sequence like a professional cinematic
production.

Specify where useful:

- shot scale
- framing
- camera height
- camera movement
- lens choice
- focal length
- focus behavior
- depth of field
- motion rendering
- perspective

Camera movement must have narrative purpose.

Avoid random:

- zooms
- whip pans
- drone movements
- extreme lens changes

=========================================================
16. CAMERA CONSISTENCY
=========================================================

Keep camera language coherent.

Separate:

CAPTURE SYSTEM

from:

VISUAL EMULATION.

Do NOT create contradictions such as claiming a digital
cinema camera is simultaneously physical film stock.

Example:

capture_system:
digital large-format cinema camera

visual_emulation:
subtle 35mm filmic rendering

This is acceptable.

=========================================================
17. LIGHTING
=========================================================

Lighting must be physically believable.

Define:

- key light
- fill
- rim light
- practical lights
- moonlight
- firelight
- atmospheric light
- shadow direction

Light must interact correctly with:

- skin
- fur
- fabric
- metal
- stone
- water
- dust

=========================================================
18. COLOR SCIENCE
=========================================================

Use cinematic color intentionally.

Avoid excessive:

- saturation
- bloom
- artificial glow
- crushed blacks
- neon highlights

Color should support:

- emotion
- environment
- time
- story progression

=========================================================
19. VFX PHILOSOPHY
=========================================================

VFX should support realism.

Do not automatically add:

- magical particles
- giant energy fields
- glowing eyes
- excessive aura
- fantasy smoke
- artificial lens flares

Only use supernatural visual effects when justified
by the story or clearly marked creative reconstruction.

=========================================================
20. MYTHOLOGY / HISTORY AUTHENTICITY
=========================================================

For mythology and history:

Prioritize the supplied evidence.

Distinguish:

- primary textual description
- traditional interpretation
- later interpretation
- popular representation
- cinematic reconstruction

Never allow popular visual culture to override
locked evidence.

=========================================================
21. SCIENCE AUTHENTICITY
=========================================================

For science topics:

Do not introduce scientifically impossible details
unless the story explicitly requires fiction.

Clearly distinguish:

- established science
- inference
- visualization
- fictional reconstruction

=========================================================
22. AI ERROR PREVENTION
=========================================================

Actively prevent common generative-video errors:

- changing faces
- changing costumes
- changing body proportions
- extra fingers
- missing fingers
- malformed hands
- malformed feet
- floating objects
- object duplication
- inconsistent shadows
- impossible reflections
- disappearing accessories
- teleporting characters
- sudden location changes
- inconsistent weather
- inconsistent time
- random camera language

=========================================================
23. CONTINUITY STATE
=========================================================

Every beat must logically inherit the previous beat.

Track:

character_state
costume_state
location_state
lighting_state
time_state
weather_state
action_state
emotional_state
object_state

A later beat must not contradict an earlier state.

=========================================================
24. SELF-CHECK BEFORE OUTPUT
=========================================================

Before producing the blueprint, internally inspect:

1. Fact integrity
2. Evidence classification
3. Evidence traceability
4. Character continuity
5. Costume continuity
6. Location continuity
7. Geography continuity
8. Time continuity
9. Lighting continuity
10. Physics continuity
11. Story continuity
12. Duration
13. Camera consistency
14. Lens consistency
15. Realism
16. Anatomy
17. VFX restraint
18. AI error prevention

If a conflict is found:

CORRECT IT BEFORE OUTPUT.

Do not merely claim that the conflict was checked.

=========================================================
25. FINAL DIRECTOR PRINCIPLE
=========================================================

The final blueprint must be:

FACTUALLY CONTROLLED
+
CINEMATICALLY POWERFUL
+
PHYSICALLY BELIEVABLE
+
VISUALLY CONSISTENT
+
TEMPORALLY CONSISTENT
+
PRODUCTION READY.

Never sacrifice factual integrity for cinematic style.

Never sacrifice physical realism for unnecessary visual
spectacle.

Never sacrifice continuity for individual impressive shots.

`;/* =========================================================
   5. DIRECTOR ENGINE + PROGRAMMATIC VALIDATOR
========================================================= */


/* =========================================================
   RUN DIRECTOR
========================================================= */

async function runDirector(
  research,
  factLock,
  duration,
  aspectRatio
) {

  const directorInput = `
${MASTER_DIRECTOR_INSTRUCTIONS}

=========================================================
REQUESTED PRODUCTION SETTINGS
=========================================================

Duration:
${duration} seconds

Aspect Ratio:
${aspectRatio}

=========================================================
RESEARCH DATA
=========================================================

${JSON.stringify(research, null, 2)}

=========================================================
FACT LOCK
=========================================================

${JSON.stringify(factLock, null, 2)}

=========================================================
FINAL INSTRUCTION
=========================================================

Create the complete LongShot AI Director Blueprint.

IMPORTANT:

- Use only supplied evidence IDs.
- Never invent evidence IDs.
- Never replace locked facts.
- Clearly classify unsupported visual details.
- Keep character continuity strict.
- Keep world continuity strict.
- Keep time continuity strict.
- Keep geography continuity strict.
- Keep physical movement believable.
- Separate camera capture from visual emulation.
- Respect the exact requested duration.
- Do not claim an audit passed unless the blueprint
  actually satisfies the requirements.

Return ONLY valid JSON matching the supplied schema.
`;

  const response = await ai.interactions.create({

    model: "gemini-3.5-flash-lite",

    input: directorInput,

    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: directorSchema
    }
  });

  if (!response.output_text) {
    throw new Error(
      "Director Engine returned empty output."
    );
  }

  try {

    return JSON.parse(response.output_text);

  } catch (error) {

    throw new Error(
      "Director Engine returned invalid JSON."
    );
  }
}


/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

function collectAllStrings(value, result = []) {

  if (typeof value === "string") {

    result.push(value);

    return result;
  }

  if (Array.isArray(value)) {

    for (const item of value) {
      collectAllStrings(item, result);
    }

    return result;
  }

  if (value && typeof value === "object") {

    for (const key of Object.keys(value)) {

      collectAllStrings(value[key], result);
    }
  }

  return result;
}


function collectEvidenceIds(value) {

  const ids = new Set();

  function walk(item) {

    if (!item) return;

    if (Array.isArray(item)) {

      for (const child of item) {
        walk(child);
      }

      return;
    }

    if (typeof item === "object") {

      for (const [key, child] of Object.entries(item)) {

        if (
          key === "evidence_ids" &&
          Array.isArray(child)
        ) {

          for (const id of child) {

            if (typeof id === "string") {
              ids.add(id);
            }
          }
        }

        walk(child);
      }
    }
  }

  walk(value);

  return [...ids];
}


/* =========================================================
   PROGRAMMATIC VALIDATOR
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

  if (!blueprint || typeof blueprint !== "object") {

    errors.push(
      "Blueprint is missing or invalid."
    );

    return {
      passed: false,
      errors,
      warnings
    };
  }


  /* -------------------------------------------------------
     1. ROOT STRUCTURE
  ------------------------------------------------------- */

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

  for (const section of requiredRootSections) {

    if (
      blueprint[section] === undefined ||
      blueprint[section] === null
    ) {

      errors.push(
        `Missing required section: ${section}`
      );
    }
  }


  /* -------------------------------------------------------
     2. PROJECT SETTINGS
  ------------------------------------------------------- */

  if (
    blueprint.project?.duration_seconds !== duration
  ) {

    errors.push(
      `Duration mismatch. Expected ${duration}, got ${blueprint.project?.duration_seconds}`
    );
  }

  if (
    blueprint.project?.aspect_ratio !== aspectRatio
  ) {

    errors.push(
      `Aspect ratio mismatch. Expected ${aspectRatio}, got ${blueprint.project?.aspect_ratio}`
    );
  }


  /* -------------------------------------------------------
     3. FACT LOCK INTEGRITY
  ------------------------------------------------------- */

  const lockedFacts =
    factLock.locked_facts || [];

  const allBlueprintText =
    collectAllStrings(blueprint).join("\n").toLowerCase();


  for (const fact of lockedFacts) {

    const claim =
      String(fact.claim || "")
        .trim()
        .toLowerCase();

    if (!claim) continue;

    /*
      We do not require the entire sentence to appear
      verbatim.

      Instead, protect important named entities extracted
      from the claim.
    */

    const importantTerms =
      extractImportantTerms(claim);

    for (const term of importantTerms) {

      if (
        !allBlueprintText.includes(term)
      ) {

        errors.push(
          `Locked fact entity missing or possibly replaced: "${term}" (${fact.evidence_id})`
        );
      }
    }
  }


  /* -------------------------------------------------------
     4. INVALID / FAKE EVIDENCE IDS
  ------------------------------------------------------- */

  const validEvidenceIds =
    new Set([
      ...lockedFacts.map(
        item => item.evidence_id
      ),

      ...(factLock.creative_reconstructions || [])
        .map(item => item.evidence_id),

      ...(factLock.visual_notes || [])
        .map(item => item.evidence_id)
    ]);

  const usedEvidenceIds =
    collectEvidenceIds(blueprint);

  for (const id of usedEvidenceIds) {

    if (!validEvidenceIds.has(id)) {

      errors.push(
        `Unknown evidence ID used: ${id}`
      );
    }
  }


  /* -------------------------------------------------------
     5. CHARACTER TRACEABILITY
  ------------------------------------------------------- */

  if (
    Array.isArray(blueprint.character_bible)
  ) {

    for (
      const character
      of blueprint.character_bible
    ) {

      if (
        !Array.isArray(character.evidence_ids)
      ) {

        errors.push(
          `Character "${character.name}" has no evidence_ids array.`
        );

        continue;
      }

      /*
        A character may contain creative visual design,
        therefore absence of evidence is not automatically
        a factual error.

        But every character must explicitly declare
        evidence linkage or UNKNOWN.
      */

      if (
        character.evidence_ids.length === 0 &&
        !String(
          character.identity_status || ""
        ).toLowerCase().includes("unknown")
      ) {

        warnings.push(
          `Character "${character.name}" has no linked evidence IDs.`
        );
      }
    }
  }


  /* -------------------------------------------------------
     6. WORLD TRACEABILITY
  ------------------------------------------------------- */

  const locations =
    blueprint.world_bible?.locations || [];

  if (Array.isArray(locations)) {

    for (const location of locations) {

      if (
        !Array.isArray(location.evidence_ids)
      ) {

        errors.push(
          `Location "${location.name}" has no evidence_ids array.`
        );
      }

      const status =
        String(
          location.evidence_status || ""
        ).toLowerCase();

      if (
        status.includes("verified") &&
        (!location.evidence_ids ||
          location.evidence_ids.length === 0)
      ) {

        errors.push(
          `Location "${location.name}" is marked verified without evidence.`
        );
      }
    }
  }


  /* -------------------------------------------------------
     7. CAMERA CONSISTENCY
  ------------------------------------------------------- */

  const visual =
    blueprint.visual_language || {};

  const capture =
    String(
      visual.capture_system || ""
    ).toLowerCase();

  const emulation =
    String(
      visual.visual_emulation || ""
    ).toLowerCase();


  /*
    Prevent the exact contradiction discovered in V3:
    digital camera + literal physical film stock.
  */

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
      term => capture.includes(term)
    );

  const literalFilm =
    literalFilmTerms.some(
      term =>
        capture.includes(term) ||
        emulation.includes(term)
    );

  if (
    digitalCapture &&
    literalFilm &&
    !emulation.includes("emulation")
  ) {

    errors.push(
      "Camera contradiction: digital capture is described together with literal physical film capture."
    );
  }


  /* -------------------------------------------------------
     8. TIMELINE VALIDATION
  ------------------------------------------------------- */

  const beats =
    blueprint.story_blueprint?.beats || [];

  if (!Array.isArray(beats) || beats.length === 0) {

    errors.push(
      "Story blueprint contains no beats."
    );

  } else {

    const totalBeatDuration =
      beats.reduce(
        (sum, beat) =>
          sum +
          Number(
            beat.duration_seconds || 0
          ),
        0
      );

    if (
      totalBeatDuration !== duration
    ) {

      errors.push(
        `Beat duration mismatch. Expected ${duration}s, got ${totalBeatDuration}s.`
      );
    }


    /*
      Validate sequential time ranges where possible.
    */

    let previousEnd = 0;

    for (const beat of beats) {

      const range =
        parseTimeRange(
          beat.time_range
        );

      if (!range) {

        warnings.push(
          `Could not parse time range for beat ${beat.beat_number}.`
        );

        continue;
      }

      if (
        Math.abs(range.start - previousEnd) > 0.01
      ) {

        errors.push(
          `Timeline gap/overlap around beat ${beat.beat_number}.`
        );
      }

      previousEnd = range.end;
    }

    if (
      Math.abs(previousEnd - duration) > 0.01
    ) {

      errors.push(
        "Timeline does not end exactly at the requested duration."
      );
    }
  }


  /* -------------------------------------------------------
     9. REQUIRED CONTINUITY SYSTEM
  ------------------------------------------------------- */

  const continuity =
    blueprint.continuity_system || {};

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

  for (const field of continuityFields) {

    if (
      !Array.isArray(continuity[field]) ||
      continuity[field].length === 0
    ) {

      errors.push(
        `Continuity system missing: ${field}`
      );
    }
  }


  /* -------------------------------------------------------
     10. REALISM REQUIREMENTS
  ------------------------------------------------------- */

  const characters =
    blueprint.character_bible || [];

  if (Array.isArray(characters)) {

    for (const character of characters) {

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
          !character[field] ||
          String(character[field]).trim() === ""
        ) {

          errors.push(
            `Character "${character.name}" missing realism field: ${field}`
          );
        }
      }
    }
  }


  /* -------------------------------------------------------
     FINAL RESULT
  ------------------------------------------------------- */

  return {

    passed:
      errors.length === 0,

    errors,

    warnings
  };
}


/* =========================================================
   IMPORTANT TERM EXTRACTION
========================================================= */

function extractImportantTerms(text) {

  const stopWords = new Set([

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

  return text
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(
      word =>
        word.length >= 5 &&
        !stopWords.has(word)
    )
    .slice(0, 12);
}


/* =========================================================
   TIME RANGE PARSER
========================================================= */

function parseTimeRange(value) {

  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .trim()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

  // Format: 00:00 - 00:04
  let match = cleaned.match(
    /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/
  );

  if (match) {

    const start =
      Number(match[1]) * 60 +
      Number(match[2]);

    const end =
      Number(match[3]) * 60 +
      Number(match[4]);

    return {
      start,
      end
    };
  }

  // Format: 0:00 - 0:04
  match = cleaned.match(
    /(\d+):(\d+)\s*-\s*(\d+):(\d+)/
  );

  if (match) {

    const start =
      Number(match[1]) * 60 +
      Number(match[2]);

    const end =
      Number(match[3]) * 60 +
      Number(match[4]);

    return {
      start,
      end
    };
  }

  // Format: 0 - 4
  match = cleaned.match(
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/
  );

  if (match) {

    return {
      start: Number(match[1]),
      end: Number(match[2])
    };
  }

  return null;
}

/* =========================================================
   AUTO CORRECTION
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

A Director Blueprint was generated but failed
programmatic validation.

Your job is to correct ONLY the detected problems.

Do not redesign the project unnecessarily.

Do not remove cinematic detail unless required.

Do not replace locked facts.

Do not invent new evidence.

=========================================================
RESEARCH
=========================================================

${JSON.stringify(research, null, 2)}

=========================================================
FACT LOCK
=========================================================

${JSON.stringify(factLock, null, 2)}

=========================================================
CURRENT BLUEPRINT
=========================================================

${JSON.stringify(blueprint, null, 2)}

=========================================================
VALIDATION ERRORS
=========================================================

${JSON.stringify(validation.errors, null, 2)}

=========================================================
VALIDATION WARNINGS
=========================================================

${JSON.stringify(validation.warnings, null, 2)}

=========================================================
CORRECTION RULES
=========================================================

1. Preserve all valid information.

2. Correct factual entity mismatches.

3. Restore locked evidence references.

4. Never create fake evidence IDs.

5. Correct timeline gaps and overlaps.

6. Make beat durations total exactly
   ${duration} seconds.

7. Keep aspect ratio exactly:
   ${aspectRatio}

8. Correct camera/capture contradictions.

9. Separate physical capture from visual emulation.

10. Correct unsupported details by marking them
    as inferred, creative reconstruction or unknown.

11. Preserve character continuity.

12. Preserve world continuity.

13. Preserve physical realism.

14. Do not claim validation passed.

Return ONLY the corrected JSON blueprint.
`;


  const response =
    await ai.interactions.create({

      model:
        "gemini-3.5-flash-lite",

      input:
        correctionInstruction,

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: directorSchema
      }
    });


  if (!response.output_text) {

    throw new Error(
      "Correction Engine returned empty output."
    );
  }


  try {

    return JSON.parse(
      response.output_text
    );

  } catch (error) {

    throw new Error(
      "Correction Engine returned invalid JSON."
    );
  }
}


/* =========================================================
   PUBLIC DIRECTOR FUNCTION
========================================================= */

export async function createDirectorBlueprint(
  researchData,
  duration = 20,
  aspectRatio = "9:16"
) {

  const research =
    normalizeResearch(
      researchData
    );


  const factLock =
    buildFactLock(
      research
    );


  /*
    First Director generation
  */

  let blueprint =
    await runDirector(
      research,
      factLock,
      duration,
      aspectRatio
    );


  /*
    First programmatic validation
  */

  let validation =
    validateBlueprint(
      blueprint,
      research,
      factLock,
      duration,
      aspectRatio
    );


  /*
    Auto-correction pass
  */

  if (!validation.passed) {

    blueprint =
      await autoCorrectBlueprint(
        blueprint,
        validation,
        research,
        factLock,
        duration,
        aspectRatio
      );


    /*
      Validate corrected blueprint again.
    */

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
    Hard failure if blueprint still invalid.
  */

  if (!validation.passed) {

    const errorMessage =
      validation.errors.join(
        " | "
      );

    throw new Error(
      `Director Blueprint failed validation after auto-correction: ${errorMessage}`
    );
  }


  /*
    Attach machine-generated validation metadata.

    This is NOT generated by the AI.
    It comes from the actual validator.
  */

  blueprint._longshot_validation = {

    validator_version:
      "V4",

    passed:
      true,

    auto_corrected:
      true,

    errors_after_validation:
      [],

    warnings:
      validation.warnings,

    validated_duration:
      duration,

    validated_aspect_ratio:
      aspectRatio
  };


  return blueprint;
}
