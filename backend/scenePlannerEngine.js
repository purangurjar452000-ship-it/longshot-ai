import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/* =========================================================
   LONGSHOT AI — SCENE PLANNER ENGINE V1
   Director Blueprint → Shot Plan → Validator → Correction
========================================================= */

const scenePlanSchema = {
  type: "object",
  properties: {
    project: {
      type: "object",
      properties: {
        title: { type: "string" },
        duration_seconds: { type: "number" },
        aspect_ratio: { type: "string" },
        planning_strategy: { type: "string" }
      },
      required: ["title", "duration_seconds", "aspect_ratio", "planning_strategy"]
    },
    continuity_locks: {
      type: "array",
      items: { type: "string" }
    },
    shots: {
      type: "array",
      items: {
        type: "object",
        properties: {
          shot_id: { type: "string" },
          beat_number: { type: "number" },
          start_time: { type: "number" },
          end_time: { type: "number" },
          duration_seconds: { type: "number" },
          location: { type: "string" },
          characters: { type: "array", items: { type: "string" } },
          story_purpose: { type: "string" },
          character_action: { type: "string" },
          blocking: { type: "string" },
          camera: {
            type: "object",
            properties: {
              shot_size: { type: "string" },
              angle: { type: "string" },
              height: { type: "string" },
              lens: { type: "string" },
              movement: { type: "string" },
              focus: { type: "string" }
            },
            required: ["shot_size", "angle", "height", "lens", "movement", "focus"]
          },
          lighting: { type: "string" },
          environment_action: { type: "string" },
          continuity_requirements: { type: "array", items: { type: "string" } },
          visual_prompt: { type: "string" },
          negative_prompt: { type: "string" },
          audio: {
            type: "object",
            properties: {
              dialogue_or_voiceover: { type: "string" },
              ambience: { type: "string" },
              sound_effects: { type: "string" },
              music_direction: { type: "string" }
            },
            required: ["dialogue_or_voiceover", "ambience", "sound_effects", "music_direction"]
          },
          transition_to_next: { type: "string" },
          evidence_ids: { type: "array", items: { type: "string" } }
        },
        required: [
          "shot_id", "beat_number", "start_time", "end_time", "duration_seconds",
          "location", "characters", "story_purpose", "character_action", "blocking",
          "camera", "lighting", "environment_action", "continuity_requirements",
          "visual_prompt", "negative_prompt", "audio", "transition_to_next", "evidence_ids"
        ]
      }
    },
    quality_control: {
      type: "object",
      properties: {
        checks: { type: "array", items: { type: "string" } },
        forbidden_errors: { type: "array", items: { type: "string" } }
      },
      required: ["checks", "forbidden_errors"]
    }
  },
  required: ["project", "continuity_locks", "shots", "quality_control"]
};

function collectEvidenceIds(value) {
  const ids = new Set();
  function walk(item) {
    if (!item) return;
    if (Array.isArray(item)) return item.forEach(walk);
    if (typeof item !== "object") return;
    for (const [key, child] of Object.entries(item)) {
      if (key === "evidence_ids" && Array.isArray(child)) {
        child.filter(id => typeof id === "string").forEach(id => ids.add(id));
      }
      walk(child);
    }
  }
  walk(value);
  return [...ids];
}

function validEvidenceIds(directorBlueprint) {
  const policy = directorBlueprint?.evidence_policy || {};
  return new Set([
    ...(policy.locked_facts || []).map(item => item.evidence_id),
    ...(directorBlueprint?.evidence_policy?.creative_reconstructions || [])
      .map(item => typeof item === "string" ? item.split(":")[0] : item.evidence_id),
    ...(directorBlueprint?.evidence_policy?.visual_research_notes || [])
      .map(item => typeof item === "string" ? item.split(":")[0] : item.evidence_id)
  ].filter(Boolean));
}

function validateScenePlan(plan, directorBlueprint, duration, aspectRatio) {
  const errors = [];
  if (!plan || typeof plan !== "object") return { passed: false, errors: ["Scene plan is missing or invalid."] };
  if (plan.project?.duration_seconds !== duration) errors.push(`Duration mismatch. Expected ${duration}.`);
  if (plan.project?.aspect_ratio !== aspectRatio) errors.push(`Aspect ratio mismatch. Expected ${aspectRatio}.`);

  const shots = Array.isArray(plan.shots) ? plan.shots : [];
  if (!shots.length) errors.push("Scene plan contains no shots.");

  let previousEnd = 0;
  let total = 0;
  for (const shot of shots) {
    const start = Number(shot.start_time);
    const end = Number(shot.end_time);
    const shotDuration = Number(shot.duration_seconds);
    if (![start, end, shotDuration].every(Number.isFinite)) {
      errors.push(`Invalid timing in ${shot.shot_id || "unknown shot"}.`);
      continue;
    }
    if (Math.abs(start - previousEnd) > 0.01) errors.push(`Shot gap/overlap at ${shot.shot_id}.`);
    if (end <= start || Math.abs((end - start) - shotDuration) > 0.01) errors.push(`Invalid duration in ${shot.shot_id}.`);
    if (!shot.visual_prompt || !shot.negative_prompt) errors.push(`Missing visual prompts in ${shot.shot_id}.`);
    if (!shot.camera?.movement || !shot.camera?.lens) errors.push(`Incomplete camera plan in ${shot.shot_id}.`);
    if (!shot.audio?.ambience || !shot.audio?.sound_effects) errors.push(`Incomplete audio plan in ${shot.shot_id}.`);
    previousEnd = end;
    total += shotDuration;
  }
  if (Math.abs(total - duration) > 0.01) errors.push(`Shot durations total ${total}, expected ${duration}.`);
  if (Math.abs(previousEnd - duration) > 0.01) errors.push(`Scene plan does not end at ${duration} seconds.`);

  const validIds = validEvidenceIds(directorBlueprint);
  for (const id of collectEvidenceIds(plan)) {
    if (validIds.size && !validIds.has(id)) errors.push(`Unknown evidence ID used: ${id}.`);
  }
  return { passed: errors.length === 0, errors };
}

function plannerInstructions(duration, aspectRatio) {
  return `
You are the EXPERT SCENE PLANNER for LongShot AI.

Convert the supplied Director Blueprint into a production-ready shot plan.
The requested duration is exactly ${duration} seconds and the aspect ratio is ${aspectRatio}.

Rules:
- Preserve every locked character, object, event and location name exactly.
- Never replace Dronagiri with Gandhamadana when Dronagiri is locked.
- Preserve the fact that Hanuman cannot identify the individual herbs and lifts the entire mountain.
- Use only evidence IDs supplied by the Director Blueprint.
- Every shot must have exact continuous timing from 0 to ${duration} seconds.
- Use the same character appearance, costume, injury, location geometry, lighting and weather across shots.
- Camera movement must have narrative purpose and physically plausible blocking.
- Separate capture system from visual emulation.
- Include image/video prompt, negative prompt, audio plan and transition for every shot.
- Do not mark creative visual details as verified facts.
- Do not add dialogue unless the blueprint supports it; use silence or ambience when appropriate.

Create enough shots to cover the story at this duration. Do not simply stretch a shorter version.
Return ONLY valid JSON matching the supplied schema.
`;
}

async function generatePlan(input, schema) {
  const response = await ai.interactions.create({
    model: "gemini-3.5-flash-lite",
    input,
    response_format: { type: "text", mime_type: "application/json", schema }
  });
  if (!response.output_text) throw new Error("Scene Planner returned empty output.");
  try { return JSON.parse(response.output_text); }
  catch { throw new Error("Scene Planner returned invalid JSON."); }
}

async function correctPlan(plan, validation, directorBlueprint, duration, aspectRatio) {
  const input = `${plannerInstructions(duration, aspectRatio)}

CORRECTION MODE: Correct ONLY these validation errors:
${JSON.stringify(validation.errors, null, 2)}

CURRENT SCENE PLAN:
${JSON.stringify(plan, null, 2)}

DIRECTOR BLUEPRINT:
${JSON.stringify(directorBlueprint, null, 2)}

Return the corrected JSON only.`;
  return generatePlan(input, scenePlanSchema);
}

export async function createScenePlan(directorBlueprint, duration = 20, aspectRatio = "9:16") {
  if (!directorBlueprint || typeof directorBlueprint !== "object") {
    throw new Error("Director Blueprint is required.");
  }

  const input = `${plannerInstructions(duration, aspectRatio)}

DIRECTOR BLUEPRINT:
${JSON.stringify(directorBlueprint, null, 2)}`;

  let plan = await generatePlan(input, scenePlanSchema);
  let validation = validateScenePlan(plan, directorBlueprint, duration, aspectRatio);

  if (!validation.passed) {
    plan = await correctPlan(plan, validation, directorBlueprint, duration, aspectRatio);
    validation = validateScenePlan(plan, directorBlueprint, duration, aspectRatio);
  }

  if (!validation.passed) {
    throw new Error(`Scene Plan failed validation after auto-correction: ${validation.errors.join(" | ")}`);
  }

  plan._longshot_scene_validation = {
    validator_version: "V1",
    passed: true,
    validated_duration: duration,
    validated_aspect_ratio: aspectRatio,
    shot_count: plan.shots.length
  };
  return plan;
}

