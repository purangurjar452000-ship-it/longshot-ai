import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY
});

/* =========================================================
   LONGSHOT AI — DIRECTOR ENGINE V5.0
   Research → Fact Lock → Identity Lock → Director
   → Semantic Validation → Causal Validation
   → Auto Correction → Final Validation
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
            typeof item === "string"
              ? item
              : JSON.stringify(item),

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
            typeof item === "string"
              ? item
              : JSON.stringify(item),

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
            typeof item === "string"
              ? item
              : JSON.stringify(item)
        })
      )
  };
}


/* =========================================================
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
              status: {
                type: "string",
                enum: [
                  "VERIFIED_LOCKED",
                  "INFERRED",
                  "CREATIVE_RECONSTRUCTION",
                  "UNKNOWN"
                ]
              }
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


    /* =====================================================
       CHARACTER BIBLE
    ===================================================== */

    character_bible: {
      type: "array",

      items: {
        type: "object",

        properties: {

          name: {
            type: "string"
          },

          identity_status: {
            type: "string",
            enum: [
              "VERIFIED",
              "MYTHOLOGICAL_IDENTITY_VERIFIED",
              "HISTORICAL_IDENTITY_VERIFIED",
              "FICTIONAL_IDENTITY",
              "INFERRED",
              "UNKNOWN"
            ]
          },

          visual_design_status: {
            type: "string",
            enum: [
              "VERIFIED",
              "INFERRED",
              "CREATIVE_RECONSTRUCTION",
              "UNKNOWN"
            ]
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
                claim: {
                  type: "string"
                },

                classification: {
                  type: "string",
                  enum: [
                    "VERIFIED",
                    "INFERRED",
                    "CREATIVE_RECONSTRUCTION",
                    "UNKNOWN"
                  ]
                },

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

          apparent_age: {
            type: "string"
          },


          /* ===============================================
             IMMUTABLE IDENTITY LOCK
          =============================================== */

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
            items: {
              type: "string"
            }
          },

          forbidden_changes: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },

        required: [
          "name",
          "identity_status",
          "visual_design_status",
          "evidence_ids",
          "visual_claims",
          "apparent_age",
          "character_identity_lock",
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


    /* =====================================================
       WORLD BIBLE
    ===================================================== */

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
                type: "string",
                enum: [
                  "VERIFIED",
                  "VERIFIED_LOCKED",
                  "INFERRED",
                  "CREATIVE_RECONSTRUCTION",
                  "UNKNOWN"
                ]
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

                    claim: {
                      type: "string"
                    },

                    classification: {
                      type: "string",
                      enum: [
                        "VERIFIED",
                        "INFERRED",
                        "CREATIVE_RECONSTRUCTION",
                        "UNKNOWN"
                      ]
                    },

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
                items: {
                  type: "string"
                }
              },

              lighting_conditions: {
                type: "string"
              },

              continuity_rules: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            },

            required: [
              "name",
              "evidence_status",
              "evidence_ids",
              "visual_claims",
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
          items: {
            type: "string"
          }
        },

        global_visual_rules: {
          type: "array",
          items: {
            type: "string"
          }
        }
      },

      required: [
        "locations",
        "global_physical_rules",
        "global_visual_rules"
      ]
    },


    /* =====================================================
       VISUAL LANGUAGE
    ===================================================== */

    visual_language: {

      type: "object",

      properties: {

        realism_target: { type: "string" },
        capture_system: { type: "string" },
        visual_emulation: { type: "string" },
        lens_policy: { type: "string" },
        focal_length_strategy: { type: "string" },
        framing: { type: "string" },
        camera_height: { type: "string" },
        camera_movement: { type: "string" },
        focus_behavior: { type: "string" },
        depth_of_field: { type: "string" },
        shutter_motion_behavior: { type: "string" },
        lighting: { type: "string" },
        practical_lighting: { type: "string" },
        shadow_behavior: { type: "string" },
        color_science: { type: "string" },
        contrast_strategy: { type: "string" },
        texture_detail: { type: "string" },
        atmospheric_depth: { type: "string" },
        motion_rendering: { type: "string" },
        vfx_philosophy: { type: "string" }
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
    },


    /* =====================================================
       STORY BLUEPRINT
    ===================================================== */

    story_blueprint: {

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

              characters: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              narration: {
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
              "characters",
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
       CONTINUITY
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


    directing_rules: {
      type: "array",
      items: {
        type: "string"
      }
    },


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
   4. MASTER DIRECTOR INSTRUCTIONS
========================================================= */

const MASTER_DIRECTOR_INSTRUCTIONS = `

You are the MASTER DIRECTOR of LongShot AI.

You transform researched material into a production-ready
cinematic blueprint.

You are responsible for:

- factual integrity
- character identity
- age continuity
- face continuity
- body continuity
- costume continuity
- geography
- temporal continuity
- causal continuity
- physical realism
- cinematic direction

=========================================================
ABSOLUTE RULE — CANONICAL CHARACTER IDENTITY
=========================================================

A named canonical character is IMMUTABLE.

Never replace a named character with:

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
unnamed commander
random historical character
random fantasy character
injured soldier
injured warrior
Alexander's commander
Alexander-era soldier

ROLE ≠ IDENTITY.

If the research says Hanuman, the visible character
must remain Hanuman.

If the research says Lakshmana, the visible character
must remain Lakshmana.

Never silently convert a named character into an archetype.

=========================================================
CHARACTER IDENTITY FINGERPRINT
=========================================================

Every character requires:

canonical name
identity type
apparent age
face identity
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
forbidden substitutions

These fields form one immutable identity fingerprint.

The same fingerprint must be inherited by every beat.

=========================================================
AGE RULE
=========================================================

Every character must have apparent_age.

Never invent a precise age when research does not establish it.

Use qualified descriptions such as:

child
adolescent
young adult
adult
mature adult
elderly
ageless/supernatural
traditional mature-adult depiction

Age cannot change between beats unless the story explicitly
contains aging.

=========================================================
FACT LOCK
=========================================================

VERIFIED_LOCKED facts are immutable.

Never:

rename canonical people
rename canonical locations
replace verified objects
change relationships
change researched events
change researched causal order
invent contradictory facts

Use only supplied evidence IDs.

=========================================================
LOCATION RULE — CRITICAL
=========================================================

A beat's location means:

WHERE THE VISIBLE CHARACTERS ARE PHYSICALLY ACTING.

Do NOT select a location merely because it appeared earlier.

If Hanuman is flying from Lanka toward the Himalayas,
he cannot be visually placed inside a Lanka camp.

Use a travel corridor / sky / ocean / mountain-pass type
location when appropriate.

If the character has arrived at the destination, only then
use the destination location.

=========================================================
GEOGRAPHY RULE
=========================================================

Never teleport.

Every location change must be represented by:

- travel
- departure
- flight
- crossing
- arrival
- explicit cut/transition
- documented supernatural travel

The geographic relationship between consecutive beats
must be understandable.

=========================================================
TIME RULE — CRITICAL
=========================================================

Keep temporal state coherent.

IMPORTANT:

"before sunrise" is a DEADLINE, not the same thing as
"sunrise".

"approaching dawn" is a transition.

Do not turn a deadline into actual sunrise lighting.

Do not show full golden sunrise while the location remains
deep midnight unless the beat explicitly depicts the
transition.

Maintain:

moon
sky brightness
shadow direction
artificial light
firelight
celestial state
sunrise/sunset state

=========================================================
CAUSAL RULE — CRITICAL
=========================================================

Every major outcome must have its necessary preceding action.

Examples:

search for herb
→ identify/select herb
→ obtain/lift/collect herb
→ travel with herb

travel
→ approach destination
→ arrive

attack
→ impact/result

administer medicine
→ physical contact
→ treatment
→ recovery

Never jump directly from:

"searching for something"

to:

"returning with the completed object"

without the acquisition event being represented somewhere.

=========================================================
ACTION DENSITY
=========================================================

Every short beat needs one dominant visual action.

Do not compress:

arrival + lifting + healing + revival + departure

into one 5–6 second beat.

If several major actions are required, distribute them across
adjacent beats while preserving causal order.

=========================================================
PHYSICAL CHARACTER PRESENCE
=========================================================

Every visible acting character must be listed in characters[].

Narration does not make a character physically present.

Do not list off-screen characters as visible actors.

=========================================================
REALISM
=========================================================

Characters must look physically real.

Prevent:

plastic skin
wax faces
rubber limbs
extra fingers
missing fingers
deformed hands
deformed feet
floating objects
weightless movement
impossible joints
inconsistent anatomy
unstable faces

Maintain breathing, blinking, micro-expression, weight,
momentum, gravity, cloth physics and environmental interaction.

=========================================================
COSTUME CONTINUITY
=========================================================

Maintain costume, material, color, accessories and signature
items across beats unless a story event explicitly changes them.

=========================================================
WORLD CONTINUITY
=========================================================

Each location must have coherent:

terrain
vegetation
architecture
props
weather
atmosphere
time
celestial conditions
lighting
physics

Do not leak mountain terrain into a camp.

Do not leak camp props into open sky.

Do not leak ocean scenery into a mountain location.

=========================================================
CINEMATOGRAPHY
=========================================================

Use purposeful:

framing
camera height
camera movement
lens
focal length
focus
depth of field
motion rendering
lighting
color science

Separate digital capture from film emulation.

=========================================================
AUTHENTICITY
=========================================================

Separate:

VERIFIED
INFERRED
CREATIVE_RECONSTRUCTION
UNKNOWN

Never present reconstruction as verified fact.

=========================================================
FINAL INTERNAL CHECK
=========================================================

Before output verify:

1. fact integrity
2. evidence IDs
3. character identity
4. character age
5. face continuity
6. body continuity
7. costume continuity
8. accessory continuity
9. location continuity
10. geography
11. time
12. lighting
13. physics
14. causal order
15. action density
16. physical character presence
17. environment compatibility
18. exact duration
19. camera consistency
20. realism
21. no generic character substitution

If any conflict exists, correct it BEFORE output.

Return only valid JSON.
`;


/* =========================================================
   5. RUN DIRECTOR
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
REQUESTED PRODUCTION
=========================================================

Duration:
${duration} seconds

Aspect Ratio:
${aspectRatio}

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
    ...(factLock.locked_facts || [])
      .map(item => item.evidence_id),

    ...(factLock.creative_reconstructions || [])
      .map(item => item.evidence_id),

    ...(factLock.visual_notes || [])
      .map(item => item.evidence_id)
  ],
  null,
  2
)}

=========================================================
FINAL OUTPUT REQUIREMENTS
=========================================================

For every character:

- exact canonical name
- apparent age
- complete identity lock
- stable face
- stable body
- stable costume
- stable accessories
- stable movement signature
- forbidden substitutions

For every beat:

- explicit location
- explicit characters array
- physical character presence
- exact action
- causal relationship
- evidence IDs
- visual priority
- transition

IMPORTANT:

A flight beat must not use a fixed camp as its physical
location.

A mountain-search beat must not immediately become
"returning with mountain" without an acquisition/lifting/
uprooting event somewhere in the causal sequence.

"Before sunrise" must not be interpreted as actual sunrise.

Do not overload short beats.

Return ONLY JSON matching the supplied schema.
`;

  const response = await ai.interactions.create({

    model:
      "gemini-3.5-flash-lite",

    input:
      directorInput,

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
   6. UTILITY FUNCTIONS
========================================================= */

function collectAllStrings(
  value,
  result = []
) {

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

      for (
        const [key, child]
        of Object.entries(item)
      ) {

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


function extractSemanticEvidenceTerms(value) {

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
    "have",
    "has",
    "had",
    "are",
    "is",
    "been",
    "being",
    "for",
    "onto",
    "its",
    "his",
    "her",
    "who",
    "what",
    "where",
    "there",
    "here",
    "character",
    "location",
    "visual",
    "appearance",
    "design",
    "detail",
    "details",
    "claim",
    "claims",
    "verified",
    "depicted",
    "shown",
    "looks",
    "look",
    "such",
    "also",
    "very",
    "more",
    "most"
  ]);

  return [
    ...new Set(

      String(value || "")
        .toLowerCase()
        .replace(
          /[^a-z0-9\s-]/g,
          " "
        )
        .replace(
          /-/g,
          " "
        )
        .split(/\s+/)

        .map(token => {

          if (
            token === "himalayas" ||
            token === "himalayan"
          ) {
            return "himalay";
          }

          if (
            token.endsWith("ies") &&
            token.length > 5
          ) {
            return (
              token.slice(0, -3) +
              "y"
            );
          }

          if (
            token.endsWith("s") &&
            token.length > 4
          ) {
            return token.slice(0, -1);
          }

          return token;
        })

        .filter(
          token =>
            token.length >= 3 &&
            !stopWords.has(token)
        )
    )
  ];
}


/* =========================================================
   7. SEMANTIC HELPERS
========================================================= */

function normalizeSemanticText(value) {

  return String(value || "")
    .toLowerCase()
    .replace(
      /[–—−]/g,
      "-"
    )
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


function buildBeatText(beat) {

  return normalizeSemanticText(

    [
      beat?.story_action,
      beat?.character_action,
      beat?.emotional_purpose,
      beat?.visual_priority,
      beat?.transition_to_next
    ]
      .filter(Boolean)
      .join(" ")

  );
}


/*
  IMPORTANT:
  Word/phrase matching instead of naive substring matching.
  This prevents "to" from matching thousands of words.
*/

function containsTerm(
  text,
  term
) {

  const normalizedText =
    normalizeSemanticText(text);

  const normalizedTerm =
    normalizeSemanticText(term);

  if (!normalizedText || !normalizedTerm) {
    return false;
  }

  if (normalizedTerm.includes(" ")) {
    return normalizedText.includes(
      normalizedTerm
    );
  }

  const escaped =
    normalizedTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  return new RegExp(
    `(^|\\s)${escaped}(?=\\s|$)`
  ).test(
    normalizedText
  );
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

  return terms.reduce(
    (
      count,
      term
    ) =>
      count +
      (
        containsTerm(
          text,
          term
        )
          ? 1
          : 0
      ),
    0
  );
}


/* =========================================================
   8. CHARACTER IDENTITY LOCK VALIDATOR
========================================================= */

function validateCharacterIdentityLocks(
  blueprint
) {

  const errors = [];

  const characters =
    Array.isArray(
      blueprint?.character_bible
    )
      ? blueprint.character_bible
      : [];


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


  const forbiddenGenericIdentityTerms = [

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
    "unnamed commander",

    "random warrior",
    "random soldier",
    "random commander",

    "unknown warrior",
    "unknown soldier",
    "unknown commander",

    "ancient warrior",
    "injured warrior",
    "injured soldier",
    "injured commander",

    "alexander commander",
    "alexander's commander",
    "alexander era soldier",
    "alexander-era soldier"
  ];


  for (const character of characters) {

    const name =
      String(
        character?.name || ""
      ).trim();


    if (!name) {

      errors.push(
        "Character identity validation failed: missing canonical name."
      );

      continue;
    }


    const apparentAge =
      String(
        character?.apparent_age || ""
      ).trim();


    if (!apparentAge) {

      errors.push(
        `Character "${name}" is missing apparent_age.`
      );
    }


    const lock =
      character?.character_identity_lock;


    if (
      !lock ||
      typeof lock !== "object"
    ) {

      errors.push(
        `Character "${name}" is missing character_identity_lock.`
      );

      continue;
    }


    const canonicalName =
      String(
        lock.canonical_name || ""
      ).trim();


    if (
      canonicalName !== name
    ) {

      errors.push(
        `Character "${name}" has identity lock canonical_name "${canonicalName}" which does not exactly match the character name.`
      );
    }


    const lockAge =
      String(
        lock.apparent_age || ""
      ).trim();


    if (!lockAge) {

      errors.push(
        `Character "${name}" identity lock is missing apparent_age.`
      );
    }


    if (
      apparentAge &&
      lockAge &&
      normalizeSemanticText(apparentAge) !==
      normalizeSemanticText(lockAge)
    ) {

      errors.push(
        `Character "${name}" has mismatched apparent age between character and identity lock.`
      );
    }


    for (const field of requiredLockFields) {

      const value =
        lock[field];


      if (
        !value ||
        (
          typeof value === "string" &&
          value.trim() === ""
        ) ||
        (
          Array.isArray(value) &&
          value.length === 0
        )
      ) {

        errors.push(
          `Character "${name}" identity lock missing required field: ${field}.`
        );
      }
    }


    if (
      !Array.isArray(
        lock.forbidden_substitutions
      ) ||
      lock.forbidden_substitutions.length === 0
    ) {

      errors.push(
        `Character "${name}" identity lock must contain forbidden_substitutions.`
      );
    }


    /*
      CRITICAL FIX:

      forbidden_substitutions is SUPPOSED to contain
      generic archetype phrases.

      Therefore we MUST NOT search that array for
      forbidden terms.

      We inspect actual identity fields only.
    */

    const actualIdentityText =
      normalizeSemanticText(

        [
          lock.identity_type,
          lock.face_identity,
          lock.facial_structure,
          lock.eyes,
          lock.hair_or_fur,
          lock.skin_or_body_texture,
          lock.body_type,
          lock.height_or_scale,
          lock.body_proportions,
          lock.musculature,
          lock.anatomy,
          lock.costume,
          lock.costume_colors,
          lock.costume_material,
          lock.costume_physics,
          lock.accessories,
          lock.signature_features,
          lock.movement_signature
        ]
          .filter(Boolean)
          .join(" ")

      );


    for (
      const forbiddenTerm
      of forbiddenGenericIdentityTerms
    ) {

      if (
        containsTerm(
          actualIdentityText,
          forbiddenTerm
        )
      ) {

        errors.push(
          `Character "${name}" identity fields contain forbidden generic substitution language: "${forbiddenTerm}".`
        );
      }
    }


    if (
      normalizeSemanticText(
        lock.canonical_name
      ) ===
      normalizeSemanticText(
        "generic warrior"
      )
    ) {

      errors.push(
        `Character "${name}" cannot use a generic archetype as canonical identity.`
      );
    }
  }

  return errors;
}


/* =========================================================
   9. SEMANTIC BEAT VALIDATOR
========================================================= */

function validateBeatSemanticContinuity(
  blueprint
) {

  const errors = [];
  const warnings = [];

  const beats =
    blueprint?.story_blueprint?.beats || [];

  const locations =
    blueprint?.world_bible?.locations || [];


  const locationMap =
    new Map(

      locations
        .map(
          location => [
            normalizeSemanticText(
              location?.name
            ),
            location
          ]
        )
        .filter(
          ([name]) => name
        )
    );


  const characterNames =
    new Set(

      (
        blueprint?.character_bible ||
        []
      )
        .map(
          character =>
            String(
              character?.name || ""
            ).trim()
        )
        .filter(Boolean)
    );


  const travelTerms = [

    "fly",
    "flying",
    "flew",
    "flight",
    "travel",
    "travelling",
    "traveling",
    "journey",
    "journeying",
    "toward",
    "towards",
    "return",
    "returns",
    "returning",
    "arrive",
    "arrives",
    "arriving",
    "depart",
    "departs",
    "departing",
    "leave",
    "leaves",
    "leaving",
    "cross",
    "crossing",
    "approach",
    "approaches",
    "approaching",
    "move",
    "moving",
    "rush",
    "rushing",
    "run",
    "running",
    "walk",
    "walking",
    "climb",
    "climbing",
    "descending",
    "ascend",
    "ascending",
    "descend"
  ];


  const fixedLocationTerms = [

    "camp",
    "encampment",
    "room",
    "chamber",
    "hut",
    "house",
    "palace",
    "temple",
    "court",
    "hall",
    "hospital",
    "shelter",
    "village",
    "city",
    "battlefield",
    "fort",
    "castle",
    "cave",
    "garden",
    "courtyard"
  ];


  const destinationTerms = [

    "toward",
    "towards",
    "arrive",
    "arrival",
    "reach",
    "reaches",
    "reaching",
    "return",
    "returns",
    "returning"
  ];


  /*
    IMPORTANT:
    "before sunrise" is NOT sunrise.
    "approaching dawn" is a transition, not full dawn.
  */

  const temporalStateGroups = {

    night: [
      "night",
      "midnight",
      "moonlit",
      "moonlight",
      "dark sky",
      "deep night"
    ],

    predawn: [
      "pre-dawn",
      "predawn",
      "before dawn",
      "before sunrise"
    ],

    dawn: [
      "dawn",
      "sunrise",
      "sunrise light",
      "first light",
      "golden first light",
      "golden ray",
      "daybreak"
    ],

    morning: [
      "morning",
      "morning light",
      "daylight"
    ],

    evening: [
      "evening",
      "sunset",
      "dusk",
      "twilight"
    ]
  };


  const temporalTransitionTerms = [

    "transition from night",
    "night giving way",
    "dawn begins",
    "dawn breaks",
    "sunrise begins",
    "sky brightens",
    "night fades",
    "night recedes",
    "first light appears",
    "approaching dawn",
    "approaching sunrise",
    "toward dawn",
    "towards dawn",
    "daybreak begins",
    "light changes",
    "lighting changes",
    "sky gradually brightens"
  ];


  const majorActionGroups = [

    [
      "fly",
      "flying",
      "flew",
      "flight",
      "travel",
      "travelling",
      "traveling",
      "journey",
      "journeying",
      "cross",
      "crossing"
    ],

    [
      "arrive",
      "arrives",
      "arriving",
      "reach",
      "reaches",
      "reaching",
      "land",
      "lands",
      "landing"
    ],

    [
      "search",
      "searches",
      "searching",
      "look",
      "looks",
      "looking",
      "seek",
      "seeks",
      "seeking"
    ],

    [
      "pick",
      "picks",
      "pluck",
      "plucks",
      "harvest",
      "harvesting",
      "collect",
      "collects",
      "grab",
      "grabs",
      "lift",
      "lifts",
      "raise",
      "raises",
      "uproot",
      "uproots",
      "tear",
      "tears"
    ],

    [
      "carry",
      "carries",
      "carrying",
      "hold",
      "holds",
      "holding",
      "bear",
      "bears",
      "bearing"
    ],

    [
      "fight",
      "fights",
      "fighting",
      "attack",
      "attacks",
      "attacking",
      "strike",
      "strikes",
      "striking"
    ],

    [
      "heal",
      "heals",
      "healing",
      "revive",
      "revives",
      "reviving",
      "administer",
      "administers",
      "administering"
    ],

    [
      "build",
      "builds",
      "building",
      "destroy",
      "destroys",
      "destroying"
    ],

    [
      "climb",
      "climbs",
      "climbing",
      "descend",
      "descends",
      "descending",
      "ascend",
      "ascends",
      "ascending"
    ]
  ];


  function getLocation(beat) {

    const key =
      normalizeSemanticText(
        beat?.location
      );

    return (
      locationMap.get(key) ||
      null
    );
  }


  function getLocationEnvironment(location) {

    if (!location) {
      return "";
    }

    return normalizeSemanticText(

      [
        location.name,
        location.environment,
        location.terrain,
        location.vegetation,
        location.architecture,
        location.props,
        location.atmosphere,
        location.weather,
        location.time_of_day,
        location.celestial_conditions,
        location.lighting_conditions
      ]
        .filter(Boolean)
        .join(" ")
    );
  }


  function getTemporalStates(text) {

    const states = [];

    for (
      const [state, terms]
      of Object.entries(
        temporalStateGroups
      )
    ) {

      if (
        containsAny(
          text,
          terms
        )
      ) {

        states.push(state);
      }
    }

    return states;
  }


  function hasExplicitTemporalTransition(text) {

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

    const beatText =
      buildBeatText(
        beat
      );

    const locationText =
      normalizeSemanticText(

        [
          location.time_of_day || "",
          location.lighting_conditions || "",
          location.celestial_conditions || ""
        ].join(" ")
      );


    /*
      Remove deadline language before determining
      actual temporal state.
    */

    const cleanedBeatText =
      beatText
        .replace(
          /before sunrise/g,
          ""
        )
        .replace(
          /before dawn/g,
          ""
        )
        .replace(
          /approaching dawn/g,
          ""
        )
        .replace(
          /approaching sunrise/g,
          ""
        );


    const beatStates =
      getTemporalStates(
        cleanedBeatText
      );

    const locationStates =
      getTemporalStates(
        locationText
      );


    if (
      beatStates.length === 0 ||
      locationStates.length === 0
    ) {
      return false;
    }


    const incompatiblePairs = [

      ["night", "dawn"],
      ["night", "morning"],
      ["night", "evening"],

      ["predawn", "morning"],
      ["predawn", "evening"],

      ["dawn", "night"],
      ["morning", "night"],
      ["evening", "morning"]
    ];


    return incompatiblePairs.some(
      ([a, b]) =>

        (
          beatStates.includes(a) &&
          locationStates.includes(b)
        )

        ||

        (
          beatStates.includes(b) &&
          locationStates.includes(a)
        )
    );
  }


  for (
    let index = 0;
    index < beats.length;
    index++
  ) {

    const beat =
      beats[index];

    const beatNumber =
      beat?.beat_number ||
      index + 1;

    const beatText =
      buildBeatText(
        beat
      );

    const location =
      getLocation(
        beat
      );

    const locationText =
      getLocationEnvironment(
        location
      );


    /* =====================================================
       A. LOCATION EXISTENCE
    ===================================================== */

    if (
      beat?.location &&
      !location
    ) {

      errors.push(
        `Beat ${beatNumber} references location "${beat.location}" but no matching world_bible location exists.`
      );
    }


    /* =====================================================
       B. TRAVEL INSIDE FIXED LOCATION
    ===================================================== */

    const travelScore =
      countMatches(
        beatText,
        travelTerms
      );

    const fixedLocationScore =
      countMatches(
        locationText,
        fixedLocationTerms
      );

    const destinationScore =
      countMatches(
        beatText,
        destinationTerms
      );


    if (
      travelScore >= 2 &&
      fixedLocationScore >= 1 &&
      destinationScore >= 1
    ) {

      const previousBeat =
        index > 0
          ? beats[index - 1]
          : null;

      const previousLocation =
        normalizeSemanticText(
          previousBeat?.location
        );

      const currentLocation =
        normalizeSemanticText(
          beat?.location
        );


      if (
        previousLocation &&
        currentLocation &&
        previousLocation ===
        currentLocation
      ) {

        errors.push(
          `Beat ${beatNumber} contains strong travel/destination action while remaining inside fixed location "${beat.location}".`
        );
      }
    }


    /* =====================================================
       C. PHYSICAL ACTION / LOCATION COMPATIBILITY
    ===================================================== */

    const airborneAction =
      containsAny(
        beatText,
        [
          "flying over mountains",
          "flying over mountain",
          "flying toward the mountains",
          "flying toward the mountain",
          "toward the himalayas",
          "towards the himalayas",
          "across the mountains",
          "over the mountains",
          "through the mountains",
          "crossing the ocean",
          "over the ocean",
          "across the ocean",
          "flying across",
          "in flight",
          "airborne"
        ]
      );


    const fixedEnvironment =
      containsAny(
        locationText,
        fixedLocationTerms
      );


    if (
      airborneAction &&
      fixedEnvironment
    ) {

      errors.push(
        `Beat ${beatNumber} contains airborne/travel action but selected location "${beat.location}" is a fixed environment. Use a physically compatible travel/transition location.`
      );
    }


    /* =====================================================
       D. NAMED WORLD LOCATION MISMATCH
    ===================================================== */

    for (
      const worldLocation
      of locations
    ) {

      const worldName =
        String(
          worldLocation?.name || ""
        ).trim();


      if (!worldName) {
        continue;
      }


      const normalizedWorldName =
        normalizeSemanticText(
          worldName
        );

      const normalizedBeatLocation =
        normalizeSemanticText(
          beat?.location
        );


      if (
        normalizedWorldName &&
        normalizedWorldName.length >= 5 &&
        normalizedBeatLocation !==
        normalizedWorldName &&
        containsTerm(
          beatText,
          normalizedWorldName
        )
      ) {

        const explicitTravel =
          containsAny(
            beatText,
            travelTerms
          ) ||
          containsAny(
            beat?.transition_to_next,
            travelTerms
          );


        if (!explicitTravel) {

          errors.push(
            `Beat ${beatNumber} mentions world location "${worldName}" while its selected physical location is "${beat.location}" without explicit travel.`
          );
        }
      }
    }


    /* =====================================================
       E. TEMPORAL / LIGHTING
    ===================================================== */

    const temporalConflict =
      hasTemporalConflict(
        beat,
        location
      );


    if (
      temporalConflict &&
      !hasExplicitTemporalTransition(
        beatText
      )
    ) {

      errors.push(
        `Beat ${beatNumber} has a temporal/lighting conflict with location "${beat?.location}".`
      );
    }


    /* =====================================================
       F. SUNRISE DEADLINE VS ACTUAL SUNRISE
    ===================================================== */

    const deadlineLanguage =
      containsAny(
        beatText,
        [
          "before sunrise",
          "before dawn",
          "before first light"
        ]
      );


    const actualSunriseLanguage =
      containsAny(
        beatText,
        [
          "sunrise",
          "first light",
          "golden first light",
          "golden ray of sunrise",
          "dawn light",
          "daybreak"
        ]
      );


    const explicitTransition =
      hasExplicitTemporalTransition(
        beatText
      );


    const locationNight =
      containsAny(
        locationText,
        [
          "midnight",
          "deep night",
          "night",
          "moonlit",
          "moonlight"
        ]
      );


    /*
      Deadline itself is allowed.
      But actual sunrise lighting in a night location
      without transition is NOT allowed.
    */

    if (
      actualSunriseLanguage &&
      !deadlineLanguage &&
      locationNight &&
      !explicitTransition
    ) {

      errors.push(
        `Beat ${beatNumber} describes actual sunrise/daybreak while the selected location remains in night/moonlit conditions without a visible transition.`
      );
    }


    /* =====================================================
       G. ACTION DENSITY
    ===================================================== */

    const actionGroupHits =
      majorActionGroups.filter(
        group =>
          containsAny(
            beatText,
            group
          )
      ).length;


    const durationSeconds =
      Number(
        beat?.duration_seconds || 0
      );


    /*
      Short beat:
      4+ major action groups = hard failure.
    */

    if (
      durationSeconds > 0 &&
      durationSeconds <= 6 &&
      actionGroupHits >= 4
    ) {

      errors.push(
        `Beat ${beatNumber} is overloaded: ${actionGroupHits} independent major action groups are compressed into ${durationSeconds}s.`
      );
    }


    /*
      5–6 sec beat with 3 major independent groups
      is suspicious and gets a warning.
    */

    if (
      durationSeconds >= 5 &&
      durationSeconds <= 6 &&
      actionGroupHits === 3
    ) {

      warnings.push(
        `Beat ${beatNumber} contains 3 major action groups in ${durationSeconds}s. Verify that one action is clearly dominant and the others are only supporting micro-actions.`
      );
    }


    if (
      durationSeconds > 0 &&
      durationSeconds <= 4 &&
      actionGroupHits >= 3
    ) {

      errors.push(
        `Beat ${beatNumber} is too action-dense for ${durationSeconds}s.`
      );
    }


    /* =====================================================
       H. CHARACTER PRESENCE
    ===================================================== */

    const listedCharacters =
      Array.isArray(
        beat?.characters
      )
        ? beat.characters
        : [];


    for (
      const character
      of listedCharacters
    ) {

      if (
        !characterNames.has(
          character
        )
      ) {

        errors.push(
          `Beat ${beatNumber} uses character "${character}" without a character_bible entry.`
        );
      }
    }


    const beatActionMentions =
      [
        ...characterNames
      ].filter(
        name =>
          containsTerm(
            beatText,
            name
          )
      );


    for (
      const mentionedCharacter
      of beatActionMentions
    ) {

      const isListed =
        listedCharacters.includes(
          mentionedCharacter
        );


      const actionOnlyText =
        normalizeSemanticText(

          `${beat?.story_action || ""} ${beat?.character_action || ""}`

        );


      const narrationText =
        normalizeSemanticText(
          beat?.narration
        );


      const onlyNarration =
        containsTerm(
          narrationText,
          mentionedCharacter
        ) &&
        !containsTerm(
          actionOnlyText,
          mentionedCharacter
        );


      if (
        !isListed &&
        !onlyNarration
      ) {

        errors.push(
          `Beat ${beatNumber} physically mentions/uses character "${mentionedCharacter}" without listing that character in characters[].`
        );
      }
    }


    /* =====================================================
       I. LOCATION CONTINUITY
    ===================================================== */

    if (index > 0) {

      const previousBeat =
        beats[index - 1];

      const previousLocation =
        normalizeSemanticText(
          previousBeat?.location
        );

      const currentLocation =
        normalizeSemanticText(
          beat?.location
        );


      if (
        previousLocation &&
        currentLocation &&
        previousLocation !==
        currentLocation
      ) {

        const transitionText =
          normalizeSemanticText(

            [
              previousBeat?.transition_to_next,
              beat?.story_action,
              beat?.character_action,
              beat?.visual_priority
            ]
              .filter(Boolean)
              .join(" ")
          );


        const transitionIsExplicit =
          containsAny(
            transitionText,
            [
              ...travelTerms,
              "new location",
              "cut to",
              "scene shifts",
              "scene changes",
              "at the destination",
              "upon arrival",
              "after arriving",
              "now at",
              "reaches",
              "arrives at",
              "lands at"
            ]
          );


        if (!transitionIsExplicit) {

          errors.push(
            `Geographic continuity break between beat ${previousBeat.beat_number} ("${previousBeat.location}") and beat ${beatNumber} ("${beat.location}"): no explicit relocation/transition.`
          );
        }
      }
    }


    /* =====================================================
       J. ENVIRONMENT LEAKAGE
    ===================================================== */

    if (
      location &&
      beatText
    ) {

      const incompatibleEnvironmentTerms = [

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


      const strongEnvironmentTerms =
        incompatibleEnvironmentTerms.filter(
          term =>
            containsTerm(
              beatText,
              term
            )
        );


      for (
        const environmentTerm
        of strongEnvironmentTerms
      ) {

        if (
          !containsTerm(
            locationText,
            environmentTerm
          )
        ) {

          const hasTravelContext =
            containsAny(
              beatText,
              travelTerms
            );


          if (!hasTravelContext) {

            errors.push(
              `Beat ${beatNumber} contains environment "${environmentTerm}" that is not compatible with selected location "${beat.location}".`
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


/* =========================================================
   10. CAUSAL BEAT VALIDATOR
========================================================= */

function validateCausalBeatContinuity(
  blueprint
) {

  const errors = [];
  const warnings = [];

  const beats =
    blueprint?.story_blueprint?.beats || [];


  if (!Array.isArray(beats) || beats.length < 2) {
    return {
      errors,
      warnings
    };
  }


  function textForBeat(beat) {
    return buildBeatText(beat);
  }


  const acquisitionTerms = [
    "pick",
    "picked",
    "pluck",
    "plucked",
    "collect",
    "collected",
    "harvest",
    "harvested",
    "grab",
    "grabbed",
    "lift",
    "lifted",
    "raise",
    "raised",
    "uproot",
    "uprooted",
    "tear",
    "tore",
    "obtain",
    "obtained",
    "take",
    "taken",
    "takes"
  ];


  const carryOutcomeTerms = [
    "carrying",
    "carries",
    "carry",
    "holding",
    "holds",
    "held",
    "returns with",
    "returning with",
    "comes back with",
    "brings back",
    "brought back"
  ];


  const mountainObjectTerms = [
    "mountain",
    "entire mountain",
    "mountain peak",
    "mountain on his shoulders",
    "mountain in his hands"
  ];


  const healingOutcomeTerms = [
    "revives",
    "revived",
    "revival",
    "heals",
    "healed",
    "restores",
    "restored",
    "awakens",
    "awakes"
  ];


  const treatmentTerms = [
    "administer",
    "administered",
    "medicine",
    "herb",
    "herbs",
    "sanjeevani",
    "treat",
    "treated",
    "apply",
    "applied"
  ];


  const arrivalTerms = [
    "arrive",
    "arrives",
    "arrived",
    "arrival",
    "reach",
    "reaches",
    "reached",
    "lands",
    "landed"
  ];


  const travelTerms = [
    "fly",
    "flying",
    "flew",
    "flight",
    "travel",
    "traveling",
    "travelling",
    "journey",
    "cross",
    "crossing",
    "return",
    "returning",
    "depart",
    "departure",
    "toward",
    "towards"
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
        ? textForBeat(previous)
        : "";


    /* =====================================================
       A. OBJECT ACQUISITION → CARRY
    ===================================================== */

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

      let acquisitionFound = false;


      /*
        Search previous beats, not only immediately previous,
        because a valid acquisition beat may be separated
        by a short transition beat.
      */

      for (
        let back = Math.max(0, index - 3);
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

          acquisitionFound = true;
          break;
        }
      }


      if (!acquisitionFound) {

        errors.push(
          `Causal continuity failure at beat ${current.beat_number}: character is carrying/returning with a mountain, but no preceding acquisition/lifting/uprooting event is represented.`
        );
      }
    }


    /* =====================================================
       B. REVIVAL MUST HAVE TREATMENT PRECONDITION
    ===================================================== */

    const currentRevives =
      containsAny(
        currentText,
        healingOutcomeTerms
      );


    if (currentRevives) {

      let treatmentFound = false;


      for (
        let back = Math.max(0, index - 3);
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

          treatmentFound = true;
          break;
        }
      }


      if (!treatmentFound) {

        warnings.push(
          `Causal continuity warning at beat ${current.beat_number}: recovery/revival occurs without a clearly represented preceding treatment action.`
        );
      }
    }


    /* =====================================================
       C. ARRIVAL SHOULD FOLLOW TRAVEL
    ===================================================== */

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


      if (locationsChanged) {

        const previousTravel =
          containsAny(
            previousText,
            travelTerms
          );


        if (!previousTravel) {

          warnings.push(
            `Beat ${current.beat_number} arrives at a new location, but the previous beat contains no clear travel/departure action.`
          );
        }
      }
    }


    /* =====================================================
       D. SEARCH → OUTCOME GAP
    ===================================================== */

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


      if (!hasAcquisitionVerb) {

        errors.push(
          `Causal gap between beat ${previous.beat_number} and beat ${current.beat_number}: search is followed by possession of a major object without an explicit acquisition action.`
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
   11. SEMANTIC VISUAL EVIDENCE
========================================================= */

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

    if (item?.evidence_id) {

      evidenceById.set(
        item.evidence_id,
        {
          kind: "LOCKED_FACT",
          text: item.claim || ""
        }
      );
    }
  }


  for (
    const item
    of factLock?.visual_notes || []
  ) {

    if (item?.evidence_id) {

      evidenceById.set(
        item.evidence_id,
        {
          kind: "VISUAL_NOTE",
          text: item.description || ""
        }
      );
    }
  }


  for (
    const item
    of factLock?.creative_reconstructions || []
  ) {

    if (item?.evidence_id) {

      evidenceById.set(
        item.evidence_id,
        {
          kind: "CREATIVE_RECONSTRUCTION",
          text: item.description || ""
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
        ).toUpperCase();


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
        classification !== "VERIFIED"
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
            record.kind === "LOCKED_FACT" ||
            record.kind === "VISUAL_NOTE"
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
            evidenceTerms.has(term)
        );


      const coverage =
        claimTerms.length === 0
          ? 0
          : matchedTerms.length /
            claimTerms.length;


      if (
        coverage < 0.75
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
            item?.classification !==
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
   12. BEAT CHARACTER COVERAGE
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
    }


    for (
      const name
      of listedCharacters
    ) {

      if (
        !characterNames.has(name)
      ) {

        errors.push(
          `Beat ${beat.beat_number} uses character "${name}" without a matching character_bible entry.`
        );
      }
    }
  }


  return errors;
}


/* =========================================================
   13. IMPORTANT TERM EXTRACTION
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


  return String(text || "")
    .replace(
      /[^a-z0-9\s-]/g,
      " "
    )
    .split(/\s+/)
    .filter(
      word =>
        word.length >= 5 &&
        !stopWords.has(word)
    )
    .slice(0, 12);
}


/* =========================================================
   14. TIME RANGE PARSER
========================================================= */

function parseTimeRange(value) {

  if (
    typeof value !== "string"
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
        Number(match[1]) * 60 +
        Number(match[2]),

      end:
        Number(match[3]) * 60 +
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
   15. PROGRAMMATIC VALIDATOR
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
    typeof blueprint !== "object"
  ) {

    return {
      passed: false,
      errors: [
        "Blueprint is missing or invalid."
      ],
      warnings: []
    };
  }


  /* =====================================================
     ROOT STRUCTURE
  ===================================================== */

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
      blueprint[section] === undefined ||
      blueprint[section] === null
    ) {

      errors.push(
        `Missing required section: ${section}`
      );
    }
  }


  /* =====================================================
     PROJECT SETTINGS
  ===================================================== */

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


  /* =====================================================
     FACT LOCK
  ===================================================== */

  const lockedFacts =
    factLock.locked_facts || [];


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
        fact.claim || ""
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
        !allBlueprintText.includes(term)
      ) {

        errors.push(
          `Locked fact entity missing or possibly replaced: "${term}" (${fact.evidence_id}).`
        );
      }
    }
  }


  /* =====================================================
     EVIDENCE IDS
  ===================================================== */

  const validEvidenceIds =
    new Set([

      ...lockedFacts.map(
        item =>
          item.evidence_id
      ),

      ...(factLock.creative_reconstructions || [])
        .map(
          item =>
            item.evidence_id
        ),

      ...(factLock.visual_notes || [])
        .map(
          item =>
            item.evidence_id
        )
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
      !validEvidenceIds.has(id)
    ) {

      errors.push(
        `Unknown evidence ID used: ${id}.`
      );
    }
  }


  /* =====================================================
     CHARACTER TRACEABILITY
  ===================================================== */

  if (
    Array.isArray(
      blueprint.character_bible
    )
  ) {

    for (
      const character
      of blueprint.character_bible
    ) {

      if (
        !Array.isArray(
          character.evidence_ids
        )
      ) {

        errors.push(
          `Character "${character.name}" has no evidence_ids array.`
        );

        continue;
      }


      if (
        character.evidence_ids.length === 0 &&
        !String(
          character.identity_status || ""
        )
          .toLowerCase()
          .includes("unknown")
      ) {

        warnings.push(
          `Character "${character.name}" has no linked evidence IDs.`
        );
      }
    }
  }


  errors.push(
    ...validateCharacterIdentityLocks(
      blueprint
    )
  );


  /* =====================================================
     WORLD TRACEABILITY
  ===================================================== */

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
        location.evidence_status || ""
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


  /* =====================================================
     SEMANTIC EVIDENCE
  ===================================================== */

  errors.push(
    ...validateSemanticEvidence(
      blueprint,
      factLock
    )
  );


  /* =====================================================
     BEAT SEMANTICS
  ===================================================== */

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


  /* =====================================================
     CAUSAL VALIDATION
  ===================================================== */

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


  /* =====================================================
     CAMERA CONSISTENCY
  ===================================================== */

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
        capture.includes(term)
    );


  const literalFilm =
    literalFilmTerms.some(
      term =>
        capture.includes(term)
    );


  if (
    digitalCapture &&
    literalFilm &&
    !emulation.includes("emulation")
  ) {

    errors.push(
      "Camera contradiction: digital capture is combined with literal physical film capture."
    );
  }


  /* =====================================================
     TIMELINE
  ===================================================== */

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


    let previousEnd = 0;


    for (
      const beat
      of beats
    ) {

      const range =
        parseTimeRange(
          beat.time_range
        );


      if (!range) {

        errors.push(
          `Could not parse time range for beat ${beat.beat_number}.`
        );

        continue;
      }


      if (
        range.end <= range.start
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


  /* =====================================================
     CONTINUITY SYSTEM
  ===================================================== */

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


  /* =====================================================
     CHARACTER REALISM
  ===================================================== */

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
        !character[field] ||
        String(
          character[field]
        ).trim() === ""
      ) {

        errors.push(
          `Character "${character.name}" missing realism field: ${field}.`
        );
      }
    }


    const lock =
      character.character_identity_lock;


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


  /* =====================================================
     BEAT CHARACTER COVERAGE
  ===================================================== */

  errors.push(
    ...validateBeatCharacterCoverage(
      blueprint
    )
  );


  /* =====================================================
     CRITICAL WARNING PROMOTION
  ===================================================== */

  /*
    Certain warnings are actually dangerous for downstream
    Scene Planner and video generation.

    Promote them to hard errors.
  */

  const criticalWarningPatterns = [

    /temporal\/lighting mismatch/i,
    /environment leakage/i,
    /too many major action/i,
    /3 major action groups/i,
    /causal continuity warning/i,
    /geographic continuity/i
  ];


  for (
    const warning
    of warnings
  ) {

    if (
      criticalWarningPatterns.some(
        pattern =>
          pattern.test(warning)
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
   16. AUTO CORRECTION
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

The Director Blueprint failed semantic validation.

Correct the blueprint WITHOUT redesigning it unnecessarily.

=========================================================
ABSOLUTE IDENTITY RULE
=========================================================

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

Preserve exact canonical names.

Preserve:

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
CRITICAL GEOGRAPHY RULE
=========================================================

The beat location is where visible characters physically act.

If a character is flying, do NOT place them inside:

camp
palace
room
temple
hut
battlefield
other unrelated fixed location

unless the action explicitly represents departure/arrival.

Create a credible travel/sky/transition location.

Never teleport.

=========================================================
CRITICAL TEMPORAL RULE
=========================================================

"before sunrise" = deadline.

It does NOT mean sunrise.

"approaching dawn" = transition.

Do not convert these into full sunrise lighting.

Night + actual sunrise is allowed ONLY when the beat
explicitly depicts the transition.

=========================================================
CRITICAL CAUSAL RULE
=========================================================

Never jump:

searching for herb
→ returning while carrying mountain

without an acquisition/lifting/uprooting event.

Likewise:

medicine search
→ revival

must preserve the treatment event.

arrival must follow travel/departure when locations change.

=========================================================
CRITICAL ACTION DENSITY RULE
=========================================================

A 5–6 second beat should have ONE dominant action.

Do not compress:

arrival + mountain lifting + return + healing + revival

into one beat.

Distribute causal actions across beats.

Preserve total requested duration exactly.

=========================================================
ENVIRONMENT RULE
=========================================================

Do not leak:

mountain scenery into camp
camp props into open sky
ocean scenery into mountain
palace architecture into forest
forest scenery into unrelated fixed location

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
    ...(factLock.locked_facts || [])
      .map(item => item.evidence_id),

    ...(factLock.creative_reconstructions || [])
      .map(item => item.evidence_id),

    ...(factLock.visual_notes || [])
      .map(item => item.evidence_id)
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
CORRECTION REQUIREMENTS
=========================================================

1. Preserve all locked facts.
2. Preserve all canonical names.
3. Preserve evidence IDs.
4. Preserve character identity locks.
5. Preserve age continuity.
6. Preserve face continuity.
7. Preserve body continuity.
8. Preserve costume continuity.
9. Preserve geography.
10. Preserve temporal continuity.
11. Preserve physical realism.
12. Preserve causal order.
13. Correct location/action conflicts.
14. Correct environment leakage.
15. Correct location transitions.
16. Correct action density.
17. Correct causal gaps.
18. Do not turn deadline language into actual sunrise.
19. Do not use generic character substitutes.
20. Every visible acting character must be in characters[].
21. Every beat must have a real physical location.
22. Exact duration must remain ${duration}s.
23. Exact aspect ratio must remain ${aspectRatio}.
24. Evidence IDs must come only from the closed list.
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
    !response.output_text
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
   17. PUBLIC DIRECTOR FUNCTION
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
    FIRST DIRECTOR GENERATION
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

    Only if the first correction still contains
    semantic errors.
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

    Scene Planner MUST NOT receive an invalid blueprint.
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

  blueprint._longshot_validation = {

    validator_version:
      "V5.0",

    passed:
      true,

    auto_corrected:
      autoCorrected,

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
