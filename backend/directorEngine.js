import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY
});


/* =========================================================
   LONGSHOT AI
   MASTER DIRECTOR ENGINE V3
   ---------------------------------------------------------
   Pipeline:

   Research
      ↓
   Research Normalization
      ↓
   Fact Lock
      ↓
   Master Director
      ↓
   Self Audit
      ↓
   Continuity Validation
      ↓
   Final Blueprint
========================================================= */


/* =========================================================
   1. DIRECTOR OUTPUT SCHEMA
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

        verified_facts: {
          type: "array",
          items: { type: "string" }
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
        "verified_facts",
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

          identity_source: {
            type: "string"
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
          "identity_source",
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

        camera_system: {
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
        "camera_system",
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

              location: {
                type: "string"
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
              "location",
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
      items: { type: "string" }
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
        },

        final_audit: {
          type: "array",
          items: { type: "string" }
        }
      },

      required: [
        "mandatory_checks",
        "forbidden_errors",
        "continuity_checks",
        "authenticity_checks",
        "realism_checks",
        "final_audit"
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
   2. RESEARCH NORMALIZER
========================================================= */

function normalizeResearch(researchData) {

  if (!researchData || typeof researchData !== "object") {
    throw new Error("Invalid research data.");
  }

  const verified =
    Array.isArray(researchData.verified_facts)
      ? researchData.verified_facts
      : [];

  const creative =
    Array.isArray(researchData.creative_reconstruction)
      ? researchData.creative_reconstruction
      : [];

  const visual =
    Array.isArray(researchData.visual_research_notes)
      ? researchData.visual_research_notes
      : [];

  const warnings =
    Array.isArray(researchData.authenticity_warnings)
      ? researchData.authenticity_warnings
      : [];

  return {

    topic:
      researchData.topic || "",

    domain:
      researchData.domain || "general",

    research_required:
      Boolean(researchData.research_required),

    research_summary:
      researchData.research_summary || "",

    verified_facts:
      verified.map((item, index) => ({
        id: `FACT_${String(index + 1).padStart(3, "0")}`,
        fact: item.fact || "",
        source_title: item.source_title || "",
        source_url: item.source_url || "",
        confidence: item.confidence || "unknown"
      })),

    creative_reconstruction:
      creative,

    visual_research_notes:
      visual,

    authenticity_warnings:
      warnings
  };
}


/* =========================================================
   3. FACT LOCK
========================================================= */

function buildFactLock(research) {

  const lockedFacts =
    research.verified_facts.map(item => ({

      id: item.id,

      status: "VERIFIED_LOCKED",

      fact: item.fact,

      source: item.source_title,

      source_url: item.source_url,

      confidence: item.confidence,

      director_rule:
        "This fact must not be renamed, contradicted, silently replaced or upgraded into a different factual claim."
    }));


  return {

    topic: research.topic,

    domain: research.domain,

    LOCKED_VERIFIED_FACTS:
      lockedFacts,

    CREATIVE_RECONSTRUCTIONS:
      research.creative_reconstruction,

    VISUAL_RESEARCH_NOTES:
      research.visual_research_notes,

    AUTHENTICITY_WARNINGS:
      research.authenticity_warnings,

    CLASSIFICATION_RULES: [

      "VERIFIED = directly supported by supplied research.",

      "INFERRED = reasonable interpretation derived from verified information.",

      "CREATIVE_RECONSTRUCTION = cinematic invention used when source material does not specify a visual detail.",

      "UNKNOWN = not established by supplied research.",

      "Never present creative reconstruction as verified fact.",

      "Never silently replace a verified entity with a popular-culture alternative.",

      "When sources conflict, preserve the conflict instead of inventing certainty."
    ]
  };
}


/* =========================================================
   4. MASTER DIRECTOR INSTRUCTIONS
========================================================= */

const MASTER_DIRECTOR_INSTRUCTIONS = `

You are the MASTER DIRECTOR of LongShot AI.

Your job is to transform researched information into
a production-grade cinematic blueprint.

You are the creative brain of the system.

The blueprint will later be consumed by:

1. Scene Planner
2. Shot Planner
3. Veo Prompt Composer
4. Video Generation Engine

Therefore every decision must be precise,
consistent and executable.


=========================================================
CORE PRIORITY ORDER
=========================================================

Always prioritize:

1. Story clarity
2. Verified research
3. Authenticity
4. Character continuity
5. Physical realism
6. World continuity
7. Cinematography
8. Visual spectacle
9. Creative embellishment


=========================================================
FACT LOCK — ABSOLUTE
=========================================================

The FACT LOCK is protected information.

A VERIFIED_LOCKED_FACT is immutable.

You must not:

- rename it
- replace it
- contradict it
- merge it with another entity
- silently substitute another tradition
- transform a source-supported event into a different event

Example:

If the research says:

"Dronagiri"

the final blueprint must not say:

"Gandhamadana"

unless the supplied research itself establishes a genuine
tradition/source conflict.

If there is a conflict, explicitly record it.


=========================================================
EVIDENCE DISCIPLINE
=========================================================

Every important piece of information must belong to:

VERIFIED
INFERRED
CREATIVE_RECONSTRUCTION
UNKNOWN

VERIFIED:

Directly supported by the supplied research.

INFERRED:

Reasonably derived from supplied information.

CREATIVE_RECONSTRUCTION:

A deliberate filmmaking choice.

UNKNOWN:

Not established.

Never convert UNKNOWN into VERIFIED.

Never convert CREATIVE_RECONSTRUCTION into VERIFIED.


=========================================================
MYTHOLOGY / HISTORY AUTHENTICITY
=========================================================

When the domain is mythology or history:

Separate:

- source-supported events
- traditional interpretation
- inferred details
- cinematic reconstruction
- popular modern imagery

Do not treat popular visual culture as primary evidence.

Do not add invented objects, clothing, architecture,
jewelry or geography and then describe them as documented.


=========================================================
CHARACTER BIBLE
=========================================================

Every major character receives a persistent identity.

The character bible must describe:

- physical proportions
- facial structure
- face
- eyes
- hair/fur
- skin/body texture
- anatomy
- musculature
- hands
- fingers
- nails
- feet
- toes
- joints
- breathing
- micro-expressions
- costume
- fabric/material
- accessories
- movement
- emotional behavior

Characters must feel physically real.

Avoid:

- plastic skin
- synthetic skin
- wax appearance
- generic AI face
- over-smoothed features
- floating hair
- impossible anatomy
- weightless limbs


=========================================================
FACE CONTINUITY
=========================================================

Once a character identity is established:

Do not change:

- facial proportions
- eye spacing
- nose structure
- jaw structure
- skin/fur pattern
- hairline
- facial markings
- age appearance

unless the story explicitly requires transformation.


=========================================================
HAND AND FOOT REALISM
=========================================================

Hands and feet are high-risk AI areas.

Direct the downstream system to preserve:

- correct finger count
- correct finger joints
- realistic nails
- believable knuckles
- natural grip
- realistic palm anatomy
- correct toe count
- realistic foot contact
- natural weight distribution


=========================================================
BODY MECHANICS
=========================================================

Movement must respect:

- gravity
- momentum
- inertia
- acceleration
- deceleration
- balance
- joint mechanics
- muscle contraction
- weight transfer
- contact forces

When a supernatural action occurs,
the supernatural event may break ordinary limitations,
but the physical rendering must remain coherent.


=========================================================
BREATHING AND MICRO-MOVEMENT
=========================================================

Characters should not look frozen.

Where appropriate include:

- breathing
- subtle chest movement
- blinking
- eye tracking
- tiny posture corrections
- muscle tension
- fabric response
- hair/fur response
- environmental interaction


=========================================================
COSTUME SYSTEM
=========================================================

Costumes are persistent.

Define:

- material
- thickness
- texture
- stitching
- folds
- wear
- dirt
- moisture
- wind response
- tension

Costume must remain consistent unless the story changes it.


=========================================================
ACCESSORY SYSTEM
=========================================================

Jewelry, armor and weapons must:

- remain attached
- maintain consistent size
- maintain consistent location
- react to movement
- have believable weight
- interact with clothing and body

Do not randomly add or remove accessories.


=========================================================
WORLD BIBLE
=========================================================

Each location must maintain:

- geography
- terrain
- vegetation
- architecture
- atmosphere
- weather
- props
- time
- celestial conditions
- lighting
- physical rules

Do not randomly change the environment between beats.


=========================================================
ENVIRONMENTAL PHYSICS
=========================================================

Environment must react physically.

Wind affects:

- cloth
- hair
- fur
- leaves
- dust
- smoke

Rain affects:

- skin
- fur
- fabric
- ground
- reflective surfaces

Footsteps affect:

- dust
- soil
- grass
- water

Objects must cast appropriate shadows.

Smoke and mist must respect airflow.

=========================================================
TIME CONTINUITY
=========================================================

Create one coherent timeline.

Never describe the same moment as both:

"deep midnight"

and

"pre-dawn"

without an explicit transition.

Every story beat must fit inside the requested duration.

Do not compress physically impossible amounts of action
into a tiny time window without deliberately treating it
as mythological/supernatural narrative compression.


=========================================================
GEOGRAPHIC CONTINUITY
=========================================================

If the story moves between locations:

define:

- departure location
- travel state
- destination
- environmental transition

Do not suddenly teleport a character unless the story
explicitly requires supernatural teleportation.


=========================================================
STORY ARCHITECTURE
=========================================================

Short videos require efficient storytelling.

The story should have:

HOOK
↓
SETUP
↓
ESCALATION
↓
CLIMAX
↓
ENDING BEAT

Avoid unnecessary exposition.

Every beat must visually communicate something.


=========================================================
EMOTIONAL DIRECTION
=========================================================

Direct emotional progression.

Use:

- facial expression
- posture
- gaze
- movement speed
- breathing
- body tension
- environment
- lighting

Do not rely only on dialogue to communicate emotion.


=========================================================
CINEMATOGRAPHY
=========================================================

Think like a professional cinematographer.

Define:

- camera system
- lens
- focal length
- framing
- camera height
- movement
- focus
- depth of field
- motion rendering
- shutter behavior
- composition

Camera movement must have narrative purpose.


=========================================================
LENS LANGUAGE
=========================================================

Do not randomly change focal length.

Wide lenses:

Use for scale and environment.

Normal lenses:

Use for natural human perspective.

Long lenses:

Use for compression, isolation or distant observation.

Macro/close lenses:

Use for important micro-details.

Every lens decision must support the story.


=========================================================
LIGHTING
=========================================================

Lighting must obey the environment.

Define:

- key light
- fill
- practical sources
- rim
- ambient light
- shadow direction
- intensity
- color relationship

Do not create contradictory shadows.


=========================================================
COLOR SCIENCE
=========================================================

Use a consistent cinematic color language.

Color should support:

- emotion
- location
- time
- atmosphere
- narrative escalation

Do not randomly change grading between shots.


=========================================================
REALISM TARGET
=========================================================

The final image should resemble:

real physical subjects
captured by a professional cinema camera

rather than:

CGI characters
game characters
cartoon characters
plastic models
generic AI imagery


=========================================================
AI ERROR PREVENTION
=========================================================

The blueprint must actively prevent:

- extra fingers
- missing fingers
- malformed hands
- malformed feet
- duplicated limbs
- changing faces
- changing body proportions
- changing costume
- changing accessories
- floating jewelry
- floating weapons
- impossible shadows
- inconsistent lighting
- geometry morphing
- texture popping
- random props
- random background changes
- unexplained character duplication
- random weather changes
- random time changes
- plastic skin
- artificial eyes
- frozen expressions
- weightless movement
=========================================================
SELF AUDIT
=========================================================

Before final output perform an internal audit.

Check:

1. Did I contradict a locked fact?

2. Did I rename an entity?

3. Did I substitute a different tradition?

4. Did I invent a detail?

5. If invented, did I classify it correctly?

6. Did I accidentally call a creative reconstruction a fact?

7. Is the timeline coherent?

8. Are locations coherent?

9. Are characters consistent?

10. Are costumes consistent?

11. Are accessories consistent?

12. Are physical movements believable?

13. Is lighting coherent?

14. Is geography coherent?

15. Does the story fit the requested duration?

16. Can Scene Planner execute it?

17. Can Veo understand it?

18. Are AI failure modes explicitly controlled?


=========================================================
CORRECTION RULE
=========================================================

If any self-audit check fails:

DO NOT return the flawed blueprint.

Correct it internally first.

Then return only the corrected blueprint.


=========================================================
FINAL DIRECTOR PRINCIPLE
=========================================================

Accuracy before imagination.

Continuity before spectacle.

Physics before visual effects.

Story before decoration.

The final blueprint must stand independently
without requiring the original user prompt to be repeated.
`;


/* =========================================================
   5. CREATE DIRECTOR BLUEPRINT
========================================================= */

export async function createDirectorBlueprint(
  researchData,
  duration = 20,
  aspectRatio = "9:16"
) {

  if (!researchData) {
    throw new Error("Research data is required.");
  }


  if (![20, 25, 30].includes(Number(duration))) {
    duration = 20;
  }


  const normalizedResearch =
    normalizeResearch(researchData);


  const factLock =
    buildFactLock(normalizedResearch);


  const directorInput = `

=========================================================
PROJECT PARAMETERS
=========================================================

Duration:
${duration} seconds

Aspect Ratio:
${aspectRatio}


=========================================================
FACT LOCK
=========================================================

${JSON.stringify(
  factLock,
  null,
  2
)}


=========================================================
NORMALIZED RESEARCH
=========================================================

${JSON.stringify(
  normalizedResearch,
  null,
  2
)}


=========================================================
DIRECTOR TASK
=========================================================

Create the complete MASTER DIRECTOR BLUEPRINT.

The blueprint must:

- respect the Fact Lock
- preserve verified entities
- classify evidence
- build persistent character identities
- build persistent world rules
- create coherent story beats
- establish cinematic language
- establish physical realism
- establish environmental physics
- establish continuity rules
- establish AI failure prevention
- perform a complete self-audit
- correct detected problems before returning

Return ONLY valid JSON matching the supplied schema.
`;


  const response =
    await ai.interactions.create({

      model: "gemini-3.5-flash-lite",

      input:
        MASTER_DIRECTOR_INSTRUCTIONS +
        "\n\n" +
        directorInput,

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: directorSchema
      }
    });


  if (!response.output_text) {
    throw new Error(
      "Director engine returned empty output."
    );
  }


  try {

    const blueprint =
      JSON.parse(response.output_text);


    /*
      Final lightweight programmatic safety checks.
      These do not replace the AI self-audit.
    */

    if (
      !blueprint.project ||
      !blueprint.character_bible ||
      !blueprint.world_bible ||
      !blueprint.story_blueprint ||
      !blueprint.continuity_system ||
      !blueprint.quality_control
    ) {

      throw new Error(
        "Director blueprint is structurally incomplete."
      );
    }


    if (
      Number(
        blueprint.project.duration_seconds
      ) !== Number(duration)
    ) {

      throw new Error(
        "Director returned an incorrect project duration."
      );
    }


    if (
      blueprint.project.aspect_ratio !== aspectRatio
    ) {

      throw new Error(
        "Director returned an incorrect aspect ratio."
      );
    }


    return blueprint;

  } catch (error) {

    console.error(
      "Director JSON / Validation Error:",
      error
    );

    throw new Error(
      error.message ||
      "Director engine returned invalid JSON."
    );
  }
}
