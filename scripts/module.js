// Intrinsic's PF2E Character Builder - Main Module Entry Point
import { CharacterStateManager } from './character-state-manager.js';
import { DataProvider } from './data-provider.js';
import { CharacterBuilderApp } from './character-builder-app.js';

const MODULE_ID = "intrinsics-pf2e-character-builder";

// Initialize module
Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);
  console.log(`${MODULE_ID} | Initialization complete`);
});

// Module ready
Hooks.once("ready", () => {
  console.log(`${MODULE_ID} | Ready`);

  // Create global namespace
  game.characterBuilder = {
    dataProvider: new DataProvider(),
    stateManager: new CharacterStateManager(),
    currentApp: null
  };

  // Expose public API
  const moduleData = game.modules.get(MODULE_ID);
  if (moduleData) {
    moduleData.api = {
      openBuilder: (actor = null) => {
        // Close existing app if open
        if (game.characterBuilder.currentApp) {
          game.characterBuilder.currentApp.close();
        }

        // Reset state manager
        game.characterBuilder.stateManager.reset(actor);

        // Open new builder app
        game.characterBuilder.currentApp = new CharacterBuilderApp();
        game.characterBuilder.currentApp.render(true);
      }
    };
  }

  console.log(`${MODULE_ID} | Module loaded successfully`);
});

// Add button to actor sheet header
Hooks.on("getActorSheetHeaderButtons", (sheet, buttons) => {
  if (sheet.actor.type !== "character") return;

  buttons.unshift({
    label: "Character Builder",
    class: "character-builder-button",
    icon: "fas fa-user-plus",
    onclick: () => {
      const api = game.modules.get(MODULE_ID)?.api;
      if (api) {
        api.openBuilder(sheet.actor);
      }
    }
  });
});

// Add toolbar button for creating new characters
Hooks.on("getSceneControlButtons", (controls) => {
  const tokenControls = controls.find(c => c.name === "token");
  if (!tokenControls) return;

  tokenControls.tools.push({
    name: "character-builder",
    title: "Character Builder",
    icon: "fas fa-user-plus",
    button: true,
    onClick: () => {
      const api = game.modules.get(MODULE_ID)?.api;
      if (api) {
        api.openBuilder();
      }
    }
  });
});
