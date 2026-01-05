// Validators - Step validation logic

export class Validators {
  // Step 1: Ancestry Selection
  static validateStep1(stateManager) {
    return !!stateManager.choices.ancestry;
  }

  // Step 2: Heritage Selection
  static validateStep2(stateManager) {
    return !!stateManager.choices.heritage;
  }

  // Step 3: Background Selection
  static validateStep3(stateManager) {
    const bg = stateManager.choices.background;
    return bg?.item && bg?.selectedBoosts?.length === 2;
  }

  // Step 4: Class Selection
  static validateStep4(stateManager) {
    const cls = stateManager.choices.class;
    return cls?.item && cls?.keyAbility;
  }

  // Step 5: Ability Score Allocation
  static validateStep5(stateManager) {
    const abilities = stateManager.choices.abilities;
    if (!abilities) return false;

    // Check that all 4 free boosts have been allocated
    const freeBoosts = abilities.freeBoosts || [];
    if (freeBoosts.length !== 4) return false;

    return true;
  }

  // Step 6: Skill Selection
  static validateStep6(stateManager) {
    const skills = stateManager.choices.skills;
    const cls = stateManager.choices.class?.item;

    if (!skills || !cls) return false;

    // Get expected skill count
    const trainedSkills = cls.system?.trainedSkills?.value || 0;
    const intModifier = Math.floor((stateManager.choices.abilities.int - 10) / 2);
    const totalClassSkills = trainedSkills + intModifier;

    // Background provides 1 skill, class provides trainedSkills + INT mod
    const expectedTotal = totalClassSkills + 1;

    return skills.trained?.length === expectedTotal;
  }

  // Step 7: Ancestry Feat Selection
  static validateStep7(stateManager) {
    return !!stateManager.choices.ancestryFeat;
  }

  // Step 8: Class Features
  static validateStep8(stateManager) {
    const cls = stateManager.choices.class?.item;
    const features = stateManager.choices.classFeatures;

    if (!cls) return false;

    const classSlug = cls.slug;

    // Class-specific validation
    if (classSlug === 'champion' || classSlug === 'cleric') {
      return !!features?.deity;
    }

    if (classSlug === 'sorcerer') {
      return !!features?.bloodline;
    }

    if (classSlug === 'barbarian') {
      return !!features?.instinct;
    }

    if (classSlug === 'ranger') {
      return !!features?.huntersEdge;
    }

    if (classSlug === 'rogue') {
      return !!features?.racket;
    }

    if (classSlug === 'alchemist') {
      return !!features?.researchField;
    }

    if (classSlug === 'bard') {
      return !!features?.muse;
    }

    if (classSlug === 'druid') {
      return !!features?.druidicOrder;
    }

    if (classSlug === 'wizard') {
      // Arcane thesis is required, school is optional
      return !!features?.arcaneThesis;
    }

    // Other classes don't require choices at level 1
    return true;
  }

  // Step 9: Spell Selection
  static validateStep9(stateManager) {
    const cls = stateManager.choices.class?.item;
    const spells = stateManager.choices.spells;

    if (!cls) return false;

    // Non-spellcasters skip this step
    if (!stateManager.isSpellcaster()) {
      return true;
    }

    if (!spells) return false;

    // Get expected counts
    const expectedCantrips = stateManager.getCantripCount();
    const expectedLevel1 = stateManager.getLevel1SpellCount();

    // For prepared casters, they can choose more spells but only prepare some
    // We'll allow them to select up to the expected count for initial spellbook/repertoire
    const cantripCount = spells.cantrips?.length || 0;
    const level1Count = spells.level1?.length || 0;

    // Cantrips must match expected count exactly
    if (cantripCount !== expectedCantrips) {
      return false;
    }

    // For level 1 spells:
    // - Spontaneous casters must match exactly
    // - Prepared casters need at least enough to prepare (but can have more in spellbook)
    const classSlug = cls.slug;
    const spontaneousCasters = ['sorcerer', 'bard', 'oracle', 'psychic'];

    if (spontaneousCasters.includes(classSlug)) {
      // Exact match required
      return level1Count === expectedLevel1;
    } else {
      // Prepared casters need at least enough
      // For wizard, we'll let them pick more for their starting spellbook
      return level1Count >= 2; // Minimum 2 for starting spellbook
    }
  }
}
