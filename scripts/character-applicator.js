// Character Applicator - Applies wizard choices to actor
import { STEPS } from './character-state-manager.js';

export class CharacterApplicator {
  constructor(stateManager, actor) {
    this.state = stateManager;
    this.actor = actor;
  }

  // Static method to apply a specific step
  static async applyStep(actor, stateManager, step) {
    const applicator = new CharacterApplicator(stateManager, actor);

    console.log(`intrinsics-pf2e-character-builder | Applying step ${step}`);

    switch(step) {
      case STEPS.CLASS:
        await applicator.applyClass();
        break;
      case STEPS.ANCESTRY:
        await applicator.applyAncestry();
        break;
      case STEPS.HERITAGE:
        await applicator.applyHeritage();
        break;
      case STEPS.DEITY:
        await applicator.applyDeity();
        break;
      case STEPS.BACKGROUND:
        await applicator.applyBackground();
        break;
      case STEPS.ABILITIES:
        await applicator.applyAbilityScores();
        break;
      case STEPS.SKILLS:
        await applicator.applySkills();
        break;
      case STEPS.FEATS:
        await applicator.applyClassFeat();
        await applicator.applyAncestryFeat();
        break;
      case STEPS.CANTRIPS:
        await applicator.applyCantrips();
        break;
      case STEPS.SPELLS:
        await applicator.applyLevel1Spells();
        break;
      case STEPS.BIO:
        await applicator.applyBio();
        break;
      case STEPS.EQUIPMENT:
        await applicator.applyEquipment();
        break;
    }
  }

  async apply() {
    console.log("intrinsics-pf2e-character-builder | Applying character choices to actor");

    try {
      // Apply in dependency order
      await this.applyAncestry();
      await this.applyHeritage();
      await this.applyDeity();
      await this.applyBackground();
      await this.applyClass();
      await this.applyClassFeat();
      await this.applyAbilityScores();
      await this.applySkills();
      await this.applyLanguages();
      await this.applyAncestryFeat();
      await this.applyCantrips();
      await this.applyLevel1Spells();
      await this.applyBio();
      await this.applyEquipment();

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

    // Check if ancestry already exists on actor
    const existing = this.actor.items.find(i => i.type === 'ancestry' && i.sourceId === ancestry.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Ancestry already applied, skipping");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Applying ancestry:", ancestry.name);

    // Create embedded document
    await this.actor.createEmbeddedDocuments("Item", [ancestry.toObject()]);
  }

  async applyHeritage() {
    const heritage = this.state.choices.heritage;
    if (!heritage) return;

    // Check if heritage already exists
    const existing = this.actor.items.find(i => i.type === 'heritage' && i.sourceId === heritage.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Heritage already applied, skipping");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Applying heritage:", heritage.name);

    await this.actor.createEmbeddedDocuments("Item", [heritage.toObject()]);
  }

  async applyDeity() {
    const deity = this.state.choices.deity;
    if (!deity) {
      console.log("intrinsics-pf2e-character-builder | No deity selected, skipping");
      return;
    }

    // Check if deity already exists
    const existing = this.actor.items.find(i => i.type === 'deity' && i.sourceId === deity.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Deity already applied, skipping");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Applying deity:", deity.name);

    await this.actor.createEmbeddedDocuments("Item", [deity.toObject()]);

    // After deity is applied, check if we have a delayed Cleric/Champion class to apply
    const classItem = this.state.choices.class?.item;
    if (classItem) {
      const classSlug = classItem.slug || classItem.name?.toLowerCase();
      if (classSlug === 'cleric' || classSlug === 'champion') {
        // Check if class already exists
        const existingClass = this.actor.items.find(i => i.type === 'class' && i.sourceId === classItem.uuid);
        if (!existingClass) {
          console.log(`intrinsics-pf2e-character-builder | Applying delayed ${classItem.name} class after deity`);

          // Clone class item
          const classData = classItem.toObject();

          // Set key ability
          const keyAbility = this.state.choices.class.keyAbility;
          if (keyAbility && classData.system.keyAbility) {
            classData.system.keyAbility.selected = keyAbility;
          }

          await this.actor.createEmbeddedDocuments("Item", [classData]);
        }
      }
    }
  }

  async applyBackground() {
    const background = this.state.choices.background?.item;
    if (!background) return;

    // Check if background already exists
    const existing = this.actor.items.find(i => i.type === 'background' && i.sourceId === background.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Background already applied, skipping");
      return;
    }

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

    // Delay Cleric and Champion class application until after deity
    const classSlug = classItem.slug || classItem.name?.toLowerCase();
    if (classSlug === 'cleric' || classSlug === 'champion') {
      console.log(`intrinsics-pf2e-character-builder | Delaying ${classItem.name} application until deity is selected`);
      return;
    }

    // Check if class already exists
    const existing = this.actor.items.find(i => i.type === 'class' && i.sourceId === classItem.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Class already applied, skipping");
      return;
    }

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

  async applyLanguages() {
    const languages = this.state.choices.languages;
    if (!languages || !languages.selected || languages.selected.length === 0) return;

    console.log("intrinsics-pf2e-character-builder | Applying languages:", languages.selected);

    // Get current languages (stored as slugs in system.details.languages.value)
    const currentLanguages = this.actor.system?.details?.languages?.value || [];

    // Add new languages that aren't already known
    const newLanguages = [...currentLanguages];
    for (const languageSlug of languages.selected) {
      if (!newLanguages.includes(languageSlug)) {
        newLanguages.push(languageSlug);
        console.log(`intrinsics-pf2e-character-builder | Added language: ${languageSlug}`);
      } else {
        console.log(`intrinsics-pf2e-character-builder | Language ${languageSlug} already known, skipping`);
      }
    }

    // Update character with new language list
    await this.actor.update({
      "system.details.languages.value": newLanguages
    });
  }

  async applyClassFeat() {
    const feat = this.state.choices.feats?.classFeat;
    if (!feat) {
      console.log("intrinsics-pf2e-character-builder | No class feat selected, skipping");
      return;
    }

    // Check if feat already exists
    const existing = this.actor.items.find(i => i.type === 'feat' && i.sourceId === feat.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Class feat already applied, skipping");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Applying class feat:", feat.name);

    // Get the character's class to ensure proper trait matching
    const actorClass = this.actor.items.find(i => i.type === 'class');
    const classSlug = actorClass?.system?.slug || actorClass?.slug;

    // Create feat data and ensure it's properly configured as a class feat
    const featData = feat.toObject();

    // Set the feat properties correctly for class feat slot
    if (featData.system) {
      featData.system.category = 'class';
      featData.system.level = { value: 1 };

      // Ensure the feat has the class trait if it's not already present
      // This is critical for PF2e to place it in the correct slot
      if (classSlug && featData.system.traits?.value) {
        if (!featData.system.traits.value.includes(classSlug)) {
          console.log(`intrinsics-pf2e-character-builder | Adding class trait '${classSlug}' to feat`);
          featData.system.traits.value.push(classSlug);
        }
      }

      // Set location to "class-1" format (class feats use this specific format)
      featData.system.location = 'class-1';
    }

    const createdFeat = await this.actor.createEmbeddedDocuments("Item", [featData]);
    console.log("intrinsics-pf2e-character-builder | Created class feat with ID:", createdFeat[0].id);
  }

  async applyAncestryFeat() {
    const feat = this.state.choices.feats?.ancestryFeat;
    if (!feat) return;

    // Check if feat already exists
    const existing = this.actor.items.find(i => i.type === 'feat' && i.sourceId === feat.uuid);
    if (existing) {
      console.log("intrinsics-pf2e-character-builder | Ancestry feat already applied, skipping");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Applying ancestry feat:", feat.name);

    // Get the character's ancestry to ensure proper trait matching
    const actorAncestry = this.actor.items.find(i => i.type === 'ancestry');
    const ancestrySlug = actorAncestry?.system?.slug;

    // Create feat data and ensure it's properly configured as an ancestry feat
    const featData = feat.toObject();

    // Set the feat properties correctly for ancestry feat slot
    if (featData.system) {
      featData.system.category = 'ancestry';
      featData.system.level = { value: 1 };

      // Ensure the feat has the ancestry trait if it's not already present
      // This is critical for PF2e to place it in the correct slot
      if (ancestrySlug && featData.system.traits?.value) {
        if (!featData.system.traits.value.includes(ancestrySlug)) {
          console.log(`intrinsics-pf2e-character-builder | Adding ancestry trait '${ancestrySlug}' to feat`);
          featData.system.traits.value.push(ancestrySlug);
        }
      }

      // Set location to "ancestry-1" format (ancestry feats use this specific format)
      // Based on character export analysis, ancestry feats need explicit location like "ancestry-1"
      featData.system.location = 'ancestry-1';
    }

    const createdFeat = await this.actor.createEmbeddedDocuments("Item", [featData]);
    console.log("intrinsics-pf2e-character-builder | Created ancestry feat with ID:", createdFeat[0].id);
  }

  async applyCantrips() {
    const classItem = this.state.choices.class?.item;
    const spells = this.state.choices.spells;

    if (!classItem) {
      console.log("intrinsics-pf2e-character-builder | No class selected, skipping cantrips");
      return;
    }

    // Check if this class auto-learns all common spells
    const autoLearn = this.state.autoLearnsCommonSpells();
    let cantripsToApply = [];

    if (autoLearn) {
      // Fetch all common cantrips for this tradition
      const tradition = this.state.choices.spellTradition || this.state.getSpellTradition();
      const dataProvider = game.characterBuilder.dataProvider;
      const allCantrips = await dataProvider.getSpells({ level: 0, tradition, rarity: 'common' });
      // Filter out focus spells
      cantripsToApply = allCantrips.filter(s => s.system.category !== 'focus');
      console.log(`intrinsics-pf2e-character-builder | Auto-learning ${cantripsToApply.length} common cantrips`);
    } else {
      // Use user-selected cantrips
      if (!spells || !spells.cantrips || spells.cantrips.length === 0) {
        console.log("intrinsics-pf2e-character-builder | No cantrips to apply, skipping");
        return;
      }
      cantripsToApply = spells.cantrips;
    }

    // Check if spellcasting entry already exists
    const className = classItem.name;
    let spellcastingEntry = this.actor.items.find(i =>
      i.type === 'spellcastingEntry' && i.name === `${className} Spellcasting`
    );

    if (!spellcastingEntry) {
      console.log("intrinsics-pf2e-character-builder | Creating spellcasting entry and adding cantrips");

      // Get spellcasting details (prefer manual tradition override)
      const tradition = this.state.choices.spellTradition || this.state.getSpellTradition();
      const spellcastingType = this.state.getSpellcastingType();

      console.log("intrinsics-pf2e-character-builder | Using tradition:", tradition);

      // Get correct spell slot counts for this class
      const spellSlots = this.getSpellSlotCounts(classItem.slug);
      const cantripSlots = this.getCantripSlotCounts(classItem.slug);

      // Create spellcasting entry with spell slots
      const spellcastingEntryData = {
        name: `${className} Spellcasting`,
        type: "spellcastingEntry",
        system: {
          ability: {
            value: this.getSpellcastingAbility(classItem.slug)
          },
          proficiency: {
            value: 1 // Trained at level 1
          },
          tradition: {
            value: tradition
          },
          prepared: {
            value: spellcastingType
          },
          slots: {
            slot0: {
              max: cantripSlots,  // Cantrip slots
              value: cantripSlots
            },
            slot1: {
              max: spellSlots,
              value: spellSlots
            },
            slot2: { max: 0, value: 0 },
            slot3: { max: 0, value: 0 },
            slot4: { max: 0, value: 0 },
            slot5: { max: 0, value: 0 },
            slot6: { max: 0, value: 0 },
            slot7: { max: 0, value: 0 },
            slot8: { max: 0, value: 0 },
            slot9: { max: 0, value: 0 },
            slot10: { max: 0, value: 0 }
          }
        }
      };

      // Create the spellcasting entry
      [spellcastingEntry] = await this.actor.createEmbeddedDocuments("Item", [spellcastingEntryData]);
      console.log("intrinsics-pf2e-character-builder | Created spellcasting entry:", spellcastingEntry.id);
    } else {
      console.log("intrinsics-pf2e-character-builder | Spellcasting entry already exists, using it");
    }

    // Add cantrips to the spellcasting entry
    if (cantripsToApply.length > 0) {
      // Check if cantrips already exist (by sourceId)
      const existingCantrips = this.actor.items.filter(i =>
        i.type === 'spell' &&
        i.system.location?.value === spellcastingEntry.id &&
        cantripsToApply.some(c => c.uuid === i.sourceId)
      );

      if (existingCantrips.length >= cantripsToApply.length) {
        console.log("intrinsics-pf2e-character-builder | Cantrips already applied, skipping");
        return;
      }

      const spellData = cantripsToApply.map(spell => {
        const data = spell.toObject();
        // Link spell to the spellcasting entry
        data.system.location = {
          value: spellcastingEntry.id
        };
        return data;
      });

      await this.actor.createEmbeddedDocuments("Item", spellData);
      console.log(`intrinsics-pf2e-character-builder | Added ${spellData.length} cantrips to spellcasting entry`);
    }

    // Create additional spellcasting entries for this class
    await this.createAdditionalSpellcastingEntries(classItem);
  }

  async applyLevel1Spells() {
    const classItem = this.state.choices.class?.item;
    const spells = this.state.choices.spells;

    if (!classItem) {
      console.log("intrinsics-pf2e-character-builder | No class selected, skipping level 1 spells");
      return;
    }

    // Check if this class auto-learns all common spells
    const autoLearn = this.state.autoLearnsCommonSpells();
    let level1ToApply = [];

    if (autoLearn) {
      // Fetch all common level 1 spells for this tradition
      const tradition = this.state.choices.spellTradition || this.state.getSpellTradition();
      const dataProvider = game.characterBuilder.dataProvider;
      const allLevel1 = await dataProvider.getSpells({ level: 1, tradition, rarity: 'common' });
      // Filter out focus spells
      level1ToApply = allLevel1.filter(s => s.system.category !== 'focus');
      console.log(`intrinsics-pf2e-character-builder | Auto-learning ${level1ToApply.length} common level 1 spells`);
    } else {
      // Use user-selected spells
      if (!spells || !spells.level1 || spells.level1.length === 0) {
        console.log("intrinsics-pf2e-character-builder | No level 1 spells to apply, skipping");
        return;
      }
      level1ToApply = spells.level1;
    }

    // Find existing spellcasting entry (should have been created in cantrips step)
    const className = classItem.name;
    const spellcastingEntry = this.actor.items.find(i =>
      i.type === 'spellcastingEntry' && i.name === `${className} Spellcasting`
    );

    if (!spellcastingEntry) {
      console.error("intrinsics-pf2e-character-builder | No spellcasting entry found! Should have been created in cantrips step");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Adding level 1 spells to existing spellcasting entry");

    // Check if level 1 spells already exist (by sourceId)
    const existingLevel1 = this.actor.items.filter(i =>
      i.type === 'spell' &&
      i.system.location?.value === spellcastingEntry.id &&
      level1ToApply.some(s => s.uuid === i.sourceId)
    );

    if (existingLevel1.length >= level1ToApply.length) {
      console.log("intrinsics-pf2e-character-builder | Level 1 spells already applied, skipping");
      return;
    }

    // Add level 1 spells to the spellcasting entry
    const spellData = level1ToApply.map(spell => {
      const data = spell.toObject();
      // Link spell to the spellcasting entry
      data.system.location = {
        value: spellcastingEntry.id
      };
      return data;
    });

    await this.actor.createEmbeddedDocuments("Item", spellData);
    console.log(`intrinsics-pf2e-character-builder | Added ${spellData.length} level 1 spells to spellcasting entry`);
  }

  async applyBio() {
    const bio = this.state.choices.bio;
    if (!bio) return;

    console.log("intrinsics-pf2e-character-builder | Applying bio");

    // Apply character name if provided
    if (bio.name && bio.name.trim()) {
      await this.actor.update({ name: bio.name.trim() });
      console.log(`intrinsics-pf2e-character-builder | Set character name to: ${bio.name.trim()}`);
    }

    // Apply personal details to character sheet fields
    const updates = {};

    // Combine gender and pronouns into single field
    if (bio.gender || bio.pronouns) {
      const genderPronouns = [bio.gender, bio.pronouns].filter(x => x).join(' / ');
      updates["system.details.gender.value"] = genderPronouns;
    }

    if (bio.age) updates["system.details.age.value"] = bio.age;
    if (bio.height) updates["system.details.height.value"] = bio.height;
    if (bio.weight) updates["system.details.weight.value"] = bio.weight;
    if (bio.ethnicity) updates["system.details.ethnicity.value"] = bio.ethnicity;
    if (bio.nationality) updates["system.details.nationality.value"] = bio.nationality;

    if (Object.keys(updates).length > 0) {
      await this.actor.update(updates);
      console.log("intrinsics-pf2e-character-builder | Applied personal details to character sheet");
    }

    // Apply biography fields directly to PF2e's biography structure
    const biographyUpdates = {};

    // PF2e has separate fields for appearance, backstory, and attitude
    if (bio.appearance && bio.appearance.trim()) {
      biographyUpdates["system.details.biography.appearance"] = bio.appearance.trim().replace(/\n/g, '<br>');
      console.log("intrinsics-pf2e-character-builder | Applied appearance to biography.appearance");
    }

    if (bio.backstory && bio.backstory.trim()) {
      // Combine backstory with backstory themes if present
      let backstoryContent = bio.backstory.trim().replace(/\n/g, '<br>');
      if (bio.backstoryThemes && bio.backstoryThemes.length > 0) {
        const themesHtml = bio.backstoryThemes.map(theme => `<li>${theme}</li>`).join('');
        backstoryContent += `<br><br><strong>Backstory Themes:</strong><ul>${themesHtml}</ul>`;
      }
      biographyUpdates["system.details.biography.backstory"] = backstoryContent;
      console.log("intrinsics-pf2e-character-builder | Applied backstory to biography.backstory");
    } else if (bio.backstoryThemes && bio.backstoryThemes.length > 0) {
      // If no backstory but we have themes, just add the themes
      const themesHtml = bio.backstoryThemes.map(theme => `<li>${theme}</li>`).join('');
      biographyUpdates["system.details.biography.backstory"] = `<strong>Backstory Themes:</strong><ul>${themesHtml}</ul>`;
    }

    if (bio.personality && bio.personality.trim()) {
      // PF2e uses "attitude" field for personality traits
      biographyUpdates["system.details.biography.attitude"] = bio.personality.trim().replace(/\n/g, '<br>');
      console.log("intrinsics-pf2e-character-builder | Applied personality to biography.attitude");
    }

    // Apply all biography updates
    if (Object.keys(biographyUpdates).length > 0) {
      await this.actor.update(biographyUpdates);
      console.log("intrinsics-pf2e-character-builder | Applied biography content to character sheet");
    }
  }

  async applyEquipment() {
    const equipment = this.state.choices.equipment;
    if (!equipment) return;

    // Check if equipment has already been applied (prevent duplicate application)
    if (equipment._applied) {
      console.log("intrinsics-pf2e-character-builder | Equipment already applied, skipping");
      return;
    }

    console.log("intrinsics-pf2e-character-builder | Applying equipment");

    // Apply cart items
    if (equipment.cartItems && equipment.cartItems.length > 0) {
      const itemsToAdd = [];

      for (const cartItem of equipment.cartItems) {
        const item = cartItem.item;
        const quantity = cartItem.quantity || 1;

        // Check if item already exists on actor (prevent duplicates)
        const existing = this.actor.items.find(i => i.sourceId === item.uuid);
        if (existing) {
          console.log(`intrinsics-pf2e-character-builder | Equipment item ${item.name} already applied, skipping`);
          continue;
        }

        // Create item data
        const itemData = item.toObject();

        // Set quantity if applicable
        if (itemData.system.quantity !== undefined) {
          itemData.system.quantity = quantity;
        }

        itemsToAdd.push(itemData);
      }

      // Add all items to actor
      if (itemsToAdd.length > 0) {
        await this.actor.createEmbeddedDocuments("Item", itemsToAdd);
        console.log(`intrinsics-pf2e-character-builder | Added ${itemsToAdd.length} equipment items to character`);
      }
    }

    // Kit items are now added to cartItems when selected, so we don't need separate kit application
    if (equipment.selectedKit) {
      console.log(`intrinsics-pf2e-character-builder | Kit selected: ${equipment.selectedKit.name} (items already in cart)`);
    }

    // Calculate gold spent from cart items
    let goldSpent = 0;
    if (equipment.cartItems && equipment.cartItems.length > 0) {
      goldSpent = equipment.cartItems.reduce((total, item) => {
        const itemPrice = item.item.system.price?.value?.gp || 0;
        return total + (itemPrice * (item.quantity || 1));
      }, 0);
    }

    const goldRemaining = 15 - goldSpent;
    console.log(`intrinsics-pf2e-character-builder | Gold calculation: goldSpent=${goldSpent}, goldRemaining=${goldRemaining}`);

    if (goldRemaining > 0) {
      // Check if character already has a Gold Pieces treasure item
      const existingGold = this.actor.items.find(item =>
        item.name === "Gold Pieces" && item.type === "treasure"
      );

      if (existingGold) {
        // Update existing gold quantity
        const currentGold = existingGold.system?.quantity || 0;
        const newQuantity = currentGold + goldRemaining;

        await this.actor.updateEmbeddedDocuments("Item", [{
          _id: existingGold.id,
          "system.quantity": newQuantity
        }]);
        console.log(`intrinsics-pf2e-character-builder | Updated gold from ${currentGold} to ${newQuantity} GP`);
      } else {
        // Create new Gold Pieces treasure item matching PF2e structure
        const goldData = {
          name: "Gold Pieces",
          type: "treasure",
          img: "systems/pf2e/icons/equipment/treasure/currency/gold-pieces.webp",
          system: {
            quantity: goldRemaining,
            category: "coin",
            price: {
              value: { gp: 1 },
              per: 1
            },
            bulk: {
              value: 1
            },
            size: "med",
            equipped: {
              carryType: "worn"
            },
            level: {
              value: 0
            },
            traits: {
              rarity: "common",
              value: []
            },
            slug: "gold-pieces"
          }
        };

        await this.actor.createEmbeddedDocuments("Item", [goldData]);
        console.log(`intrinsics-pf2e-character-builder | Created Gold Pieces treasure with ${goldRemaining} GP`);
      }
    }

    // Mark equipment as applied to prevent duplicate application
    equipment._applied = true;
  }

  getSpellcastingAbility(classSlug) {
    const abilities = {
      'wizard': 'int',
      'sorcerer': 'cha',
      'cleric': 'wis',
      'druid': 'wis',
      'bard': 'cha',
      'oracle': 'cha',
      'witch': 'int',
      'magus': 'int',
      'summoner': 'cha',
      'psychic': 'int',
      'animist': 'wis',
      'necromancer': 'int'
    };

    return abilities[classSlug] || 'int';
  }

  getSpellSlotCounts(classSlug) {
    // Number of 1st-level spell slots each class gets
    const slotCounts = {
      'wizard': 2,
      'sorcerer': 3,
      'cleric': 2,
      'druid': 2,
      'bard': 2,
      'oracle': 3,
      'witch': 2,
      'magus': 1,
      'summoner': 1,
      'psychic': 1,
      'animist': 2,
      'necromancer': 1
    };

    return slotCounts[classSlug] || 2;
  }

  getCantripSlotCounts(classSlug) {
    // Number of cantrip slots each class gets (cantrips prepared/known)
    const cantripCounts = {
      'wizard': 5,
      'sorcerer': 5,
      'cleric': 5,
      'druid': 5,
      'bard': 5,
      'oracle': 5,
      'witch': 5,
      'magus': 5,
      'summoner': 5,
      'psychic': 5,
      'animist': 5,
      'necromancer': 5
    };

    return cantripCounts[classSlug] || 5;
  }

  async createAdditionalSpellcastingEntries(classItem) {
    const classSlug = classItem.slug;
    const tradition = this.state.choices.spellTradition || this.state.getSpellTradition();

    // Define additional spellcasting entries for each class
    const additionalEntries = {
      'animist': [
        {
          name: 'Vessel Spells',
          type: 'focus',
          tradition: 'divine',
          ability: 'wis'
        },
        {
          name: 'Apparition Attunement',
          type: 'spontaneous',
          tradition: 'divine',
          ability: 'wis',
          cantripSlots: 2,
          spellSlots: { slot1: 1 }
        }
      ],
      'cleric': [
        {
          name: 'Divine Font',
          type: 'prepared',
          tradition: 'divine',
          ability: 'wis',
          spellSlots: { slot1: 4 }
        }
      ],
      'druid': [
        {
          name: 'Order Spells',
          type: 'focus',
          tradition: 'primal',
          ability: 'wis'
        }
      ],
      'necromancer': [
        {
          name: 'Grave Spells',
          type: 'focus',
          tradition: 'occult',
          ability: 'int'
        }
      ],
      'oracle': [
        {
          name: 'Revelation Spells',
          type: 'focus',
          tradition: 'divine',
          ability: 'cha'
        }
      ],
      'psychic': [
        {
          name: 'Psi Amps',
          type: 'focus',
          tradition: 'occult',
          ability: 'int'
        }
      ],
      'sorcerer': [
        {
          name: 'Bloodline Spells',
          type: 'focus',
          tradition: tradition,
          ability: 'cha'
        }
      ],
      'witch': [
        {
          name: 'Hex Spells',
          type: 'focus',
          tradition: tradition,
          ability: 'int'
        }
      ],
      'bard': [
        {
          name: 'Composition Spells',
          type: 'focus',
          tradition: 'occult',
          ability: 'cha'
        }
      ],
      'magus': [
        {
          name: 'Conflux Spells',
          type: 'focus',
          tradition: 'arcane',
          ability: 'int'
        }
      ],
      'summoner': [
        {
          name: 'Link Spells',
          type: 'focus',
          tradition: tradition,
          ability: 'cha'
        }
      ]
    };

    const entries = additionalEntries[classSlug];
    if (!entries) return;

    for (const entry of entries) {
      // Check if this entry already exists
      const existing = this.actor.items.find(i =>
        i.type === 'spellcastingEntry' && i.name === entry.name
      );

      if (existing) {
        console.log(`intrinsics-pf2e-character-builder | ${entry.name} already exists, skipping`);
        continue;
      }

      // Build slots object
      const slots = {
        slot0: { max: entry.cantripSlots || 0, value: entry.cantripSlots || 0 },
        slot1: { max: entry.spellSlots?.slot1 || 0, value: entry.spellSlots?.slot1 || 0 },
        slot2: { max: 0, value: 0 },
        slot3: { max: 0, value: 0 },
        slot4: { max: 0, value: 0 },
        slot5: { max: 0, value: 0 },
        slot6: { max: 0, value: 0 },
        slot7: { max: 0, value: 0 },
        slot8: { max: 0, value: 0 },
        slot9: { max: 0, value: 0 },
        slot10: { max: 0, value: 0 }
      };

      const entryData = {
        name: entry.name,
        type: 'spellcastingEntry',
        system: {
          ability: {
            value: entry.ability
          },
          proficiency: {
            value: 1 // Trained at level 1
          },
          tradition: {
            value: entry.tradition
          },
          prepared: {
            value: entry.type
          },
          slots: slots
        }
      };

      await this.actor.createEmbeddedDocuments("Item", [entryData]);
      console.log(`intrinsics-pf2e-character-builder | Created ${entry.name} spellcasting entry`);
    }
  }
}
