export function createScenePlan(prompt, duration) {
  const sceneCount =
    duration === 20 ? 4 :
    duration === 25 ? 5 :
    6;

  const scenes = [];

  for (let i = 1; i <= sceneCount; i++) {
    scenes.push({
      scene: i,
      duration: i === sceneCount ? 5 : 5,
      prompt: `${prompt}

Create Scene ${i} as part of one continuous cinematic story.

Maintain strict continuity with previous scenes:
- same main character appearance
- same clothing
- same environment
- same time of day
- same visual style
- consistent lighting
- realistic cinematic camera movement

Scene ${i} must naturally continue from the previous scene and lead into the next scene.

Do not restart the story.
Do not randomly change the character, location or visual style.`
    });
  }

  return scenes;
}
