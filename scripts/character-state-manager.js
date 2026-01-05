// Character State Manager - Manages wizard state and player choices
import { Validators } from './validators.js';

export const STEPS = {
  ANCESTRY: 1,
  HERITAGE: 2,
  BACKGROUND: 3,
  CLASS: 4,
  ABILITIES: 5,
  SKILLS: 6,
  ANCESTRY_FEAT: 7,
  CLASS_FEATURES: 8,
  SPELLS: 9
};

export const STEP_NAMES = {
  1: "Ancestry",
  2: "Heritage",
  3: "Background",
  4: "Class",
  5: "Abilities",
  6: "Skills",
  7: "Ancestry Feat",
  8: "Class Features",
  9: "Spells"
};

export class CharacterStateManager {
  constructor() {
    this.reset();
  }

  reset(actor = null) {
    this.currentStep = STEPS.ANCESTRY;
    this.mode = actor ? 'modify' : 'create';
    this.targetActor = actor;
    this.actorName = actor ? actor.name : "New Character";

    this.choices = {
      ancestry: null,           // Item document
      heritage: null,           // Item document
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
      ancestryFeat: null,       // Item document
      classFeatures: {
        deity: null,            // For champion/cleric
        bloodline: null,        // For sorcerer
        instinct: null,         // For barbarian
        huntersEdge: null,      // For ranger
        racket: null,           // For rogue
        researchField: null,    // For alchemist
        muse: null,             // For bard
        druidicOrder: null,     // For druid
        arcaneSchool: null,     // For wizard (optional)
        arcaneThesis: null      // For wizard
      },
      spells: {
        cantrips: [],           // Array of spell documents
        level1: []              // Array of spell documents
      }
    };

    // Computed properties
    this.completedSteps = new Set();
  }

  // Set a choice and update display
  setChoice(category, value, subcategory = null) {
    if (subcategory) {
      this.choices[category][subcategory] = value;
    } else {
      this.choices[category] = value;
    }

    // Mark current step as potentially complete
    this.validateCurrentStep();

    // Trigger UI update
    if (game.characterBuilder?.currentApp) {
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
    if (step < STEPS.ANCESTRY || step > STEPS.SPELLS) return false;

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
  nextStep() {
    if (!this.canAdvanceStep()) {
      ui.notifications.warn("Please complete the current step first");
      return false;
    }

    this.completedSteps.add(this.currentStep);

    // Check if we should skip spells step for non-casters
    if (this.currentStep === STEPS.CLASS_FEATURES && !this.isSpellcaster()) {
      // Skip spells step
      this.currentStep = STEPS.SPELLS + 1; // Beyond last step
      this.finalizeCharacter();
      return true;
    }

    if (this.currentStep < STEPS.SPELLS) {
      this.currentStep++;
      if (game.characterBuilder?.currentApp) {
        game.characterBuilder.currentApp.render(false);
      }
      return true;
    } else {
      // Final step - finalize character
      this.finalizeCharacter();
      return true;
    }
  }

  // Go back to previous step
  previousStep() {
    if (this.currentStep > STEPS.ANCESTRY) {
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

  // Check if selected class is a spellcaster
  isSpellcaster() {
    const classItem = this.choices.class?.item;
    if (!classItem) return false;

    const spellcasterClasses = [
      'wizard', 'sorcerer', 'cleric', 'druid', 'bard', 'oracle',
      'witch', 'magus', 'summoner', 'psychic'
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
      'psychic': 'occult'
    };

    return traditions[classItem.slug] || null;
  }

  // Get tradition from sorcerer bloodline
  getSorcererTradition() {
    const bloodline = this.choices.classFeatures?.bloodline;
    if (!bloodline) return 'arcane'; // Default

    // Bloodline traditions mapping
    const bloodlineTraditions = {
      'aberrant': 'occult',
      'angelic': 'divine',
      'demonic': 'divine',
      'diabolic': 'divine',
      'draconic': 'arcane',
      'elemental': 'primal',
      'fey': 'primal',
      'hag': 'occult',
      'imperial': 'arcane',
      'undead': 'divine',
      'wyrmblessed': 'divine'
    };

    return bloodlineTraditions[bloodline.slug] || 'arcane';
  }

  // Get tradition from witch patron
  getWitchTradition() {
    // Witches choose their tradition via patron
    // This would need patron selection logic
    return 'occult'; // Default
  }

  // Get number of cantrips for class
  getCantripCount() {
    return 5; // All spellcasters get 5 cantrips at level 1
  }

  // Get number of level 1 spells for class
  getLevel1SpellCount() {
    const classItem = this.choices.class?.item;
    if (!classItem) return 0;

    const spellCounts = {
      'wizard': 10,      // Can prepare INT+1, but knows unlimited (spellbook)
      'sorcerer': 3,     // Spontaneous
      'cleric': 10,      // Can prepare WIS+1, but knows unlimited
      'druid': 10,       // Can prepare WIS+1, but knows unlimited
      'bard': 2,         // Spontaneous
      'oracle': 4,       // Spontaneous
      'witch': 10,       // Can prepare INT+1, but knows unlimited
      'magus': 2,        // Hybrid caster
      'summoner': 2,     // Hybrid caster
      'psychic': 4       // Spontaneous
    };

    return spellCounts[classItem.slug] || 0;
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
