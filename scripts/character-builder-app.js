// Character Builder App - Main UI Application
import { STEPS, STEP_NAMES } from './character-state-manager.js';
import { formatBoosts, formatTraits, getAbilityLabel, ABILITIES } from './utils.js';

const MODULE_ID = "intrinsics-pf2e-character-builder";

export class CharacterBuilderApp extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'character-builder',
      classes: ['character-builder'],
      template: null, // Dynamic HTML generation
      popOut: true,
      resizable: true,
      width: 900,
      height: 700
    });
  }

  get title() {
    const stateManager = game.characterBuilder?.stateManager;
    if (!stateManager) return 'Character Builder';

    const step = stateManager.currentStep;
    const stepName = STEP_NAMES[step] || 'Character Builder';
    return `Character Builder - Step ${step}: ${stepName}`;
  }

  async getData() {
    return {};
  }

  async _renderInner(data) {
    const html = await this.generateHTML();
    return $(html);
  }

  async _render(force = false, options = {}) {
    await super._render(force, options);

    if (this.element) {
      this.activateListeners(this.element);
    }
  }

  // Generate HTML based on current step
  async generateHTML() {
    const stateManager = game.characterBuilder?.stateManager;
    if (!stateManager) return '<div>State Manager not initialized</div>';

    const progressBar = this.generateProgressBar();
    const stepContent = await this.generateStepContent();

    return `
      ${progressBar}
      <div class="wizard-content">
        ${stepContent}
      </div>
    `;
  }

  // Generate progress bar
  generateProgressBar() {
    const stateManager = game.characterBuilder.stateManager;
    const currentStep = stateManager.currentStep;
    const completedSteps = stateManager.completedSteps;

    let html = '<div class="wizard-progress">';

    for (let step = STEPS.ANCESTRY; step <= STEPS.SPELLS; step++) {
      const stepName = STEP_NAMES[step];
      const isCompleted = completedSteps.has(step);
      const isCurrent = step === currentStep;
      const classes = [];

      if (isCompleted) classes.push('completed');
      if (isCurrent) classes.push('active');

      html += `
        <div class="progress-step ${classes.join(' ')}" data-step="${step}">
          <div class="step-number">${step}</div>
          <div class="step-label">${stepName}</div>
        </div>
      `;
    }

    html += '</div>';
    return html;
  }

  // Generate step-specific content
  async generateStepContent() {
    const stateManager = game.characterBuilder.stateManager;
    const step = stateManager.currentStep;

    switch(step) {
      case STEPS.ANCESTRY:
        return await this.generateStep1_Ancestry();
      case STEPS.HERITAGE:
        return await this.generateStep2_Heritage();
      case STEPS.BACKGROUND:
        return await this.generateStep3_Background();
      case STEPS.CLASS:
        return await this.generateStep4_Class();
      case STEPS.ABILITIES:
        return this.generateStep5_Abilities();
      case STEPS.SKILLS:
        return this.generateStep6_Skills();
      case STEPS.ANCESTRY_FEAT:
        return await this.generateStep7_AncestryFeat();
      case STEPS.CLASS_FEATURES:
        return await this.generateStep8_ClassFeatures();
      case STEPS.SPELLS:
        return await this.generateStep9_Spells();
      default:
        return '<div>Unknown step</div>';
    }
  }

  // Step 1: Ancestry Selection
  async generateStep1_Ancestry() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedAncestry = stateManager.choices.ancestry;

    // Load ancestries
    const ancestries = await dataProvider.getAncestries();

    let html = `
      <div class="wizard-step step-ancestry">
        <h2>Choose Your Ancestry</h2>
        <p class="step-description">Your ancestry determines your HP, size, speed, ability boosts and flaws, and languages.</p>
        <div class="ancestry-grid">
    `;

    for (const ancestry of ancestries) {
      const isSelected = selectedAncestry?.id === ancestry.id;
      const cardClass = isSelected ? 'selection-card selected' : 'selection-card';

      const hp = ancestry.system.hp || 0;
      const size = ancestry.system.size || 'medium';
      const speed = ancestry.system.speed || 25;

      html += `
        <div class="${cardClass}" data-item-id="${ancestry.id}">
          <img class="card-icon" src="${ancestry.img}" alt="${ancestry.name}">
          <h3 class="card-title">${ancestry.name}</h3>
          <div class="card-traits">${formatTraits(ancestry.system.traits?.value || [])}</div>
          <div class="card-stats">
            <span><i class="fas fa-heart"></i> HP: ${hp}</span>
            <span><i class="fas fa-expand-arrows-alt"></i> Size: ${size.capitalize()}</span>
            <span><i class="fas fa-running"></i> Speed: ${speed} ft</span>
          </div>
          <div class="card-boosts">
            ${formatBoosts(ancestry.system.boosts)}
          </div>
          ${this.formatFlaws(ancestry.system.flaws)}
        </div>
      `;
    }

    html += `
        </div>
        ${this.generateNavigation()}
      </div>
    `;

    return html;
  }

  // Step 2: Heritage Selection
  async generateStep2_Heritage() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedAncestry = stateManager.choices.ancestry;
    const selectedHeritage = stateManager.choices.heritage;

    if (!selectedAncestry) {
      return '<div>Please select an ancestry first</div>';
    }

    // Load heritages for selected ancestry
    const heritages = await dataProvider.getHeritages(selectedAncestry.slug);

    let html = `
      <div class="wizard-step step-heritage">
        <h2>Choose Your Heritage</h2>
        <p class="step-description">Your heritage represents your lineage within your ${selectedAncestry.name} ancestry.</p>
        <div class="heritage-list">
    `;

    for (const heritage of heritages) {
      const isSelected = selectedHeritage?.id === heritage.id;
      const cardClass = isSelected ? 'selection-card selected' : 'selection-card';

      html += `
        <div class="${cardClass}" data-item-id="${heritage.id}">
          <img class="card-icon" src="${heritage.img}" alt="${heritage.name}">
          <h3 class="card-title">${heritage.name}</h3>
          <div class="card-description">${heritage.system.description?.value || ''}</div>
        </div>
      `;
    }

    html += `
        </div>
        ${this.generateNavigation()}
      </div>
    `;

    return html;
  }

  // Step 3: Background Selection
  async generateStep3_Background() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedBackground = stateManager.choices.background?.item;
    const selectedBoosts = stateManager.choices.background?.selectedBoosts || [];

    // Load backgrounds
    const backgrounds = await dataProvider.getBackgrounds();

    let html = `
      <div class="wizard-step step-background">
        <h2>Choose Your Background</h2>
        <p class="step-description">Your background represents your training and experiences before becoming an adventurer.</p>
        <div class="background-grid">
    `;

    for (const background of backgrounds) {
      const isSelected = selectedBackground?.id === background.id;
      const cardClass = isSelected ? 'selection-card selected' : 'selection-card';

      html += `
        <div class="${cardClass}" data-item-id="${background.id}">
          <img class="card-icon" src="${background.img}" alt="${background.name}">
          <h3 class="card-title">${background.name}</h3>
          <div class="card-boosts">
            ${formatBoosts(background.system.boosts)}
          </div>
          <div class="card-description">${background.system.description?.value || ''}</div>
        </div>
      `;
    }

    html += `
        </div>
    `;

    // Show boost selection if background is selected
    if (selectedBackground) {
      const boosts = selectedBackground.system.boosts;
      html += this.generateBoostSelection(boosts, selectedBoosts);
    }

    html += `
        ${this.generateNavigation()}
      </div>
    `;

    return html;
  }

  // Step 4: Class Selection
  async generateStep4_Class() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedClass = stateManager.choices.class?.item;
    const selectedKeyAbility = stateManager.choices.class?.keyAbility;

    // Load classes
    const classes = await dataProvider.getClasses();

    let html = `
      <div class="wizard-step step-class">
        <h2>Choose Your Class</h2>
        <p class="step-description">Your class represents your profession and defines your abilities and role in combat.</p>
        <div class="class-grid">
    `;

    for (const cls of classes) {
      const isSelected = selectedClass?.id === cls.id;
      const cardClass = isSelected ? 'selection-card selected' : 'selection-card';

      const keyAbilityOptions = cls.system.keyAbility?.value || [];
      const hp = cls.system.hp || 0;

      html += `
        <div class="${cardClass}" data-item-id="${cls.id}">
          <img class="card-icon" src="${cls.img}" alt="${cls.name}">
          <h3 class="card-title">${cls.name}</h3>
          <div class="card-traits">${formatTraits(cls.system.traits?.value || [])}</div>
          <div class="card-stats">
            <span><i class="fas fa-heart"></i> HP: ${hp}</span>
            <span><i class="fas fa-star"></i> Key: ${keyAbilityOptions.map(a => a.toUpperCase()).join('/')}</span>
          </div>
          <div class="card-description">${cls.system.description?.value || ''}</div>
        </div>
      `;
    }

    html += `
        </div>
    `;

    // Show key ability selection if class is selected
    if (selectedClass) {
      const keyAbilityOptions = selectedClass.system.keyAbility?.value || [];
      html += this.generateKeyAbilitySelection(keyAbilityOptions, selectedKeyAbility);
    }

    html += `
        ${this.generateNavigation()}
      </div>
    `;

    return html;
  }

  // Step 5: Ability Score Allocation
  generateStep5_Abilities() {
    const stateManager = game.characterBuilder.stateManager;
    const ancestry = stateManager.choices.ancestry;
    const background = stateManager.choices.background;
    const classChoice = stateManager.choices.class;

    if (!ancestry || !background?.item || !classChoice?.item) {
      return '<div>Please complete previous steps first</div>';
    }

    // Calculate boosts from each source
    const ancestryBoosts = this.getAncestryBoosts(ancestry);
    const backgroundBoosts = background.selectedBoosts || [];
    const classBoost = classChoice.keyAbility;
    const freeBoosts = stateManager.choices.abilities?.freeBoosts || [];

    // Calculate final scores
    const finalScores = this.calculateFinalScores(
      ancestryBoosts,
      backgroundBoosts,
      classBoost,
      freeBoosts
    );

    let html = `
      <div class="wizard-step step-abilities">
        <h2>Allocate Ability Scores</h2>
        <p class="step-description">At level 1, you receive boosts from your ancestry, background, class, and 4 free boosts. Each boost increases an ability score by 2 (max 18).</p>

        <div class="boost-summary">
          <h3>Your Boosts</h3>
          <div class="boost-source-list">
            <div class="boost-source">
              <strong>Ancestry (${ancestry.name}):</strong> ${this.formatBoostList(ancestryBoosts.boosts)}
            </div>
            ${ancestryBoosts.flaws.length > 0 ? `
              <div class="boost-source flaw-source">
                <strong>Ancestry Flaws:</strong> ${this.formatBoostList(ancestryBoosts.flaws, true)}
              </div>
            ` : ''}
            <div class="boost-source">
              <strong>Background (${background.item.name}):</strong> ${this.formatBoostList(backgroundBoosts)}
            </div>
            <div class="boost-source">
              <strong>Class (${classChoice.item.name}):</strong> ${getAbilityName(classBoost)}
            </div>
            <div class="boost-source">
              <strong>Free Boosts:</strong> ${freeBoosts.length}/4 allocated
            </div>
          </div>
        </div>

        <div class="ability-allocator">
          <h3>Ability Scores</h3>
          <p class="allocator-hint">Click on an ability to add a free boost. You have ${4 - freeBoosts.length} free boosts remaining.</p>
    `;

    // Generate ability rows
    for (const abilityKey of Object.keys(ABILITIES)) {
      const score = finalScores[abilityKey];
      const modifier = Math.floor((score - 10) / 2);
      const boostSources = this.getBoostSources(abilityKey, ancestryBoosts, backgroundBoosts, classBoost, freeBoosts);
      const freeBoostCount = freeBoosts.filter(a => a === abilityKey).length;
      const canAddBoost = freeBoosts.length < 4 && score < 18;

      html += `
        <div class="ability-row ${canAddBoost ? 'can-boost' : ''}" data-ability="${abilityKey}">
          <div class="ability-info">
            <div class="ability-name">${getAbilityName(abilityKey)}</div>
            <div class="ability-abbr">${abilityKey.toUpperCase()}</div>
          </div>
          <div class="ability-boosts">
            ${boostSources.map(source => `<span class="boost-indicator ${source.type}">${source.label}</span>`).join('')}
            ${freeBoostCount > 0 ? `<span class="boost-indicator free">Free ×${freeBoostCount}</span>` : ''}
          </div>
          <div class="ability-value">
            <div class="ability-score">${score}</div>
            <div class="ability-modifier">${modifier >= 0 ? '+' : ''}${modifier}</div>
          </div>
          ${canAddBoost ? `<button class="add-boost-btn" data-ability="${abilityKey}"><i class="fas fa-plus"></i></button>` : ''}
          ${freeBoostCount > 0 ? `<button class="remove-boost-btn" data-ability="${abilityKey}"><i class="fas fa-minus"></i></button>` : ''}
        </div>
      `;
    }

    html += `
        </div>
        ${this.generateNavigation()}
      </div>
    `;

    return html;
  }

  // Helper: Get ancestry boosts and flaws
  getAncestryBoosts(ancestry) {
    const boosts = [];
    const flaws = [];

    // Extract boosts
    if (ancestry.system.boosts) {
      for (const key in ancestry.system.boosts) {
        const boostData = ancestry.system.boosts[key];
        if (boostData.value) {
          boosts.push(...boostData.value);
        }
      }
    }

    // Extract flaws
    if (ancestry.system.flaws) {
      for (const key in ancestry.system.flaws) {
        const flawData = ancestry.system.flaws[key];
        if (flawData.value) {
          flaws.push(...flawData.value);
        }
      }
    }

    return { boosts, flaws };
  }

  // Helper: Calculate final ability scores
  calculateFinalScores(ancestryBoosts, backgroundBoosts, classBoost, freeBoosts) {
    const scores = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };

    // Apply ancestry boosts
    for (const boost of ancestryBoosts.boosts) {
      if (boost !== 'free' && scores[boost] !== undefined) {
        scores[boost] += 2;
      }
    }

    // Apply ancestry flaws
    for (const flaw of ancestryBoosts.flaws) {
      if (scores[flaw] !== undefined) {
        scores[flaw] -= 2;
      }
    }

    // Apply background boosts
    for (const boost of backgroundBoosts) {
      if (scores[boost] !== undefined) {
        scores[boost] += 2;
      }
    }

    // Apply class boost
    if (classBoost && scores[classBoost] !== undefined) {
      scores[classBoost] += 2;
    }

    // Apply free boosts
    for (const boost of freeBoosts) {
      if (scores[boost] !== undefined) {
        scores[boost] = Math.min(scores[boost] + 2, 18); // Cap at 18
      }
    }

    return scores;
  }

  // Helper: Get boost sources for display
  getBoostSources(abilityKey, ancestryBoosts, backgroundBoosts, classBoost, freeBoosts) {
    const sources = [];

    // Ancestry boosts
    if (ancestryBoosts.boosts.includes(abilityKey)) {
      sources.push({ type: 'ancestry', label: 'Ancestry' });
    }

    // Ancestry flaws
    if (ancestryBoosts.flaws.includes(abilityKey)) {
      sources.push({ type: 'flaw', label: 'Flaw' });
    }

    // Background boosts
    if (backgroundBoosts.includes(abilityKey)) {
      sources.push({ type: 'background', label: 'Background' });
    }

    // Class boost
    if (classBoost === abilityKey) {
      sources.push({ type: 'class', label: 'Class' });
    }

    return sources;
  }

  // Helper: Format boost list
  formatBoostList(boosts, isFlaws = false) {
    if (!boosts || boosts.length === 0) return 'None';

    return boosts
      .map(b => b === 'free' ? 'Free Choice' : getAbilityName(b))
      .join(', ');
  }

  // Step 6: Skill Selection
  generateStep6_Skills() {
    const stateManager = game.characterBuilder.stateManager;
    const background = stateManager.choices.background;
    const classChoice = stateManager.choices.class;
    const abilities = stateManager.choices.abilities;

    if (!background?.item || !classChoice?.item) {
      return '<div>Please complete previous steps first</div>';
    }

    // Calculate INT modifier for bonus skills
    const freeBoosts = abilities?.freeBoosts || [];
    const ancestryBoosts = this.getAncestryBoosts(stateManager.choices.ancestry);
    const backgroundBoosts = background.selectedBoosts || [];
    const classBoost = classChoice.keyAbility;

    const finalScores = this.calculateFinalScores(ancestryBoosts, backgroundBoosts, classBoost, freeBoosts);
    const intModifier = Math.floor((finalScores.int - 10) / 2);

    // Get class trained skills count
    const classSkillCount = classChoice.item.system?.trainedSkills?.value || 0;
    const totalClassSkills = Math.max(classSkillCount + intModifier, 0);

    // Get background skill (usually fixed, but some backgrounds have choice)
    const backgroundSkill = this.getBackgroundSkill(background.item);

    // Get selected skills
    const selectedSkills = stateManager.choices.skills?.trained || [];

    // Total skills: background (1) + class skills
    const totalSkillsNeeded = 1 + totalClassSkills;

    let html = `
      <div class="wizard-step step-skills">
        <h2>Select Skills</h2>
        <p class="step-description">Choose skills to train. Each skill improves your ability to perform specific tasks.</p>

        <div class="skill-summary">
          <div class="skill-info-box">
            <strong>Background Skill:</strong> ${backgroundSkill ? getSkillLabel(backgroundSkill) : 'Choose one'}
          </div>
          <div class="skill-info-box">
            <strong>Class Skills:</strong> ${classSkillCount} + ${intModifier} (INT) = ${totalClassSkills} to select
          </div>
          <div class="skill-info-box">
            <strong>Total Selected:</strong> ${selectedSkills.length}/${totalSkillsNeeded}
          </div>
        </div>

        <div class="skill-grid">
    `;

    // Generate skill cards
    for (const [skillKey, skillData] of Object.entries(SKILLS)) {
      const isSelected = selectedSkills.includes(skillKey);
      const isBackgroundSkill = backgroundSkill === skillKey;
      const abilityMod = Math.floor((finalScores[skillData.ability] - 10) / 2);

      const cardClass = [
        'skill-card',
        isSelected ? 'selected' : '',
        isBackgroundSkill ? 'background-skill' : ''
      ].filter(Boolean).join(' ');

      html += `
        <div class="${cardClass}" data-skill="${skillKey}">
          <div class="skill-header">
            <div class="skill-name">${skillData.label}</div>
            <div class="skill-modifier">${abilityMod >= 0 ? '+' : ''}${abilityMod}</div>
          </div>
          <div class="skill-ability">${getAbilityName(skillData.ability)}</div>
          ${isBackgroundSkill ? '<div class="skill-badge">Background</div>' : ''}
          ${isSelected && !isBackgroundSkill ? '<i class="fas fa-check-circle skill-check"></i>' : ''}
        </div>
      `;
    }

    html += `
        </div>
        ${this.generateNavigation()}
      </div>
    `;

    return html;
  }

  // Helper: Get background skill
  getBackgroundSkill(background) {
    // Most backgrounds have a fixed skill in their rules
    // For simplicity, we'll extract from the first skill boost in the background
    // In a real implementation, you'd parse the background's rule elements

    // Common background skill mappings
    const backgroundSkills = {
      'acolyte': 'religion',
      'acrobat': 'acrobatics',
      'animal-whisperer': 'nature',
      'artisan': 'crafting',
      'artist': 'performance',
      'barkeep': 'diplomacy',
      'barrister': 'diplomacy',
      'bounty-hunter': 'survival',
      'charlatan': 'deception',
      'criminal': 'stealth',
      'detective': 'society',
      'emissary': 'society',
      'entertainer': 'performance',
      'farmhand': 'athletics',
      'field-medic': 'medicine',
      'fortune-teller': 'occultism',
      'gambler': 'deception',
      'gladiator': 'performance',
      'guard': 'intimidation',
      'herbalist': 'nature',
      'hermit': 'nature',
      'hunter': 'survival',
      'laborer': 'athletics',
      'martial-disciple': 'acrobatics',
      'merchant': 'diplomacy',
      'miner': 'survival',
      'noble': 'society',
      'nomad': 'survival',
      'prisoner': 'stealth',
      'sailor': 'athletics',
      'scholar': 'arcana',
      'scout': 'survival',
      'street-urchin': 'thievery',
      'tinker': 'crafting',
      'warrior': 'intimidation'
    };

    return backgroundSkills[background.slug] || 'society';
  }

  // Step 7: Ancestry Feat (placeholder for now)
  async generateStep7_AncestryFeat() {
    return `
      <div class="wizard-step step-ancestry-feat">
        <h2>Choose Ancestry Feat</h2>
        <p>Step 7 - To be implemented</p>
        ${this.generateNavigation()}
      </div>
    `;
  }

  // Step 8: Class Features (placeholder for now)
  async generateStep8_ClassFeatures() {
    return `
      <div class="wizard-step step-class-features">
        <h2>Class Features</h2>
        <p>Step 8 - To be implemented</p>
        ${this.generateNavigation()}
      </div>
    `;
  }

  // Step 9: Spells (placeholder for now)
  async generateStep9_Spells() {
    return `
      <div class="wizard-step step-spells">
        <h2>Select Spells</h2>
        <p>Step 9 - To be implemented</p>
        ${this.generateNavigation()}
      </div>
    `;
  }

  // Helper: Generate boost selection UI
  generateBoostSelection(boosts, selectedBoosts) {
    let html = `
      <div class="boost-selection">
        <h3>Select 2 Ability Boosts</h3>
        <div class="boost-buttons">
    `;

    // Get available boost options from first two boost slots
    const boostOptions = [];
    if (boosts && boosts['0']) {
      boostOptions.push(...(boosts['0'].value || []));
    }
    if (boosts && boosts['1']) {
      boostOptions.push(...(boosts['1'].value || []));
    }

    // Remove duplicates
    const uniqueBoosts = [...new Set(boostOptions)];

    for (const ability of uniqueBoosts) {
      const isSelected = selectedBoosts.includes(ability);
      const btnClass = isSelected ? 'boost-btn selected' : 'boost-btn';

      html += `
        <button class="${btnClass}" data-ability="${ability}">
          ${getAbilityLabel(ability)}
        </button>
      `;
    }

    html += `
        </div>
        <p class="boost-count">Selected: <span class="boost-count-value">${selectedBoosts.length}</span>/2</p>
      </div>
    `;

    return html;
  }

  // Helper: Generate key ability selection UI
  generateKeyAbilitySelection(options, selectedAbility) {
    let html = `
      <div class="key-ability-selection">
        <h3>Choose Key Ability</h3>
        <div class="key-ability-buttons">
    `;

    for (const ability of options) {
      const isSelected = selectedAbility === ability;
      const btnClass = isSelected ? 'key-ability-btn selected' : 'key-ability-btn';

      html += `
        <button class="${btnClass}" data-ability="${ability}">
          ${getAbilityLabel(ability)}
        </button>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // Helper: Format flaws
  formatFlaws(flaws) {
    if (!flaws || Object.keys(flaws).length === 0) {
      return '';
    }

    const flawList = [];
    for (const key in flaws) {
      const flawAbilities = flaws[key].value || [];
      flawList.push(...flawAbilities);
    }

    if (flawList.length === 0) return '';

    return `
      <div class="card-flaws">
        <i class="fas fa-minus-circle"></i> Flaw: ${flawList.map(a => getAbilityLabel(a)).join(', ')}
      </div>
    `;
  }

  // Generate navigation buttons
  generateNavigation() {
    const stateManager = game.characterBuilder.stateManager;
    const canGoBack = stateManager.currentStep > STEPS.ANCESTRY;
    const canAdvance = stateManager.canAdvanceStep();
    const isLastStep = stateManager.currentStep >= STEPS.SPELLS;

    const prevDisabled = !canGoBack ? 'disabled' : '';
    const nextDisabled = !canAdvance ? 'disabled' : '';
    const nextLabel = isLastStep ? 'Finalize Character' : 'Next';

    return `
      <div class="wizard-navigation">
        <button class="nav-button prev-step" ${prevDisabled}>
          <i class="fas fa-arrow-left"></i> Previous
        </button>
        <button class="nav-button next-step" ${nextDisabled}>
          ${nextLabel} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;
  }

  // Activate event listeners
  activateListeners(html) {
    super.activateListeners(html);

    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;

    // Navigation buttons
    html.find('.prev-step').click(() => {
      stateManager.previousStep();
    });

    html.find('.next-step').click(() => {
      stateManager.nextStep();
    });

    // Progress bar step clicks
    html.find('.progress-step').click((ev) => {
      const step = parseInt(ev.currentTarget.dataset.step);
      stateManager.goToStep(step);
    });

    // Ancestry selection
    html.find('.step-ancestry .selection-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const ancestries = await dataProvider.getAncestries();
      const ancestry = ancestries.find(a => a.id === itemId);

      if (ancestry) {
        stateManager.setChoice('ancestry', ancestry);
      }
    });

    // Heritage selection
    html.find('.step-heritage .selection-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const ancestrySlug = stateManager.choices.ancestry?.slug;
      const heritages = await dataProvider.getHeritages(ancestrySlug);
      const heritage = heritages.find(h => h.id === itemId);

      if (heritage) {
        stateManager.setChoice('heritage', heritage);
      }
    });

    // Background selection
    html.find('.step-background .selection-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const backgrounds = await dataProvider.getBackgrounds();
      const background = backgrounds.find(b => b.id === itemId);

      if (background) {
        stateManager.setChoice('background', {
          item: background,
          selectedBoosts: []
        });
        this.updateDisplay();
      }
    });

    // Background boost selection
    html.find('.boost-btn').click((ev) => {
      const ability = ev.currentTarget.dataset.ability;
      const currentBoosts = stateManager.choices.background?.selectedBoosts || [];

      if (currentBoosts.includes(ability)) {
        // Remove boost
        const newBoosts = currentBoosts.filter(a => a !== ability);
        stateManager.setChoice('background', {
          item: stateManager.choices.background.item,
          selectedBoosts: newBoosts
        });
      } else if (currentBoosts.length < 2) {
        // Add boost
        stateManager.setChoice('background', {
          item: stateManager.choices.background.item,
          selectedBoosts: [...currentBoosts, ability]
        });
      }
    });

    // Class selection
    html.find('.step-class .selection-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const classes = await dataProvider.getClasses();
      const cls = classes.find(c => c.id === itemId);

      if (cls) {
        stateManager.setChoice('class', {
          item: cls,
          keyAbility: null
        });
        this.updateDisplay();
      }
    });

    // Key ability selection
    html.find('.key-ability-btn').click((ev) => {
      const ability = ev.currentTarget.dataset.ability;
      stateManager.setChoice('class', {
        item: stateManager.choices.class.item,
        keyAbility: ability
      });
    });

    // Ability score boost allocation
    html.find('.add-boost-btn').click((ev) => {
      const ability = ev.currentTarget.dataset.ability;
      const currentAbilities = stateManager.choices.abilities || { freeBoosts: [] };
      const freeBoosts = currentAbilities.freeBoosts || [];

      if (freeBoosts.length < 4) {
        stateManager.setChoice('abilities', {
          freeBoosts: [...freeBoosts, ability]
        });
      }
    });

    html.find('.remove-boost-btn').click((ev) => {
      const ability = ev.currentTarget.dataset.ability;
      const currentAbilities = stateManager.choices.abilities || { freeBoosts: [] };
      const freeBoosts = currentAbilities.freeBoosts || [];

      // Remove one instance of this ability
      const index = freeBoosts.indexOf(ability);
      if (index > -1) {
        const newBoosts = [...freeBoosts];
        newBoosts.splice(index, 1);
        stateManager.setChoice('abilities', {
          freeBoosts: newBoosts
        });
      }
    });

    // Skill selection
    html.find('.skill-card').click((ev) => {
      const skillKey = ev.currentTarget.dataset.skill;
      const currentSkills = stateManager.choices.skills || { trained: [] };
      const selectedSkills = currentSkills.trained || [];

      // Get background skill
      const background = stateManager.choices.background?.item;
      const backgroundSkill = this.getBackgroundSkill(background);

      // Background skill is always selected
      if (skillKey === backgroundSkill) {
        return; // Can't deselect background skill
      }

      // Toggle skill selection
      if (selectedSkills.includes(skillKey)) {
        // Deselect
        const newSkills = selectedSkills.filter(s => s !== skillKey);
        // Always include background skill
        if (!newSkills.includes(backgroundSkill)) {
          newSkills.unshift(backgroundSkill);
        }
        stateManager.setChoice('skills', { trained: newSkills });
      } else {
        // Select if we haven't exceeded the limit
        const classChoice = stateManager.choices.class;
        const abilities = stateManager.choices.abilities;
        const freeBoosts = abilities?.freeBoosts || [];
        const ancestryBoosts = this.getAncestryBoosts(stateManager.choices.ancestry);
        const backgroundBoosts = stateManager.choices.background.selectedBoosts || [];
        const classBoost = classChoice.keyAbility;
        const finalScores = this.calculateFinalScores(ancestryBoosts, backgroundBoosts, classBoost, freeBoosts);
        const intModifier = Math.floor((finalScores.int - 10) / 2);
        const classSkillCount = classChoice.item.system?.trainedSkills?.value || 0;
        const totalSkillsNeeded = 1 + Math.max(classSkillCount + intModifier, 0);

        if (selectedSkills.length < totalSkillsNeeded) {
          const newSkills = [...selectedSkills, skillKey];
          // Ensure background skill is included
          if (!newSkills.includes(backgroundSkill)) {
            newSkills.unshift(backgroundSkill);
          }
          stateManager.setChoice('skills', { trained: newSkills });
        } else {
          ui.notifications.warn("You have already selected the maximum number of skills");
        }
      }
    });
  }

  // Update display (re-render)
  async updateDisplay() {
    if (!this.element) return;

    const html = await this.generateHTML();

    // Update title
    this.element.find('.window-title').text(this.title);

    // Update content
    const content = this.element.find('.window-content');
    if (content.length > 0) {
      content.html(html);
      this.activateListeners(this.element);
    }
  }
}
