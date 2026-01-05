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
    const pack = game.packs.get("pf2e.ancestries");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E ancestries pack not found");
      return [];
    }

    const documents = await pack.getDocuments();

    // Filter to common/uncommon ancestries and sort alphabetically
    return documents
      .filter(doc => doc.system.rarity === 'common' || doc.system.rarity === 'uncommon')
      .sort((a, b) => a.name.localeCompare(b.name));
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
      // Filter by ancestry
      return this.cache.heritages.filter(h =>
        h.system.ancestry?.slug === ancestrySlug
      );
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
      .filter(doc => doc.system.rarity === 'common' || doc.system.rarity === 'uncommon')
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
    const pack = game.packs.get("pf2e.feats-srd");
    if (!pack) {
      console.error("intrinsics-pf2e-character-builder | PF2E feats pack not found");
      return [];
    }

    const documents = await pack.getDocuments();
    return documents;
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
    return spells.filter(spell => {
      // Level filter
      if (filters.level !== undefined && spell.system.level?.value !== filters.level) {
        return false;
      }

      // Tradition filter
      if (filters.tradition) {
        const traditions = spell.system.traits?.traditions || [];
        if (!traditions.includes(filters.tradition)) {
          return false;
        }
      }

      // Category filter (focus spells, cantrips, etc.)
      if (filters.category === 'cantrip' && spell.system.level?.value !== 0) {
        return false;
      }

      if (filters.category === 'focus' && spell.system.category !== 'focus') {
        return false;
      }

      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
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
