// Character Applicator - Applies wizard choices to actor

export class CharacterApplicator {
  constructor(stateManager, actor) {
    this.state = stateManager;
    this.actor = actor;
  }

  async apply() {
    console.log("intrinsics-pf2e-character-builder | Applying character choices to actor");

    try {
      // Apply in dependency order
      await this.applyAncestry();
      await this.applyHeritage();
      await this.applyBackground();
      await this.applyClass();
      await this.applyAbilityScores();
      await this.applySkills();
      await this.applyAncestryFeat();
      await this.applyClassFeatures();
      await this.applySpells();

      // Set level to 1
      await this.actor.update({ "system.details.level.value": 1 });

      ui.notifications.info(`Character ${this.actor.name} finalized successfully!`);
    } catch (error) {
      console.error("intrinsics-pf2e-character-builder | Error applying character:", error);
      throw error;
    }
  }

  async applyAncestry() {
    const ancestry = this.state.choices.ancestry;
    if (!ancestry) return;

    console.log("intrinsics-pf2e-character-builder | Applying ancestry:", ancestry.name);

    // Create embedded document
    await this.actor.createEmbeddedDocuments("Item", [ancestry.toObject()]);
  }

  async applyHeritage() {
    const heritage = this.state.choices.heritage;
    if (!heritage) return;

    console.log("intrinsics-pf2e-character-builder | Applying heritage:", heritage.name);

    await this.actor.createEmbeddedDocuments("Item", [heritage.toObject()]);
  }

  async applyBackground() {
    const background = this.state.choices.background?.item;
    if (!background) return;

    console.log("intrinsics-pf2e-character-builder | Applying background:", background.name);

    // Clone the background item and set the selected boosts
    const bgData = background.toObject();

    // Update boost selections if needed
    const selectedBoosts = this.state.choices.background.selectedBoosts || [];
    if (selectedBoosts.length > 0 && bgData.system.boosts) {
      // PF2E system handles boost selection through rules
      // We'll let the system process this
    }

    await this.actor.createEmbeddedDocuments("Item", [bgData]);
  }

  async applyClass() {
    const classItem = this.state.choices.class?.item;
    if (!classItem) return;

    console.log("intrinsics-pf2e-character-builder | Applying class:", classItem.name);

    // Clone class item
    const classData = classItem.toObject();

    // Set key ability
    const keyAbility = this.state.choices.class.keyAbility;
    if (keyAbility && classData.system.keyAbility) {
      classData.system.keyAbility.selected = keyAbility;
    }

    await this.actor.createEmbeddedDocuments("Item", [classData]);
  }

  async applyAbilityScores() {
    const abilities = this.state.choices.abilities;
    if (!abilities) return;

    console.log("intrinsics-pf2e-character-builder | Applying ability scores");

    // PF2E uses a build system for tracking boosts
    // The system will calculate final scores based on boosts
    // For now, we'll let the ancestry/background/class boosts apply automatically
    // TODO: Implement proper boost tracking for manual ability allocation
  }

  async applySkills() {
    const skills = this.state.choices.skills;
    if (!skills || !skills.trained || skills.trained.length === 0) return;

    console.log("intrinsics-pf2e-character-builder | Applying skills:", skills.trained);

    // Set skill proficiencies
    const updates = {};
    for (const skill of skills.trained) {
      updates[`system.skills.${skill}.rank`] = 1; // 1 = Trained
    }

    await this.actor.update(updates);
  }

  async applyAncestryFeat() {
    const feat = this.state.choices.ancestryFeat;
    if (!feat) return;

    console.log("intrinsics-pf2e-character-builder | Applying ancestry feat:", feat.name);

    await this.actor.createEmbeddedDocuments("Item", [feat.toObject()]);
  }

  async applyClassFeatures() {
    const classFeatures = this.state.choices.classFeatures;
    const classItem = this.state.choices.class?.item;

    if (!classItem) return;

    console.log("intrinsics-pf2e-character-builder | Applying class features");

    // Apply class-specific features
    const classSlug = classItem.slug;

    // Deity (Champion/Cleric)
    if ((classSlug === 'champion' || classSlug === 'cleric') && classFeatures.deity) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.deity.toObject()]);
    }

    // Bloodline (Sorcerer)
    if (classSlug === 'sorcerer' && classFeatures.bloodline) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.bloodline.toObject()]);
    }

    // Instinct (Barbarian)
    if (classSlug === 'barbarian' && classFeatures.instinct) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.instinct.toObject()]);
    }

    // Hunter's Edge (Ranger)
    if (classSlug === 'ranger' && classFeatures.huntersEdge) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.huntersEdge.toObject()]);
    }

    // Racket (Rogue)
    if (classSlug === 'rogue' && classFeatures.racket) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.racket.toObject()]);
    }

    // Research Field (Alchemist)
    if (classSlug === 'alchemist' && classFeatures.researchField) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.researchField.toObject()]);
    }

    // Muse (Bard)
    if (classSlug === 'bard' && classFeatures.muse) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.muse.toObject()]);
    }

    // Druidic Order (Druid)
    if (classSlug === 'druid' && classFeatures.druidicOrder) {
      await this.actor.createEmbeddedDocuments("Item", [classFeatures.druidicOrder.toObject()]);
    }

    // Arcane School/Thesis (Wizard)
    if (classSlug === 'wizard') {
      if (classFeatures.arcaneSchool) {
        await this.actor.createEmbeddedDocuments("Item", [classFeatures.arcaneSchool.toObject()]);
      }
      if (classFeatures.arcaneThesis) {
        await this.actor.createEmbeddedDocuments("Item", [classFeatures.arcaneThesis.toObject()]);
      }
    }
  }

  async applySpells() {
    const spells = this.state.choices.spells;
    if (!spells || (spells.cantrips.length === 0 && spells.level1.length === 0)) return;

    console.log("intrinsics-pf2e-character-builder | Applying spells");

    // Combine cantrips and level 1 spells
    const allSpells = [...spells.cantrips, ...spells.level1];

    if (allSpells.length > 0) {
      await this.actor.createEmbeddedDocuments("Item",
        allSpells.map(s => s.toObject())
      );
    }
  }
}
