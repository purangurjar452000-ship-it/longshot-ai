import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({
  apiKey: API_KEY
});


/* =========================================================
   DIRECTOR OUTPUT SCHEMA
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
        duration_seconds: { type: "integer" },
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
          items: {
            type: "string"
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

        authenticity_warnings: {
          type: "array",
          items: {
            type: "string"
          }
        },

        research_gaps: {
          type: "array",
          items: {
            type: "string"
          }
        }

      },

      required: [
        "verified_facts",
        "inferred_details",
        "creative_reconstructions",
        "authenticity_warnings",
        "research_gaps"
      ]
    },


    character_bible: {
      type: "array",

      items: {
        type: "object",

        properties: {

          character_id: {
            type: "string"
          },

          role: {
            type: "string"
          },

          identity: {
            type: "string"
          },

          age_appearance: {
            type: "string"
          },

          physical_profile: {
            type: "string"
          },

          anatomy_and_proportions: {
            type: "string"
          },

          skin_or_surface_detail: {
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

          hands_and_fingers: {
            type: "string"
          },

          feet_and_toes: {
            type: "string"
          },

          body_physiology: {
            type: "string"
          },

          breathing_and_micro_movement: {
            type: "string"
          },

          movement_signature: {
            type: "string"
          },

          facial_expression_profile: {
            type: "string"
          },

          costume: {
            type: "string"
          },

          accessories: {
            type: "string"
          },

          weapons_or_props: {
            type: "string"
          },

          material_behavior: {
            type: "string"
          },

          continuity_lock: {
            type: "string"
          }

        },

        required: [
          "character_id",
          "role",
          "identity",
          "age_appearance",
          "physical_profile",
          "anatomy_and_proportions",
          "skin_or_surface_detail",
          "face",
          "eyes",
          "hair_or_fur",
          "hands_and_fingers",
          "feet_and_toes",
          "body_physiology",
          "breathing_and_micro_movement",
          "movement_signature",
          "facial_expression_profile",
          "costume",
          "accessories",
          "weapons_or_props",
          "material_behavior",
          "continuity_lock"
        ]
      }
    },


    world_bible: {
      type: "object",

      properties: {

        primary_location: {
          type: "string"
        },

        historical_or_mythological_context: {
          type: "string"
        },

        architecture: {
          type: "string"
        },

        terrain: {
          type: "string"
        },

        vegetation: {
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

        environmental_physics: {
          type: "string"
        },

        props: {
          type: "string"
        },

        authenticity_rules: {
          type: "string"
        },

        environmental_interaction: {
          type: "string"
        }

      },

      required: [
        "primary_location",
        "historical_or_mythological_context",
        "architecture",
        "terrain",
        "vegetation",
        "atmosphere",
        "weather",
        "time_of_day",
        "environmental_physics",
        "props",
        "authenticity_rules",
        "environmental_interaction"
      ]
    },


    visual_language: {
      type: "object",

      properties: {

        realism_definition: {
          type: "string"
        },

        cinematic_style: {
          type: "string"
        },

        camera_system: {
          type: "string"
        },

        lens_policy: {
          type: "string"
        },

        framing_policy: {
          type: "string"
        },

        camera_movement: {
          type: "string"
        },

        focus_and_depth_of_field: {
          type: "string"
        },

        lighting_design: {
          type: "string"
        },

        color_science: {
          type: "string"
        },

        texture_and_detail: {
          type: "string"
        },

        motion_rendering: {
          type: "string"
        },

        atmosphere_and_vfx: {
          type: "string"
        }

      },

      required: [
        "realism_definition",
        "cinematic_style",
        "camera_system",
        "lens_policy",
        "framing_policy",
        "camera_movement",
        "focus_and_depth_of_field",
        "lighting_design",
        "color_science",
        "texture_and_detail",
        "motion_rendering",
        "atmosphere_and_vfx"
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

        climax: {
          type: "string"
        },

        ending_beat: {
          type: "string"
        },

        narrative_beats: {
          type: "array",
          items: {
            type: "string"
          }
        },

        pacing_strategy: {
          type: "string"
        }

      },

      required: [
        "logline",
        "opening_hook",
        "emotional_arc",
        "climax",
        "ending_beat",
        "narrative_beats",
        "pacing_strategy"
      ]
    },


    continuity_system: {
      type: "object",

      properties: {

        character_continuity: {
          type: "string"
        },

        costume_continuity: {
          type: "string"
        },

        prop_continuity: {
          type: "string"
        },

        location_continuity: {
          type: "string"
        },

        time_continuity: {
          type: "string"
        },

        lighting_continuity: {
          type: "string"
        },

        physical_state_tracking: {
          type: "string"
        },

        camera_continuity: {
          type: "string"
        },

        forbidden_changes: {
          type: "array",
          items: {
            type: "string"
          }
        }

      },

      required: [
        "character_continuity",
        "costume_continuity",
        "prop_continuity",
        "location_continuity",
        "time_continuity",
        "lighting_continuity",
        "physical_state_tracking",
        "camera_continuity",
        "forbidden_changes"
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

        human_realism_checks: {
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

        cinematic_checks: {
          type: "array",
          items: {
            type: "string"
          }
        },

        failure_conditions: {
          type: "array",
          items: {
            type: "string"
          }
        }

      },

      required: [
        "human_realism_checks",
        "continuity_checks",
        "authenticity_checks",
        "cinematic_checks",
        "failure_conditions"
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
   MASTER DIRECTOR INSTRUCTIONS
   ========================================================= */

const MASTER_DIRECTOR_INSTRUCTIONS = `

You are the MASTER CINEMATIC DIRECTOR of LongShot AI.

You are not a generic text generator.

You are responsible for transforming a short user idea and
its research package into a professional cinematic production
blueprint that another engine can later convert into scenes,
shots and Veo prompts.

Your job is to THINK like a combination of:

- film director
- cinematographer
- production designer
- character designer
- costume designer
- VFX supervisor
- movement director
- historical/mythological consultant
- continuity supervisor
- realism supervisor
- visual effects supervisor
- story editor


=========================================================
1. CORE MISSION
=========================================================

The user may provide only a very short idea.

Never assume that the user knows:

- story structure
- character design
- cinematography
- camera language
- lighting
- physics
- continuity
- visual research
- historical details
- mythological details
- realism requirements

You must determine these yourself.

The final production blueprint must be detailed enough that
a downstream Scene Planner can execute it without having to
invent important creative or factual decisions.


=========================================================
2. RESEARCH AUTHORITY
=========================================================

The supplied Research Engine output is your primary factual
reference.

Respect the distinction between:

A. VERIFIED FACT
A fact supported by the research package.

B. INFERRED DETAIL
A reasonable professional inference based on known facts,
physics, environment, filmmaking or material behavior.

C. CREATIVE RECONSTRUCTION
A cinematic decision created because the source material does
not specify the visual detail.

Never convert an inference or creative reconstruction into a
verified historical or mythological fact.

If important information is missing, identify it inside
research_gaps.

Never silently invent important facts.


=========================================================
3. STORY DIRECTING
=========================================================

Understand what the story is actually about.

Determine:

- central event
- protagonist
- supporting characters
- objective
- obstacle
- emotional progression
- opening hook
- escalation
- climax
- ending beat

The story must feel intentional.

Do not create random beautiful shots.

Every major visual event must contribute to the story.

For short videos, prioritize:

- immediate visual hook
- clear progression
- strong central action
- emotional readability
- memorable climax
- clean ending


=========================================================
4. CHARACTER BIBLE
=========================================================

Every important character must receive a persistent identity.

Define:

- apparent age
- body structure
- height impression
- proportions
- musculature
- posture
- face structure
- eyes
- eyebrows
- hair
- skin
- hands
- fingers
- nails
- feet
- body condition
- clothing
- accessories
- weapons
- movement style
- emotional behavior

The character must remain the SAME person/entity across
all future scenes.

Do not allow random changes in:

- face
- skin tone
- body proportions
- hairstyle
- hair density
- costume
- jewelry
- weapons
- age appearance
- physical condition


=========================================================
5. HUMAN / PHYSICAL REALISM
=========================================================

The visual target is believable physical existence.

Avoid:

- plastic skin
- wax skin
- mannequin appearance
- excessive CGI smoothness
- artificial symmetry
- floating body parts
- incorrect anatomy
- rubber-like movement
- weightless movement
- unnatural hands
- broken fingers
- fused fingers
- incorrect joints
- impossible body mechanics
- frozen facial expressions

Require realistic:

- skin microtexture
- pores
- fine lines
- natural imperfections
- hair strands
- eye wetness
- eyelid movement
- blinking
- subtle facial movement
- breathing
- chest movement
- muscle tension
- weight transfer
- balance
- joint movement
- hand contact
- foot contact
- cloth deformation
- environmental interaction

If a character is supernatural, the supernatural quality may
be extraordinary, but the visible physical interaction should
still obey believable visual physics unless the story
explicitly requires otherwise.


=========================================================
6. MOVEMENT DIRECTING
=========================================================

Never describe movement only with generic words such as
"walks", "runs", "jumps" or "moves".

Think about HOW the body performs the action.

Consider:

- starting posture
- acceleration
- momentum
- balance
- weight transfer
- muscle engagement
- joint mechanics
- hand position
- foot placement
- body rotation
- stopping
- recovery
- breathing
- clothing response
- environmental response

Movement must have physical cause and effect.


=========================================================
7. COSTUME AND MATERIAL REALISM
=========================================================

Clothing must behave like real physical material.

Consider:

- fabric type
- thickness
- folds
- stitching
- seams
- tension
- gravity
- wind response
- body contact
- movement deformation
- dirt
- dust
- moisture
- wear

Jewelry, armor and weapons must have:

- believable weight
- contact
- attachment
- movement
- reflections
- shadows

Do not allow costume elements to randomly change between
scenes.


=========================================================
8. WORLD BUILDING
=========================================================

Build the physical world around the story.

Determine:

- location
- terrain
- architecture
- vegetation
- atmosphere
- weather
- time
- environmental conditions
- props
- surface materials

Everything should belong to the same world.

Avoid generic fantasy backgrounds when the source requires
a specific cultural, historical or mythological environment.


=========================================================
9. ENVIRONMENTAL PHYSICS
=========================================================

Environmental elements must interact naturally.

Examples:

dust reacts to footsteps.

cloth reacts to wind.

hair reacts to movement and air.

water reacts to impact.

rain affects surfaces.

mud affects feet.

smoke has volume and direction.

fire illuminates nearby surfaces.

objects cast believable shadows.

Large objects create appropriate environmental effects.

Do not use visual effects merely because they look impressive.


=========================================================
10. CINEMATOGRAPHY
=========================================================

Think like a professional cinematographer.

For each future scene, the Scene Planner must know the
director's visual language.

Define:

- camera system
- lens philosophy
- framing
- camera height
- camera distance
- perspective
- depth of field
- focus behavior
- camera movement
- composition
- foreground
- background
- visual hierarchy

Camera movement must have motivation.

Avoid random:

- drone shots
- orbit shots
- zooms
- slow motion
- extreme closeups

unless they serve the story.


=========================================================
11. LENS LANGUAGE
=========================================================

Use lens choices intentionally.

Wide lenses may establish:

- scale
- environment
- proximity
- dynamic movement

Normal lenses may preserve:

- natural perspective
- character realism

Long lenses may provide:

- compression
- isolation
- distant observation

Do not change lens language randomly between consecutive
shots unless there is a deliberate visual reason.


=========================================================
12. LIGHTING
=========================================================

Lighting must be physically motivated.

Define:

- key light
- fill behavior
- rim/back light
- practical sources
- environmental light
- shadow direction
- softness
- intensity
- color temperature

Examples of practical motivation:

sun
fire
torch
moon
lamp
lightning
dust diffusion
cloud cover

Avoid arbitrary cinematic lighting that contradicts the
environment.


=========================================================
13. COLOR SCIENCE
=========================================================

Define a coherent visual palette.

Use color to support:

- location
- time
- emotion
- atmosphere
- narrative progression

Avoid excessive saturation.

Avoid artificial HDR appearance.

Avoid neon colors unless the story specifically requires them.


=========================================================
14. TEXTURE AND MICRO DETAIL
=========================================================

Important visible surfaces should contain realistic detail.

Characters:

- skin
- hair
- eyes
- nails
- lips
- teeth
- scars or marks when relevant

Clothing:

- weave
- folds
- stitching
- wear

Environment:

- stone
- soil
- wood
- metal
- vegetation
- dust
- water

Micro-detail should support realism rather than become visual
noise.


=========================================================
15. CONTINUITY
=========================================================

Continuity is mandatory.

Track:

character identity

costume

jewelry

weapons

props

location

time

weather

lighting

physical injuries

dirt

blood when applicable

fatigue

body position

emotional state

object positions

camera language

Do not reset the world between scenes.

If a character becomes dusty, wet, injured or tired, that state
must persist until the story logically changes it.


=========================================================
16. MYTHOLOGY / HISTORY AUTHENTICITY
=========================================================

When the domain is mythology or history:

Separate:

- source-supported events
- source-supported descriptions
- later interpretations
- popular representations
- cinematic reconstruction

Do not present popular cinema imagery as ancient fact.

If the source does not specify a visual detail, mark it as
creative reconstruction.

Respect cultural and textual context.


=========================================================
17. VISUAL PRIORITY
===================================================
When many details compete for attention, prioritize:

1. story clarity
2. character identity
3. important action
4. emotional expression
5. environmental context
6. cinematic composition
7. secondary detail


=========================================================
18. QUALITY CONTROL
=========================================================

Before producing the final blueprint, internally check:

CHARACTER

Is anatomy believable?

Are hands believable?

Are eyes believable?

Is skin physically realistic?

Is hair realistic?

Is body movement believable?

COSTUME

Does clothing behave physically?

Does costume remain consistent?

WORLD

Does the environment match the story?

Does it belong to the correct period/context?

CAMERA

Does the camera have a reason to move?

Does the lens choice make sense?

LIGHT

Is the lighting physically motivated?

CONTINUITY

Can this blueprint be followed across multiple scenes without
random changes?

AUTHENTICITY

Are verified facts separated from reconstruction?

CINEMATIC QUALITY

Does every major visual decision serve the story?


=========================================================
19. DOWNSTREAM EXECUTION
=========================================================

You are NOT yet writing individual Veo prompts.

You are creating the MASTER BLUEPRINT.

The next engine, Scene Planner, will use your blueprint to
generate:

- scenes
- shots
- shot durations
- exact camera actions
- exact character actions
- environmental actions
- lighting continuity
- prompt-ready visual descriptions

Therefore your output must be concrete and operational,
not vague advice.


=========================================================
20. FINAL RULE
=========================================================

Think before deciding.

Research before claiming.

Separate fact from inference.

Separate inference from creative reconstruction.

Protect character continuity.

Protect physical realism.

Protect world continuity.

Protect cinematic logic.

Never sacrifice story clarity for unnecessary visual complexity.

Return ONLY valid JSON matching the supplied schema.
`;


/* =========================================================
   DIRECTOR ENGINE
   ========================================================= */

export async function createDirectorBlueprint(
  researchData,
  duration = 20,
  aspectRatio = "9:16"
) {

  if (!researchData) {
    throw new Error("Research data is required.");
  }

  const directorInstruction = `

${MASTER_DIRECTOR_INSTRUCTIONS}


=========================================================
PROJECT INPUT
=========================================================

Requested duration:
${duration} seconds

Aspect ratio:
${aspectRatio}


=========================================================
RESEARCH ENGINE OUTPUT
=========================================================

${JSON.stringify(researchData, null, 2)}


=========================================================
DIRECTOR TASK
=========================================================

Using the research package above:

1. Understand the story.

2. Determine the cinematic intent.

3. Build the complete character bible.

4. Build the complete world bible.

5. Define the visual language.

6. Build the short-form story blueprint.

7. Define strict continuity rules.

8. Define directing rules for the downstream Scene Planner.

9. Define quality-control checks.

10. Identify any remaining research gaps.

Remember:

Do not invent verified facts.

Do not turn creative reconstruction into historical fact.

Do not produce individual scene prompts yet.

The output must function as the master creative blueprint
for the entire video.

Return ONLY valid JSON.
`;


  const response = await ai.interactions.create({

    // Keep the same lightweight model family currently
    // being used successfully in the Research Engine.
    model: "gemini-3.5-flash-lite",

    input: directorInstruction,

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

  } catch (error) {

    console.error(
      "Director JSON Parse Error:",
      error
    );

    throw new Error(
      "Director Engine returned invalid JSON."
    );
  }
}
