import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY
});


/* =========================================================
   LONGSHOT AI — DIRECTOR ENGINE V4.5
   Research → Fact Lock → Director → Semantic Validator
   → Auto Correction → Final Blueprint
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
          items: {
            type: "string"
          }
        },

        creative_reconstructions: {
          type: "array",
          items: {
            type: "string"
          }
        },

        unknown_details: {
          type: "array",
          items: {
            type: "string"
          }
        },

        contradictions_detected: {
          type: "array",
          items: {
            type: "string"
          }
        },

        fact_lock_rules: {
          type: "array",
          items: {
            type: "string"
          }
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
    },

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
          items: {
            type: "string"
          }
        },

        forbidden_errors: {
          type: "array",
          items: {
            type: "string"
          }
        },

        continuity_checks: {
          type: "array",
          items: {
            type: "string"
          }
        },

        authenticity_checks: {
          type: "array",
          items: {
            type: "string"
          }
        },

        realism_checks: {
          type: "array",
          items: {
            type: "string"
          }
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
→ PROGRAMMATIC SEMANTIC VALIDATOR
→ AUTO CORRECTION IF REQUIRED
→ FINAL BLUEPRINT

=========================================================
ABSOLUTE DIRECTOR RULE
=========================================================

Every beat must be physically, geographically,
temporally and causally coherent.

Never select a location merely because it appeared
earlier in the story.

The beat location must represent where the visible
characters are physically acting during that beat.

If a character is travelling between locations, the
beat must represent the travel itself, a credible
transition space, or the destination only after arrival.

Never combine a travel action with an unrelated fixed
location unless the story explicitly establishes that
the character is travelling through or departing from
that location.

Never describe sunrise, dawn, night, midnight or another
temporal state that contradicts the established lighting
without explicitly depicting the transition.

Never compress several independent major actions into
one very short beat when doing so would make the action
physically or visually ambiguous.

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

If the research locks a canonical name, you MUST preserve
that exact name.

When sources disagree, preserve the disagreement rather
than silently selecting one version.

=========================================================
2. EVIDENCE CLASSIFICATION
=========================================================

Every important factual or visual claim must belong to:

VERIFIED
INFERRED
CREATIVE_RECONSTRUCTION
UNKNOWN

Never present creative reconstruction as factual evidence.

=========================================================
3. EVIDENCE TRACEABILITY
=========================================================

Important claims must reference evidence IDs.

Use only supplied IDs.

Identity and visual evidence are separate.

A verified identity does not automatically verify
visual appearance.

A verified location name does not automatically verify
its terrain, architecture, vegetation, lighting or
environmental appearance.

=========================================================
4. CHARACTER DIRECTING
=========================================================

Build a complete character bible.

Maintain stable:

- facial structure
- body proportions
- musculature
- skin/fur
- hair/fur
- eyes
- hands
- fingers
- feet
- toes
- breathing
- blinking
- micro-expressions
- movement
- costume
- materials
- accessories

Do not randomly change face, body, hairstyle,
costume, age appearance or skin/fur texture.

=========================================================
5. HUMAN / CREATURE REALISM
=========================================================

Characters must look physically present in the real world.

Avoid:

- plastic skin
- wax-like faces
- artificial CGI appearance
- frozen expressions
- weightless movement
- rubber limbs
- impossible joints
- deformed hands
- missing fingers
- extra fingers
- malformed feet

Use realistic:

- skin texture
- muscle tension
- tendon movement
- breathing
- blinking
- eye moisture
- weight transfer
- joint mechanics
- cloth interaction
- environmental interaction

=========================================================
6. MOVEMENT PHYSICS
=========================================================

All movement must respect:

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

Supernatural movement is allowed only when required by
the researched story or clearly identified reconstruction.

It must still have coherent visual logic.

=========================================================
7. COSTUME AND MATERIAL REALISM
=========================================================

Costumes must behave like real physical materials.

Maintain:

- fabric behavior
- weight
- folds
- wrinkles
- tension
- friction
- dirt
- moisture
- wear
- damage

Accessories must remain consistent.

=========================================================
8. WORLD BUILDING
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

Separate factual evidence from cinematic reconstruction.

=========================================================
9. TIME CONTINUITY
=========================================================

Maintain one coherent temporal state.

Do not create contradictions such as:

"midnight"

and:

"first golden ray of sunrise"

unless the story explicitly shows the transition.

Maintain consistency of:

- moon
- sky brightness
- shadows
- artificial light
- atmospheric color
- sunrise/sunset state

=========================================================
10. GEOGRAPHY CONTINUITY
=========================================================

Locations must remain geographically coherent.

A character remains in the previous location until:

- travel is explicitly shown,
- relocation is explicitly stated,
- or the story establishes a documented location change.

If rapid or supernatural travel occurs, represent the
transition deliberately.

Never silently teleport characters.

=========================================================
11. STORY DIRECTING
=========================================================

Create:

- opening hook
- setup
- escalation
- emotional development
- climax
- ending beat

Every beat must contribute to the story.

=========================================================
12. DURATION MANAGEMENT
=========================================================

Respect the requested duration exactly.

20 seconds → exactly 20 seconds.

25 seconds → exactly 25 seconds.

30 seconds → exactly 30 seconds.

Avoid forcing several major independent actions into
a 4–5 second beat.

A short beat should normally have one dominant visual
action plus supporting micro-actions.

=========================================================
13. BEAT SEMANTIC RULES
=========================================================

For EVERY beat verify internally:

A. WHERE ARE THE CHARACTERS?

B. WHAT EXACTLY ARE THEY DOING?

C. CAN THAT ACTION PHYSICALLY HAPPEN AT THAT LOCATION?

D. IF THEY ARE TRAVELLING, IS THE TRAVEL SHOWN?

E. DOES THE LOCATION MATCH THE ENVIRONMENT IMPLIED
   BY THE action?

F. DOES THE TIME MATCH THE LIGHTING?

G. DOES THE BEAT INHERIT THE PREVIOUS LOCATION,
   ACTION STATE, WEATHER AND TIME?

H. ARE ALL LISTED CHARACTERS physically present?

I. DOES THE BEAT CONTAIN TOO MANY MAJOR ACTIONS
   FOR ITS DURATION?

J. IF THE LOCATION CHANGES, IS THE TRANSITION
   EXPLICIT?

Never output a beat that fails these checks.

=========================================================
14. CINEMATOGRAPHY
=========================================================

Specify where useful:

- shot scale
- framing
- camera height
- camera movement
- lens
- focal length
- focus
- depth of field
- motion rendering
- perspective

Camera movement must have narrative purpose.

=========================================================
15. CAMERA CONSISTENCY
=========================================================

Separate:

CAPTURE SYSTEM

from:

VISUAL EMULATION.

Digital cinema capture plus filmic visual emulation
is acceptable.

Literal physical film capture must not contradict
a digital capture system.

=========================================================
16. LIGHTING
=========================================================

Lighting must be physically believable.

Maintain:

- key light
- fill
- rim
- practical lights
- moonlight
- firelight
- atmospheric light
- shadow direction

Lighting must agree with the temporal state.

=========================================================
17. COLOR SCIENCE
=========================================================

Use cinematic color intentionally.

Avoid excessive:

- saturation
- bloom
- artificial glow
- crushed blacks
- neon highlights

=========================================================
18. VFX
=========================================================

VFX must support realism.

Do not automatically add:

- magical particles
- giant energy fields
- glowing eyes
- excessive aura
- fantasy smoke
- artificial lens flares

Use them only when justified.

=========================================================
19. AUTHENTICITY
=========================================================

For mythology/history:

Prioritize supplied evidence.

Distinguish:

- primary textual description
- traditional interpretation
- later interpretation
- popular representation
- cinematic reconstruction

For science:

Distinguish:

- established science
- inference
- visualization
- fictional reconstruction

=========================================================
20. AI ERROR PREVENTION
=========================================================

Prevent:

- changing faces
- changing costumes
- changing body proportions
- extra fingers
- missing fingers
- malformed hands
- malformed feet
- floating objects
- duplicated objects
- inconsistent shadows
- impossible reflections
- disappearing accessories
- teleporting characters
- sudden location changes
- inconsistent weather
- inconsistent time
- random camera language

=========================================================
21. CONTINUITY STATE
=========================================================

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

Every later beat must inherit the previous state unless
the story explicitly changes it.

=========================================================
22. FINAL SELF-CHECK
=========================================================

Before output inspect:

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
19. Beat action/location compatibility
20. Beat temporal compatibility
21. Action density
22. Physical character presence

If a conflict is found:

CORRECT IT BEFORE OUTPUT.

=========================================================
23. FINAL DIRECTOR PRINCIPLE
=========================================================

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
GEOGRAPHICALLY COHERENT
+
PRODUCTION READY.

Never sacrifice factual integrity for cinematic style.

Never sacrifice physical realism for spectacle.

Never sacrifice continuity for an impressive individual shot.

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
AVAILABLE EVIDENCE IDS — CLOSED LIST
=========================================================

${JSON.stringify([
  ...(factLock.locked_facts || []).map(item => item.evidence_id),
  ...(factLock.creative_reconstructions || []).map(item => item.evidence_id),
  ...(factLock.visual_notes || []).map(item => item.evidence_id)
], null, 2)}

Use ONLY IDs from this list.

=========================================================
FINAL INSTRUCTION
=========================================================

Create the complete LongShot AI Director Blueprint.

IMPORTANT:

- Use only supplied evidence IDs.
- Never invent evidence IDs.
- Never replace locked facts.
- Clearly classify unsupported visual details.
- Keep identity_status separate from visual_design_status.
- Add field-level visual_claims.
- Preserve every canonical person, object and location name.
- Reproduce locked events and causal relationships.
- Keep character continuity strict.
- Keep world continuity strict.
- Keep time continuity strict.
- Keep geography continuity strict.
- Keep physical movement believable.
- Every story beat must contain an explicit characters array.
- Every listed character must be physically present at the beat location.
- Never list an off-screen narrator as a visible character.
- Use narration for off-screen voice-over.
- Never mention a character physically acting while omitting
  that character from the characters array.
- Preserve exact character names.
- Separate camera capture from visual emulation.
- Respect exact requested duration.
- Every beat must be semantically compatible with its location.
- Every location change must have a logical transition.
- Do not place a travel action inside an unrelated fixed location.
- Do not combine incompatible temporal states.
- Do not compress too many independent major actions into
  a short beat.
- Do not claim an audit passed unless the blueprint actually
  satisfies these requirements.

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
   6. UTILITY FUNCTIONS
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


function extractSemanticEvidenceTerms(value) {

  const stopWords = new Set([
    "the", "and", "was", "were", "with", "from", "that", "this",
    "when", "during", "using", "into", "back", "over", "under",
    "after", "before", "their", "they", "them", "which", "have",
    "has", "had", "are", "is", "been", "being", "for", "onto",
    "its", "his", "her", "who", "what", "where", "there", "here",
    "character", "location", "visual", "appearance", "design",
    "detail", "details", "claim", "claims", "verified", "depicted",
    "shown", "looks", "look", "such", "also", "very", "more", "most"
  ]);

  return [...new Set(
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/-/g, " ")
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
          return token.slice(0, -3) + "y";
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
  )];
}


/* =========================================================
   7. SEMANTIC NORMALIZATION HELPERS
========================================================= */

function normalizeSemanticText(value) {

  return String(value || "")
    .toLowerCase()
    .replace(/[–—−]/g, "-")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function buildBeatText(beat) {

  return normalizeSemanticText([
    beat?.story_action,
    beat?.character_action,
    beat?.emotional_purpose,
    beat?.visual_priority,
    beat?.transition_to_next
  ]
    .filter(Boolean)
    .join(" "));
}


function containsAny(text, terms) {

  const normalized = normalizeSemanticText(text);

  return terms.some(term =>
    normalized.includes(
      normalizeSemanticText(term)
    )
  );
}


function countMatches(text, terms) {

  const normalized = normalizeSemanticText(text);

  return terms.reduce(
    (count, term) =>
      count +
      (normalized.includes(
        normalizeSemanticText(term)
      ) ? 1 : 0),
    0
  );
}


/* =========================================================
   8. SEMANTIC BEAT VALIDATOR
========================================================= */

function validateBeatSemanticContinuity(blueprint) {

  const errors = [];
  const warnings = [];

  const beats =
    blueprint?.story_blueprint?.beats || [];

  const locations =
    blueprint?.world_bible?.locations || [];

  const locationMap =
    new Map(
      locations
        .map(location => [
          normalizeSemanticText(location?.name),
          location
        ])
        .filter(([name]) => name)
    );

  const characterNames =
    new Set(
      (blueprint?.character_bible || [])
        .map(character =>
          String(character?.name || "").trim()
        )
        .filter(Boolean)
    );

  const travelTerms = [
    "fly",
    "flying",
    "flew",
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
    "to ",
    "arrive",
    "arrival",
    "reach",
    "reaches",
    "reaching",
    "return",
    "returns",
    "returning"
  ];

  const temporalGroups = {
    night: [
      "night",
      "midnight",
      "moonlit",
      "moonlight",
      "dark sky"
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
      "golden ray"
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

  const majorActionGroups = [
    [
      "fly",
      "flying",
      "flew",
      "travel",
      "travelling",
      "traveling",
      "journey",
      "journeying",
      "cross"
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
      "lifts"
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
      normalizeSemanticText(beat?.location);

    return locationMap.get(key) || null;
  }


  function getLocationEnvironment(location) {

    if (!location) return "";

    return normalizeSemanticText([
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
      .join(" "));
  }


  function hasTemporalConflict(beat, location) {

    if (!location) return false;

    const beatText =
      buildBeatText(beat);

    const locationTime =
      normalizeSemanticText(
        location.time_of_day
      );

    const locationLighting =
      normalizeSemanticText(
        location.lighting_conditions
      );

    const environmentText =
      `${locationTime} ${locationLighting}`;

    const beatTemporalStates = [];

    for (const [state, terms] of Object.entries(
      temporalGroups
    )) {

      if (
        containsAny(
          beatText,
          terms
        )
      ) {
        beatTemporalStates.push(state);
      }
    }

    const locationTemporalStates = [];

    for (const [state, terms] of Object.entries(
      temporalGroups
    )) {

      if (
        containsAny(
          environmentText,
          terms
        )
      ) {
        locationTemporalStates.push(state);
      }
    }

    if (
      beatTemporalStates.length === 0 ||
      locationTemporalStates.length === 0
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
        beatTemporalStates.includes(a) &&
        locationTemporalStates.includes(b)
    );
  }


  for (let index = 0; index < beats.length; index++) {

    const beat = beats[index];

    const beatNumber =
      beat?.beat_number || index + 1;

    const beatText =
      buildBeatText(beat);

    const location =
      getLocation(beat);

    const locationText =
      getLocationEnvironment(location);


    /* -----------------------------------------------------
       A. LOCATION MUST EXIST
    ----------------------------------------------------- */

    if (
      beat?.location &&
      !location
    ) {

      errors.push(
        `Beat ${beatNumber} references location "${beat.location}" but no matching world_bible location exists.`
      );
    }


    /* -----------------------------------------------------
       B. TRAVEL + FIXED LOCATION MISMATCH
    ----------------------------------------------------- */

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
        previousBeat?.location || "";

      const currentLocation =
        beat?.location || "";

      const sameLocation =
        normalizeSemanticText(
          previousLocation
        ) ===
        normalizeSemanticText(
          currentLocation
        );

      if (sameLocation) {

        warnings.push(
          `Beat ${beatNumber} contains strong travel/destination language while remaining at fixed location "${currentLocation}".`
        );
      }
    }


    /* -----------------------------------------------------
       C. ACTION MUST MATCH LOCATION
    ----------------------------------------------------- */

    const environmentTravelConflict =
      (
        containsAny(
          beatText,
          [
            "flying over mountains",
            "flying over mountain",
            "across the mountains",
            "over the mountains",
            "through the mountains",
            "flying toward the mountains",
            "toward the himalayas",
            "towards the himalayas",
            "toward the mountain",
            "towards the mountain",
            "crossing the ocean",
            "over the ocean",
            "across the ocean",
            "flying across"
          ]
        )
      ) &&
      (
        containsAny(
          locationText,
          fixedLocationTerms
        )
      );

    if (environmentTravelConflict) {

      errors.push(
        `Beat ${beatNumber} has a travel/environment action that conflicts with its fixed location "${beat.location}". The beat should use a physically compatible travel location, transition space, origin, or destination.`
      );
    }


    /* -----------------------------------------------------
       D. NAMED WORLD LOCATION IN ACTION
    ----------------------------------------------------- */

    for (const worldLocation of locations) {

      const worldName =
        String(
          worldLocation?.name || ""
        ).trim();

      if (!worldName) continue;

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
        normalizedBeatLocation !== normalizedWorldName &&
        beatText.includes(normalizedWorldName)
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
            `Beat ${beatNumber} mentions world location "${worldName}" in its action while the beat location is "${beat.location}" without an explicit transition.`
          );
        }
      }
    }


    /* -----------------------------------------------------
       E. TEMPORAL + LIGHTING CONSISTENCY
    ----------------------------------------------------- */

    if (
      hasTemporalConflict(
        beat,
        location
      )
    ) {

      errors.push(
        `Beat ${beatNumber} has a temporal/lighting contradiction with location "${beat.location}". Beat action and world-bible lighting must represent the same coherent temporal state or an explicit transition.`
      );
    }


    /* -----------------------------------------------------
       F. SUNRISE / SUNSET CONTRADICTION
    ----------------------------------------------------- */

    const sunriseInBeat =
      containsAny(
        beatText,
        [
          "sunrise",
          "first light",
          "first golden ray",
          "golden ray of sunrise",
          "dawn light"
        ]
      );

    const nightInLocation =
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

    if (
      sunriseInBeat &&
      nightInLocation &&
      !containsAny(
        beatText,
        [
          "transition from night",
          "night giving way",
          "dawn begins",
          "dawn breaks",
          "sunrise begins"
        ]
      )
    ) {

      errors.push(
        `Beat ${beatNumber} describes sunrise/dawn while the selected location remains defined as night/moonlit without an explicit temporal transition.`
      );
    }


    /* -----------------------------------------------------
       G. ACTION DENSITY
    ----------------------------------------------------- */

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

    if (
      durationSeconds > 0 &&
      durationSeconds <= 5 &&
      actionGroupHits >= 4
    ) {

      errors.push(
        `Beat ${beatNumber} is overloaded: it contains approximately ${actionGroupHits} independent major action groups inside ${durationSeconds} seconds. Split or simplify the beat while preserving the researched causal sequence.`
      );
    }

    if (
      durationSeconds > 0 &&
      durationSeconds <= 4 &&
      actionGroupHits >= 3
    ) {

      errors.push(
        `Beat ${beatNumber} is too action-dense for ${durationSeconds} seconds. Keep one dominant visual action and only supporting micro-actions.`
      );
    }


    /* -----------------------------------------------------
       H. CHARACTER PHYSICAL PRESENCE
    ----------------------------------------------------- */

    const listedCharacters =
      Array.isArray(
        beat?.characters
      )
        ? beat.characters
        : [];

    for (const character of listedCharacters) {

      if (
        !characterNames.has(character)
      ) {

        errors.push(
          `Beat ${beatNumber} uses character "${character}" without a character_bible entry.`
        );
      }
    }


    const beatActionMentions =
      new Set(
        [...characterNames].filter(
          name =>
            beatText.includes(
              normalizeSemanticText(name)
            )
        )
      );

    for (const mentionedCharacter of beatActionMentions) {

      const isListed =
        listedCharacters.includes(
          mentionedCharacter
        );

      const narrationText =
        normalizeSemanticText(
          beat?.narration
        );

      const onlyNarration =
        narrationText.includes(
          normalizeSemanticText(
            mentionedCharacter
          )
        ) &&
        !normalizeSemanticText(
          `${beat?.story_action || ""} ${beat?.character_action || ""}`
        ).includes(
          normalizeSemanticText(
            mentionedCharacter
          )
        );

      if (
        !isListed &&
        !onlyNarration
      ) {

        errors.push(
          `Beat ${beatNumber} mentions character "${mentionedCharacter}" as an acting/present entity but does not list that character in the explicit characters array.`
        );
      }
    }


    /* -----------------------------------------------------
       I. ADJACENT LOCATION CONTINUITY
    ----------------------------------------------------- */

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
        previousLocation !== currentLocation
      ) {

        const transitionText =
          normalizeSemanticText([
            previousBeat?.transition_to_next,
            beat?.story_action,
            beat?.character_action,
            beat?.visual_priority
          ]
            .filter(Boolean)
            .join(" "));

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
              "now at"
            ]
          );

        if (!transitionIsExplicit) {

          errors.push(
            `Geographic continuity break between beat ${previousBeat.beat_number} ("${previousBeat.location}") and beat ${beatNumber} ("${beat.location}"): location changes without an explicit travel, arrival, transition, or relocation action.`
          );
        }
      }
    }


    /* -----------------------------------------------------
       J. ENVIRONMENT LEAKAGE
    ----------------------------------------------------- */

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
            beatText.includes(term)
        );

      if (
        strongEnvironmentTerms.length > 0
      ) {

        const currentLocationName =
          normalizeSemanticText(
            beat?.location
          );

        const currentEnvironment =
          locationText;

        for (
          const environmentTerm
          of strongEnvironmentTerms
        ) {

          if (
            !currentEnvironment.includes(
              environmentTerm
            )
          ) {

            const hasTravelContext =
              containsAny(
                beatText,
                travelTerms
              );

            if (!hasTravelContext) {

              warnings.push(
                `Beat ${beatNumber} contains environment "${environmentTerm}" not found in the selected location "${currentLocationName}". Verify that the action is not leaking scenery from another location.`
              );
            }
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
   9. SEMANTIC VISUAL EVIDENCE
========================================================= */

function validateSemanticEvidence(
  blueprint,
  factLock
) {

  const errors = [];

  const allowedClassifications = new Set([
    "VERIFIED",
    "INFERRED",
    "CREATIVE_RECONSTRUCTION",
    "UNKNOWN"
  ]);

  const evidenceById = new Map();

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
        label +
        " is missing its visual_claims array."
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
          label +
          " has an empty visual claim."
        );

        continue;
      }

      if (
        !allowedClassifications.has(
          classification
        )
      ) {

        errors.push(
          label +
          " has an invalid visual claim classification: " +
          classification +
          "."
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
          label +
          " marks a visual claim VERIFIED without a linked locked fact or visual research note."
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
          label +
          " marks a visual claim VERIFIED, but the cited evidence does not directly support enough of its key terms. Revise the claim/evidence or downgrade it."
        );
      }
    }
  }


  for (
    const character
    of blueprint.character_bible || []
  ) {

    const label =
      "Character " +
      JSON.stringify(
        character?.name ||
        "(unnamed)"
      );

    inspectClaims(
      character || {},
      label
    );

    if (
      String(
        character?.identity_status || ""
      ).toUpperCase() ===
      "HISTORICAL_IDENTITY_VERIFIED"
    ) {

      errors.push(
        label +
        " uses HISTORICAL_IDENTITY_VERIFIED; mythological figures must use MYTHOLOGICAL_IDENTITY_VERIFIED unless the research explicitly establishes historical identity."
      );
    }

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
          label +
          " has visual_design_status VERIFIED, but not every visual claim is independently VERIFIED."
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
      "Location " +
      JSON.stringify(
        location?.name ||
        "(unnamed)"
      )
    );
  }

  return errors;
}


/* =========================================================
   10. BEAT CHARACTER COVERAGE
========================================================= */

function validateBeatCharacterCoverage(
  blueprint
) {

  const errors = [];

  const characterNames =
    new Set(
      (blueprint.character_bible || [])
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

    if (
      listedCharacters.length === 0
    ) {

      errors.push(
        `Beat ${beat.beat_number} has no explicit characters array.`
      );
    }
  }

  return errors;
}


/* =========================================================
   11. IMPORTANT TERM EXTRACTION
========================================================= */

function extractImportantTerms(
  text
) {

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
   12. TIME RANGE PARSER
========================================================= */

function parseTimeRange(
  value
) {

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


  match =
    cleaned.match(
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


  match =
    cleaned.match(
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
   13. PROGRAMMATIC VALIDATOR
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

  for (
    const section
    of requiredRootSections
  ) {

    if (
      blueprint[section] ===
      undefined ||
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
    blueprint.project?.duration_seconds !==
    duration
  ) {

    errors.push(
      `Duration mismatch. Expected ${duration}, got ${blueprint.project?.duration_seconds}`
    );
  }

  if (
    blueprint.project?.aspect_ratio !==
    aspectRatio
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

    if (!claim) continue;

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
        `Unknown evidence ID used: ${id}`
      );
    }
  }


  /* -------------------------------------------------------
     5. CHARACTER TRACEABILITY
  ------------------------------------------------------- */

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


  /* -------------------------------------------------------
     6. WORLD TRACEABILITY
  ------------------------------------------------------- */

  const locations =
    blueprint.world_bible?.locations ||
    [];

  if (
    Array.isArray(locations)
  ) {

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
  }


  /* -------------------------------------------------------
     6A. SEMANTIC VISUAL EVIDENCE
  ------------------------------------------------------- */

  errors.push(
    ...validateSemanticEvidence(
      blueprint,
      factLock
    )
  );


  /* -------------------------------------------------------
     6B. SEMANTIC BEAT VALIDATION — V4.5
  ------------------------------------------------------- */

  const semanticBeatValidation =
    validateBeatSemanticContinuity(
      blueprint
    );

  errors.push(
    ...semanticBeatValidation.errors
  );

  warnings.push(
    ...semanticBeatValidation.warnings
  );


  /* -------------------------------------------------------
     7. CAMERA CONSISTENCY
  ------------------------------------------------------- */

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
        capture.includes(term)
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
    !emulation.includes(
      "emulation"
    )
  ) {

    errors.push(
      "Camera contradiction: digital capture is described together with literal physical film capture."
    );
  }


  /* -------------------------------------------------------
     8. TIMELINE VALIDATION
  ------------------------------------------------------- */

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
        (sum, beat) =>
          sum +
          Number(
            beat.duration_seconds ||
            0
          ),
        0
      );

    if (
      totalBeatDuration !==
      duration
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

        warnings.push(
          `Could not parse time range for beat ${beat.beat_number}.`
        );

        continue;
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
        "Timeline does not end exactly at the requested duration."
      );
    }
  }


  /* -------------------------------------------------------
     9. REQUIRED CONTINUITY SYSTEM
  ------------------------------------------------------- */

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
        `Continuity system missing: ${field}`
      );
    }
  }


  /* -------------------------------------------------------
     10. REALISM REQUIREMENTS
  ------------------------------------------------------- */

  const characters =
    blueprint.character_bible ||
    [];

  if (
    Array.isArray(characters)
  ) {

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
            `Character "${character.name}" missing realism field: ${field}`
          );
        }
      }
    }
  }


  /* -------------------------------------------------------
     11. BEAT CHARACTER COVERAGE
  ------------------------------------------------------- */

  errors.push(
    ...validateBeatCharacterCoverage(
      blueprint
    )
  );


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
   14. AUTO CORRECTION
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

A Director Blueprint failed programmatic validation.

Your job is to correct the detected problems.

Do not redesign the project unnecessarily.

Do not remove cinematic detail unless required.

Do not replace locked facts.

Do not invent new evidence.

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
AVAILABLE EVIDENCE IDS — CLOSED LIST
=========================================================

${JSON.stringify([
  ...(factLock.locked_facts || [])
    .map(item => item.evidence_id),

  ...(factLock.creative_reconstructions || [])
    .map(item => item.evidence_id),

  ...(factLock.visual_notes || [])
    .map(item => item.evidence_id)
], null, 2)}

Every evidence_ids entry must be copied from this list.

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
SEMANTIC CORRECTION RULES
=========================================================

1. Every beat location must describe where the visible
   characters are physically acting.

2. If a beat contains travel, flying, journeying,
   crossing, returning, approaching or arriving,
   do not place it inside an unrelated fixed location
   unless the action explicitly starts, ends or passes
   through that location.

3. If a character is travelling between two locations,
   create a coherent travel/transition state instead of
   silently teleporting the character.

4. If a beat changes location from the previous beat,
   the transition must be explicit.

5. Never place a character at a distant location merely
   because that character provides narration.

6. All physically acting characters must appear in the
   beat characters array.

7. Keep time and lighting coherent.

8. Do not combine night and sunrise/dawn lighting unless
   the beat explicitly depicts the transition.

9. If a beat contains too many independent major actions
   for its duration, simplify the beat or restructure
   the adjacent beats while preserving the researched
   causal sequence.

10. Never remove a locked factual event merely to satisfy
    cinematic pacing.

11. Preserve the causal order of researched actions.

12. Preserve exact canonical names.

13. Preserve geography.

14. Preserve physical realism.

15. If a warning identifies environment leakage, make the
    beat environment agree with the selected location or
    explicitly establish that the character is travelling
    through that environment.

=========================================================
GENERAL CORRECTION RULES
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
    inferred, creative reconstruction or unknown.

11. Preserve character continuity.

12. Preserve world continuity.

13. Preserve physical realism.

14. Preserve exact locked names.

15. Keep identity separate from visual appearance.

16. Correct visual_claim classifications.

17. Never treat a verified location name as proof of
    its visual details.

18. Keep narration separate from visible characters.

19. Every beat must contain explicit characters.

20. Every physically acting character must be listed.

21. Never teleport characters.

22. Never silently change geography.

23. Never claim validation passed.

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

  } catch (error) {

    throw new Error(
      "Correction Engine returned invalid JSON."
    );
  }
}


/* =========================================================
   15. PUBLIC DIRECTOR FUNCTION
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


  let autoCorrected =
    false;


  /*
    Auto-correction pass
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
    Machine-generated validation metadata.
  */

  blueprint._longshot_validation = {

    validator_version:
      "V4.5",

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
