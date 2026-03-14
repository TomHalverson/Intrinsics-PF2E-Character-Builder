// Data Provider - Loads and caches compendium data (supports PF2E and SF2E)
import { getPackId, getSystemId, getSystemSetting } from './system-config.js';

/**
 * Helper: Get a compendium pack by canonical name with fallback label search.
 * First tries the mapped pack ID, then searches by label if not found.
 * @param {string} canonicalName - e.g., 'feats-srd', 'classes'
 * @param {string} labelHint - A label to search for as fallback, e.g., 'Feats'
 * @returns {CompendiumCollection|null}
 */
function findPack(canonicalName, labelHint) {
  const packId = getPackId(canonicalName);
  let pack = game.packs.get(packId);
  if (pack) return pack;

  // Fallback: search by label (case-insensitive)
  if (labelHint) {
    const lowerHint = labelHint.toLowerCase();
    pack = game.packs.find(p =>
      p.metadata.label.toLowerCase() === lowerHint &&
      p.metadata.packageName === game.system.id
    );
    if (pack) {
      console.log(`intrinsics-pf2e-character-builder | Pack '${packId}' not found, but found '${pack.collection}' by label '${labelHint}'`);
      return pack;
    }
  }

  console.warn(`intrinsics-pf2e-character-builder | Pack '${packId}' not found (label hint: '${labelHint}')`);
  return null;
}

export class DataProvider {
  constructor() {
    this.cache = {
      ancestries: null,
      heritages: null,
      backgrounds: null,
      classes: null,
      feats: null,
      spells: null,
      classFeatures: null,
      deities: null
    };
    this.loading = new Map(); // Track in-progress loads
  }

  // Get ancestries (common and uncommon only)
  async getAncestries() {
    if (this.cache.ancestries) return this.cache.ancestries;
    if (this.loading.has('ancestries')) return this.loading.get('ancestries');

    const promise = this._loadAncestries();
    this.loading.set('ancestries', promise);
    try {
      this.cache.ancestries = await promise;
      return this.cache.ancestries;
    } finally {
      this.loading.delete('ancestries');
    }
  }

  async _loadAncestries() {
    console.log("intrinsics-pf2e-character-builder | Loading ancestries...");

    // Try multiple pack ID formats
    const ancestriesPackId = getPackId("ancestries");
    let pack = game.packs.get(ancestriesPackId);

    if (!pack) {
      console.warn(`intrinsics-pf2e-character-builder | Pack not found with ID '${ancestriesPackId}', searching...`);

      // Search for the pack by metadata
      pack = game.packs.find(p => {
        console.log(`intrinsics-pf2e-character-builder | Checking pack: ${p.metadata.id} (${p.metadata.label})`);
        return p.metadata.id === ancestriesPackId ||
               p.metadata.label === "Ancestries" ||
               p.collection === ancestriesPackId;
      });
    }

    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} ancestries pack not found!`);
      console.log("intrinsics-pf2e-character-builder | Available packs:");
      game.packs.forEach(p => {
        console.log(`  - ${p.metadata.id} | ${p.metadata.label} | ${p.collection} | ${p.metadata.type}`);
      });
      return [];
    }

    console.log(`intrinsics-pf2e-character-builder | Found pack: ${pack.metadata.id} (${pack.metadata.label})`);
    console.log("intrinsics-pf2e-character-builder | Loading documents...");

    const documents = await pack.getDocuments();
    console.log(`intrinsics-pf2e-character-builder | Loaded ${documents.length} documents`);

    if (documents.length > 0) {
      console.log("intrinsics-pf2e-character-builder | Sample document:", documents[0]);
      console.log("intrinsics-pf2e-character-builder | Checking rarity locations:");
      console.log("  - doc.system.rarity:", documents[0].system?.rarity);
      console.log("  - doc.system.traits.rarity:", documents[0].system?.traits?.rarity);
      console.log("  - doc.rarity:", documents[0].rarity);
    }

    // Include all ancestries, sort by rarity then name
    const filtered = documents
      .filter(doc => {
        // Check multiple possible locations for rarity
        const rarity = doc.system?.traits?.rarity || doc.system?.rarity || doc.rarity;
        return rarity === 'common' || rarity === 'uncommon' || rarity === 'rare';
      })
      .sort((a, b) => {
        const rarityA = a.system?.traits?.rarity || a.system?.rarity || a.rarity;
        const rarityB = b.system?.traits?.rarity || b.system?.rarity || b.rarity;

        // Sort order: common, uncommon, rare
        const rarityOrder = { 'common': 0, 'uncommon': 1, 'rare': 2 };
        const orderDiff = rarityOrder[rarityA] - rarityOrder[rarityB];

        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });

    console.log(`intrinsics-pf2e-character-builder | Loaded ${filtered.length} ancestries (common/uncommon/rare)`);
    if (filtered.length > 0) {
      console.log("intrinsics-pf2e-character-builder | Ancestries:", filtered.map(a => a.name).join(', '));
    }

    return filtered;
  }

  // Get heritages (optionally filtered by ancestry)
  async getHeritages(ancestrySlug = null) {
    if (!this.cache.heritages) {
      if (this.loading.has('heritages')) {
        await this.loading.get('heritages');
      } else {
        const promise = this._loadHeritages();
        this.loading.set('heritages', promise);
        try {
          this.cache.heritages = await promise;
        } finally {
          this.loading.delete('heritages');
        }
      }
    }

    if (ancestrySlug) {
      // Return ancestry-specific heritages + versatile heritages (those without an ancestry)
      const ancestrySpecific = this.cache.heritages.filter(h =>
        h.system.ancestry?.slug === ancestrySlug
      );
      const versatile = this.cache.heritages.filter(h =>
        !h.system.ancestry || h.system.ancestry.slug === null
      );

      return {
        specific: ancestrySpecific,
        versatile: versatile
      };
    }

    return this.cache.heritages;
  }

  async _loadHeritages() {
    const pack = findPack("heritages", "Heritages");
    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} heritages pack not found`);
      return [];
    }

    const documents = await pack.getDocuments();
    return documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get backgrounds
  async getBackgrounds() {
    if (this.cache.backgrounds) return this.cache.backgrounds;
    if (this.loading.has('backgrounds')) return this.loading.get('backgrounds');

    const promise = this._loadBackgrounds();
    this.loading.set('backgrounds', promise);
    try {
      this.cache.backgrounds = await promise;
      return this.cache.backgrounds;
    } finally {
      this.loading.delete('backgrounds');
    }
  }

  async _loadBackgrounds() {
    const pack = findPack("backgrounds", "Backgrounds");
    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} backgrounds pack not found`);
      return [];
    }

    const documents = await pack.getDocuments();

    // Include all backgrounds (common, uncommon, and rare), sort by rarity then name
    return documents
      .filter(doc => {
        const rarity = doc.system?.traits?.rarity || doc.system?.rarity || doc.rarity;
        return rarity === 'common' || rarity === 'uncommon' || rarity === 'rare';
      })
      .sort((a, b) => {
        const rarityA = a.system?.traits?.rarity || a.system?.rarity || a.rarity;
        const rarityB = b.system?.traits?.rarity || b.system?.rarity || b.rarity;

        // Sort order: common, uncommon, rare
        const rarityOrder = { 'common': 0, 'uncommon': 1, 'rare': 2 };
        const orderDiff = rarityOrder[rarityA] - rarityOrder[rarityB];

        if (orderDiff !== 0) return orderDiff;
        return a.name.localeCompare(b.name);
      });
  }

  // Get classes
  async getClasses() {
    if (this.cache.classes) return this.cache.classes;
    if (this.loading.has('classes')) return this.loading.get('classes');

    const promise = this._loadClasses();
    this.loading.set('classes', promise);
    try {
      this.cache.classes = await promise;
      return this.cache.classes;
    } finally {
      this.loading.delete('classes');
    }
  }

  async _loadClasses() {
    const pack = findPack("classes", "Classes");
    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} classes pack not found`);
      return [];
    }

    const documents = await pack.getDocuments();

    // Load playtest classes if available
    const playtestPack = game.packs.get("pf2e-playtest-data.impossible-playtest-classes");
    if (playtestPack) {
      console.log("intrinsics-pf2e-character-builder | Loading playtest classes...");
      const playtestDocs = await playtestPack.getDocuments();

      // Wrap playtest classes to provide slug property
      const wrappedPlaytest = playtestDocs.map(doc => {
        // If slug is missing, create a wrapper with a computed slug
        if (!doc.slug || doc.slug === null) {
          const generatedSlug = doc.name.toLowerCase().replace(/\s+/g, '-');
          console.log(`intrinsics-pf2e-character-builder | Generated slug for ${doc.name}: ${generatedSlug}`);

          // Create a proxy that returns the generated slug
          return new Proxy(doc, {
            get(target, prop) {
              if (prop === 'slug') return generatedSlug;
              return target[prop];
            }
          });
        }
        return doc;
      });

      documents.push(...wrappedPlaytest);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${playtestDocs.length} playtest classes`);
    }

    // Load RR playtest classes (Daredevil, Slayer) if available
    const rrPlaytestPack = game.packs.get("pf2e-playtest-data.rr-playtest-classes");
    if (rrPlaytestPack) {
      console.log("intrinsics-pf2e-character-builder | Loading RR playtest classes...");
      const rrPlaytestDocs = await rrPlaytestPack.getDocuments();

      // Wrap playtest classes to provide slug property
      const wrappedRRPlaytest = rrPlaytestDocs.map(doc => {
        if (!doc.slug || doc.slug === null) {
          const generatedSlug = doc.name.toLowerCase().replace(/\s+/g, '-');
          console.log(`intrinsics-pf2e-character-builder | Generated slug for ${doc.name}: ${generatedSlug}`);

          return new Proxy(doc, {
            get(target, prop) {
              if (prop === 'slug') return generatedSlug;
              return target[prop];
            }
          });
        }
        return doc;
      });

      documents.push(...wrappedRRPlaytest);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${rrPlaytestDocs.length} RR playtest classes`);
    }

    // Load SF2E playtest classes (Mechanic, Technomancer) if available
    const sf2ePlaytestPack = game.packs.get("starfinder-field-test-for-pf2e.sf2e-classes");
    if (sf2ePlaytestPack) {
      console.log("intrinsics-pf2e-character-builder | Loading SF2E playtest classes...");
      const sf2ePlaytestDocs = await sf2ePlaytestPack.getDocuments();

      const wrappedSF2EPlaytest = sf2ePlaytestDocs.map(doc => {
        if (!doc.slug || doc.slug === null) {
          const generatedSlug = doc.name.toLowerCase().replace(/\s+/g, '-');
          console.log(`intrinsics-pf2e-character-builder | Generated slug for ${doc.name}: ${generatedSlug}`);
          return new Proxy(doc, {
            get(target, prop) {
              if (prop === 'slug') return generatedSlug;
              return target[prop];
            }
          });
        }
        return doc;
      });

      // Only add classes that aren't already loaded from the core system packs
      const existingSlugs = new Set(documents.map(d => d.slug));
      const newClasses = wrappedSF2EPlaytest.filter(d => !existingSlugs.has(d.slug));
      documents.push(...newClasses);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${newClasses.length} SF2E playtest classes (${sf2ePlaytestDocs.length} total in pack)`);
    }

    return documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get feats with optional filters
  async getFeats(filters = {}) {
    if (!this.cache.feats) {
      if (this.loading.has('feats')) {
        await this.loading.get('feats');
      } else {
        const promise = this._loadFeats();
        this.loading.set('feats', promise);
        try {
          this.cache.feats = await promise;
        } finally {
          this.loading.delete('feats');
        }
      }
    }

    return this._filterFeats(this.cache.feats, filters);
  }

  async _loadFeats() {
    const allFeats = [];

    // Load standard feats
    const pack = findPack("feats-srd", "Feats");
    if (pack) {
      const documents = await pack.getDocuments();
      allFeats.push(...documents);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${documents.length} standard feats`);
    } else {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} feats pack not found`);
    }

    // Load playtest class feats
    const playtestPack = game.packs.get("pf2e-playtest-data.impossible-playtest-class-feats");
    if (playtestPack) {
      const playtestDocs = await playtestPack.getDocuments();
      allFeats.push(...playtestDocs);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${playtestDocs.length} playtest class feats`);
    } else {
      console.warn("intrinsics-pf2e-character-builder | Playtest class feats pack not found");
    }

    // Load RR playtest class features (Daredevil, Slayer)
    const rrPlaytestPack = game.packs.get("pf2e-playtest-data.rr-playtest-class-features");
    if (rrPlaytestPack) {
      const rrPlaytestDocs = await rrPlaytestPack.getDocuments();
      allFeats.push(...rrPlaytestDocs);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${rrPlaytestDocs.length} RR playtest class feats`);
    } else {
      console.warn("intrinsics-pf2e-character-builder | RR playtest class feats pack not found");
    }

    // Load SF2E playtest feats (Mechanic, Technomancer) if available
    let sf2eFeatsPack = game.packs.get("starfinder-field-test-for-pf2e.sf2e-feats");
    if (!sf2eFeatsPack) {
      // Fallback: search for SF2E feats pack by module name
      sf2eFeatsPack = game.packs.find(p =>
        p.metadata.packageName === 'starfinder-field-test-for-pf2e' &&
        (p.metadata.name === 'sf2e-feats' || p.metadata.label.toLowerCase().includes('feat'))
      );
      if (sf2eFeatsPack) {
        console.log(`intrinsics-pf2e-character-builder | Found SF2E feats pack via fallback search: ${sf2eFeatsPack.collection}`);
      }
    }
    if (sf2eFeatsPack) {
      const sf2ePlaytestDocs = await sf2eFeatsPack.getDocuments();
      allFeats.push(...sf2ePlaytestDocs);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${sf2ePlaytestDocs.length} SF2E playtest feats`);
      // Debug: log feat categories to help diagnose filtering issues
      if (sf2ePlaytestDocs.length > 0) {
        const categories = [...new Set(sf2ePlaytestDocs.map(f => f.system?.category))];
        console.log(`intrinsics-pf2e-character-builder | SF2E feat categories found: ${JSON.stringify(categories)}`);
        const sample = sf2ePlaytestDocs[0];
        console.log(`intrinsics-pf2e-character-builder | SF2E sample feat:`, {
          name: sample.name, type: sample.type, category: sample.system?.category,
          level: sample.system?.level?.value, traits: sample.system?.traits?.value
        });
      }
    } else {
      console.warn("intrinsics-pf2e-character-builder | SF2E playtest feats pack not found (starfinder-field-test-for-pf2e.sf2e-feats)");
    }

    return allFeats;
  }

  _filterFeats(feats, filters) {
    return feats.filter(feat => {
      // Level filter
      if (filters.level !== undefined && feat.system.level?.value !== filters.level) {
        return false;
      }

      // Category filter (ancestry, class, general, skill)
      if (filters.category && feat.system.category !== filters.category) {
        return false;
      }

      // Traits filter (must have all specified traits)
      if (filters.traits && filters.traits.length > 0) {
        const featTraits = feat.system.traits?.value || [];
        if (!filters.traits.every(t => featTraits.includes(t))) {
          return false;
        }
      }

      // Ancestry filter (for ancestry feats)
      if (filters.ancestry) {
        const featTraits = feat.system.traits?.value || [];
        if (!featTraits.includes(filters.ancestry)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get spells with optional filters
  async getSpells(filters = {}) {
    if (!this.cache.spells) {
      if (this.loading.has('spells')) {
        await this.loading.get('spells');
      } else {
        const promise = this._loadSpells();
        this.loading.set('spells', promise);
        try {
          this.cache.spells = await promise;
        } finally {
          this.loading.delete('spells');
        }
      }
    }

    return this._filterSpells(this.cache.spells, filters);
  }

  async _loadSpells() {
    const pack = findPack("spells-srd", "Spells");
    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} spells pack not found`);
      return [];
    }

    const documents = await pack.getDocuments();
    return documents;
  }

  _filterSpells(spells, filters) {
    console.log('intrinsics-pf2e-character-builder | _filterSpells called with filters:', filters);
    console.log('intrinsics-pf2e-character-builder | Total spells to filter:', spells.length);

    const filtered = spells.filter(spell => {
      const traits = spell.system.traits?.value || [];
      const isCantrip = traits.includes('cantrip');

      // Special handling for cantrips (level 0 means we want cantrips)
      if (filters.level === 0) {
        // Looking for cantrips - must have cantrip trait
        if (!isCantrip) {
          return false;
        }
      } else if (filters.level !== undefined) {
        // Looking for leveled spells - must match level AND not be a cantrip
        if (spell.system.level?.value !== filters.level || isCantrip) {
          return false;
        }
      }

      // Tradition filter
      if (filters.tradition) {
        const traditions = spell.system.traits?.traditions || [];
        if (!traditions.includes(filters.tradition)) {
          return false;
        }
      }

      // Category filter for focus spells
      if (filters.category === 'focus' && spell.system.category !== 'focus') {
        return false;
      }

      // Rarity filter
      if (filters.rarity) {
        const rarity = spell.system.traits?.rarity || 'common';
        if (rarity !== filters.rarity) {
          return false;
        }
      }

      return true;
    });

    console.log('intrinsics-pf2e-character-builder | Filtered spells:', filtered.length);
    if (filtered.length > 0) {
      const sample = filtered[0];
      console.log('intrinsics-pf2e-character-builder | Sample spell:', sample.name);
      console.log('intrinsics-pf2e-character-builder | - traditions:', sample.system.traits?.traditions);
      console.log('intrinsics-pf2e-character-builder | - traits:', sample.system.traits?.value);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get deities
  async getDeities() {
    if (this.cache.deities) return this.cache.deities;
    if (this.loading.has('deities')) return this.loading.get('deities');

    const promise = this._loadDeities();
    this.loading.set('deities', promise);
    try {
      this.cache.deities = await promise;
      return this.cache.deities;
    } finally {
      this.loading.delete('deities');
    }
  }

  async _loadDeities() {
    const pack = findPack("deities", "Deities");
    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} deities pack not found`);
      return [];
    }

    const documents = await pack.getDocuments();
    return documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get class features
  async getClassFeatures(classSlug) {
    if (!this.cache.classFeatures) {
      if (this.loading.has('classFeatures')) {
        await this.loading.get('classFeatures');
      } else {
        const promise = this._loadClassFeatures();
        this.loading.set('classFeatures', promise);
        try {
          this.cache.classFeatures = await promise;
        } finally {
          this.loading.delete('classFeatures');
        }
      }
    }

    // Filter by class
    return this.cache.classFeatures.filter(feature => {
      const traits = feature.system.traits?.value || [];
      return traits.includes(classSlug);
    });
  }

  async _loadClassFeatures() {
    const allFeatures = [];

    const pack = findPack("classfeatures", "Class Features");
    if (pack) {
      const documents = await pack.getDocuments();
      allFeatures.push(...documents);
    } else {
      console.error(`intrinsics-pf2e-character-builder | ${getSystemId()} class features pack not found`);
    }

    // Also load SF2E playtest class features from sf2e-feats pack
    let sf2eFeatsPack = game.packs.get("starfinder-field-test-for-pf2e.sf2e-feats");
    if (!sf2eFeatsPack) {
      sf2eFeatsPack = game.packs.find(p =>
        p.metadata.packageName === 'starfinder-field-test-for-pf2e' &&
        (p.metadata.name === 'sf2e-feats' || p.metadata.label.toLowerCase().includes('feat'))
      );
    }
    if (sf2eFeatsPack) {
      const sf2eDocs = await sf2eFeatsPack.getDocuments();
      const sf2eFeatures = sf2eDocs.filter(d => d.system?.category === 'classfeature');
      allFeatures.push(...sf2eFeatures);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${sf2eFeatures.length} SF2E class features from sf2e-feats pack`);
    }

    return allFeatures;
  }

  // Get equipment kits from configured compendium
  async getEquipmentKits() {
    const MODULE_ID = "intrinsics-pf2e-character-builder";
    const compendiumId = game.settings.get(MODULE_ID, "equipmentKitsCompendium");

    if (!compendiumId) {
      console.log("intrinsics-pf2e-character-builder | No equipment kits compendium configured");
      return [];
    }

    const pack = game.packs.get(compendiumId);
    if (!pack) {
      console.error(`intrinsics-pf2e-character-builder | Equipment kits compendium not found: ${compendiumId}`);
      return [];
    }

    const documents = await pack.getDocuments();
    console.log(`intrinsics-pf2e-character-builder | Found ${documents.length} equipment kits`);
    return documents.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Check if Mythic variant rules are enabled
  isMythicEnabled() {
    try {
      const systemId = getSystemId();
      const settings = game.settings.settings;
      if (settings.has(`${systemId}.mythic`)) {
        return game.settings.get(systemId, 'mythic') === 'enabled';
      }
      return false;
    } catch (e) {
      console.log("intrinsics-pf2e-character-builder | Could not check mythic setting:", e);
      return false;
    }
  }

  // Get Mythic Callings (level 1 mythic feats from classfeatures)
  async getMythicCallings() {
    // Load class features if not already loaded
    if (!this.cache.classFeatures) {
      if (this.loading.has('classFeatures')) {
        await this.loading.get('classFeatures');
      } else {
        const promise = this._loadClassFeatures();
        this.loading.set('classFeatures', promise);
        try {
          this.cache.classFeatures = await promise;
        } finally {
          this.loading.delete('classFeatures');
        }
      }
    }

    // Filter for mythic traits at level 1
    const mythicFeats = this.cache.classFeatures.filter(feature => {
      const traits = feature.system?.traits?.value || [];
      const level = feature.system?.level?.value || 0;
      return traits.includes('mythic') && level === 1;
    });

    console.log(`intrinsics-pf2e-character-builder | Found ${mythicFeats.length} level 1 mythic feats`);
    return mythicFeats.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Clear cache
  clearCache() {
    this.cache = {
      ancestries: null,
      heritages: null,
      backgrounds: null,
      classes: null,
      feats: null,
      spells: null,
      classFeatures: null,
      deities: null
    };
  }
}
