// System Configuration - Abstracts differences between PF2E and Starfinder 2E (SF2E)
// Both systems share the same underlying engine but use different compendiums

const MODULE_ID = "intrinsics-pf2e-character-builder";

/**
 * Get the active game system ID (e.g., 'pf2e', 'sf2e')
 */
export function getSystemId() {
  return game.system.id;
}

/**
 * Check if the active system is Pathfinder 2E
 */
export function isPF2E() {
  return game.system.id === 'pf2e';
}

/**
 * Get a human-readable label for the active system
 */
export function getSystemLabel() {
  if (isPF2E()) return 'Pathfinder 2E';
  return game.system.title || 'Starfinder 2E';
}

/**
 * Get the short system abbreviation for UI display
 */
export function getSystemAbbrev() {
  if (isPF2E()) return 'PF2E';
  return game.system.id.toUpperCase();
}

/**
 * Get a compendium pack collection ID for the active system.
 * Handles naming differences between PF2E and SF2E compendiums.
 * PF2E uses 'feats-srd', 'spells-srd', 'equipment-srd' while SF2E uses 'feats', 'spells', 'equipment'.
 * @param {string} packName - The canonical pack name, e.g., 'ancestries', 'classes', 'feats-srd'
 * @returns {string} Full pack ID like 'pf2e.feats-srd' or 'sf2e.feats'
 */
export function getPackId(packName) {
  const systemId = game.system.id;

  // Pack name mapping: canonical name → system-specific name
  // PF2E uses '-srd' suffixed names; SF2E drops the suffix
  if (!isPF2E()) {
    const sf2eNameMap = {
      'feats-srd': 'feats',
      'spells-srd': 'spells',
      'equipment-srd': 'equipment',
      'classfeatures': 'class-features'
    };
    packName = sf2eNameMap[packName] || packName;
  }

  return `${systemId}.${packName}`;
}

/**
 * Get the system's game API object (e.g., game.pf2e or game.sf2e)
 */
export function getSystemAPI() {
  return game[game.system.id];
}

/**
 * Safely get a system-level setting
 * @param {string} key - The setting key (e.g., 'homebrew.languageRarities')
 * @returns {*} The setting value, or undefined if not found
 */
export function getSystemSetting(key) {
  try {
    return game.settings.get(game.system.id, key);
  } catch (e) {
    console.warn(`${MODULE_ID} | Could not get system setting '${key}':`, e);
    return undefined;
  }
}

/**
 * Get language localization key for a language slug
 * @param {string} slug - The language slug
 * @returns {string} The localization key
 */
export function getLanguageLocKey(slug) {
  const prefix = isPF2E() ? 'PF2E' : getSystemAbbrev();
  return `${prefix}.Language.${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
}

/**
 * Get the gold piece treasure icon path for the active system
 */
export function getGoldPieceIcon() {
  return `systems/${game.system.id}/icons/equipment/treasure/currency/gold-pieces.webp`;
}

/**
 * Get default continent/region descriptions based on the active system
 */
export function getDefaultContinentDescriptions() {
  if (isPF2E()) {
    return {
      "Avistan": "The northern continent of the Inner Sea region, home to many diverse nations and peoples.",
      "Garund": "The southern continent of the Inner Sea region, a land of ancient mysteries and vast deserts.",
      "Tian Xia": "The far eastern continent, a land of ancient empires and diverse cultures.",
      "Arcadia": "The western continent, largely unexplored by Inner Sea peoples.",
      "Casmaron": "The eastern continent, home to vast steppes and mighty kingdoms."
    };
  }
  // Starfinder 2E regions
  return {
    "Pact Worlds": "The core worlds of the Pact, centered around Absalom Station and the sun.",
    "Near Space": "The region of space closest to the Pact Worlds, containing many explored star systems.",
    "The Vast": "The vast unexplored regions of space beyond Near Space.",
    "Veskarium": "The militaristic empire of the vesk people."
  };
}

/**
 * Get default suggested languages based on the active system
 */
export function getDefaultSuggestedLanguages() {
  if (isPF2E()) {
    return "common,taldane,dwarven,elven,goblin,gnomish,halfling,jotun,orcish";
  }
  // Starfinder 2E common languages
  return "common,vesk,kasatha,shirren,ysoki,android,lashunta";
}
