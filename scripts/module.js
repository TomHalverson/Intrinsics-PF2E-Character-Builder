// Intrinsic's PF2E Character Builder - Main Module Entry Point
import { CharacterStateManager } from './character-state-manager.js';
import { DataProvider } from './data-provider.js';
import { CharacterBuilderApp } from './character-builder-app.js';
import { SuggestedLanguagesConfig } from './suggested-languages-config.js';

const MODULE_ID = "intrinsics-pf2e-character-builder";

// Initialize module
Hooks.once("init", () => {
  console.log(`${MODULE_ID} | Initializing`);

  // Register module settings

  // Suggested languages setting (must register before menu)
  game.settings.register(MODULE_ID, "suggestedLanguages", {
    scope: "world",
    config: false, // Hidden - use the menu instead
    type: String,
    default: "common,taldane,dwarven,elven,goblin,gnomish,halfling,jotun,orcish",
    requiresReload: false,
    onChange: value => {
      console.log(`${MODULE_ID} | Suggested languages updated to:`, value);
    }
  });

  // Custom button for suggested languages configuration
  game.settings.registerMenu(MODULE_ID, "suggestedLanguagesMenu", {
    name: "Configure Suggested Languages",
    hint: "Select which languages should appear as suggested during character creation",
    label: "Configure Languages",
    icon: "fas fa-language",
    type: SuggestedLanguagesConfig,
    restricted: true
  });

  console.log(`${MODULE_ID} | Registered settings menu for suggested languages`);

  game.settings.register(MODULE_ID, "equipmentKitsCompendium", {
    name: "Equipment Kits Compendium",
    hint: "Select the compendium containing class equipment kits. Kits will be available for purchase during character creation.",
    scope: "world",
    config: true,
    type: String,
    default: "",
    choices: () => {
      const choices = { "": "None" };
      game.packs.forEach(pack => {
        if (pack.documentName === "Item") {
          choices[pack.collection] = pack.title;
        }
      });
      return choices;
    }
  });

  game.settings.register(MODULE_ID, "continentDescriptions", {
    name: "Continent Descriptions",
    hint: "JSON object mapping continent names to description text. Format: {\"Avistan\": \"Description here\"}",
    scope: "world",
    config: true,
    type: String,
    default: JSON.stringify({
      "Avistan": "The northern continent of the Inner Sea region, home to many diverse nations and peoples.",
      "Garund": "The southern continent of the Inner Sea region, a land of ancient mysteries and vast deserts.",
      "Tian Xia": "The far eastern continent, a land of ancient empires and diverse cultures.",
      "Arcadia": "The western continent, largely unexplored by Inner Sea peoples.",
      "Casmaron": "The eastern continent, home to vast steppes and mighty kingdoms."
    })
  });

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
