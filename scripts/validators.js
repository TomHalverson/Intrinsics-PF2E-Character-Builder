// Validators - Step validation logic

export class Validators {
  // Step 1: Class Selection
  static validateStep1(stateManager) {
    const cls = stateManager.choices.class;
    const isValid = !!cls?.item;
    console.log('intrinsics-pf2e-character-builder | Step 1 validation:', { cls, isValid });
    return isValid;
  }

  // Step 2: Ancestry Selection
  static validateStep2(stateManager) {
    const ancestry = stateManager.choices.ancestry;
    const isValid = !!ancestry;
    console.log('intrinsics-pf2e-character-builder | Step 2 validation:', { ancestry, isValid });
    return isValid;
  }

  // Step 3: Heritage Selection
  static validateStep3(stateManager) {
    const heritage = stateManager.choices.heritage;
    const isValid = !!heritage;
    console.log('intrinsics-pf2e-character-builder | Step 4 validation:', { heritage, isValid });
    return isValid;
  }

  // Step 4: Deity Selection (Optional)
  static validateStep4(stateManager) {
    // Deity is optional, so always return true
    console.log('intrinsics-pf2e-character-builder | Step 5 validation (deity - optional):', { isValid: true });
    return true;
  }

  // Step 5: Background Selection
  static validateStep5(stateManager) {
    const bg = stateManager.choices.background;
    // Boosts are now handled on character sheet, just check if background is selected
    const isValid = !!bg?.item;
    console.log('intrinsics-pf2e-character-builder | Step 6 validation:', { bg, isValid });
    return isValid;
  }

  // Step 6: Character Review & Ability Score Allocation
  static validateStep6(stateManager) {
    // Since abilities are handled by the character sheet's built-in editor,
    // we just auto-pass this step. Users can manually allocate on the sheet.
    const isValid = true;
    console.log('intrinsics-pf2e-character-builder | Step 7 validation (auto-pass):', { isValid });
    return isValid;
  }

  // Step 7: Skill Selection
  static validateStep7(stateManager) {
    const skills = stateManager.choices.skills;
    const cls = stateManager.choices.class?.item;
    const actor = stateManager.targetActor;

    if (!skills || !cls) {
      console.log('intrinsics-pf2e-character-builder | Step 8 validation: Missing skills or class');
      return false;
    }

    // Get INT modifier from actor (abilities are on character sheet now)
    // PF2E stores the modifier directly in the mod property
    const intModifier = actor?.system?.abilities?.int?.mod || 0;

    // Get class skill count from helper (using class slug, not system data)
    // We'll use a lookup table since we have the correct counts
    const classSkillCounts = {
      'alchemist': 3, 'bard': 4, 'barbarian': 3, 'champion': 2, 'commander': 2,
      'cleric': 2, 'druid': 2, 'exemplar': 3, 'fighter': 3, 'guardian': 3,
      'gunslinger': 3, 'inventor': 3, 'investigator': 4, 'kineticist': 3,
      'magus': 2, 'monk': 4, 'oracle': 3, 'psychic': 3, 'ranger': 4,
      'rogue': 7, 'sorcerer': 2, 'summoner': 3, 'swashbuckler': 4,
      'thaumaturge': 3, 'witch': 3, 'wizard': 2, 'runesmith': 2,
      'necromancer': 2, 'animist': 2
    };

    const baseClassSkills = classSkillCounts[cls.slug] || 2;
    const totalClassSkills = Math.max(baseClassSkills + intModifier, 0);

    // Background provides 1 skill, class provides base + INT mod
    const expectedTotal = totalClassSkills + 1;

    const isValid = skills.trained?.length === expectedTotal;
    console.log('intrinsics-pf2e-character-builder | Step 8 validation:', {
      classSlug: cls.slug,
      baseClassSkills,
      intModifier,
      totalClassSkills,
      expectedTotal,
      actualCount: skills.trained?.length,
      isValid
    });

    return isValid;
  }

  // Step 8: Feat Selection (Ancestry + Class if applicable)
  static validateStep8(stateManager) {
    const feats = stateManager.choices.feats;

    // Ancestry feat is always required
    if (!feats?.ancestryFeat) {
      console.log('intrinsics-pf2e-character-builder | Step 8 validation: Missing ancestry feat');
      return false;
    }

    // Class feat is required only if the class gets one at level 1
    if (stateManager.getsLevel1ClassFeat() && !feats?.classFeat) {
      console.log('intrinsics-pf2e-character-builder | Step 8 validation: Missing required class feat');
      return false;
    }

    console.log('intrinsics-pf2e-character-builder | Step 8 validation (feats):', {
      ancestryFeat: !!feats?.ancestryFeat,
      classFeat: !!feats?.classFeat,
      isValid: true
    });
    return true;
  }

  // Step 9: Cantrip Selection
  static validateStep9(stateManager) {
    const cls = stateManager.choices.class?.item;
    const spells = stateManager.choices.spells;

    if (!cls) return false;

    // Non-spellcasters skip this step
    if (!stateManager.isSpellcaster()) {
      return true;
    }

    // Classes that auto-learn all common spells skip this step
    if (stateManager.autoLearnsCommonSpells()) {
      console.log('intrinsics-pf2e-character-builder | Step 10 validation (auto-learn cantrips): true');
      return true;
    }

    if (!spells) return false;

    // Get expected cantrip count
    const expectedCantrips = stateManager.getCantripCount();
    const cantripCount = spells.cantrips?.length || 0;

    // Cantrips must match expected count exactly
    const isValid = cantripCount === expectedCantrips;
    console.log('intrinsics-pf2e-character-builder | Step 10 validation (cantrips):', {
      expectedCantrips,
      cantripCount,
      isValid
    });

    return isValid;
  }

  // Step 10: Level 1 Spell Selection
  static validateStep10(stateManager) {
    const cls = stateManager.choices.class?.item;
    const spells = stateManager.choices.spells;

    if (!cls) return false;

    // Non-spellcasters skip this step
    if (!stateManager.isSpellcaster()) {
      return true;
    }

    // Classes that auto-learn all common spells skip this step
    if (stateManager.autoLearnsCommonSpells()) {
      console.log('intrinsics-pf2e-character-builder | Step 11 validation (auto-learn spells): true');
      return true;
    }

    if (!spells) return false;

    // Get expected level 1 count
    const expectedLevel1 = stateManager.getLevel1SpellCount();
    const level1Count = spells.level1?.length || 0;

    // For level 1 spells:
    // - Spontaneous casters must match exactly
    // - Prepared casters need at least enough to prepare (but can have more in spellbook)
    const classSlug = cls.slug;
    const spontaneousCasters = ['sorcerer', 'bard', 'oracle', 'psychic', 'summoner'];

    let isValid;
    if (spontaneousCasters.includes(classSlug)) {
      // Exact match required
      isValid = level1Count === expectedLevel1;
    } else {
      // Prepared casters need at least enough
      // For wizard, we'll let them pick more for their starting spellbook
      isValid = level1Count >= 2; // Minimum 2 for starting spellbook
    }

    console.log('intrinsics-pf2e-character-builder | Step 11 validation (level 1 spells):', {
      expectedLevel1,
      level1Count,
      classSlug,
      isSpontaneous: spontaneousCasters.includes(classSlug),
      isValid
    });

    return isValid;
  }

  // Step 11: Bio (Optional - name and backstory theme)
  static validateStep11(stateManager) {
    // Bio is optional - always return true
    // User can skip naming and use default, or add backstory theme
    console.log('intrinsics-pf2e-character-builder | Step 12 validation (bio - optional):', { isValid: true });
    return true;
  }

  // Step 12: Equipment (Optional - class kits or cart items)
  static validateStep12(stateManager) {
    const equipment = stateManager.choices.equipment;

    // Equipment is optional, but validate gold limit if cart items selected
    if (equipment?.cartItems?.length > 0) {
      // Calculate total gold spent from cart
      const goldSpent = equipment.cartItems.reduce((total, item) => {
        const itemPrice = item.item.system.price?.value?.gp || 0;
        return total + (itemPrice * (item.quantity || 1));
      }, 0);

      if (goldSpent > 15) {
        console.log('intrinsics-pf2e-character-builder | Step 12 validation (equipment - exceeded gold limit):', {
          goldSpent,
          isValid: false
        });
        return false;
      }
    }

    console.log('intrinsics-pf2e-character-builder | Step 12 validation (equipment - optional):', { isValid: true });
    return true;
  }
}
