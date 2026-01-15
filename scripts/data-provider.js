// Data Provider - Loads and caches PF2E compendium data

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
    let pack = game.packs.get("pf2e.ancestries");

    if (!pack) {
      console.warn("intrinsics-pf2e-character-builder | Pack not found with ID 'pf2e.ancestries', searching...");

      // Search for the pack by metadata
      pack = game.packs.find(p => {
        console.log(`intrinsics-pf2e-character-builder | Checking pack: ${p.metadata.id} (${p.metadata.label})`);
        return p.metadata.id === "pf2e.ancestries" ||
               p.metadata.label === "Ancestries" ||
               p.collection === "pf2e.ancestries";
      });
    }

    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E ancestries pack not found!");
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
    const pack = game.packs.get("pf2e.heritages");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E heritages pack not found");
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
    const pack = game.packs.get("pf2e.backgrounds");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E backgrounds pack not found");
      return [];
    }

    const documents = await pack.getDocuments();

    // Filter to common/uncommon and sort
    return documents
      .filter(doc => {
        const rarity = doc.system?.traits?.rarity || doc.system?.rarity || doc.rarity;
        return rarity === 'common' || rarity === 'uncommon';
      })
      .sort((a, b) => a.name.localeCompare(b.name));
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
    const pack = game.packs.get("pf2e.classes");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E classes pack not found");
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
    const pack = game.packs.get("pf2e.feats-srd");
    if (pack) {
      const documents = await pack.getDocuments();
      allFeats.push(...documents);
      console.log(`intrinsics-pf2e-character-builder | Loaded ${documents.length} standard feats`);
    } else {
      console.error("intrinsics-pf2e-character-builder | PF2E feats pack not found");
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
    const pack = game.packs.get("pf2e.spells-srd");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E spells pack not found");
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
    const pack = game.packs.get("pf2e.deities");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E deities pack not found");
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
    const pack = game.packs.get("pf2e.classfeatures");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E class features pack not found");
      return [];
    }

    const documents = await pack.getDocuments();
    return documents;
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
