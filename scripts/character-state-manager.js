// Character State Manager - Manages wizard state and player choices
import { Validators } from './validators.js';
import { CharacterApplicator } from './character-applicator.js';

export const STEPS = {
  CLASS: 1,
  ANCESTRY: 2,
  HERITAGE: 3,
  DEITY: 4,
  BACKGROUND: 5,
  ABILITIES: 6,
  SKILLS: 7,
  FEATS: 8,
  CANTRIPS: 9,
  SPELLS: 10,
  BIO: 11,
  EQUIPMENT: 12
};

export const STEP_NAMES = {
  1: "Class",
  2: "Ancestry",
  3: "Heritage",
  4: "Deity",
  5: "Background",
  6: "Abilities",
  7: "Skills",
  8: "Feats",
  9: "Cantrips",
  10: "Spells",
  11: "Bio",
  12: "Equipment"
};

export class CharacterStateManager {
  constructor() {
    this.reset();
  }

  reset(actor = null) {
    this.currentStep = STEPS.CLASS;
    this.mode = actor ? 'modify' : 'create';
    this.targetActor = actor;
    this.actorName = actor ? actor.name : "New Character";
    this._advancing = false; // Guard flag to prevent concurrent step advancement

    this.choices = {
      ancestry: null,           // Item document
      heritage: null,           // Item document
      deity: null,              // Item document (optional)
      background: {
        item: null,             // Item document
        selectedBoosts: []      // Array of ability keys ['str', 'dex']
      },
      class: {
        item: null,             // Item document
        keyAbility: null        // String: 'str', 'dex', etc.
      },
      abilities: {
        freeBoosts: []        // Array of ability keys for the 4 free boosts
      },
      skills: {
        trained: [],            // Array of skill keys
        background: null,       // Background skill (usually fixed)
        classSkills: []         // Class skill selections
      },
      feats: {
        ancestryFeat: null,     // Item document (required)
        classFeat: null         // Item document (optional, depends on class)
      },
      spells: {
        cantrips: [],           // Array of spell documents
        level1: []              // Array of spell documents
      },
      bio: {
        name: '',                 // Character name
        backstoryThemes: [],      // Array of backstory theme strings
        gender: '',               // Gender
        pronouns: '',             // Pronouns
        age: '',                  // Age
        ethnicity: '',            // Ethnicity
        nationality: ''           // Nationality
      },
      equipment: {
        selectedKit: null,        // String: kit identifier (e.g., 'wizard-kit-1')
        customItems: [],          // Array of {item: document, quantity: number}
        goldSpent: 0              // Total gold spent on custom items
      }
    };

    // Computed properties
    this.completedSteps = new Set();
  }

  // Set a choice and update display
  setChoice(category, value, subcategory = null, skipUIUpdate = false) {
    if (subcategory) {
      this.choices[category][subcategory] = value;
    } else {
      this.choices[category] = value;
    }

    // Mark current step as potentially complete
    this.validateCurrentStep();

    // Trigger UI update (unless explicitly skipped for text inputs)
    if (!skipUIUpdate && game.characterBuilder?.currentApp) {
      game.characterBuilder.currentApp.updateDisplay();
    }
  }

  // Get a choice
  getChoice(category, subcategory = null) {
    if (subcategory) {
      return this.choices[category]?.[subcategory];
    }
    return this.choices[category];
  }

  // Navigate to step
  goToStep(step) {
    if (step < STEPS.CLASS || step > STEPS.EQUIPMENT) return false;

    // Can only go forward if current step is valid
    if (step > this.currentStep && !this.canAdvanceStep()) {
      ui.notifications.warn("Please complete the current step first");
      return false;
    }

    // Can only go to steps we've completed or current + 1
    if (step > this.currentStep + 1 && !this.completedSteps.has(step)) {
      return false;
    }

    this.currentStep = step;

    if (game.characterBuilder?.currentApp) {
      game.characterBuilder.currentApp.render(false);
    }

    return true;
  }

  // Advance to next step
  async nextStep() {
    // Guard against concurrent execution
    if (this._advancing) {
      console.log('intrinsics-pf2e-character-builder | nextStep already in progress, ignoring');
      return false;
    }

    if (!this.canAdvanceStep()) {
      ui.notifications.warn("Please complete the current step first");
      return false;
    }

    this._advancing = true;
    console.log(`intrinsics-pf2e-character-builder | Advancing from step ${this.currentStep}`);

    try {
      this.completedSteps.add(this.currentStep);

    // Create actor if needed (first step in create mode)
    if (this.mode === 'create' && !this.targetActor && this.currentStep === STEPS.CLASS) {
      try {
        this.targetActor = await Actor.create({
          name: this.actorName,
          type: "character",
          system: {}
        });
        ui.notifications.info(`Created character: ${this.actorName}`);
      } catch (error) {
        console.error("intrinsics-pf2e-character-builder | Failed to create actor:", error);
        ui.notifications.error("Failed to create character");
        return false;
      }
    }

    // Apply changes for current step to actor
    if (this.targetActor) {
      try {
        await CharacterApplicator.applyStep(this.targetActor, this, this.currentStep);
      } catch (error) {
        console.error(`intrinsics-pf2e-character-builder | Failed to apply step ${this.currentStep}:`, error);
        ui.notifications.warn(`Failed to apply changes: ${error.message}`);
        // Continue anyway - user can fix manually
      }
    }

    // Handle step progression with conditional skips
    let nextStep = this.currentStep + 1;

    // Skip cantrips and spells for non-spellcasters
    if (nextStep === STEPS.CANTRIPS && !this.isSpellcaster()) {
      // Skip both spell steps and go to bio
      nextStep = STEPS.BIO;
    }

    // Check if we've reached the final step
    if (this.currentStep >= STEPS.EQUIPMENT) {
      // Final step - finalize character
      this.finalizeCharacter();
      return true;
    }

    // Advance to next step
    this.currentStep = nextStep;
    if (game.characterBuilder?.currentApp) {
      game.characterBuilder.currentApp.render(false);
    }
    return true;
  } finally {
    this._advancing = false;
  }
}

  // Go back to previous step
  previousStep() {
    if (this.currentStep > STEPS.CLASS) {
      this.currentStep--;
      if (game.characterBuilder?.currentApp) {
        game.characterBuilder.currentApp.render(false);
      }
      return true;
    }
    return false;
  }

  // Check if current step is valid
  canAdvanceStep() {
    const validatorName = `validateStep${this.currentStep}`;
    if (Validators[validatorName]) {
      return Validators[validatorName](this);
    }
    return false;
  }

  // Validate current step and update completed steps
  validateCurrentStep() {
    if (this.canAdvanceStep()) {
      this.completedSteps.add(this.currentStep);
    } else {
      this.completedSteps.delete(this.currentStep);
    }
  }

  // Check if selected class gets a level 1 class feat
  getsLevel1ClassFeat() {
    const classItem = this.choices.class?.item;
    if (!classItem) return false;

    const level1ClassFeatClasses = [
      'swashbuckler', 'fighter', 'alchemist', 'barbarian', 'champion',
      'commander', 'guardian', 'gunslinger', 'inventor', 'monk', 'rogue',
      'runesmith', 'kineticist', 'thaumaturge', 'exemplar'
    ];

    return level1ClassFeatClasses.includes(classItem.slug);
  }

  // Check if selected class is a spellcaster
  isSpellcaster() {
    const classItem = this.choices.class?.item;
    if (!classItem) return false;

    const spellcasterClasses = [
      'wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'oracle',
      'witch', 'magus', 'summoner', 'psychic', 'animist', 'necromancer'
    ];

    return spellcasterClasses.includes(classItem.slug);
  }

  // Get spell tradition for selected class
  getSpellTradition() {
    const classItem = this.choices.class?.item;
    if (!classItem) return null;

    const traditions = {
      'wizard': 'arcane',
      'sorcerer': this.getSorcererTradition(),
      'cleric': 'divine',
      'druid': 'primal',
      'bard': 'occult',
      'oracle': 'divine',
      'witch': this.getWitchTradition(),
      'magus': 'arcane',
      'summoner': 'arcane',
      'psychic': 'occult',
      'animist': 'divine',
      'necromancer': 'occult'
    };

    return traditions[classItem.slug] || null;
  }

  // Get tradition from sorcerer bloodline (read from actor's items)
  getSorcererTradition() {
    // Try to find bloodline in actor's items
    if (this.targetActor) {
      console.log('intrinsics-pf2e-character-builder | Looking for bloodline in actor items...');

      // Find ALL items with bloodline in the name
      const bloodlineItems = this.targetActor.items.filter(item =>
        item.name.toLowerCase().includes('bloodline')
      );

      console.log('intrinsics-pf2e-character-builder | Found', bloodlineItems.length, 'bloodline items');
      bloodlineItems.forEach(item => {
        console.log('intrinsics-pf2e-character-builder |  -', item.name, '(slug:', item.slug, ', type:', item.type, ')');
      });

      // Check each bloodline item for tradition info
      for (const bloodlineItem of bloodlineItems) {
        const bloodlineName = bloodlineItem.name.toLowerCase();
        const slug = (bloodlineItem.slug || '').toLowerCase();

        // Check both name and slug
        const searchText = bloodlineName + ' ' + slug;

        // Bloodline traditions mapping
        if (searchText.includes('aberrant')) return 'occult';
        if (searchText.includes('angelic')) return 'divine';
        if (searchText.includes('demonic')) return 'divine';
        if (searchText.includes('diabolic')) return 'divine';
        if (searchText.includes('draconic')) return 'arcane';
        if (searchText.includes('elemental')) return 'primal';
        if (searchText.includes('fey')) return 'primal';
        if (searchText.includes('hag')) return 'occult';
        if (searchText.includes('imperial')) return 'arcane';
        if (searchText.includes('undead')) return 'divine';
        if (searchText.includes('wyrmblessed')) return 'divine';
        if (searchText.includes('psychopomp')) return 'divine';
        if (searchText.includes('nymph')) return 'primal';
      }

      if (bloodlineItems.length === 0) {
        console.log('intrinsics-pf2e-character-builder | No bloodline found in actor items');
        console.log('intrinsics-pf2e-character-builder | Actor items:', this.targetActor.items.map(i => i.name).join(', '));
      } else {
        console.log('intrinsics-pf2e-character-builder | Bloodline items found but no tradition detected from their names/slugs');
      }
    }

    console.log('intrinsics-pf2e-character-builder | Using default arcane tradition for sorcerer');
    return 'arcane'; // Default
  }

  // Get tradition from witch patron (read from actor's items)
  getWitchTradition() {
    // Try to find patron in actor's items
    if (this.targetActor) {
      const patronItem = this.targetActor.items.find(item =>
        item.type === 'feat' &&
        item.system?.category === 'classfeature' &&
        item.name.toLowerCase().includes('patron')
      );

      if (patronItem) {
        console.log('intrinsics-pf2e-character-builder | Found patron:', patronItem.name);
        // Patron determines tradition - check the item's tradition
        const tradition = patronItem.system?.tradition?.value;
        if (tradition) return tradition;
      }
    }

    return 'occult'; // Default
  }

  // Get number of cantrips for class (for spellbook/repertoire at creation)
  getCantripCount() {
    const classItem = this.choices.class?.item;
    if (!classItem) return 0;

    const cantripCounts = {
      'wizard': 10,      // Spellbook starts with 10 cantrips
      'sorcerer': 5,     // Spontaneous - 5 cantrips known
      'cleric': 0,       // Prepared - auto-learns all common divine cantrips
      'druid': 0,        // Prepared - auto-learns all common primal cantrips
      'bard': 5,         // Spontaneous - 5 cantrips known
      'oracle': 5,       // Spontaneous - 5 cantrips known
      'witch': 10,       // Prepared - learns 10 cantrips
      'magus': 8,        // Hybrid - learns 8 cantrips
      'summoner': 5,     // Hybrid - 5 cantrips
      'psychic': 3,      // Spontaneous - 3 cantrips known (3 more from conscious mind)
      'animist': 0,      // Prepared - auto-learns all common divine cantrips
      'necromancer': 10  // Prepared - learns 10 cantrips
    };

    return cantripCounts[classItem.slug] || 5;
  }

  // Get number of level 1 spells for class (for spellbook/repertoire at creation)
  getLevel1SpellCount() {
    const classItem = this.choices.class?.item;
    if (!classItem) return 0;

    const spellCounts = {
      'wizard': 5,       // Spellbook starts with 5 1st level spells
      'sorcerer': 3,     // Spontaneous - 3 spells known
      'cleric': 0,       // Prepared - auto-learns all common divine spells
      'druid': 0,        // Prepared - auto-learns all common primal spells
      'bard': 2,         // Spontaneous - 2 spells known
      'oracle': 2,       // Spontaneous - 2 spells known
      'witch': 5,        // Prepared - learns 5 spells
      'magus': 4,        // Hybrid - learns 4 spells
      'summoner': 1,     // Hybrid - 1 spell
      'psychic': 1,      // Spontaneous - 1 spell known
      'animist': 0,      // Prepared - auto-learns all common divine spells
      'necromancer': 5   // Prepared - learns 5 spells
    };

    return spellCounts[classItem.slug] || 0;
  }

  // Get spellcasting type for class
  getSpellcastingType() {
    const classItem = this.choices.class?.item;
    if (!classItem) return null;

    const types = {
      'wizard': 'prepared',
      'sorcerer': 'spontaneous',
      'cleric': 'prepared',
      'druid': 'prepared',
      'bard': 'spontaneous',
      'oracle': 'spontaneous',
      'witch': 'prepared',
      'magus': 'prepared',
      'summoner': 'spontaneous',
      'psychic': 'spontaneous',
      'animist': 'prepared',
      'necromancer': 'prepared'
    };

    return types[classItem.slug] || 'prepared';
  }

  // Check if class auto-learns all common spells (doesn't need to select)
  autoLearnsCommonSpells() {
    const classItem = this.choices.class?.item;
    if (!classItem) return false;

    const autoLearnClasses = ['cleric', 'druid', 'animist'];
    return autoLearnClasses.includes(classItem.slug);
  }

  // Finalize character creation
  async finalizeCharacter() {
    ui.notifications.info("Finalizing character...");

    try {
      const { CharacterApplicator } = await import('./character-applicator.js');

      let actor = this.targetActor;

      // Create new actor if in create mode
      if (this.mode === 'create') {
        actor = await Actor.create({
          name: this.actorName,
          type: "character",
          system: {}
        });
      }

      // Apply all choices to actor
      const applicator = new CharacterApplicator(this, actor);
      await applicator.apply();

      // Open the actor sheet
      actor.sheet.render(true);

      // Close builder app
      if (game.characterBuilder?.currentApp) {
        game.characterBuilder.currentApp.close();
      }

      ui.notifications.info(`Character ${actor.name} created successfully!`);
    } catch (error) {
      console.error("intrinsics-pf2e-character-builder | Error finalizing character:", error);
      ui.notifications.error("Failed to finalize character. See console for details.");
    }
  }

  // Set actor name
  setActorName(name) {
    this.actorName = name || "New Character";
  }
}
