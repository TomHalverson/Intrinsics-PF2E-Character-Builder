// Character Builder App - Main UI Application
import { STEPS, STEP_NAMES } from './character-state-manager.js';
import { formatBoosts, formatTraits, getAbilityLabel, getAbilityName, getSkillLabel, ABILITIES, SKILLS } from './utils.js';
import { generateEquipmentReminders } from './equipment-reminders.js';

const MODULE_ID = "intrinsics-pf2e-character-builder";

// Language descriptions
const LANGUAGE_DESCRIPTIONS = {
  // Common Languages
  'draconic': 'The ancient language of dragons and their kin, known for its harsh consonants and sibilant hisses.',
  'dwarven': 'The sturdy language of dwarves, characterized by guttural sounds and an emphasis on clan and craft.',
  'elven': 'An elegant and flowing language spoken by elves, known for its melodic quality.',
  'fey': 'The whimsical and ever-changing language of the fey, filled with riddles and wordplay.',
  'gnomish': 'A rapid and excited language spoken by gnomes, often difficult for others to follow.',
  'goblin': 'A harsh, fast-paced language of goblins, filled with words for fire and mischief.',
  'halfling': 'A warm and friendly language that borrows heavily from other cultures.',
  'jotun': 'The booming language of giants, powerful and resonant.',
  'orcish': 'A harsh and aggressive language spoken by orcs and their allies.',
  'sakvroth': 'The sinister language of the drow and other Darklands denizens.',
  'taldane': 'Taldane is the most widely spoken language in Avistan and Garund; indeed, it is often referred to as Common across the Inner Sea Region. It is a trade language which takes its alphabet from ancient Jistka and its numerals from Kelish. Most of the terms and grammar are based on ancient Azlanti, although Taldane also borrows from Varisian.',
  'common': 'Taldane is the most widely spoken language in Avistan and Garund; indeed, it is often referred to as Common across the Inner Sea Region. It is a trade language which takes its alphabet from ancient Jistka and its numerals from Kelish. Most of the terms and grammar are based on ancient Azlanti, although Taldane also borrows from Varisian.',

  // Uncommon Languages
  'adlet': 'The language of the adlet, a race of wolf-headed humanoids from the frozen north.',
  'aklo': 'An ancient and unsettling language associated with aberrations and dark magic.',
  'algollthu': 'The telepathic language of the alghollthus, masters of mental manipulation.',
  'amarrun': 'A regional language spoken in specific areas of the Inner Sea.',
  'arboreal': 'The slow and methodical language of treants and other plant creatures.',
  'boggard': 'The croaking language of boggards, filled with amphibian sounds.',
  'calda': 'A regional language from the northern reaches.',
  'caligni': 'The whispering language of the caligni, denizens of the dark.',
  'chthonian': 'The dark language of the demons of the Abyss.',
  'cyclops': 'An ancient language of prophecy and fate, spoken by cyclopes.',
  'daemonic': 'The vile language of daemons from Abaddon.',
  'diabolic': 'The formal and legalistic language of devils from Hell.',
  'ekujae': 'The language of the Ekujae elves of the Mwangi Expanse.',
  'empyrean': 'The celestial language of angels and other good-aligned outsiders.',
  'grippli': 'The language of the grippli, tree frog humanoids.',
  'hallit': 'A coarse language often spoken by Kellid barbarians, it has no written form.',
  'iruxi': 'The hissing language of lizardfolk.',
  'kelish': 'A flowing language from the nation of Qadira.',
  'kholo': 'The language of gnolls, filled with barks and laughs.',
  'kibwani': 'A regional language from the Mwangi Expanse.',
  'kitsune': 'The language of the fox-like kitsune people.',
  'lirgeni': 'The language once spoken in the lost nation of Lirgen.',
  'muan': 'A regional language from Tian Xia.',
  'mwangi': 'One of the primary languages of the Mwangi Expanse.',
  'mzunu': 'A regional language from the Mwangi Expanse.',
  'nagaji': 'The serpentine language of the nagaji people.',
  'necril': 'The whispering language of the undead and necromancers.',
  'ocotan': 'A regional language from specific areas.',
  'osiriani': 'The ancient language of Osirion, filled with historical significance.',
  'petran': 'The language of earth elementals and stone-dwelling creatures.',
  'protean': 'The ever-changing language of proteans from the Maelstrom.',
  'pyric': 'The crackling language of fire elementals.',
  'requian': 'The language of psychopomps and the River of Souls.',
  'shadowtongue': 'The dark language of the Shadow Plane.',
  'shoanti': 'The tribal language of the Shoanti people of Varisia.',
  'skald': 'The language of the Ulfen people in Avistans north.',
  'sphinx': 'The riddling language of sphinxes.',
  'sussaran': 'The language of air elementals and sky-dwelling creatures.',
  'tang': 'A regional language from Tian Xia.',
  'tengu': 'The rapid, clicking language of the crow-like tengu.',
  'thalassic': 'The flowing language of water elementals and aquatic beings.',
  'tien': 'The common language of Tian Xia, the Dragon Empires.',
  'utopian': 'The harmonious language of axiomites and other lawful outsiders.',
  'vanara': 'The language of the monkey-like vanara people.',
  'varisian': 'The language of Varisia, known for its wandering people and traditions.',
  'vudrani': 'The ancient and complex language of Vudra.',
  'xanmba': 'A regional language from the Mwangi Expanse.',
  'wayang': 'The whispering language of the shadow-touched wayang.',
  'ysoki': 'The chittering language of the ratfolk.',

  // Rare Languages
  'akitonian': 'The language of the red planet Akiton.',
  'anadi': 'The language of the spider-like anadi people.',
  'ancient-osiriani': 'The archaic form of Osiriani, used in ancient texts.',
  'androffan': 'The technological language of the Androffans.',
  'anugobu': 'An ancient goblinoid language.',
  'arcadian': 'The language of distant Arcadia.',
  'azlanti': 'The lost language of ancient Azlant, ancestor to many modern tongues.',
  'destrachan': 'The sonic language of destrochans.',
  'drooni': 'The language of the drow clans.',
  'dziriak': 'The language of the shadow-dwelling dzirak.',
  'elder-thing': 'The alien language of the Elder Things.',
  'erutaki': 'The language of the Erutaki people of the far north.',
  'formian': 'The language of the ant-like formians.',
  'garundi': 'An ancient language of northern Garund.',
  'girtablilu': 'The language of the scorpion-folk.',
  'goloma': 'The language of the many-eyed goloma.',
  'grioth': 'The alien language of the bat-like grioth.',
  'hwan': 'A regional language from Tian Xia.',
  'iblydan': 'The language of certain demonic cults.',
  'ikeshti': 'The language of the desert-dwelling ikeshti lizardfolk.',
  'immolis': 'The language of fire-dwelling creatures.',
  'jistkan': 'The ancient language of the Jistka Imperium.',
  'jyoti': 'The language of the light-dwelling jyoti.',
  'kaava': 'A regional tribal language.',
  'kashrishi': 'The language of the wise kashrishi people.',
  'kovintal': 'A rare regional language.',
  'lashunta': 'The language of the telepathic lashunta of Castrovel.',
  'mahwek': 'A regional language from specific areas.',
  'migo': 'The alien language of the mi-go.',
  'minaten': 'A regional language from Tian Xia.',
  'minkaian': 'The language of Minkai in Tian Xia.',
  'munavri': 'The language of the psychic munavri.',
  'okaiyan': 'A regional language from Tian Xia.',
  'orvian': 'The trade language of Orv in the Darklands.',
  'rasu': 'The language of the psychopomp rasus.',
  'ratajin': 'The language of the shapeshifting ratajin.',
  'razatlani': 'An ancient language from lost civilizations.',
  'russian': 'The language of distant Irrisen and beyond.',
  'samsaran': 'The mystical language of the reincarnating samsarans.',
  'sasquatch': 'The language of the elusive sasquatch.',
  'senzar': 'An esoteric language of enlightenment.',
  'shae': 'The language of the shadow-plane shae.',
  'shisk': 'The language of the reptilian shisk.',
  'shobhad': 'The language of the four-armed shobhad of Akiton.',
  'shoony': 'The language of the dog-like shoony people.',
  'shory': 'The lost language of the flying Shory Empire.',
  'strix': 'The language of the winged strix.',
  'surki': 'A regional language from specific areas.',
  'talican': 'A rare regional language.',
  'tanuki': 'The language of the raccoon-dog tanuki.',
  'tekritanin': 'An ancient dwarven language.',
  'thassilonian': 'The ancient language of the Thassilonian Empire.',
  'varki': 'The language of the Varki people of the far north.',
  'vishkanyan': 'The serpentine language of the vishkanya.',
  'wyrwood': 'The language of the construct wyrwoods.',
  'yaksha': 'The language of the yaksha spirits.',
  'yithian': 'The alien language of the time-traveling yithians.',

  // Secret Languages
  'wildsong': 'The secret language of druids, allowing communication with nature.'
};

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

    const header = this.generateHeader();
    const stepContent = await this.generateStepContent();

    return `
      ${header}
      <div class="wizard-content">
        ${stepContent}
      </div>
    `;
  }

  // Generate header with navigation and progress
  generateHeader() {
    const stateManager = game.characterBuilder.stateManager;
    const currentStep = stateManager.currentStep;
    const completedSteps = stateManager.completedSteps;

    const canGoBack = currentStep > STEPS.ANCESTRY;
    const canAdvance = stateManager.canAdvanceStep();
    const isLastStep = currentStep >= STEPS.EQUIPMENT;
    const prevDisabled = !canGoBack ? 'disabled' : '';
    const nextDisabled = !canAdvance ? 'disabled' : '';
    const nextLabel = isLastStep ? 'Finalize' : 'Next';

    let html = `
      <div class="wizard-header">
        <button class="nav-button prev-step" ${prevDisabled}>
          <i class="fas fa-arrow-left"></i> Previous
        </button>
        <div class="wizard-progress">
    `;

    for (let step = STEPS.CLASS; step <= STEPS.EQUIPMENT; step++) {
      const stepName = STEP_NAMES[step];
      const isCompleted = completedSteps.has(step);
      const isCurrent = step === currentStep;
      const classes = [];

      if (isCompleted) classes.push('completed');
      if (isCurrent) classes.push('active');

      // Step icons
      const stepIcons = {
        1: 'fa-shield', // Class
        2: 'fa-users', // Ancestry
        3: 'fa-user', // Heritage
        4: 'fa-book-open', // Deity
        5: 'fa-book', // Background
        6: 'fa-dice-d20', // Abilities
        7: 'fa-tools', // Skills
        8: 'fa-star', // Ancestry Feat
        9: 'fa-wand-magic-sparkles', // Cantrips
        10: 'fa-magic', // Spells
        11: 'fa-id-card', // Bio
        12: 'fa-shopping-bag' // Equipment
      };

      html += `
        <div class="progress-step ${classes.join(' ')}" data-step="${step}">
          <div class="step-icon"><i class="fas ${stepIcons[step]}"></i></div>
          <div class="step-label">${stepName}</div>
        </div>
      `;
    }

    html += `
        </div>
        <button class="nav-button next-step" ${nextDisabled}>
          ${nextLabel} <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    `;

    return html;
  }

  // Generate selection summary
  generateSelectionSummary() {
    const stateManager = game.characterBuilder.stateManager;
    const choices = stateManager.choices;

    const selections = [];

    if (choices.class?.item) {
      selections.push(`<span class="summary-item"><strong>Class:</strong> ${choices.class.item.name}</span>`);
    }

    if (choices.ancestry) {
      selections.push(`<span class="summary-item"><strong>Ancestry:</strong> ${choices.ancestry.name}</span>`);
    }

    if (choices.heritage) {
      selections.push(`<span class="summary-item"><strong>Heritage:</strong> ${choices.heritage.name}</span>`);
    }

    if (choices.background?.item) {
      selections.push(`<span class="summary-item"><strong>Background:</strong> ${choices.background.item.name}</span>`);
    }

    if (choices.abilities?.freeBoosts?.length > 0) {
      const boosts = choices.abilities.freeBoosts.map(b => b.toUpperCase()).join(', ');
      selections.push(`<span class="summary-item"><strong>Boosts:</strong> ${boosts}</span>`);
    }

    if (choices.skills?.trained?.length > 0) {
      selections.push(`<span class="summary-item"><strong>Skills:</strong> ${choices.skills.trained.length} selected</span>`);
    }

    if (choices.ancestryFeat) {
      selections.push(`<span class="summary-item"><strong>Ancestry Feat:</strong> ${choices.ancestryFeat.name}</span>`);
    }

    if (choices.spells?.cantrips?.length > 0 || choices.spells?.level1?.length > 0) {
      const cantripCount = choices.spells?.cantrips?.length || 0;
      const spellCount = choices.spells?.level1?.length || 0;
      selections.push(`<span class="summary-item"><strong>Spells:</strong> ${cantripCount} cantrips, ${spellCount} level 1</span>`);
    }

    if (selections.length === 0) {
      return '<div class="selection-summary"><span class="summary-placeholder">Make your selections to see them here</span></div>';
    }

    return `
      <div class="selection-summary">
        ${selections.join('')}
      </div>
    `;
  }

  // Generate step-specific content
  async generateStepContent() {
    const stateManager = game.characterBuilder.stateManager;
    const step = stateManager.currentStep;

    switch(step) {
      case STEPS.CLASS:
        return await this.generateStep1_Class();
      case STEPS.ANCESTRY:
        return await this.generateStep2_Ancestry();
      case STEPS.HERITAGE:
        return await this.generateStep3_Heritage();
      case STEPS.DEITY:
        return await this.generateStep4_Deity();
      case STEPS.BACKGROUND:
        return await this.generateStep5_Background();
      case STEPS.ABILITIES:
        return this.generateStep6_Abilities();
      case STEPS.SKILLS:
        return this.generateStep7_Skills();
      case STEPS.FEATS:
        return await this.generateStep8_Feats();
      case STEPS.CANTRIPS:
        return await this.generateStep9_Cantrips();
      case STEPS.SPELLS:
        return await this.generateStep10_Spells();
      case STEPS.BIO:
        return this.generateStep11_Bio();
      case STEPS.EQUIPMENT:
        return await this.generateStep12_Equipment();
      default:
        return '<div>Unknown step</div>';
    }
  }

  // Step 2: Ancestry Selection
  async generateStep2_Ancestry() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedAncestry = stateManager.choices.ancestry;

    // Load ancestries
    const ancestries = await dataProvider.getAncestries();

    let html = `
      <div class="wizard-step step-ancestry">
        <h2>Choose Your Ancestry</h2>
        <p class="step-description">Your ancestry determines your HP, size, speed, ability boosts and flaws, and languages.</p>
    `;

    if (!ancestries || ancestries.length === 0) {
      html += `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p><strong>No ancestries found!</strong></p>
          <p>Make sure you're in a PF2E game world and the PF2E system compendia are available.</p>
          <p>Check the browser console (F12) for more details.</p>
        </div>
      `;
    } else {
      // Two-column layout: grid on left, info panel on right
      html += `<div class="selection-with-info">`;
      html += `<div class="selection-grid-column">`;
      // Group ancestries by rarity
      const byRarity = {
        common: ancestries.filter(a => (a.system?.traits?.rarity || a.system?.rarity || a.rarity) === 'common'),
        uncommon: ancestries.filter(a => (a.system?.traits?.rarity || a.system?.rarity || a.rarity) === 'uncommon'),
        rare: ancestries.filter(a => (a.system?.traits?.rarity || a.system?.rarity || a.rarity) === 'rare')
      };

      // Display each rarity group
      for (const [rarity, items] of Object.entries(byRarity)) {
        if (items.length === 0) continue;

        const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
        const rarityClass = `rarity-${rarity}`;

        html += `
          <div class="rarity-section">
            <h3 class="rarity-header ${rarityClass}">${rarityLabel} Ancestries</h3>
            <div class="ancestry-grid">
        `;

        for (const ancestry of items) {
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
          </div>
        `;
      }

      // Close selection grid column
      html += `</div>`;

      // Info panel
      html += `<div class="selection-info-panel">`;

      if (selectedAncestry) {
        const rawDescription = selectedAncestry.system?.description?.value || 'No description available.';
        const description = await TextEditor.enrichHTML(rawDescription, { async: true });

        html += `
          <div class="info-panel-content">
            <h3>${selectedAncestry.name}</h3>
            <div class="info-description">${description}</div>
          </div>
        `;
      } else {
        html += `
          <div class="info-panel-placeholder">
            <i class="fas fa-info-circle"></i>
            <p>Select an ancestry to view details</p>
          </div>
        `;
      }

      html += `</div>`;
      html += `</div>`; // Close selection-with-info
    }

    html += `
      </div>
    `;

    return html;
  }

  // Step 3: Heritage Selection
  async generateStep3_Heritage() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedAncestry = stateManager.choices.ancestry;
    const selectedHeritage = stateManager.choices.heritage;

    if (!selectedAncestry) {
      return '<div>Please select an ancestry first</div>';
    }

    // Load heritages for selected ancestry (returns { specific, versatile })
    const heritageData = await dataProvider.getHeritages(selectedAncestry.slug);

    let html = `
      <div class="wizard-step step-heritage">
        <h2>Choose Your Heritage</h2>
        <p class="step-description">Your heritage represents your lineage within your ${selectedAncestry.name} ancestry.</p>
    `;

    // Display ancestry-specific heritages
    if (heritageData.specific && heritageData.specific.length > 0) {
      html += `
        <div class="rarity-section">
          <h3 class="rarity-header rarity-common">${selectedAncestry.name} Heritages</h3>
          <div class="heritage-list">
      `;

      for (const heritage of heritageData.specific) {
        const isSelected = selectedHeritage?.id === heritage.id;
        const cardClass = isSelected ? 'selection-card selected' : 'selection-card';
        const rawDesc = heritage.system.description?.value || '';
        const description = await TextEditor.enrichHTML(rawDesc, { async: true });

        html += `
          <div class="${cardClass}" data-item-id="${heritage.id}">
            <img class="card-icon" src="${heritage.img}" alt="${heritage.name}">
            <h3 class="card-title">${heritage.name}</h3>
            <div class="card-description">${description}</div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    // Display versatile heritages
    if (heritageData.versatile && heritageData.versatile.length > 0) {
      html += `
        <div class="rarity-section">
          <h3 class="rarity-header rarity-uncommon">Versatile Heritages</h3>
          <div class="heritage-list">
      `;

      for (const heritage of heritageData.versatile) {
        const isSelected = selectedHeritage?.id === heritage.id;
        const cardClass = isSelected ? 'selection-card selected' : 'selection-card';
        const rawDesc = heritage.system.description?.value || '';
        const description = await TextEditor.enrichHTML(rawDesc, { async: true });

        html += `
          <div class="${cardClass}" data-item-id="${heritage.id}">
            <img class="card-icon" src="${heritage.img}" alt="${heritage.name}">
            <h3 class="card-title">${heritage.name}</h3>
            <div class="card-description">${description}</div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
      </div>
    `;

    return html;
  }

  // Step 4: Deity Selection (Optional)
  async generateStep4_Deity() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedDeity = stateManager.choices.deity;

    // Load deities
    const deities = await dataProvider.getDeities();

    // Get the compendium pack to access folder information
    const pack = game.packs.get("pf2e.deities");
    let deitiesByFolder = { 'Core Gods': [], 'Other': [] };

    if (pack) {
      // Try to organize by folders if available
      for (const deity of deities) {
        const folder = pack.folders?.find(f => deity.folder?.id === f.id);
        if (folder && folder.name) {
          if (!deitiesByFolder[folder.name]) {
            deitiesByFolder[folder.name] = [];
          }
          deitiesByFolder[folder.name].push(deity);
        } else {
          deitiesByFolder['Other'].push(deity);
        }
      }
    } else {
      // If we can't access folders, put all in "Other"
      deitiesByFolder['Other'] = deities;
    }

    // Sort folders so Core Deities comes first, then alphabetically
    const sortedFolders = Object.keys(deitiesByFolder).sort((a, b) => {
      if (a === 'Core Gods') return -1;
      if (b === 'Core Gods') return 1;
      return a.localeCompare(b);
    });

    // Extract all unique domains for filtering
    const allDomains = new Set();
    deities.forEach(deity => {
      const domains = deity.system.domains?.primary || [];
      domains.forEach(domain => allDomains.add(domain));
    });
    const sortedDomains = Array.from(allDomains).sort();

    // Extract all unique favored weapons for filtering
    const allWeapons = new Set();
    deities.forEach(deity => {
      const weapons = deity.system?.weapons;
      if (Array.isArray(weapons) && weapons.length > 0) {
        weapons.forEach(weapon => allWeapons.add(weapon));
      }
    });
    const sortedWeapons = Array.from(allWeapons).sort();

    let html = `
      <div class="wizard-step step-deity">
        <h2>Select a Deity (Optional)</h2>
        <p class="step-description">Choose a deity your character worships, or skip this step.</p>

        ${selectedDeity ? `
          <div class="selection-summary">
            <div class="summary-header">
              <i class="fas fa-check-circle"></i>
              <strong>Selected Deity:</strong>
            </div>
            <div class="summary-content">
              <img src="${selectedDeity.img || 'icons/svg/mystery-man.svg'}" alt="${selectedDeity.name}" class="summary-icon">
              <div class="summary-details">
                <div class="summary-name">${selectedDeity.name}</div>
                <div class="summary-meta">${selectedDeity.system.alignment ? selectedDeity.system.alignment.own : ''}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="deity-filters">
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" class="deity-search" placeholder="Search deities, domains, or weapons..." />
          </div>

          <div class="filter-row">
            <div class="filter-select-container">
              <label for="pantheon-filter"><i class="fas fa-filter"></i> Pantheon:</label>
              <select id="pantheon-filter" class="pantheon-filter">
                <option value="">All Pantheons</option>
                ${sortedFolders.map(folder => `<option value="${folder}">${folder}</option>`).join('')}
              </select>
            </div>

            <div class="filter-select-container">
              <label for="domain-filter"><i class="fas fa-book"></i> Domain:</label>
              <select id="domain-filter" class="domain-filter">
                <option value="">All Domains</option>
                ${sortedDomains.map(domain => `<option value="${domain}">${domain}</option>`).join('')}
              </select>
            </div>

            <div class="filter-select-container">
              <label for="weapon-filter"><i class="fas fa-sword"></i> Favored Weapon:</label>
              <select id="weapon-filter" class="weapon-filter">
                <option value="">All Weapons</option>
                ${sortedWeapons.map(weapon => {
                  // Format weapon name for display
                  const displayName = weapon.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                  return `<option value="${weapon}">${displayName}</option>`;
                }).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="deity-selection-container">
    `;

    // Render deities grouped by folder
    for (const folderName of sortedFolders) {
      const folderDeities = deitiesByFolder[folderName];
      if (folderDeities.length === 0) continue;

      html += `
        <div class="deity-folder" data-folder="${folderName}">
          <h3 class="folder-title">${folderName}</h3>
          <div class="selection-grid">
      `;

      for (const deity of folderDeities) {
        const isSelected = selectedDeity?.uuid === deity.uuid;
        const img = deity.img || 'icons/svg/mystery-man.svg';

        // Enrich description for searching and display
        const rawDescription = deity.system.description?.value || 'No description available.';
        const description = await TextEditor.enrichHTML(rawDescription, { async: true });

        // Extract category/font for display
        const font = deity.system.font ? deity.system.font.join(', ') : '';
        const domains = deity.system.domains?.primary || [];

        // Extract favored weapons
        const weapons = deity.system?.weapons || [];
        const weaponNames = weapons.map(w =>
          w.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        );

        html += `
          <div class="selection-card deity-card ${isSelected ? 'selected' : ''}"
               data-uuid="${deity.uuid}"
               data-type="deity"
               data-name="${deity.name.toLowerCase()}"
               data-description="${rawDescription.toLowerCase().replace(/<[^>]*>/g, '')}"
               data-domains="${domains.map(d => d.toLowerCase()).join(',')}"
               data-weapons="${weapons.map(w => w.toLowerCase()).join(',')}">
            <div class="card-icon">
              <img src="${img}" alt="${deity.name}" />
            </div>
            <div class="card-content">
              <h3 class="card-title">${deity.name}</h3>
              <div class="card-traits">
                ${deity.system.alignment ? `<span class="trait">${deity.system.alignment.own}</span>` : ''}
              </div>
              <div class="deity-meta">
                ${font ? `<div class="deity-font"><strong>Font:</strong> ${font}</div>` : ''}
                ${weaponNames.length > 0 ? `<div class="deity-weapon"><strong>Favored Weapon:</strong> ${weaponNames.join(', ')}</div>` : ''}
                ${domains.length > 0 ? `<div class="deity-domains"><strong>Domains:</strong> ${domains.slice(0, 3).join(', ')}${domains.length > 3 ? '...' : ''}</div>` : ''}
              </div>
              <div class="card-description">${description}</div>
            </div>
            ${isSelected ? '<i class="fas fa-check-circle selected-icon"></i>' : ''}
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // Step 5: Background Selection
  async generateStep5_Background() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedBackground = stateManager.choices.background?.item;

    // Load backgrounds
    const backgrounds = await dataProvider.getBackgrounds();

    let html = `
      <div class="wizard-step step-background">
        <h2>Choose Your Background</h2>
        <p class="step-description">Your background represents your training and experiences before becoming an adventurer. Ability boosts will be allocated on your character sheet.</p>

        ${selectedBackground ? `
          <div class="selection-summary">
            <div class="summary-header">
              <i class="fas fa-check-circle"></i>
              <strong>Selected Background:</strong>
            </div>
            <div class="summary-content">
              <img src="${selectedBackground.img || 'icons/svg/mystery-man.svg'}" alt="${selectedBackground.name}" class="summary-icon">
              <div class="summary-details">
                <div class="summary-name">${selectedBackground.name}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" class="background-search" placeholder="Search backgrounds..." />
        </div>

        <div class="background-container">
    `;

    // Group by rarity
    const byRarity = {
      common: backgrounds.filter(b => (b.system?.traits?.rarity || b.system?.rarity || b.rarity) === 'common'),
      uncommon: backgrounds.filter(b => (b.system?.traits?.rarity || b.system?.rarity || b.rarity) === 'uncommon'),
      rare: backgrounds.filter(b => (b.system?.traits?.rarity || b.system?.rarity || b.rarity) === 'rare')
    };

    for (const [rarity, items] of Object.entries(byRarity)) {
      if (items.length === 0) continue;

      const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
      const rarityClass = `rarity-${rarity}`;

      html += `
        <div class="rarity-section" data-rarity="${rarity}">
          <h3 class="rarity-header ${rarityClass}">${rarityLabel} Backgrounds</h3>
          <div class="background-grid">
      `;

      for (const background of items) {
        const isSelected = selectedBackground?.id === background.id;
        const cardClass = isSelected ? 'selection-card selected' : 'selection-card';
        const rawDesc = background.system.description?.value || '';
        const description = await TextEditor.enrichHTML(rawDesc, { async: true });

        html += `
          <div class="${cardClass}" data-item-id="${background.id}" data-name="${background.name.toLowerCase()}">
            <img class="card-icon" src="${background.img}" alt="${background.name}">
            <h3 class="card-title">${background.name}</h3>
            <div class="card-boosts">
              ${formatBoosts(background.system.boosts)}
            </div>
            <div class="card-description">${description}</div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
        </div>

      </div>
    `;

    return html;
  }

  // Step 4: Class Selection
  async generateStep1_Class() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const selectedClass = stateManager.choices.class?.item;

    // Load classes
    const classes = await dataProvider.getClasses();
    console.log(`intrinsics-pf2e-character-builder | Loaded ${classes.length} total classes`);

    // Group classes by category
    const classGroups = {
      MARTIALS: ['alchemist', 'barbarian', 'champion', 'commander', 'fighter', 'guardian', 'gunslinger', 'inventor', 'investigator', 'monk', 'ranger', 'rogue', 'swashbuckler'],
      SPELLCASTERS: ['animist', 'cleric', 'druid', 'necromancer', 'psychic', 'oracle', 'sorcerer', 'witch', 'wizard'],
      HYBRID: ['bard', 'exemplar', 'runesmith', 'kineticist', 'magus', 'summoner', 'thaumaturge']
    };

    const groupedClasses = {
      MARTIALS: classes.filter(c => classGroups.MARTIALS.includes(c.slug)),
      SPELLCASTERS: classes.filter(c => classGroups.SPELLCASTERS.includes(c.slug)),
      HYBRID: classes.filter(c => classGroups.HYBRID.includes(c.slug))
    };

    // Log any classes that don't fit into a category
    const allCategorizedSlugs = [...classGroups.MARTIALS, ...classGroups.SPELLCASTERS, ...classGroups.HYBRID];
    const uncategorized = classes.filter(c => !allCategorizedSlugs.includes(c.slug));
    if (uncategorized.length > 0) {
      console.warn(`intrinsics-pf2e-character-builder | Uncategorized classes (${uncategorized.length}):`, uncategorized.map(c => `${c.name} (${c.slug})`));
    }

    let html = `
      <div class="wizard-step step-class">
        <h2>Choose Your Class</h2>
        <p class="step-description">Your class represents your profession and defines your abilities and role in combat.</p>

        <div class="selection-with-info">
          <div class="selection-grid-column">
    `;

    // Generate each category
    for (const [category, classList] of Object.entries(groupedClasses)) {
      if (classList.length === 0) continue;

      const categoryColors = {
        MARTIALS: 'rarity-common',
        SPELLCASTERS: 'rarity-uncommon',
        HYBRID: 'rarity-rare'
      };

      html += `
        <div class="rarity-section">
          <h3 class="rarity-header ${categoryColors[category]}">${category}</h3>
          <div class="class-grid">
      `;

      for (const cls of classList) {
        const isSelected = selectedClass?.id === cls.id;
        const cardClass = isSelected ? 'selection-card selected' : 'selection-card';
        const keyAbilityOptions = cls.system.keyAbility?.value || [];
        const hp = cls.system.hp || 0;
        const isPlaytest = ['necromancer', 'runesmith'].includes(cls.slug);

        const customIconPath = this.getClassIconPath(cls.slug);
        html += `
          <div class="${cardClass}" data-item-id="${cls.id}">
            ${isPlaytest ? '<span class="playtest-badge">Playtest</span>' : ''}
            <img class="card-icon" src="${customIconPath}" alt="${cls.name}" onerror="this.onerror=null; this.src='${cls.img}';">
            <h3 class="card-title">${cls.name}</h3>
            <div class="card-stats">
              <span><i class="fas fa-heart"></i> ${hp}</span>
              <span><i class="fas fa-star"></i> ${keyAbilityOptions.map(a => a.toUpperCase()).join('/')}</span>
            </div>
          </div>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    html += `
          </div>

          <div class="selection-info-panel">
    `;

    if (selectedClass) {
      const rawDescription = selectedClass.system?.description?.value || 'No description available.';
      const description = await TextEditor.enrichHTML(rawDescription, { async: true });
      const keyAbilityOptions = selectedClass.system.keyAbility?.value || [];
      const hp = selectedClass.system.hp || 0;
      const spellcasterInfo = this.getSpellcasterInfo(selectedClass.slug);

      // Get static ratings for this class
      const ratings = this.getClassRatings(selectedClass.slug);

      html += `
        <div class="info-panel-content">
          <h3>${selectedClass.name}</h3>
          <div class="class-info-stats">
            <div class="stat-line"><strong>HP:</strong> ${hp} + CON modifier</div>
            <div class="stat-line"><strong>Key Ability:</strong> ${keyAbilityOptions.map(a => a.toUpperCase()).join(' or ')}</div>
            ${spellcasterInfo ? `<div class="stat-line"><strong>Spellcasting:</strong> ${spellcasterInfo}</div>` : ''}
          </div>

          <div class="class-ratings-section">
            <h4>Class Ratings</h4>
            <p class="help-text-small">Reference ratings for this class</p>

            <div class="rating-row">
              <label>Offense:</label>
              <div class="star-rating">
                ${this.generateStarRating(ratings.offense)}
              </div>
            </div>

            <div class="rating-row">
              <label>Defense:</label>
              <div class="star-rating">
                ${this.generateStarRating(ratings.defense)}
              </div>
            </div>

            <div class="rating-row">
              <label>Utility:</label>
              <div class="star-rating">
                ${this.generateStarRating(ratings.utility)}
              </div>
            </div>

            <div class="rating-row">
              <label>Support:</label>
              <div class="star-rating">
                ${this.generateStarRating(ratings.support)}
              </div>
            </div>
          </div>

          <div class="info-description">${description}</div>
        </div>
      `;
    } else {
      html += `
        <div class="info-panel-placeholder">
          <i class="fas fa-info-circle"></i>
          <p>Select a class to view details</p>
        </div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    return html;
  }

  // Step 8: Feat Selection (Ancestry + Class if applicable)
  async generateStep8_Feats() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const ancestry = stateManager.choices.ancestry;
    const classChoice = stateManager.choices.class;
    const feats = stateManager.choices.feats || {};
    const selectedAncestryFeat = feats.ancestryFeat;
    const selectedClassFeat = feats.classFeat;

    if (!ancestry || !classChoice?.item) {
      return '<div>Please complete previous steps first</div>';
    }

    const classItem = classChoice.item;
    const showClassFeats = stateManager.getsLevel1ClassFeat();

    // Load all feats
    const allFeats = await dataProvider.getFeats();

    // Filter ancestry feats
    console.log(`intrinsics-pf2e-character-builder | Looking for ancestry feats for: ${ancestry.name} (slug: ${ancestry.slug})`);

    const ancestryAliases = {
      'kholo': ['kholo', 'gnoll']
    };

    const ancestryFeats = allFeats.filter(feat => {
      const isAncestryFeat = feat.system?.category === 'ancestry';
      const isLevel1 = feat.system?.level?.value === 1;
      const traits = feat.system?.traits?.value || [];

      const ancestrySlugLower = ancestry.slug.toLowerCase();
      const ancestryNameLower = ancestry.name.toLowerCase();
      const possibleNames = ancestryAliases[ancestrySlugLower] || [ancestrySlugLower, ancestryNameLower];

      const matchesAncestry = traits.some(trait =>
        possibleNames.some(name => trait.toLowerCase() === name)
      ) || possibleNames.some(name => feat.name.toLowerCase().includes(name));

      return isAncestryFeat && isLevel1 && matchesAncestry;
    }).sort((a, b) => a.name.localeCompare(b.name));

    console.log(`intrinsics-pf2e-character-builder | Found ${ancestryFeats.length} ancestry feats`);

    // Filter class feats if applicable
    let classFeats = [];
    if (showClassFeats) {
      console.log(`intrinsics-pf2e-character-builder | Looking for class feats for: ${classItem.name} (slug: ${classItem.slug})`);

      classFeats = allFeats.filter(feat => {
        const isClassFeat = feat.system?.category === 'class';
        const isLevel1 = feat.system?.level?.value === 1;
        const traits = feat.system?.traits?.value || [];
        const classSlugLower = classItem.slug.toLowerCase();
        const matchesClass = traits.some(trait => trait.toLowerCase() === classSlugLower);

        return isClassFeat && isLevel1 && matchesClass;
      }).sort((a, b) => a.name.localeCompare(b.name));

      console.log(`intrinsics-pf2e-character-builder | Found ${classFeats.length} class feats`);
    }

    let html = `
      <div class="wizard-step step-feats">
        <h2>Choose Feats</h2>
        <p class="step-description">Select your level 1 feats to customize your character.</p>

        <div class="search-bar">
          <i class="fas fa-search"></i>
          <input type="text" class="feat-search" placeholder="Search feats..." />
        </div>
    `;

    // Class Feat Section (if applicable)
    if (showClassFeats) {
      html += `
        <div class="feat-section">
          <h3 class="feat-section-title">${classItem.name} Class Feat</h3>
          <p class="feat-section-description">Choose a 1st-level ${classItem.name} class feat.</p>
          <div class="feat-grid class-feat-grid">
      `;

      if (classFeats.length === 0) {
        html += `
          <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>No level 1 ${classItem.name} class feats found in the compendium.</p>
          </div>
        `;
      } else {
        for (const feat of classFeats) {
          const isSelected = selectedClassFeat?.id === feat.id;
          const cardClass = isSelected ? 'selection-card feat-card selected' : 'selection-card feat-card';
          const rawDesc = feat.system?.description?.value || '';
          const description = await TextEditor.enrichHTML(rawDesc, { async: true });
          const prerequisites = feat.system?.prerequisites?.value || [];
          const traits = feat.system?.traits?.value || [];

          html += `
            <div class="${cardClass}" data-item-id="${feat.id}" data-name="${feat.name.toLowerCase()}" data-feat-type="class">
              <img class="card-icon" src="${feat.img}" alt="${feat.name}">
              <div class="feat-content">
                <h3 class="card-title">${feat.name}</h3>
                ${traits.length > 0 ? `<div class="card-traits">${formatTraits(traits)}</div>` : ''}
                ${prerequisites.length > 0 ? `<div class="feat-prerequisites"><strong>Prerequisites:</strong> ${prerequisites.map(p => p.value || p).join(', ')}</div>` : ''}
                <div class="card-description">${description}</div>
              </div>
            </div>
          `;
        }
      }

      html += `
          </div>
        </div>
      `;
    }

    // Ancestry Feat Section
    html += `
      <div class="feat-section">
        <h3 class="feat-section-title">${ancestry.name} Ancestry Feat</h3>
        <p class="feat-section-description">Choose a 1st-level ${ancestry.name} ancestry feat.</p>
        <div class="feat-grid ancestry-feat-grid">
    `;

    if (ancestryFeats.length === 0) {
      html += `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>No level 1 ${ancestry.name} feats found in the compendium.</p>
        </div>
      `;
    } else {
      for (const feat of ancestryFeats) {
        const isSelected = selectedAncestryFeat?.id === feat.id;
        const cardClass = isSelected ? 'selection-card feat-card selected' : 'selection-card feat-card';
        const rawDesc = feat.system?.description?.value || '';
        const description = await TextEditor.enrichHTML(rawDesc, { async: true });
        const prerequisites = feat.system?.prerequisites?.value || [];
        const traits = feat.system?.traits?.value || [];

        html += `
          <div class="${cardClass}" data-item-id="${feat.id}" data-name="${feat.name.toLowerCase()}" data-feat-type="ancestry">
            <img class="card-icon" src="${feat.img}" alt="${feat.name}">
            <div class="feat-content">
              <h3 class="card-title">${feat.name}</h3>
              ${traits.length > 0 ? `<div class="card-traits">${formatTraits(traits)}</div>` : ''}
              ${prerequisites.length > 0 ? `<div class="feat-prerequisites"><strong>Prerequisites:</strong> ${prerequisites.map(p => p.value || p).join(', ')}</div>` : ''}
              <div class="card-description">${description}</div>
            </div>
          </div>
        `;
      }
    }

    html += `
        </div>
      </div>
    `;

    html += `
      </div>
    `;

    return html;
  }

  // Step 6: Character Review & Ability Scores
  async generateStep6_Abilities() {
    const stateManager = game.characterBuilder.stateManager;
    const ancestry = stateManager.choices.ancestry;
    const heritage = stateManager.choices.heritage;
    const background = stateManager.choices.background;
    const classChoice = stateManager.choices.class;

    if (!ancestry || !heritage || !background?.item || !classChoice?.item) {
      return '<div>Please complete previous steps first</div>';
    }

    let html = `
      <div class="wizard-step step-review">
        <div class="ability-allocator">
          <h2><i class="fas fa-dice-d20"></i> Allocate Attribute Boosts</h2>
          <p class="step-description">At level 1, you receive 4 free attribute boosts in addition to those from your ancestry, background, and class. Click the button below to open your character sheet and allocate attribute boosts using the built-in attribute editor.</p>

          <div class="ability-button-container">
            <button class="open-sheet-btn large-action-btn">
              <i class="fas fa-user-edit"></i>
              Open Character Sheet to Allocate Attributes
            </button>
          </div>

          <div class="ability-instructions">
            <h3>Instructions:</h3>
            <ol>
              <li>Click the button above to open your character sheet</li>
              <li>Find the "Attributes" section and click the edit button</li>
              <li>Allocate your 4 free ability boosts (you'll see boosts from ancestry, background, and class already applied)</li>
              <li>Close the character sheet when done</li>
              <li>Click "Next" below to continue to skill selection</li>
            </ol>
          </div>
        </div>

        <h2>Character Review</h2>
        <p class="step-description">Review your character's base features. Ability scores and other details are being applied automatically to your character sheet.</p>

        <div class="review-summary">
          <div class="review-section">
            <h3><i class="fas fa-shield"></i> Class</h3>
            <div class="review-item">
              <img class="review-icon" src="${this.getClassIconPath(classChoice.item.slug)}" alt="${classChoice.item.name}" onerror="this.onerror=null; this.src='${classChoice.item.img}';">
              <div>
                <strong>${classChoice.item.name}</strong>
                <div class="review-detail">HP: ${classChoice.item.system.hp} + CON modifier</div>
                <div class="review-detail">Key Ability: ${(classChoice.item.system.keyAbility?.value || []).map(a => a.toUpperCase()).join(' or ')}</div>
              </div>
            </div>
          </div>

          <div class="review-section">
            <h3><i class="fas fa-users"></i> Ancestry & Heritage</h3>
            <div class="review-item">
              <img class="review-icon" src="${ancestry.img}" alt="${ancestry.name}">
              <div>
                <strong>${ancestry.name}</strong>
                <div class="review-detail">${heritage.name}</div>
              </div>
            </div>
          </div>

          <div class="review-section">
            <h3><i class="fas fa-book"></i> Background</h3>
            <div class="review-item">
              <img class="review-icon" src="${background.item.img}" alt="${background.item.name}">
              <div>
                <strong>${background.item.name}</strong>
                <div class="review-detail">Ability Boosts: ${this.formatBoostList(background.selectedBoosts)}</div>
              </div>
            </div>
          </div>
    `;

    // Show class features if actor exists and has class features
    const actor = stateManager.targetActor;
    if (actor) {
      const classFeatures = actor.items.filter(i =>
        i.type === 'feat' &&
        i.system?.category === 'classfeature' &&
        i.system?.level?.value === 1
      );

      if (classFeatures.length > 0) {
        html += `
          <div class="review-section">
            <h3><i class="fas fa-trophy"></i> Class Features</h3>
            <div class="class-features-list">
        `;

        for (const feature of classFeatures) {
          const rawDescription = feature.system?.description?.value || '';
          const description = await TextEditor.enrichHTML(rawDescription, { async: true });

          html += `
            <div class="feature-item">
              <img class="feature-icon" src="${feature.img}" alt="${feature.name}">
              <div class="feature-info">
                <strong>${feature.name}</strong>
                ${feature.system?.traits?.value?.length > 0 ? `<div class="feature-traits">${formatTraits(feature.system.traits.value)}</div>` : ''}
                <div class="feature-description">${description}</div>
              </div>
            </div>
          `;
        }

        html += `
            </div>
          </div>
        `;
      }
    }

    html += `
          <div class="review-note">
            <i class="fas fa-info-circle"></i>
            <p>Your ancestry, heritage, background, and class features have been applied to your character sheet.</p>
          </div>
        </div>
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

  // Helper: Get spellcaster info for class
  getSpellcasterInfo(classSlug) {
    const spellcasterTypes = {
      'animist': 'Prepared Divine',
      'bard': 'Spontaneous Occult',
      'cleric': 'Prepared Divine',
      'druid': 'Prepared Primal',
      'oracle': 'Spontaneous Divine',
      'psychic': 'Spontaneous Occult',
      'sorcerer': 'Spontaneous (varies by Bloodline)',
      'summoner': 'Spontaneous (varies by Eidolon)',
      'witch': 'Prepared (varies by Patron)',
      'wizard': 'Prepared Arcane',
      'necromancer': 'Prepared Occult',
      'magus': 'Prepared Arcane (Hybrid)',
      'kineticist': 'Impulses (not traditional spells)'
    };

    return spellcasterTypes[classSlug] || null;
  }

  // Helper: Get custom class icon path from ClassIcons folder
  getClassIconPath(classSlug) {
    return `modules/${MODULE_ID}/ClassIcons/${classSlug}_Icon.png`;
  }

  // Helper: Get class ratings (static reference data)
  getClassRatings(classSlug) {
    const CLASS_RATINGS = {
      'alchemist': { offense: 3, defense: 3, utility: 4, support: 4 },
      'animist': { offense: 3, defense: 3, utility: 4, support: 5 },
      'barbarian': { offense: 5, defense: 3, utility: 2, support: 1 },
      'bard': { offense: 2, defense: 2, utility: 4, support: 5 },
      'champion': { offense: 3, defense: 5, utility: 2, support: 4 },
      'cleric': { offense: 3, defense: 3, utility: 4, support: 5 },
      'commander': { offense: 2, defense: 3, utility: 3, support: 5 },
      'druid': { offense: 3, defense: 3, utility: 5, support: 4 },
      'fighter': { offense: 5, defense: 4, utility: 2, support: 2 },
      'guardian': { offense: 2, defense: 5, utility: 2, support: 4 },
      'gunslinger': { offense: 5, defense: 2, utility: 3, support: 1 },
      'inventor': { offense: 3, defense: 3, utility: 5, support: 3 },
      'investigator': { offense: 2, defense: 2, utility: 5, support: 3 },
      'kineticist': { offense: 4, defense: 3, utility: 4, support: 2 },
      'magus': { offense: 5, defense: 2, utility: 3, support: 1 },
      'monk': { offense: 4, defense: 4, utility: 3, support: 2 },
      'necromancer': { offense: 3, defense: 2, utility: 4, support: 3 },
      'oracle': { offense: 3, defense: 2, utility: 4, support: 5 },
      'psychic': { offense: 4, defense: 2, utility: 4, support: 3 },
      'ranger': { offense: 4, defense: 3, utility: 4, support: 2 },
      'rogue': { offense: 4, defense: 2, utility: 5, support: 2 },
      'sorcerer': { offense: 4, defense: 2, utility: 4, support: 3 },
      'summoner': { offense: 3, defense: 3, utility: 3, support: 4 },
      'swashbuckler': { offense: 4, defense: 3, utility: 3, support: 2 },
      'thaumaturge': { offense: 3, defense: 3, utility: 4, support: 3 },
      'witch': { offense: 3, defense: 2, utility: 4, support: 4 },
      'wizard': { offense: 4, defense: 2, utility: 5, support: 3 }
    };

    return CLASS_RATINGS[classSlug] || { offense: 0, defense: 0, utility: 0, support: 0 };
  }

  // Helper: Generate star rating HTML (read-only)
  generateStarRating(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating;
      html += `<i class="fas fa-star ${filled ? 'filled' : 'empty'}"></i>`;
    }
    return html;
  }

  // Helper: Get skill count for class
  getClassSkillCount(classSlug) {
    const skillCounts = {
      'alchemist': 3,
      'bard': 4,
      'barbarian': 3,
      'champion': 2,
      'commander': 2,
      'cleric': 2,
      'druid': 2,
      'exemplar': 3,
      'fighter': 3,
      'guardian': 3,
      'gunslinger': 3,
      'inventor': 3,
      'investigator': 4,
      'kineticist': 3,
      'magus': 2,
      'monk': 4,
      'oracle': 3,
      'psychic': 3,
      'ranger': 4,
      'rogue': 7,
      'sorcerer': 2,
      'summoner': 3,
      'swashbuckler': 4,
      'thaumaturge': 3,
      'witch': 3,
      'wizard': 2,
      'runesmith': 2,
      'necromancer': 2,
      'animist': 2
    };

    return skillCounts[classSlug] || 2;
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

  // Step 7: Skill Selection
  generateStep7_Skills() {
    const stateManager = game.characterBuilder.stateManager;
    const actor = stateManager.targetActor;
    const background = stateManager.choices.background;
    const classChoice = stateManager.choices.class;

    if (!background?.item || !classChoice?.item) {
      return '<div>Please complete previous steps first</div>';
    }

    // Get INT modifier from actor (abilities are set on character sheet)
    // PF2E stores the modifier directly in the mod property
    let intModifier = 0;
    if (actor?.system?.abilities?.int) {
      // Try to get the mod directly (PF2E system)
      intModifier = actor.system.abilities.int.mod || 0;

      // Debug logging
      console.log('intrinsics-pf2e-character-builder | INT ability data:', actor.system.abilities.int);
      console.log('intrinsics-pf2e-character-builder | INT modifier:', intModifier);
    }

    // Get class skill count using helper
    const classSkillCount = this.getClassSkillCount(classChoice.item.slug);
    const totalClassSkills = Math.max(classSkillCount + intModifier, 0);

    console.log('intrinsics-pf2e-character-builder | Class:', classChoice.item.slug, 'Base skills:', classSkillCount, 'INT mod:', intModifier, 'Total:', totalClassSkills);

    // Get background skill (usually fixed, but some backgrounds have choice)
    const backgroundSkill = this.getBackgroundSkill(background.item);

    // Get selected skills
    let selectedSkills = stateManager.choices.skills?.trained || [];

    // Ensure background skill is included in selected skills
    if (backgroundSkill && !selectedSkills.includes(backgroundSkill)) {
      selectedSkills = [backgroundSkill, ...selectedSkills];
      stateManager.setChoice('skills', { trained: selectedSkills });
    }

    // Total skills: background (1) + class skills
    const totalSkillsNeeded = 1 + totalClassSkills;

    // Get current skill proficiencies from actor
    const actorSkills = actor?.system?.skills || {};

    let html = `
      <div class="wizard-step step-skills">
        <h2>Select Skills</h2>
        <p class="step-description">Choose skills to train. Each skill improves your ability to perform specific tasks. Some skills may already be granted by your class, ancestry, or background.</p>

        <div class="skill-summary">
          <div class="skill-info-box">
            <strong>Background Skill:</strong> ${backgroundSkill ? getSkillLabel(backgroundSkill) : 'Choose one'}
          </div>
          <div class="skill-info-box">
            <strong>Class Skills:</strong> ${classSkillCount} + ${intModifier} (INT) = ${totalClassSkills} to select
          </div>
          <div class="skill-info-box ${selectedSkills.length >= totalSkillsNeeded ? 'boost-complete' : 'boost-incomplete'}">
            <strong>Selected:</strong> ${selectedSkills.length}/${totalSkillsNeeded}
          </div>
        </div>

        <div class="skill-grid">
    `;

    // Generate skill cards
    for (const [skillKey, skillData] of Object.entries(SKILLS)) {
      const isSelected = selectedSkills.includes(skillKey);
      const isBackgroundSkill = backgroundSkill === skillKey;

      // Get current proficiency from actor
      const skillProf = actorSkills[skillKey];
      const profLevel = skillProf?.rank || 0;
      const profLabels = ['Untrained', 'Trained', 'Expert', 'Master', 'Legendary'];
      const profLabel = profLabels[profLevel] || 'Untrained';

      // Calculate modifier
      const abilityMod = Math.floor(((actor?.system?.abilities?.[skillData.ability]?.value || 10) - 10) / 2);
      const profBonus = profLevel * 2;
      const level = actor?.system?.details?.level?.value || 1;
      const totalMod = abilityMod + profBonus + (profLevel > 0 ? level : 0);

      const cardClass = [
        'skill-card',
        isSelected ? 'selected' : '',
        isBackgroundSkill ? 'background-skill' : '',
        profLevel > 0 ? 'already-trained' : ''
      ].filter(Boolean).join(' ');

      html += `
        <div class="${cardClass}" data-skill="${skillKey}">
          <div class="skill-header">
            <div class="skill-name">${skillData.label}</div>
            <div class="skill-modifier">${totalMod >= 0 ? '+' : ''}${totalMod}</div>
          </div>
          <div class="skill-ability">${getAbilityName(skillData.ability)}</div>
          <div class="skill-proficiency">${profLabel}</div>
          ${isBackgroundSkill ? '<div class="skill-badge">Background</div>' : ''}
          ${profLevel > 0 ? '<div class="skill-badge" style="background: var(--cb-accent-green);">Already Trained</div>' : ''}
          ${isSelected && !isBackgroundSkill && profLevel === 0 ? '<i class="fas fa-check-circle skill-check"></i>' : ''}
        </div>
      `;
    }

    html += `
        </div>

        <div class="language-selection">
          <h2><i class="fas fa-language"></i> Select Languages</h2>
          <p class="step-description">Choose additional languages. You gain additional languages equal to your Intelligence modifier.</p>

          <div class="language-summary">
            <div class="skill-info-box">
              <strong>Bonus Languages from INT:</strong> ${Math.max(intModifier, 0)}
            </div>
            <div class="skill-info-box ${(stateManager.choices.languages?.selected || []).length >= Math.max(intModifier, 0) ? 'boost-complete' : 'boost-incomplete'}">
              <strong>Selected:</strong> ${(stateManager.choices.languages?.selected || []).length}/${Math.max(intModifier, 0)}
            </div>
          </div>

          ${intModifier > 0 ? `
            <div class="language-grid" id="language-selector">
              ${this.generateLanguageOptions(actor, stateManager.choices.languages?.selected || [])}
            </div>
          ` : '<p class="help-text">You don\'t have any bonus languages to select (INT modifier: 0 or less)</p>'}
        </div>

      </div>
    `;

    return html;
  }

  // Helper: Generate language options
  generateLanguageOptions(actor, selectedLanguages) {
    // Get language rarities from PF2e homebrew settings
    let languageRarities;
    try {
      languageRarities = game.settings.get("pf2e", "homebrew.languageRarities");
    } catch (error) {
      console.warn('intrinsics-pf2e-character-builder | Could not get language rarities:', error);
      languageRarities = {};
    }

    console.log('intrinsics-pf2e-character-builder | Language rarities:', languageRarities);

    // Convert Sets to Arrays (PF2e stores these as Sets of slugs)
    const commonLanguageSlugs = Array.from(languageRarities?.common || []);
    const uncommonLanguageSlugs = Array.from(languageRarities?.uncommon || []);
    const rareLanguageSlugs = Array.from(languageRarities?.rare || []);
    const secretLanguageSlugs = Array.from(languageRarities?.secret || []);

    console.log('intrinsics-pf2e-character-builder | Language counts - Common:', commonLanguageSlugs.length, 'Uncommon:', uncommonLanguageSlugs.length, 'Rare:', rareLanguageSlugs.length, 'Secret:', secretLanguageSlugs.length);

    // Helper to get language label from slug
    const getLanguageLabel = (slug) => {
      // Try to localize using PF2e's language localization
      const locKey = `PF2E.Language.${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
      const localized = game.i18n.localize(locKey);
      // If localization failed, return the slug in title case
      if (localized === locKey) {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      return localized;
    };

    // Get languages character already knows from system data (stored as slugs in lowercase)
    const knownLanguageSlugs = actor?.system?.details?.languages?.value || [];

    console.log('intrinsics-pf2e-character-builder | Known languages:', knownLanguageSlugs);
    console.log('intrinsics-pf2e-character-builder | Selected languages:', selectedLanguages);

    let html = '';

    // If no languages are configured, show a helpful message
    if (commonLanguageSlugs.length === 0 && uncommonLanguageSlugs.length === 0 && rareLanguageSlugs.length === 0 && secretLanguageSlugs.length === 0) {
      return '<p class="help-text">No languages found. Please configure languages in the PF2e Homebrew Elements settings.</p>';
    }

    // Suggested Languages Section
    const suggestedLanguagesSetting = game.settings.get("intrinsics-pf2e-character-builder", "suggestedLanguages");
    const suggestedSlugs = suggestedLanguagesSetting.split(',').map(s => s.trim()).filter(Boolean);

    if (suggestedSlugs.length > 0) {
      html += '<h3><i class="fas fa-star"></i> Suggested Languages</h3><div class="language-group suggested-languages">';
      suggestedSlugs.forEach(slug => {
        // Only show if the language exists in the configured languages
        const allLanguageSlugs = [...commonLanguageSlugs, ...uncommonLanguageSlugs, ...rareLanguageSlugs, ...secretLanguageSlugs];
        if (!allLanguageSlugs.includes(slug)) return;

        const label = getLanguageLabel(slug);
        const isKnown = knownLanguageSlugs.includes(slug);
        const isSelected = selectedLanguages.includes(slug);
        const disabled = isKnown && !isSelected;

        html += `
          <div class="language-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-language="${slug}">
            <div class="language-name">${label}</div>
            ${isKnown ? '<div class="language-badge">Already Known</div>' : ''}
            ${isSelected ? '<i class="fas fa-check-circle language-check"></i>' : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    // Language Details Section (after suggested, before categories)
    if (selectedLanguages && selectedLanguages.length > 0) {
      // Get all known languages (including those from ancestry/heritage)
      const allLanguages = [...new Set([...knownLanguageSlugs, ...selectedLanguages])];

      html += `
        <div class="language-details-section-inline">
          <h3><i class="fas fa-info-circle"></i> Language Details</h3>
          <div class="language-details-grid">
      `;

      allLanguages.forEach(slug => {
        const label = getLanguageLabel(slug);
        const description = LANGUAGE_DESCRIPTIONS[slug] || 'No description available for this language.';
        const isSelected = selectedLanguages.includes(slug);
        const isKnown = knownLanguageSlugs.includes(slug);

        let statusBadge = '';
        if (isSelected && !isKnown) {
          statusBadge = '<span class="language-status-badge new">New</span>';
        } else if (isKnown) {
          statusBadge = '<span class="language-status-badge known">Known</span>';
        }

        html += `
          <div class="language-detail-card">
            <div class="language-detail-header">
              <h4>${label}</h4>
              ${statusBadge}
            </div>
            <p class="language-description">${description}</p>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // Common Languages
    if (commonLanguageSlugs.length > 0) {
      html += '<h3>Common Languages</h3><div class="language-group">';
      commonLanguageSlugs.forEach(slug => {
        const label = getLanguageLabel(slug);
        const isKnown = knownLanguageSlugs.includes(slug);
        const isSelected = selectedLanguages.includes(slug);
        const disabled = isKnown && !isSelected;

        html += `
          <div class="language-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-language="${slug}">
            <div class="language-name">${label}</div>
            ${isKnown ? '<div class="language-badge">Already Known</div>' : ''}
            ${isSelected ? '<i class="fas fa-check-circle language-check"></i>' : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    // Uncommon Languages
    if (uncommonLanguageSlugs.length > 0) {
      html += '<h3>Uncommon Languages</h3><div class="language-group">';
      uncommonLanguageSlugs.forEach(slug => {
        const label = getLanguageLabel(slug);
        const isKnown = knownLanguageSlugs.includes(slug);
        const isSelected = selectedLanguages.includes(slug);
        const disabled = isKnown && !isSelected;

        html += `
          <div class="language-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-language="${slug}">
            <div class="language-name">${label}</div>
            ${isKnown ? '<div class="language-badge">Already Known</div>' : ''}
            ${isSelected ? '<i class="fas fa-check-circle language-check"></i>' : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    // Rare Languages
    if (rareLanguageSlugs.length > 0) {
      html += '<h3>Rare Languages</h3><div class="language-group">';
      rareLanguageSlugs.forEach(slug => {
        const label = getLanguageLabel(slug);
        const isKnown = knownLanguageSlugs.includes(slug);
        const isSelected = selectedLanguages.includes(slug);
        const disabled = isKnown && !isSelected;

        html += `
          <div class="language-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-language="${slug}">
            <div class="language-name">${label}</div>
            ${isKnown ? '<div class="language-badge">Already Known</div>' : ''}
            ${isSelected ? '<i class="fas fa-check-circle language-check"></i>' : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    // Secret Languages
    if (secretLanguageSlugs.length > 0) {
      html += '<h3>Secret Languages</h3><div class="language-group">';
      secretLanguageSlugs.forEach(slug => {
        const label = getLanguageLabel(slug);
        const isKnown = knownLanguageSlugs.includes(slug);
        const isSelected = selectedLanguages.includes(slug);
        const disabled = isKnown && !isSelected;

        html += `
          <div class="language-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}" data-language="${slug}">
            <div class="language-name">${label}</div>
            ${isKnown ? '<div class="language-badge">Already Known</div>' : ''}
            ${isSelected ? '<i class="fas fa-check-circle language-check"></i>' : ''}
          </div>
        `;
      });
      html += '</div>';
    }

    return html;
  }

  // Helper: Generate language details section
  generateLanguageDetails(actor, selectedLanguages) {
    if (!selectedLanguages || selectedLanguages.length === 0) {
      return '';
    }

    // Get all known languages (including those from ancestry/heritage)
    const knownLanguageSlugs = actor?.system?.details?.languages?.value || [];
    const allLanguages = [...new Set([...knownLanguageSlugs, ...selectedLanguages])];

    if (allLanguages.length === 0) {
      return '';
    }

    // Helper to get language label from slug
    const getLanguageLabel = (slug) => {
      const locKey = `PF2E.Language.${slug.charAt(0).toUpperCase() + slug.slice(1)}`;
      const localized = game.i18n.localize(locKey);
      if (localized === locKey) {
        return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      return localized;
    };

    let html = `
      <div class="language-details-section">
        <h3><i class="fas fa-info-circle"></i> Language Details</h3>
        <p class="help-text">Information about languages you know or are learning.</p>
        <div class="language-details-grid">
    `;

    allLanguages.forEach(slug => {
      const label = getLanguageLabel(slug);
      const description = LANGUAGE_DESCRIPTIONS[slug] || 'No description available for this language.';
      const isSelected = selectedLanguages.includes(slug);
      const isKnown = knownLanguageSlugs.includes(slug);

      let statusBadge = '';
      if (isSelected && !isKnown) {
        statusBadge = '<span class="language-status-badge new">New</span>';
      } else if (isKnown) {
        statusBadge = '<span class="language-status-badge known">Known</span>';
      }

      html += `
        <div class="language-detail-card">
          <div class="language-detail-header">
            <h4>${label}</h4>
            ${statusBadge}
          </div>
          <p class="language-description">${description}</p>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // Helper: Generate continent descriptions section
  generateContinentDescriptions(actor) {
    // Get continent descriptions from module settings
    let continentDescriptions = {};
    try {
      const descriptionsJSON = game.settings.get("intrinsics-pf2e-character-builder", "continentDescriptions");
      continentDescriptions = JSON.parse(descriptionsJSON);
    } catch (error) {
      console.warn('intrinsics-pf2e-character-builder | Could not parse continent descriptions:', error);
    }

    // If no descriptions configured, return empty
    if (Object.keys(continentDescriptions).length === 0) {
      return '';
    }

    let html = `
      <div class="continent-descriptions-section">
        <h2><i class="fas fa-globe"></i> World Overview</h2>
        <p class="step-description">Learn about the major continents and regions of Golarion.</p>
        <div class="continent-details-grid">
    `;

    // Sort continents alphabetically
    const sortedContinents = Object.keys(continentDescriptions).sort();

    sortedContinents.forEach(continent => {
      const description = continentDescriptions[continent];

      html += `
        <div class="continent-detail-card">
          <h3>${continent}</h3>
          <p class="continent-description">${description}</p>
        </div>
      `;
    });

    html += `
        </div>
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

  // Step 9: Cantrips
  async generateStep9_Cantrips() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const classItem = stateManager.choices.class?.item;

    if (!classItem) {
      return `<div class="wizard-step step-cantrips">
        <p>Please select a class first</p>
      </div>`;
    }

    // Check if this is a spellcaster
    if (!stateManager.isSpellcaster()) {
      return `
        <div class="wizard-step step-cantrips">
          <div class="no-spells">
            <p>Your class does not cast spells.</p>
            <p>Click "Next" to continue.</p>
          </div>
        </div>
      `;
    }

    // Check if this class auto-learns all common spells
    if (stateManager.autoLearnsCommonSpells()) {
      const tradition = stateManager.getSpellTradition();
      const traditionLabel = tradition ? tradition.charAt(0).toUpperCase() + tradition.slice(1) : 'Divine';
      return `
        <div class="wizard-step step-cantrips">
          <h2>Cantrips</h2>
          <div class="auto-learn-info">
            <i class="fas fa-book-open"></i>
            <p>As a ${classItem.name}, you automatically know all common ${traditionLabel} cantrips.</p>
            <p class="help-text">These will be added to your character sheet automatically.</p>
            <p>Click "Next" to continue.</p>
          </div>
        </div>
      `;
    }

    const autoTradition = stateManager.getSpellTradition();
    const cantripCount = stateManager.getCantripCount();
    const selectedSpells = stateManager.choices.spells || { cantrips: [], level1: [] };
    const spellcastingType = stateManager.getSpellcastingType();
    const typeLabel = spellcastingType === 'prepared' ? 'Prepared' : 'Spontaneous';

    // Allow manual tradition override (stored in state)
    const manualTradition = stateManager.choices.spellTradition;
    const tradition = manualTradition || autoTradition;

    console.log('intrinsics-pf2e-character-builder | Auto tradition:', autoTradition, 'Manual:', manualTradition, 'Using:', tradition);
    console.log('intrinsics-pf2e-character-builder | Cantrips needed:', cantripCount);

    // Determine if we need to show tradition selector (for Sorcerers, Witches, and Summoners)
    const needsTraditionSelector = classItem.slug === 'sorcerer' || classItem.slug === 'witch' || classItem.slug === 'summoner';

    // Load cantrips only
    const cantrips = await dataProvider.getSpells({ level: 0, tradition });

    // Filter out focus spells
    const regularCantrips = cantrips.filter(s => s.system.category !== 'focus');

    console.log('intrinsics-pf2e-character-builder | Found cantrips:', regularCantrips.length);

    // Prepare spell arrays with metadata (don't spread - just add properties)
    const cantripsWithMeta = regularCantrips.map(s => {
      s.spellLevel = 0;
      s.spellType = 'cantrip';
      return s;
    });

    console.log('intrinsics-pf2e-character-builder | Cantrips with meta:', cantripsWithMeta.length);
    if (cantripsWithMeta.length > 0) {
      console.log('intrinsics-pf2e-character-builder | Sample cantrip:', cantripsWithMeta[0].name, 'UUID:', cantripsWithMeta[0].uuid);
    }

    return `
      <div class="wizard-step step-cantrips">
        <h2>Select Cantrips</h2>

        ${selectedSpells.cantrips && selectedSpells.cantrips.length > 0 ? `
          <div class="selection-summary">
            <div class="summary-header">
              <i class="fas fa-check-circle"></i>
              <strong>Selected Cantrips (${selectedSpells.cantrips.length}/${cantripCount}):</strong>
            </div>
            <div class="summary-spell-list">
              ${selectedSpells.cantrips.map(spell => `
                <div class="summary-spell-item">
                  <img src="${spell.img || 'icons/svg/mystery-man.svg'}" alt="${spell.name}" class="summary-spell-icon">
                  <span class="summary-spell-name">${spell.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="spell-info">
          <div class="tradition-selector-container">
            <div class="tradition-info">
              <strong>Tradition:</strong>
              ${needsTraditionSelector ? `
                <select class="tradition-selector" data-current="${tradition}">
                  <option value="arcane" ${tradition === 'arcane' ? 'selected' : ''}>Arcane</option>
                  <option value="divine" ${tradition === 'divine' ? 'selected' : ''}>Divine</option>
                  <option value="occult" ${tradition === 'occult' ? 'selected' : ''}>Occult</option>
                  <option value="primal" ${tradition === 'primal' ? 'selected' : ''}>Primal</option>
                </select>
              ` : `<span>${tradition ? tradition.capitalize() : 'Unknown'}</span>`}
            </div>
            <div class="type-info">
              <strong>Type:</strong> <span>${typeLabel}</span>
            </div>
          </div>
        </div>

        <div class="spell-actions">
          <div class="spell-search-container">
            <i class="fas fa-search"></i>
            <input type="text" class="spell-search" placeholder="Search cantrips..." />
          </div>
        </div>

        <div class="spell-selection-container">
          <div class="spell-section">
            <h3 class="spell-section-header">
              Cantrips
              <span class="spell-count">${selectedSpells.cantrips?.length || 0} / ${cantripCount}</span>
            </h3>
            <p class="help-text">Click anywhere on a spell card to select/deselect it.</p>
            <div class="selection-grid cantrip-grid">
              ${(await Promise.all(cantripsWithMeta.map(spell => this.generateSpellCard(spell, selectedSpells)))).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Step 10: Level 1 Spells
  async generateStep10_Spells() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;
    const classItem = stateManager.choices.class?.item;

    if (!classItem) {
      return `<div class="wizard-step step-spells">
        <p>Please select a class first</p>
      </div>`;
    }

    // Check if this is a spellcaster
    if (!stateManager.isSpellcaster()) {
      return `
        <div class="wizard-step step-spells">
          <div class="no-spells">
            <p>Your class does not cast spells.</p>
            <p>Click "Finalize" to complete character creation.</p>
          </div>
        </div>
      `;
    }

    // Check if this class auto-learns all common spells
    if (stateManager.autoLearnsCommonSpells()) {
      const tradition = stateManager.getSpellTradition();
      const traditionLabel = tradition ? tradition.charAt(0).toUpperCase() + tradition.slice(1) : 'Divine';
      return `
        <div class="wizard-step step-spells">
          <h2>Level 1 Spells</h2>
          <div class="auto-learn-info">
            <i class="fas fa-book-open"></i>
            <p>As a ${classItem.name}, you automatically know all common ${traditionLabel} level 1 spells.</p>
            <p class="help-text">These will be added to your character sheet automatically.</p>
            <p>Click "Finalize" to complete character creation.</p>
          </div>
        </div>
      `;
    }

    const autoTradition = stateManager.getSpellTradition();
    const level1Count = stateManager.getLevel1SpellCount();
    const selectedSpells = stateManager.choices.spells || { cantrips: [], level1: [] };
    const spellcastingType = stateManager.getSpellcastingType();
    const typeLabel = spellcastingType === 'prepared' ? 'Prepared' : 'Spontaneous';

    // Allow manual tradition override (stored in state)
    const manualTradition = stateManager.choices.spellTradition;
    const tradition = manualTradition || autoTradition;

    console.log('intrinsics-pf2e-character-builder | Auto tradition:', autoTradition, 'Manual:', manualTradition, 'Using:', tradition);
    console.log('intrinsics-pf2e-character-builder | Level 1 needed:', level1Count);

    // Load level 1 spells only
    const level1Spells = await dataProvider.getSpells({ level: 1, tradition });

    // Filter out focus spells
    const regularLevel1 = level1Spells.filter(s => s.system.category !== 'focus');

    console.log('intrinsics-pf2e-character-builder | Found Level 1 spells:', regularLevel1.length);

    // Prepare spell arrays with metadata (don't spread - just add properties)
    const level1WithMeta = regularLevel1.map(s => {
      s.spellLevel = 1;
      s.spellType = 'level1';
      return s;
    });

    console.log('intrinsics-pf2e-character-builder | Level 1 with meta:', level1WithMeta.length);
    if (level1WithMeta.length > 0) {
      console.log('intrinsics-pf2e-character-builder | Sample level 1:', level1WithMeta[0].name, 'UUID:', level1WithMeta[0].uuid);
    }

    return `
      <div class="wizard-step step-spells">
        <h2>Select Level 1 Spells</h2>

        ${selectedSpells.level1 && selectedSpells.level1.length > 0 ? `
          <div class="selection-summary">
            <div class="summary-header">
              <i class="fas fa-check-circle"></i>
              <strong>Selected Level 1 Spells (${selectedSpells.level1.length}/${level1Count}):</strong>
            </div>
            <div class="summary-spell-list">
              ${selectedSpells.level1.map(spell => `
                <div class="summary-spell-item">
                  <img src="${spell.img || 'icons/svg/mystery-man.svg'}" alt="${spell.name}" class="summary-spell-icon">
                  <span class="summary-spell-name">${spell.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="spell-info">
          <div class="tradition-selector-container">
            <div class="tradition-info">
              <strong>Tradition:</strong> <span>${tradition ? tradition.capitalize() : 'Unknown'}</span>
            </div>
            <div class="type-info">
              <strong>Type:</strong> <span>${typeLabel}</span>
            </div>
          </div>
        </div>

        <div class="spell-actions">
          <div class="spell-search-container">
            <i class="fas fa-search"></i>
            <input type="text" class="spell-search" placeholder="Search spells..." />
          </div>
        </div>

        <div class="spell-selection-container">
          <div class="spell-section">
            <h3 class="spell-section-header">
              Level 1 Spells
              <span class="spell-count">${selectedSpells.level1?.length || 0} / ${level1Count}</span>
            </h3>
            <p class="help-text">Click anywhere on a spell card to select/deselect it.</p>
            <div class="selection-grid level1-grid">
              ${(await Promise.all(level1WithMeta.map(spell => this.generateSpellCard(spell, selectedSpells)))).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Step 11: Bio (Name and Backstory Theme)
  generateStep11_Bio() {
    const stateManager = game.characterBuilder.stateManager;
    const bio = stateManager.choices.bio || {
      name: '',
      backstoryThemes: [],
      gender: '',
      pronouns: '',
      age: '',
      ethnicity: '',
      nationality: '',
      continent: '',
      height: '',
      weight: '',
      backstory: '',
      appearance: '',
      personality: ''
    };

    // Migrate: If nationality exists but continent doesn't, infer continent
    if (bio.nationality && !bio.continent) {
      const continentCountries = {
        'Avistan': {
          'Broken Lands': ['Absalom', 'Mendev', 'Nelduin', 'Numeria', 'Brevoy', 'Rostland', 'Razmiran', 'River Kingdoms'],
          'Eye of Dread': ['Lastwall', 'Molthune', 'Nirmathas', 'Ustalav'],
          'Saga Lands': ['Realm of the Mammoth Lords', 'Varisia', 'Belkzen', 'Irrisen', 'Lands of the Linnorm Kings', 'New Thassilon'],
          'Shining Kingdoms': ['Andoran', 'Galt', 'Kyonin', 'Druma', 'Taldor', 'Five Kings Mountains'],
          'Old Cheliax': ['Cheliax', 'Isger', 'Nidal']
        }
      };

      // Find which continent contains this nationality
      for (const [continent, regions] of Object.entries(continentCountries)) {
        for (const countries of Object.values(regions)) {
          if (countries.includes(bio.nationality)) {
            bio.continent = continent;
            stateManager.setChoice('bio', bio, null, true);
            break;
          }
        }
        if (bio.continent) break;
      }
    }

    const ancestry = stateManager.choices.ancestry;

    // Comprehensive backstory themes list (100+ themes)
    const ALL_BACKSTORY_THEMES = [
      'Seeking Revenge', 'Quest for Knowledge', 'Lost Heirloom', 'Prophecy Fulfillment', 'Redemption Arc',
      'Protect the Innocent', 'Find True Love', 'Escape Past Life', 'Prove Worth to Family', 'Discover Heritage',
      'Break a Curse', 'Atone for Sins', 'Find Missing Person', 'Restore Honor', 'Seek Adventure',
      'Accumulate Wealth', 'Master a Craft', 'Uncover Conspiracy', 'Defeat Ancient Evil', 'Save Homeland',
      'Cure Disease', 'Find Legendary Artifact', 'Avenge Mentor', 'Overthrow Tyrant', 'Unite Kingdoms',
      'Discover Lost Civilization', 'Tame Wild Beast', 'Conquer Fear', 'Escape Destiny', 'Forge New Path',
      'Reclaim Throne', 'Save Loved One', 'Stop Apocalypse', 'Unravel Mystery', 'Redeem Villain',
      'Find Purpose', 'Escape Slavery', 'Prove Innocence', 'Win Tournament', 'Craft Masterpiece',
      'Build Empire', 'Destroy Weapon', 'Find Paradise', 'Stop War', 'Unite Factions',
      'Restore Balance', 'Break Tradition', 'Honor Ancestors', 'Defy Gods', 'Become Legend',
      'Find Peace', 'Seek Enlightenment', 'Master Magic', 'Defeat Rival', 'Save Nature',
      'Explore Unknown', 'Document History', 'Create Legacy', 'End Suffering', 'Bring Justice',
      'Survive Ordeal', 'Unlock Potential', 'Face Demons', 'Embrace Destiny', 'Reject Fate',
      'Find Belonging', 'Earn Respect', 'Gain Power', 'Lose Innocence', 'Find Identity',
      'Escape Prison', 'Clear Name', 'Settle Debt', 'Keep Promise', 'Break Oath',
      'Find Truth', 'Hide Secret', 'Expose Lie', 'Preserve Tradition', 'Start Revolution',
      'End Corruption', 'Save Species', 'Prevent Disaster', 'Complete Quest', 'Pass Test',
      'Earn Title', 'Join Order', 'Leave Order', 'Find Mentor', 'Surpass Teacher',
      'Protect Artifact', 'Destroy Evil', 'Spread Faith', 'Question Beliefs', 'Find Answers',
      'Seek Forgiveness', 'Grant Mercy', 'Show Strength', 'Prove Loyalty', 'Test Limits',
      'Overcome Addiction', 'Face Past', 'Build Future', 'Live Present', 'Defy Odds',
      'Beat System', 'Change World', 'Accept Change', 'Fight Change', 'Embrace Chaos'
    ];

    // Continent and nationality options
    const continentCountries = {
      'Avistan': {
        'Broken Lands': ['Absalom', 'Mendev', 'Nelduin', 'Numeria', 'Brevoy', 'Rostland', 'Razmiran', 'River Kingdoms'],
        'Eye of Dread': ['Lastwall', 'Molthune', 'Nirmathas', 'Ustalav'],
        'Saga Lands': ['Realm of the Mammoth Lords', 'Varisia', 'Belkzen', 'Irrisen', 'Lands of the Linnorm Kings', 'New Thassilon'],
        'Shining Kingdoms': ['Andoran', 'Galt', 'Kyonin', 'Druma', 'Taldor', 'Five Kings Mountains'],
        'Old Cheliax': ['Cheliax', 'Isger', 'Nidal']
      },
      'Garund': {},
      'Tian Xia': {},
      'Arcadia': {},
      'Casmaron': {}
    };

    return `
      <div class="wizard-step step-bio">
        <h2>Character Bio</h2>
        <p class="step-description">Define your character's identity and background.</p>

        <div class="bio-sections">
          <!-- Personal Details Section -->
          <div class="bio-section personal-details-section">
            <h3>Personal Details</h3>
            <div class="bio-fields-grid">
              <div class="bio-field bio-field-full">
                <label for="character-name-input">Character Name</label>
                <div class="name-with-button">
                  <input type="text" id="character-name-input" class="bio-input"
                         placeholder="Enter character name..."
                         value="${bio.name || ''}" />
                  <button type="button" class="generate-name-btn">
                    <i class="fas fa-external-link-alt"></i> Open Fantasy Name Generator
                  </button>
                </div>
              </div>
              <div class="bio-field">
                <label for="bio-gender">Gender</label>
                <input type="text" id="bio-gender" class="bio-input"
                       placeholder="e.g., Male, Female, Non-binary..."
                       value="${bio.gender || ''}" />
              </div>
              <div class="bio-field">
                <label for="bio-pronouns">Pronouns</label>
                <input type="text" id="bio-pronouns" class="bio-input"
                       placeholder="e.g., he/him, she/her, they/them..."
                       value="${bio.pronouns || ''}" />
              </div>
              <div class="bio-field">
                <label for="bio-age">Age</label>
                <input type="text" id="bio-age" class="bio-input"
                       placeholder="e.g., 25, Young Adult..."
                       value="${bio.age || ''}" />
              </div>
              <div class="bio-field">
                <label for="bio-height">Height</label>
                <input type="text" id="bio-height" class="bio-input"
                       placeholder="e.g., 6'2\", 5'8\"..."
                       value="${bio.height || ''}" />
              </div>
              <div class="bio-field">
                <label for="bio-weight">Weight</label>
                <input type="text" id="bio-weight" class="bio-input"
                       placeholder="e.g., 180 lbs, 65 kg..."
                       value="${bio.weight || ''}" />
              </div>
              <div class="bio-field">
                <label for="bio-ethnicity">Ethnicity</label>
                <input type="text" id="bio-ethnicity" class="bio-input"
                       placeholder="e.g., Keleshite, Ulfen, Garundi..."
                       value="${bio.ethnicity || ''}" />
              </div>
              <div class="bio-field">
                <label for="bio-continent">Continent</label>
                <select id="bio-continent" class="bio-select">
                  <option value="">Select continent...</option>
                  <option value="Avistan" ${bio.continent === 'Avistan' ? 'selected' : ''}>Avistan</option>
                  <option value="Garund" ${bio.continent === 'Garund' ? 'selected' : ''}>Garund</option>
                  <option value="Tian Xia" ${bio.continent === 'Tian Xia' ? 'selected' : ''}>Tian Xia</option>
                  <option value="Arcadia" ${bio.continent === 'Arcadia' ? 'selected' : ''}>Arcadia</option>
                  <option value="Casmaron" ${bio.continent === 'Casmaron' ? 'selected' : ''}>Casmaron</option>
                </select>
              </div>
              <div class="bio-field bio-field-full">
                <div id="continent-description" class="continent-description-box">
                  <em>Select a continent to see its description...</em>
                </div>
              </div>
              <div class="bio-field">
                <label for="bio-nationality">Country</label>
                <select id="bio-nationality" class="bio-select">
                  <option value="">Select continent first...</option>
                </select>
              </div>
              <div class="bio-field bio-field-full">
                <div id="nationality-description" class="nationality-description">
                  <em>Select a country to see its description...</em>
                </div>
              </div>
            </div>
          </div>

          <!-- Backstory Section -->
          <div class="bio-section backstory-section">
            <h3>Backstory</h3>
            <p class="help-text">Write your character's background story.</p>
            <textarea id="bio-backstory" class="bio-textarea" rows="6"
                      placeholder="Describe your character's history, upbringing, and the events that shaped them...">${bio.backstory || ''}</textarea>
          </div>

          <!-- Appearance Section -->
          <div class="bio-section appearance-section">
            <h3>Appearance</h3>
            <p class="help-text">Describe how your character looks.</p>
            <textarea id="bio-appearance" class="bio-textarea" rows="4"
                      placeholder="Describe your character's physical appearance, clothing, distinguishing features...">${bio.appearance || ''}</textarea>
          </div>

          <!-- Personality Section -->
          <div class="bio-section personality-section">
            <h3>Personality</h3>
            <p class="help-text">Describe your character's personality traits, mannerisms, and behavior.</p>
            <div class="personality-with-button">
              <textarea id="bio-personality" class="bio-textarea" rows="4"
                        placeholder="Describe your character's personality, values, quirks, and typical behavior...">${bio.personality || ''}</textarea>
              <button type="button" class="generate-personality-btn">
                <i class="fas fa-dice"></i> Generate Random Traits
              </button>
            </div>
          </div>

          <!-- Backstory Themes Section -->
          <div class="bio-section theme-section">
            <h3>Backstory Themes (Optional)</h3>
            <p class="help-text">Roll for random backstory themes that might inspire your character's motivations.</p>
            <div class="theme-roll-container">
              <button type="button" class="roll-themes-btn">
                <i class="fas fa-dice"></i> Roll Backstory Themes
              </button>
              <div class="rolled-themes-list">
                ${bio.backstoryThemes && bio.backstoryThemes.length > 0 ? `
                  ${bio.backstoryThemes.map(theme => `
                    <div class="rolled-theme-item">
                      <i class="fas fa-star"></i>
                      <span>${theme}</span>
                    </div>
                  `).join('')}
                ` : '<p class="no-themes-text">Click the button above to generate random backstory themes</p>'}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Step 12: Equipment (Class Kits and Custom Purchases)
  async generateStep12_Equipment() {
    const stateManager = game.characterBuilder.stateManager;
    const dataProvider = game.characterBuilder.dataProvider;

    // Initialize equipment state if needed
    if (!stateManager.choices.equipment) {
      stateManager.choices.equipment = {
        selectedKit: null,
        cartItems: [],
        goldSpent: 0
      };
    }
    if (!stateManager.choices.equipment.cartItems) {
      stateManager.choices.equipment.cartItems = [];
    }

    const equipment = stateManager.choices.equipment;
    const selectedClass = stateManager.choices.class?.item;

    // Calculate gold properly from cart items
    let goldSpent = 0;
    if (equipment.cartItems && equipment.cartItems.length > 0) {
      goldSpent = equipment.cartItems.reduce((total, item) => {
        const itemPrice = item.item.system.price?.value?.gp || 0;
        return total + (itemPrice * (item.quantity || 1));
      }, 0);
    }
    const goldRemaining = 15 - goldSpent;

    // Load equipment kits from compendium
    const kits = await dataProvider.getEquipmentKits();

    // Generate equipment reminders for Clerics, Champions, and Runesmiths
    const remindersHtml = generateEquipmentReminders(stateManager);

    let html = `
      <div class="wizard-step step-equipment">
        <h2>Choose Your Equipment</h2>
        <p class="step-description">Browse equipment, select a pre-made kit, or drag items into your shopping cart (15 GP total).</p>

        ${remindersHtml}

        <!-- Browse Equipment Section (Top) -->
        <div class="equipment-section equipment-browse-section">
          <h3>Browse Equipment</h3>
          <p class="section-help">Open the Compendium Browser to find equipment and drag items to your cart.</p>
          <button type="button" class="open-compendium-btn">
            <i class="fas fa-search"></i> Open Compendium Browser
          </button>
          <p class="help-text"><i class="fas fa-info-circle"></i> Drag items from the browser into the shopping cart below.</p>
        </div>

        <div class="equipment-container">
          <!-- Left Column: Kits -->
          <div class="equipment-left">
            <!-- Class Kits Section -->
            <div class="equipment-section">
              <h3>Class Equipment Kits</h3>
              <p class="section-help">Pre-selected equipment sets optimized for your class.</p>
              <div class="equipment-kits-grid">
    `;

    if (kits.length === 0) {
      html += `
                <div class="equipment-kit-placeholder">
                  <i class="fas fa-box"></i>
                  <p>No equipment kits available</p>
                  <p class="help-text">Ask your GM to configure equipment kits in module settings</p>
                </div>
      `;
    } else {
      for (const kit of kits) {
        const kitPrice = kit.system.price?.value?.gp || 0;
        const canAfford = kitPrice <= 15; // Check against full budget, not remaining
        const isSelected = equipment.selectedKit?.id === kit.id;

        html += `
                <div class="equipment-kit-card ${isSelected ? 'selected' : ''} ${!canAfford ? 'unaffordable' : ''}" data-kit-id="${kit.id}">
                  <img class="kit-icon" src="${kit.img || 'icons/svg/item-bag.svg'}" alt="${kit.name}">
                  <div class="kit-info">
                    <h4 class="kit-name">${kit.name}</h4>
                    <p class="kit-price">${kitPrice} GP</p>
                    ${kit.system.description?.value ? `<div class="kit-description">${await TextEditor.enrichHTML(kit.system.description.value, { async: true })}</div>` : ''}
                  </div>
                  <div class="kit-actions">
                    <button type="button" class="kit-details-btn" data-kit-id="${kit.id}">
                      <i class="fas fa-info-circle"></i> View Contents
                    </button>
                    ${isSelected ? `
                      <button type="button" class="kit-deselect-btn" data-kit-id="${kit.id}">
                        <i class="fas fa-times"></i> Deselect
                      </button>
                    ` : ''}
                  </div>
                  ${isSelected ? '<div class="kit-selected-badge"><i class="fas fa-check"></i> Selected</div>' : ''}
                </div>
        `;
      }
    }

    html += `
              </div>
            </div>
          </div>

          <!-- Right Column: Shopping Cart -->
          <div class="equipment-right">
            <div class="shopping-cart" data-drop-zone="true">
              <h3><i class="fas fa-shopping-cart"></i> Shopping Cart</h3>

              <div class="cart-summary">
                <div class="cart-total">
                  <span>Total:</span>
                  <span class="total-amount ${goldSpent > 15 ? 'over-budget' : ''}">${goldSpent.toFixed(2)} / 15 GP</span>
                </div>
                ${goldSpent > 15 ? `
                  <div class="cart-warning">
                    <i class="fas fa-exclamation-triangle"></i> Over budget!
                  </div>
                ` : `
                  <div class="cart-remaining">
                    <span>Remaining:</span>
                    <span>${goldRemaining.toFixed(2)} GP</span>
                  </div>
                `}
              </div>

              <div class="cart-items">
                ${equipment.cartItems && equipment.cartItems.length > 0 ? `
                  ${equipment.cartItems.map((item, index) => {
                    const itemPrice = item.item.system.price?.value?.gp || 0;
                    const quantity = item.quantity || 1;
                    const totalPrice = itemPrice * quantity;
                    return `
                      <div class="cart-item" data-index="${index}">
                        <img class="cart-item-icon" src="${item.item.img}" alt="${item.item.name}">
                        <div class="cart-item-info">
                          <span class="cart-item-name">${item.item.name}</span>
                          <span class="cart-item-price">${itemPrice} GP each</span>
                        </div>
                        <div class="cart-item-quantity">
                          <button type="button" class="qty-decrease" data-index="${index}">
                            <i class="fas fa-minus"></i>
                          </button>
                          <input type="number" class="qty-input" data-index="${index}" value="${quantity}" min="1" max="99">
                          <button type="button" class="qty-increase" data-index="${index}">
                            <i class="fas fa-plus"></i>
                          </button>
                        </div>
                        <div class="cart-item-total">
                          ${totalPrice.toFixed(2)} GP
                        </div>
                        <button type="button" class="cart-item-remove" data-index="${index}">
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    `;
                  }).join('')}
                ` : `
                  <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p class="help-text">Select a kit or drag items from the compendium</p>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  // Helper to format action text
  formatActionText(actionValue) {
    if (!actionValue || actionValue === '—') return '—';

    // Convert action value to readable text
    const actionStr = String(actionValue).toLowerCase();
    if (actionStr === '1') return '1 Action';
    if (actionStr === '2') return '2 Actions';
    if (actionStr === '3') return '3 Actions';
    if (actionStr === 'reaction') return 'Reaction';
    if (actionStr === 'free') return 'Free Action';

    // Default: capitalize first letter
    return actionValue.charAt(0).toUpperCase() + actionValue.slice(1);
  }

  // Generate a spell card with inline description
  async generateSpellCard(spell, selectedSpells) {
    const isCantrip = spell.spellLevel === 0;
    const isSelected = isCantrip
      ? selectedSpells.cantrips?.some(s => s.uuid === spell.uuid)
      : selectedSpells.level1?.some(s => s.uuid === spell.uuid);

    const img = spell.img || 'icons/svg/mystery-man.svg';
    const actionValue = spell.system.time?.value || '—';
    const actionText = this.formatActionText(actionValue);
    const components = [];
    if (spell.system.components?.verbal) components.push('V');
    if (spell.system.components?.somatic) components.push('S');
    if (spell.system.components?.material) components.push('M');
    const componentStr = components.join(', ') || '—';

    const traits = spell.system.traits?.value || [];
    const traditions = spell.system.traits?.traditions || [];

    // Get additional spell details
    const range = spell.system.range?.value || '—';
    const duration = spell.system.duration?.value || '—';
    const area = spell.system.area?.value || null;
    const target = spell.system.target?.value || null;

    // Enrich description immediately (like we do with feats)
    const rawDescription = spell.system.description?.value || 'No description available';
    const description = await TextEditor.enrichHTML(rawDescription, { async: true });

    return `
      <div class="selection-card spell-card ${isSelected ? 'selected' : ''}"
           data-uuid="${spell.uuid}"
           data-spell-type="${spell.spellType}"
           data-spell-level="${spell.spellLevel}">
        <div class="card-icon">
          <img src="${img}" alt="${spell.name}" />
        </div>
        <div class="spell-content">
          <h3 class="card-title">${spell.name}</h3>
          <div class="spell-meta-inline">
            <span class="spell-level">${isCantrip ? 'Cantrip' : `Level ${spell.spellLevel}`}</span>
            <span class="spell-actions">${actionText}</span>
            <span class="spell-components">${componentStr}</span>
          </div>
          <div class="card-traits">
            ${traditions.map(t => `<span class="trait tradition-${t}">${t.capitalize()}</span>`).join('')}
            ${traits.slice(0, 3).map(t => `<span class="trait">${t.capitalize()}</span>`).join('')}
          </div>
          <div class="spell-stats">
            ${range !== '—' ? `<span class="stat-item"><strong>Range:</strong> ${range}</span>` : ''}
            ${target ? `<span class="stat-item"><strong>Target:</strong> ${target}</span>` : ''}
            ${area ? `<span class="stat-item"><strong>Area:</strong> ${area}</span>` : ''}
            ${duration !== '—' ? `<span class="stat-item"><strong>Duration:</strong> ${duration}</span>` : ''}
          </div>
          <div class="card-description">${description}</div>
        </div>
        ${isSelected ? '<i class="fas fa-check-circle selected-icon"></i>' : ''}
      </div>
    `;
  }

  // Update spell info panel
  async updateSpellInfoPanel(spell) {
    console.log('intrinsics-pf2e-character-builder | updateSpellInfoPanel called for:', spell.name);
    const infoPanel = this.element.find('#spell-info-panel');
    console.log('intrinsics-pf2e-character-builder | Info panel found:', infoPanel.length);
    if (!infoPanel.length) {
      console.warn('intrinsics-pf2e-character-builder | Info panel not found!');
      return;
    }

    const spellLevel = spell.system.level?.value || 0;
    const actions = spell.system.time?.value || '—';
    const components = [];
    if (spell.system.components?.verbal) components.push('Verbal');
    if (spell.system.components?.somatic) components.push('Somatic');
    if (spell.system.components?.material) components.push('Material');
    const componentStr = components.join(', ') || 'None';

    const range = spell.system.range?.value || '—';
    const duration = spell.system.duration?.value || '—';
    const area = spell.system.area?.value || null;
    const traditions = spell.system.traits?.traditions || [];
    const traits = spell.system.traits?.value || [];

    // Enrich the description with Foundry links (use new namespaced version for v13+)
    const enricher = foundry.applications?.ux?.TextEditor?.implementation || TextEditor;
    const description = await enricher.enrichHTML(spell.system.description?.value || 'No description available', { async: true });

    const html = `
      <div class="spell-info-content">
        <div class="spell-info-header">
          <img src="${spell.img || 'icons/svg/mystery-man.svg'}" alt="${spell.name}" class="spell-info-icon" />
          <div>
            <h2>${spell.name}</h2>
            <p class="spell-level-badge">${spellLevel === 0 ? 'Cantrip' : `Level ${spellLevel}`}</p>
          </div>
        </div>

        <div class="spell-info-stats">
          <div class="stat-row">
            <span class="stat-label">Actions:</span>
            <span class="stat-value">${actions}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Components:</span>
            <span class="stat-value">${componentStr}</span>
          </div>
          ${range !== '—' ? `<div class="stat-row">
            <span class="stat-label">Range:</span>
            <span class="stat-value">${range}</span>
          </div>` : ''}
          ${area ? `<div class="stat-row">
            <span class="stat-label">Area:</span>
            <span class="stat-value">${area}</span>
          </div>` : ''}
          ${duration !== '—' ? `<div class="stat-row">
            <span class="stat-label">Duration:</span>
            <span class="stat-value">${duration}</span>
          </div>` : ''}
        </div>

        ${traditions.length > 0 ? `
          <div class="spell-info-section">
            <h4>Traditions</h4>
            <div class="trait-list">
              ${traditions.map(t => `<span class="trait tradition-${t}">${t.capitalize()}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${traits.length > 0 ? `
          <div class="spell-info-section">
            <h4>Traits</h4>
            <div class="trait-list">
              ${traits.map(t => `<span class="trait">${t.capitalize()}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <div class="spell-info-section">
          <h4>Description</h4>
          <div class="spell-description-full">${description}</div>
        </div>
      </div>
    `;

    infoPanel.html(html);
    console.log('intrinsics-pf2e-character-builder | Info panel HTML set successfully');
  }

  // Truncate HTML content to plain text
  truncateHtml(html, maxLength) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || '';

    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

    // Progress bar step clicks disabled - navigation only via Previous/Next buttons
    // html.find('.progress-step').click((ev) => {
    //   const step = parseInt(ev.currentTarget.dataset.step);
    //   stateManager.goToStep(step);
    // });

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
      const heritageData = await dataProvider.getHeritages(ancestrySlug);

      // Search in both specific and versatile heritage arrays
      let heritage = heritageData.specific?.find(h => h.id === itemId);
      if (!heritage) {
        heritage = heritageData.versatile?.find(h => h.id === itemId);
      }

      if (heritage) {
        stateManager.setChoice('heritage', heritage);
      }
    });

    // Deity selection
    html.find('.step-deity .selection-card').click(async (ev) => {
      const uuid = ev.currentTarget.dataset.uuid;
      const deities = await dataProvider.getDeities();
      const deity = deities.find(d => d.uuid === uuid);

      if (deity) {
        stateManager.setChoice('deity', deity);
      }
    });

    // Deity search (searches name, description, domains, and weapons)
    html.find('.deity-search').on('input', (ev) => {
      const searchTerm = ev.currentTarget.value.toLowerCase();
      const cards = html.find('.step-deity .deity-card');
      const folders = html.find('.step-deity .deity-folder');

      if (!searchTerm) {
        // Show all cards and folders
        cards.show();
        folders.show();
        return;
      }

      // Filter cards by name, description, domains, or weapons
      cards.each((i, card) => {
        const $card = $(card);
        const name = $card.data('name') || '';
        const description = $card.data('description') || '';
        const domains = $card.data('domains') || '';
        const weapons = $card.data('weapons') || '';
        if (name.includes(searchTerm) || description.includes(searchTerm) || domains.includes(searchTerm) || weapons.includes(searchTerm)) {
          $card.show();
        } else {
          $card.hide();
        }
      });

      // Hide empty folders
      folders.each((i, folder) => {
        const $folder = $(folder);
        const visibleCards = $folder.find('.deity-card:visible');
        if (visibleCards.length > 0) {
          $folder.show();
        } else {
          $folder.hide();
        }
      });
    });

    // Pantheon filter
    html.find('.pantheon-filter').on('change', (ev) => {
      const selectedPantheon = ev.currentTarget.value;
      const folders = html.find('.step-deity .deity-folder');

      if (!selectedPantheon) {
        // Show all folders
        folders.show();
        return;
      }

      // Show only the selected pantheon folder
      folders.each((i, folder) => {
        const $folder = $(folder);
        const folderName = $folder.data('folder');
        if (folderName === selectedPantheon) {
          $folder.show();
        } else {
          $folder.hide();
        }
      });
    });

    // Domain filter
    html.find('.domain-filter').on('change', (ev) => {
      const selectedDomain = ev.currentTarget.value.toLowerCase();
      const cards = html.find('.step-deity .deity-card');
      const folders = html.find('.step-deity .deity-folder');

      if (!selectedDomain) {
        // Show all cards and folders
        cards.show();
        folders.show();
        return;
      }

      // Filter cards by domain
      cards.each((i, card) => {
        const $card = $(card);
        const domains = $card.data('domains') || '';
        if (domains.includes(selectedDomain)) {
          $card.show();
        } else {
          $card.hide();
        }
      });

      // Hide empty folders
      folders.each((i, folder) => {
        const $folder = $(folder);
        const visibleCards = $folder.find('.deity-card:visible');
        if (visibleCards.length > 0) {
          $folder.show();
        } else {
          $folder.hide();
        }
      });
    });

    // Weapon filter
    html.find('.weapon-filter').on('change', (ev) => {
      const selectedWeapon = ev.currentTarget.value.toLowerCase();
      const cards = html.find('.step-deity .deity-card');
      const folders = html.find('.step-deity .deity-folder');

      if (!selectedWeapon) {
        // Show all cards and folders
        cards.show();
        folders.show();
        return;
      }

      // Filter cards by weapon
      cards.each((i, card) => {
        const $card = $(card);
        const weapons = $card.data('weapons') || '';
        if (weapons.includes(selectedWeapon)) {
          $card.show();
        } else {
          $card.hide();
        }
      });

      // Hide empty folders
      folders.each((i, folder) => {
        const $folder = $(folder);
        const visibleCards = $folder.find('.deity-card:visible');
        if (visibleCards.length > 0) {
          $folder.show();
        } else {
          $folder.hide();
        }
      });
    });

    // Background selection
    html.find('.step-background .selection-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const backgrounds = await dataProvider.getBackgrounds();
      const background = backgrounds.find(b => b.id === itemId);

      if (background) {
        stateManager.setChoice('background', {
          item: background
        });
        this.updateDisplay();
      }
    });

    // Class selection
    html.find('.step-class .selection-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const classes = await dataProvider.getClasses();
      const cls = classes.find(c => c.id === itemId);

      if (cls) {
        // Auto-select first key ability option
        const keyAbilityOptions = cls.system.keyAbility?.value || [];
        const keyAbility = keyAbilityOptions.length > 0 ? keyAbilityOptions[0] : null;

        stateManager.setChoice('class', {
          item: cls,
          keyAbility: keyAbility
        });
        this.updateDisplay();
      }
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

    // Background search
    html.find('.background-search').on('input', (ev) => {
      const searchTerm = ev.currentTarget.value.toLowerCase();
      const cards = html.find('.step-background .selection-card');
      const sections = html.find('.step-background .rarity-section');

      if (!searchTerm) {
        // Show all cards and sections
        cards.show();
        sections.show();
        return;
      }

      // Filter cards
      cards.each((i, card) => {
        const $card = $(card);
        const name = $card.data('name') || '';
        if (name.includes(searchTerm)) {
          $card.show();
        } else {
          $card.hide();
        }
      });

      // Hide empty sections
      sections.each((i, section) => {
        const $section = $(section);
        const visibleCards = $section.find('.selection-card:visible').length;
        if (visibleCards > 0) {
          $section.show();
        } else {
          $section.hide();
        }
      });
    });

    // Open character sheet button (for ability allocation)
    html.find('.open-sheet-btn').click(async () => {
      const actor = stateManager.targetActor;
      if (actor) {
        // Open the character sheet
        await actor.sheet.render(true);

        // Try to open the ability builder after a short delay
        setTimeout(() => {
          // PF2E character sheets have an attribute builder button
          // We'll trigger a click on it or open the app directly
          const abilityBuilder = actor.sheet.element?.find('.tab[data-tab="abilities"]');
          if (abilityBuilder?.length) {
            abilityBuilder.click();
          }

          // Try to open the attribute builder directly
          setTimeout(() => {
            const builderBtn = actor.sheet.element?.find('button[data-action="build-attributes"]');
            if (builderBtn?.length) {
              builderBtn.click();
            }
          }, 200);
        }, 300);
      } else {
        ui.notifications.warn("No character sheet available yet");
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
        const actor = stateManager.targetActor;

        // Get INT modifier from actor (abilities are on character sheet now)
        // PF2E stores the modifier directly in the mod property
        const intModifier = actor?.system?.abilities?.int?.mod || 0;

        // Get class skill count from lookup table (matches validator logic)
        const classSkillCount = this.getClassSkillCount(classChoice.item.slug);
        const totalClassSkills = Math.max(classSkillCount + intModifier, 0);
        const totalSkillsNeeded = 1 + totalClassSkills; // +1 for background skill

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

    // Language selection
    html.find('.language-card').click((ev) => {
      const card = $(ev.currentTarget);

      // Can't select already known languages
      if (card.hasClass('disabled')) {
        return;
      }

      const language = ev.currentTarget.dataset.language;
      const currentLanguages = stateManager.choices.languages || { selected: [] };
      const selectedLanguages = currentLanguages.selected || [];
      const actor = stateManager.targetActor;

      // Get INT modifier
      const intModifier = actor?.system?.abilities?.int?.mod || 0;
      const maxLanguages = Math.max(intModifier, 0);

      // Toggle language selection
      if (selectedLanguages.includes(language)) {
        // Deselect
        const newLanguages = selectedLanguages.filter(l => l !== language);
        stateManager.setChoice('languages', { selected: newLanguages });
      } else {
        // Select if we haven't exceeded the limit
        if (selectedLanguages.length < maxLanguages) {
          const newLanguages = [...selectedLanguages, language];
          stateManager.setChoice('languages', { selected: newLanguages });
        } else {
          ui.notifications.warn("You have already selected the maximum number of languages");
        }
      }

      this.updateDisplay();
    });

    // Feat selection (both class and ancestry feats)
    html.find('.step-feats .feat-card').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const featType = ev.currentTarget.dataset.featType; // 'class' or 'ancestry'
      const feats = await dataProvider.getFeats();
      const feat = feats.find(f => f.id === itemId);

      if (feat && featType) {
        const currentFeats = stateManager.choices.feats || {};
        const updatedFeats = {
          ...currentFeats,
          [`${featType}Feat`]: feat
        };
        stateManager.setChoice('feats', updatedFeats);
      }
    });

    // Feat search filter
    html.find('.feat-search').on('input', (ev) => {
      const searchTerm = ev.target.value.toLowerCase();
      const cards = html.find('.feat-card');

      if (!searchTerm) {
        cards.show();
        return;
      }

      cards.each((i, card) => {
        const $card = $(card);
        const name = $card.data('name') || '';
        if (name.includes(searchTerm)) {
          $card.show();
        } else {
          $card.hide();
        }
      });
    });

    // Spell/Cantrip card click handler (for both steps)
    const handleSpellCardClick = async (ev) => {
      ev.stopPropagation();
      const card = $(ev.currentTarget);
      const uuid = card.data('uuid');
      const spellType = card.data('spell-type');

      if (!uuid || !spellType) {
        return;
      }

      // Fetch the spell from the UUID
      const spell = await fromUuid(uuid);
      if (!spell) {
        console.error(`intrinsics-pf2e-character-builder | Failed to load spell from UUID: ${uuid}`);
        return;
      }

      const currentSpells = stateManager.choices.spells || { cantrips: [], level1: [] };
      const targetArray = spellType === 'cantrip' ? 'cantrips' : 'level1';
      const selectedSpells = currentSpells[targetArray] || [];

      // Check if already selected
      const isSelected = selectedSpells.some(s => s.uuid === spell.uuid);

      if (isSelected) {
        // Deselect
        const newSpells = selectedSpells.filter(s => s.uuid !== spell.uuid);
        stateManager.setChoice('spells', {
          ...currentSpells,
          [targetArray]: newSpells
        });
      } else {
        // Check limits
        const maxCount = spellType === 'cantrip'
          ? stateManager.getCantripCount()
          : stateManager.getLevel1SpellCount();

        if (selectedSpells.length >= maxCount) {
          ui.notifications.warn(`You can only select ${maxCount} ${spellType === 'cantrip' ? 'cantrips' : 'level 1 spells'}`);
          return;
        }

        // Select
        stateManager.setChoice('spells', {
          ...currentSpells,
          [targetArray]: [...selectedSpells, spell]
        });
      }

      this.updateDisplay();
    };

    // Attach handler to both cantrip and spell steps
    html.find('.step-cantrips .spell-card').click(handleSpellCardClick.bind(this));
    html.find('.step-spells .spell-card').click(handleSpellCardClick.bind(this));

    // Browse Spells button (opens PF2e Compendium Browser)
    html.find('.browse-spells-btn').click(() => {
      if (game.pf2e?.compendiumBrowser) {
        // Open the compendium browser to the spells tab
        game.pf2e.compendiumBrowser.render(true);
        // Try to navigate to spells tab
        setTimeout(() => {
          const browser = game.pf2e.compendiumBrowser;
          if (browser.element?.length) {
            const spellsTab = browser.element.find('[data-tab="spell"]');
            if (spellsTab.length) {
              spellsTab.click();
            }
          }
        }, 300);
      } else {
        ui.notifications.warn("PF2e Compendium Browser is not available. You can search spells using the search box below.");
      }
    });

    // Spell search filter (works for both cantrips and level 1 spells)
    html.find('.spell-search').on('input', (ev) => {
      const searchTerm = ev.target.value.toLowerCase();
      const searchInput = $(ev.target);

      // Find cards in the current step (either cantrips or spells)
      const parentStep = searchInput.closest('.wizard-step');
      const cards = parentStep.find('.selection-card');

      if (!searchTerm) {
        cards.show();
        return;
      }

      cards.each((i, card) => {
        const $card = $(card);
        const name = $card.find('.card-title').text().toLowerCase();
        const description = $card.find('.card-description').text().toLowerCase();

        // Search in both name and description
        if (name.includes(searchTerm) || description.includes(searchTerm)) {
          $card.show();
        } else {
          $card.hide();
        }
      });
    });

    // Tradition selector change
    html.find('.tradition-selector').on('change', async (ev) => {
      const newTradition = ev.target.value;
      console.log('intrinsics-pf2e-character-builder | Tradition changed to:', newTradition);

      // Store the manual tradition override
      stateManager.choices.spellTradition = newTradition;

      // Clear selected spells when changing tradition
      stateManager.setChoice('spells', { cantrips: [], level1: [] });

      // Re-render to load new spell list
      await this.render(false);
    });

    // Set tradition dropdown value explicitly (fix for dropdown display issue)
    if (stateManager.choices.spellTradition) {
      const traditionSelect = html.find('.tradition-selector')[0];
      if (traditionSelect) {
        traditionSelect.value = stateManager.choices.spellTradition;
        // Trigger a non-bubbling change to update display without triggering handlers
        setTimeout(() => {
          traditionSelect.dispatchEvent(new Event('input', { bubbles: false }));
        }, 0);
      }
    }

    // Bio step: Character name input
    html.find('#character-name-input').on('input', (ev) => {
      const name = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, name }, null, true);
    });

    // Bio step: Generate name button
    html.find('.generate-name-btn').click(() => {
      const ancestry = stateManager.choices.ancestry;
      const ancestryName = ancestry ? ancestry.name.toLowerCase() : 'pathfinder';

      // Open the Fantasy Name Generator in a new tab
      const url = `https://www.fantasynamegenerators.com/pathfinder.php`;
      window.open(url, '_blank');

      ui.notifications.info(`Opening Fantasy Name Generator for ${ancestryName} names. Copy a name and paste it into the input field.`);
    });

    // Bio step: Personal details inputs
    html.find('#bio-gender').on('input', (ev) => {
      const gender = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, gender }, null, true);
    });

    html.find('#bio-pronouns').on('input', (ev) => {
      const pronouns = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, pronouns }, null, true);
    });

    html.find('#bio-age').on('input', (ev) => {
      const age = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, age }, null, true);
    });

    html.find('#bio-ethnicity').on('input', (ev) => {
      const ethnicity = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, ethnicity }, null, true);
    });

    html.find('#bio-height').on('input', (ev) => {
      const height = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, height }, null, true);
    });

    html.find('#bio-weight').on('input', (ev) => {
      const weight = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, weight }, null, true);
    });

    html.find('#bio-backstory').on('input', (ev) => {
      const backstory = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, backstory }, null, true);
    });

    html.find('#bio-appearance').on('input', (ev) => {
      const appearance = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, appearance }, null, true);
    });

    html.find('#bio-personality').on('input', (ev) => {
      const personality = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, personality }, null, true);
    });

    // Generate personality traits button
    html.find('.generate-personality-btn').click(() => {
      const personalityTraits = [
        'Brave and courageous', 'Cautious and careful', 'Curious and inquisitive', 'Loyal and steadfast',
        'Cunning and clever', 'Honest and straightforward', 'Secretive and mysterious', 'Friendly and outgoing',
        'Reserved and quiet', 'Optimistic and cheerful', 'Pessimistic and gloomy', 'Ambitious and driven',
        'Laid-back and easygoing', 'Serious and focused', 'Humorous and witty', 'Compassionate and kind',
        'Ruthless and cold', 'Idealistic and principled', 'Pragmatic and realistic', 'Impulsive and spontaneous',
        'Methodical and planned', 'Creative and artistic', 'Logical and analytical', 'Emotional and expressive',
        'Stoic and controlled', 'Generous and giving', 'Greedy and selfish', 'Humble and modest',
        'Proud and arrogant', 'Patient and calm', 'Hot-tempered and quick to anger', 'Forgiving and merciful',
        'Vengeful and grudge-holding', 'Trusting and naive', 'Suspicious and paranoid', 'Independent and self-reliant',
        'Dependent on others', 'Leader-like and commanding', 'Follower-like and obedient', 'Rebellious and defiant'
      ];

      // Roll for 2 random personality traits
      const selected = [];
      while (selected.length < 2) {
        const trait = personalityTraits[Math.floor(Math.random() * personalityTraits.length)];
        if (!selected.includes(trait)) {
          selected.push(trait);
        }
      }

      const generatedText = selected.join(', ');
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, personality: generatedText }, null, true);
      this.updateDisplay();
    });

    // Continent and nationality data structure
    const continentCountries = {
      'Avistan': {
        'Absalom': ['Absalom'],
        'Broken Lands': ['Mendev', 'Nelduin', 'Numeria', 'Brevoy', 'Rostland', 'Razmiran', 'River Kingdoms', "The Worldwound"],
        'Eye of Dread': ['Lastwall', 'Molthune', 'Nirmathas', 'Ustalav'],
        'Saga Lands': ['Realm of the Mammoth Lords', 'Varisia', 'Belkzen', 'Irrisen', 'Lands of the Linnorm Kings', 'New Thassilon'],
        'Shining Kingdoms': ['Andoran', 'Galt', 'Kyonin', 'Druma', 'Taldor', 'Five Kings Mountains'],
        'Old Cheliax': ['Cheliax', 'Isger', 'Nidal']
      },
      'Garund': {
        'Golden Road': ['Rahadoum', 'Thuvia', 'Osirion', 'Katapesh','Qadira'],
        'High Seas': ['Mediogalti Island','The Shackles'],
        'Impossible Lands': ['Alkenstar','Bhopan','Geb','Jalmeray','Mana Wastes','Nex'],
        'Mwangi Expanse': ['Bloodcove','Kibwe','Mzali','Nantambu','Nine Walls','Senghor','Sodden Lands','Usaro','Vidrian'],
        'Mualijae Nations':['Alijae','Ekujae','Kallijae'],
        'Southern Garund': ['Chauxen','Dehrukani','Droon','Eihlona','Holomog','Kazulu','Murraseth','Nurvatcha','Tirakawhan']
      },
      'Tian Xia':{
        'Northern Tian Xia': ['Minkai','Chu Ye','Hongal','Hwanggot','Jinin','Songbai'],
        'Eastern Tian Xia': ['Po Li','Bachuan','Quain','Shenmen','Tang Mai','Tianjing'],
        'Southern Tian Xia': ['Nagajor','Valash Raj','Xa Hoi','Kwanlai'],
        'Western Tian Xia': ['Kaoling','Lingshen','Linvarre'],
        'Central Tian Xia':['Goka','Wanshou'],
        'Maritime Tian Xia': ['Xidao'],
      },
      'Arcadia': {
        'Northern Arcadia': ['Braskoff','Briarbough','Crownpeaks','Halana'],
        'Central Arcadia': ['Illani Plains','Nalmeras','Heyopan'],
        'Western Arcadia': ['Three Craters','Ghostlands','Degasi']
      },
      'Casmaron': {
        'Grass Sea': ['Karazh'],
        'Iblydos': ['Pol-Bailax','Pol-Duraxillis','Pol-Liachora','Pol-Ptirmeios','Pol-Sylirica','Pol-Ungkore','Pol-Xamne'],
        'Kelesh Empire': ['Ayyarad','Hukaris','Khattib','Midea','Mishyria','Thieron','Unbroken League','Zelshabbar'],
        'Vudra': ['Baghava','Danamsa','Dharget','Janvari','Japrini','Kaurata','Khoyadesh','Mharana','Nayapul','Pandata','Praramdav','Saman','Sikari','Tanadesh','Vaktai'],
        'Eastern Casmaron':['Kaladay'],
        'Western Casmaron':['Iobaria','Whistling Plains']
      },
      'Crown of the World': 
      {
        'Outer Rim': ['Almhult','Hasanaliat','Osman Confederation','Yumyzyl'],
        'High Ice': ['Khorkii Clans','Ulaagor Clans','Urjuk'],
        'Boreal Expanse': ['Zavaten Gura']

      }
    };

    // Nation descriptions - add your descriptions for each nation here
    const nationDescriptions = {
      // Avistan - Broken Lands
      'Absalom': 'The City at the Center of the World, Absalom is a vast, cosmopolitan metropolis where global trade, ancient history, and political intrigue converge. Founded by the god Aroden, it stands as the largest city in the Inner Sea region and houses the Starstone Cathedral. Adventurers, merchants, and diplomats from across Golarion gather in its diverse districts.',
      'Mendev': 'A militant crusader nation shaped by generations of holy war, Mendev is defined by faith, sacrifice, and vigilance against existential threats. For over a century, it stood as the primary bulwark against the demonic armies pouring from the Worldwound. Though the Worldwound has closed, Mendev continues to rebuild while maintaining its martial culture and devotion to Iomedae.',
      'Nelduin': 'A new nation in the River Kingdoms, shaped by a long war with the Nymph Nyrissa, known and feared for the intelligence service called the Crimson Eye',
      'Numeria': 'A land where barbaric traditions clash with alien technology, Numeria is ruled by warlords wielding relics they barely understand. When the spaceship Divinity crashed here millennia ago, it transformed the region into a wasteland littered with incredible technological artifacts. The Technic League monopolizes access to this salvage, creating a society of brutal inequality.',
      'Brevoy': 'A young and fractious realm of feuding noble houses, recently devastated by civil war. The mysterious disappearance of House Rogarvia plunged the nation into chaos, with Houses Surtova and Orlovsky vying for control. The recent civil war between its northern (Issia) and southern (Rostland) tore the kingdom apart into Brevoy and Rostland',
      'Rostland': 'A proud and culturally distinct region of Brevoy, now independant and ruled by the Swordlord Jamandi Aldori. Rostland values chivalry, independence, and ancient traditions, particularly the Aldori dueling style. Its people chafed under Brevic rule and rebelled, successfully gaining independance in 4712',
      'Razmiran': 'A tightly controlled theocracy ruled by a self-proclaimed living god, Razmiran is marked by propaganda, obedience, and suppressed dissent. The masked charlatan Razmir maintains power through his faiths rigid hierarchy and the illusion of divine power. Citizens live under constant surveillance, forced to tithe heavily to the clergy while foreign nations treat Razmiran with suspicion.',
      'River Kingdoms': 'A patchwork of constantly shifting states, the River Kingdoms prize personal freedom, ambition, and strength over centralized authority. Countless would-be monarchs rise and fall along the Sellen River, their petty kingdoms emerging and collapsing with the seasons. The only constant is the River Freedoms —six traditional guidelines that protect personal liberty above all.',
      'The Worldwound': 'A scarred land once known as Sarkoris, devastated by Areelu Vorlesh opening a tear into the Abyss, the Worldwound is extremely dangerous, haunted, and shaped by the legacy of abyssal corruption.',
      // Avistan - Eye of Dread
      'Lastwall': 'Once a bastion against undeath, Lastwalls fallen territories are defined by sacrifice, lost heroism, and lingering martial tradition. When the Whispering Tyrant Tar-Baphon broke free, his undead armies destroyed this proud nation, transforming it into the Gravelands. The surviving Knights of Lastwall now operate as a scattered order, maintaining their vigil from exile.',
      'Molthune': 'A rigid, militarized nation that values discipline and order, Molthune seeks strength through conquest and centralized authority. After breaking from Cheliax, it built a powerful military machine to expand its borders and suppress dissent. Its ongoing conflict with rebellious Nirmathas drains resources while its Imperial Governor rules with an iron fist.',
      'Nirmathas': 'A fiercely independent land of forests and guerrilla fighters, Nirmathas resists foreign rule through mobility, local loyalty, and resilience. Born from rebellion against Molthunes oppression, this young nation has no formal government, instead relying on loose confederations of rangers and militias. Its people would rather die free in the Fangwood than live under imperial law.',
      'Ustalav': 'A gothic realm steeped in superstition and tragedy, Ustalav is a land where folklore, fear, and ancient horrors shape daily life. Divided into fractious counties ruled by suspicious nobles rumoured to be vampires, it bears the scars of centuries under the Whispering Tyrants rule. Mist-shrouded forests, crumbling castles, and whispered tales of undead and lycanthropes define this haunted nation.',
      // Avistan - Saga Lands
      'Realm of the Mammoth Lords': 'A harsh northern land where megafauna roam freely, its people survive through strength, tradition, and reverence for the old ways. Following clans hunt alongside prehistoric beasts across frozen tundra and taiga, proving their worth through deeds of courage. The land is equally sacred and deadly, where only the strong endure.',
      'Varisia': 'A culturally diverse frontier shaped by ancient ruins and strong traditions, Varisia blends settled cities with nomadic and tribal peoples. Massive Thassilonian monuments dot the landscape, drawing treasure hunters and scholars alike. The Varisian people travel in colorful caravans while city-states like Magnimar and Korvosa compete for influence.',
      'Belkzen': 'A brutal orc-held region defined by constant warfare, Belkzen values strength, survival, and dominance above all else. Numerous orc tribes battle constantly for supremacy among the ruins of fallen dwarf sky citadels. Only the strongest warlords can unite the tribes temporarily, usually for devastating raids on neighboring lands.',
      'Irrisen': 'A frozen land ruled by powerful witches, Irrisen is shaped by harsh magic, unyielding winters, and fear-driven obedience. Baba Yagas daughters govern this nation with cruel authority, maintaining eternal winter and treating human subjects as little more than cattle. Every century, Baba Yaga returns to replace the ruling queen, ensuring no witch grows too powerful.',
      'Lands of the Linnorm Kings': 'A collection of fiercely independent kingdoms, the Linnorm Lands prize personal glory, strength, and legendary deeds. Only those who slay a linnorm dragon can claim a throne, creating a culture that celebrates heroic achievement. These proud Ulfen people resist outside authority while raiding, trading, and exploring across the northern seas.',
      'New Thassilon': 'A reborn empire rising from ancient ruins, New Thassilon blends powerful magic with competing visions of rule and legacy. When the Runelord Sorshen returned, she sought to rebuild Thassilon as a force for good, breaking from its tyrannical past. This fragile nation struggles between redemption and the weight of ten thousand years of sins.',
      // Avistan - Shining Kingdoms
      'Andoran': 'A revolutionary republic built on ideals of freedom and equality, Andoran opposes tyranny and promotes civic responsibility. Born from rebellion against Cheliax, it abolished slavery and nobility, creating a government of elected representatives. The Eagle Knights serve as the nations military and covert operators, fighting oppression across the Inner Sea.',
      'Galt': 'A nation trapped in perpetual revolution, Galt is defined by paranoia, political violence, and the fear of becoming tomorrows enemy. The infamous final blades—guillotines that trap souls—execute "enemies of the revolution" daily as factions compete for fleeting power. Former heroes and villains alike fall to mobs and tribunals in endless cycles of retribution.',
      'Kyonin': 'The ancient homeland of the elves, Kyonin is a deeply magical forest realm that values tradition, artistry, and patience. After millennia of absence, the elves reclaimed this land from demons, but remain somewhat isolated from human affairs. The nation is protected by powerful wards and the vigilant demon-hunters of the Lantern Bearers.',
      'Druma': 'A pragmatic mercantile nation, Druma values contracts, stability, and wealth above ideology or conquest. Ruled by the Kalistocracy—a council of the nations wealthiest merchants—it maintains strict neutrality to protect trade relationships. The Prophecies of Kalistrade guide both commerce and personal conduct, creating a society obsessed with profit and purity.',
      'Taldor': 'An ancient empire in decline, Taldor is steeped in tradition, bureaucracy, and the struggle between reform and stagnation. Once the greatest human empire, it has lost territories to rebellion and mismanagement, becoming a shadow of former glory. Reformist and traditionalist factions battle for the nations soul as it attempts to modernize without losing its identity.',
      'Five Kings Mountains': 'A mountainous dwarven realm defined by clan loyalty, craftsmanship, and the long memory of grudges and honor. Five dwarven kingdoms united under the High King rule from Highhelm, maintaining ancient traditions of stonework and warfare. They remember every slight and alliance across centuries, making them steadfast friends and implacable enemies.',

      // Avistan – Old Cheliax
      'Cheliax': 'A rigid infernal empire, Cheliax enforces order through law, contracts, and diabolical authority. After House Thrune claimed power through devilish pacts, the nation transformed into a tyranny where diabolic worship is state religion. Its people endure oppression under the promise of order, while Hells influence permeates every institution.',
      'Isger': 'A small, war-scarred vassal state, Isger struggles with instability, poverty, and the aftermath of foreign domination. Crushed between Cheliax and Druma, it serves as a Chelish puppet while recovering from the devastating Goblinblood Wars. Bandits and monsters roam freely as the weak government fails to maintain order.',
      'Nidal': 'A secretive land bound to shadowy powers, Nidal embraces suffering and obedience as sacred truths. For millennia, the nation has served Zon-Kuthon, the god of darkness and pain, through a pact that saved them from ancient catastrophe. Citizens endure ritualized torment as religious devotion while shadowy agents enforce absolute loyalty to church and state.',
      // Garund - Golden Road
      'Rahadoum': 'A nation that banned all gods and divine magic, Rahadoum pursues knowledge and reason above faith. After religious wars nearly destroyed the nation, the Laws of Mortality outlawed all worship, creating a society that relies on philosophy and science. The Pure Legion enforces these laws while citizens debate whether enlightenment justifies such rigid control.',
      'Thuvia': 'A desert nation famous for the mysterious sun orchids that produce potions of immortality, Thuvia carefully rations these treasures to maintain independence. Only six potions are sold each year at auction, their astronomical prices funding the entire nation. Ancient mysteries and desert monasteries dot the landscape while foreign powers constantly scheme to steal the sun orchid secrets.',
      'Osirion': 'An ancient desert kingdom rich in history and tombs, Osirion is experiencing a renaissance of exploration and commerce. Freed from Keleshite rule, it has opened its borders to treasure hunters seeking fortune in countless pharaonic ruins. The nation balances modernization with tradition, as the Ruby Prince encourages discovery while protecting the most sacred sites.',
      'Katapesh': 'A bustling trade nation where anything can be bought or sold, Katapesh is defined by mercantile pragmatism and exotic danger. The mysterious Pactmasters rule from the capital, maintaining order while allowing remarkable freedom in commerce, including slave trade and dangerous substances. The desert markets overflow with goods from across the world, both wondrous and terrible.',
      'Qadira': 'The westernmost satrapy of the vast Kelesh Empire, Qadira serves as a gateway between civilizations and a staging ground for conquest. Blending Keleshite sophistication with Garundi influence, it projects imperial power while maintaining a unique cultural identity. The satrap balances loyalty to the distant emperor with local autonomy and ambitions toward Taldor.',
      // Garund - High Seas
      'Mediogalti Island': 'A lawless pirate haven ruled by the Red Mantis assassins, Mediogalti Island serves as a base for both maritime raiders and professional killers. The capital of Ilizmagorti tolerates any crime except interfering with the Red Mantis or their contracts. Pirates, smugglers, and those seeking the assassins services mingle in this dangerous port.',
      'The Shackles': 'A confederation of pirate islands ruled by the Hurricane King, the Shackles offer freedom from law in exchange for strength and cunning. The Free Captains maintain a loose alliance through the Pirate Council, sharing plunder and defending their waters from naval powers. Life is brutal but free, where capability matters more than birth.',
      // Garund - Impossible Lands
      'Alkenstar': 'A technological marvel born from necessity, Alkenstar thrives in the magic-dead wastes by mastering gunpowder and engineering. Surrounded by the chaotic Mana Wastes, its people developed firearms and clockwork to survive where magic fails. The Grand Duchess maintains order in this industrial city-state while exporting weapons across Golarion.',
      'Bhopan': 'A land of martial artists and warrior-philosophers, Bhopan values physical and spiritual perfection through disciplined training. Monasteries dot the countryside where masters teach devastating techniques alongside meditation and wisdom. The nation maintains independence through the skill of its warriors rather than armies.',
      'Geb': 'An undead nation ruled by the ancient necromancer-king Geb himself, where the living serve alongside countless undead. For millennia, the ghost-emperor has maintained this kingdom in his eternal war with neighboring Nex. The living inhabitants have adapted to this macabre existence, with bloodfarming and necromancy as ordinary parts of daily life.',
      'Jalmeray': 'An island nation of Vudrani culture and mysticism, Jalmeray is a land of impossible wonders and spiritual enlightenment. Transplanted from distant Vudra centuries ago, it maintains strong ties to that distant land while developing its own character. Maharajas rule over magnificent cities where genies walk freely and monks pursue transcendence.',
      'Mana Wastes': 'A chaotic wasteland where magic runs wild or fails completely, the Mana Wastes were created by the cataclysmic war between Geb and Nex. Reality itself is unstable, with areas of dead magic adjacent to zones of wild, unpredictable power. Mutants, monsters, and desperate scavengers struggle to survive in this inhospitable terrain.',
      'Nex': 'A magocracy of incredible arcane power, Nex was founded by the archmage whose war with Geb shaped the region. Though the archmage vanished millennia ago, his nation continues as a center of magical innovation and study. The Council of Three and Nine governs through bureaucratic magic while citizens pursue arcane advancement as the highest calling.',
      // Garund - Mwangi Expanse
      'Bloodcove': 'A frontier logging town dominated by the ruthless Aspis Consortium, Bloodcove extracts wealth from the jungle through exploitation and violence. The Consortiums agents brutally suppress local populations while harvesting rare woods and other resources. Despite its small size, it casts a dark shadow over the surrounding Expanse.',
      'Kibwe': 'A prosperous Mwangi city known for its universities and free port, Kibwe balances tradition with cosmopolitan trade. The Council of Elders governs wisely while maintaining the citys independence from colonial powers. Scholars come from across the world to study at its renowned institutions.',
      'Mzali': 'A reborn city ruled by the returned sun god-king Walkena, Mzali combines ancient glory with brutal theocracy. The child-god demands absolute obedience and regular sacrifices to maintain his power. Citizens live in fear and fanaticism while Walkena schemes to restore his empires former greatness.',
      'Nantambu': 'A center of learning and magical study, Nantambu houses the prestigious Magaambya, the oldest school of magic in the Inner Sea region. The city celebrates knowledge and diversity, welcoming students from across Golarion. Its Council of Learned keeps the city safe while fostering an atmosphere of scholarly pursuit.',
      'Nine Walls': 'A mysterious city of concentric walls protecting increasingly strange districts, Nine Walls has stood for millennia with many secrets. Each wall marks a different architectural era and culture, with the innermost districts housing incomprehensible wonders. The city welcomes traders but guards its deepest mysteries jealously.',
      'Senghor': 'A major port city that serves as a hub for trade between the Mwangi Expanse and the wider world, Senghor thrives on commerce and diversity. Free of colonial rule, it maintains independence through careful diplomacy and economic leverage. The harbor bustles with ships from every nation while the markets overflow with Expanse goods.',
      'Sodden Lands': 'A drowned realm where massive hurricanes destroyed a nation and transformed it into a swampy disaster zone, the Sodden Lands are largely abandoned. Survivors eke out existence on stilts and floating platforms while monsters thrive in the flooded ruins. The Eye of Abendego, the eternal hurricane, ensures the land remains uninhabitable.',
      'Usaro': 'A brutal city of demons and beast-men ruled by the Demon Lord Angazhans chosen, Usaro is a nightmare of savagery and blood sacrifice. Charau-ka ape-men dominate lesser tribes in service to their demonic patron. The city stands as a testament to primal violence and demonic corruption.',
      'Vidrian': 'A newly independent nation born from rebellion against Chelish colonialism, Vidrian struggles to forge its own identity and stability. The Firebrands led the revolution that freed this land, but building a nation proves harder than winning freedom. Competing factions debate the future while external threats and internal divisions challenge the fragile state.',
      // Garund - Mualijae Nations
      'Alijae': 'An elven nation of jungle dwellers who embraced the Mwangi Expanse as their home, the Alijae are master hunters and guides. They maintain their ancestral traditions while adapting to the jungle, creating a unique culture. The Alijae serve as intermediaries between the deep jungle and the outside world.',
      'Ekujae': 'Fierce elven protectors of the jungle, the Ekujae wage eternal war against demons and those who would despoil their sacred forests. They guard the demon-haunted ruins of fallen civilizations with deadly skill. The Ekujae consider themselves the Expanses immune system, eliminating threats before they can spread.',
      'Kallijae': 'Elven scholars and historians who dwell in the ruins of Mwangi empires, the Kallijae preserve ancient knowledge and artifacts. They study the fallen civilizations that preceded them, seeking wisdom in crumbling stones and faded texts. The Kallijae serve as the Expanses memory, though their isolationism limits their influence.',
      // Garund - Southern Garund
      'Chauxen': 'A militaristic nation of disciplined warriors, Chauxen maintains order through strength and martial tradition in southern Garund. Its legions project power across the region while maintaining internal stability. The nation values duty and capability above all else.',
      'Dehrukani': 'A land of ancient traditions and mysterious ruins, Dehrukani preserves knowledge of civilizations that predated modern nations. Its people blend old ways with adaptation to a changing world. Scholars seek to unlock the secrets buried in their homeland.',
      'Droon': 'A nation of skilled artisans and craftspeople, Droon is known for exceptional works of art and engineering. Its guilds maintain high standards while competing for prestige. The culture celebrates creation and innovation.',
      'Eihlona': 'A coastal nation of traders and sailors, Eihlona connects southern Garund to distant lands through maritime commerce. Its harbors welcome ships from across the world. The people have adapted to life between land and sea.',
      'Holomog': 'A nation struggling with internal divisions and external pressures, Holomog faces challenges to its stability and identity. Competing factions vie for control while neighbors watch for weakness. The future remains uncertain for this troubled land.',
      'Kazulu': 'A warrior nation that values strength and honor, Kazulu maintains its independence through martial prowess. Its fighters are renowned for their skill and ferocity. The culture revolves around proving oneself in combat.',
      'Murraseth': 'A mysterious land of ancient secrets and hidden powers, Murraseth guards knowledge from ages past. Its people maintain traditions few outsiders understand. The nation keeps its distance from foreign affairs.',
      'Nurvatcha': 'A land of spiritual significance and natural wonders, Nurvatcha is home to sacred sites and powerful natural forces. Its people live in harmony with their environment. The nation attracts pilgrims and those seeking enlightenment.',
      'Tirakawhan': 'A diverse nation blending multiple cultures and traditions, Tirakawhan serves as a crossroads in southern Garund. Its people have learned to navigate between different ways of life. The nations strength lies in its adaptability.',
      // Tian Xia - Northern
      'Minkai': 'An island empire of samurai honor and imperial tradition, Minkai values loyalty, duty, and ancestral reverence above all. The Jade Regent rules over a feudal society where bushido shapes every aspect of life. Despite recent turmoil, the nation maintains its proud warrior culture.',
      'Chu Ye': 'A nation of skilled riders and mounted warriors, Chu Ye controls the northern steppes through cavalry superiority. Its people blend nomadic traditions with settled civilization. The horse-lords maintain their independence through mobility and martial skill.',
      'Hongal': 'A land of fierce horsemen who roam vast grasslands, Hongal prizes freedom and personal glory. The tribal confederations resist outside authority while raiding and trading with neighbors. Strength and reputation determine status among these proud warriors.',
      'Hwanggot': 'A nation recovering from occupation and rebuilding its identity, Hwanggot blends old traditions with necessary adaptation. Its people work to reclaim their heritage while embracing change. The nation faces forward while honoring the past.',
      'Jinin': 'A mountainous realm of martial artists and isolated monasteries, Jinin values spiritual and physical discipline. Its people pursue perfection through rigorous training and meditation. The nation maintains independence through the skill of its warriors.',
      'Songbai': 'A land of scholars, artists, and refined culture, Songbai celebrates intellectual and aesthetic achievement. Its academies and guilds maintain high standards of learning and craft. The nation influences its neighbors through cultural excellence rather than force.',
      // Tian Xia - Eastern
      'Po Li': 'A prosperous trading nation controlling key maritime routes, Po Li thrives on commerce and naval power. Its merchant fleets connect distant lands while its harbors bustle with activity. The nations wealth flows from careful diplomacy and shrewd business.',
      'Bachuan': 'A land of misty rivers and ancient traditions, Bachuan maintains customs passed down through countless generations. Its people value continuity and stability above radical change. The nation endures through patience and adaptation.',
      'Quain': 'A nation of mysterious forests and hidden valleys, Quain guards its secrets from outsiders. Its people maintain traditions few foreigners comprehend. The land itself seems to resist those who would intrude.',
      'Shenmen': 'A land of legendary craftsmanship and technological innovation, Shenmen produces works of exceptional quality and ingenuity. Its artisans and engineers are sought across Tian Xia. The nation takes pride in surpassing its own achievements.',
      'Tang Mai': 'A coastal nation of sailors and explorers, Tang Mai maintains a powerful navy and far-reaching trade networks. Its people are renowned for their navigation skills and daring voyages. The nation looks outward, always seeking new opportunities.',
      'Tianjing': 'A nation of strict order and bureaucratic efficiency, Tianjing administers its territories through complex hierarchy and documentation. Its civil service maintains stability through regulation and procedure. The nation values predictability and proper form.',
      // Tian Xia - Southern
      'Nagajor': 'A realm ruled by naga serpent-folk who enslave humanoid populations, Nagajor is defined by ancient tyranny and dark magic. The naga maintain their dominance through sorcery and cruelty. Slaves outnumber masters but rebellion faces terrible consequences.',
      'Valash Raj': 'A land of elephant-mounted warriors and jungle kingdoms, Valash Raj combines martial tradition with sophisticated culture. Its rajahs rule diverse populations while maintaining complex alliances. The nation balances power between competing city-states.',
      'Xa Hoi': 'A region of rice paddies and river deltas, Xa Hois people have mastered water management and aquaculture. Its communities thrive through cooperation and adaptation to their environment. The nations strength lies in its agricultural abundance.',
      'Kwanlai': 'A nation of traders and cosmopolitan ports, Kwanlai welcomes foreigners and celebrates diversity. Its markets offer goods from across the world while its people adapt readily to new ideas. The nation prospers through openness and commerce.',
      // Tian Xia - Western
      'Kaoling': 'A land of powerful storms and hardy people, Kaoling endures harsh weather and difficult terrain. Its inhabitants have adapted to constant challenges through resilience. The nations strength comes from surviving what would break others.',
      'Lingshen': 'A realm of sacred mountains and spiritual significance, Lingshen attracts pilgrims seeking enlightenment. Its monasteries and shrines dot the landscape. The nation serves as a center of faith and contemplation.',
      'Linvarre': 'A frontier land blending multiple cultural influences, Linvarre serves as a meeting point between different traditions. Its people navigate between various ways of life. The nations character emerges from this continuous synthesis.',
      // Tian Xia - Central
      'Goka': 'The largest and most cosmopolitan city in Tian Xia, Goka welcomes traders, adventurers, and refugees from across the world. Its massive harbor and diverse districts make it a center of commerce and culture. The city-state maintains independence through economic power and careful diplomacy.',
      'Wanshou': 'A land where humans live alongside intelligent animals and beast-folk, Wanshous unique nature shapes every aspect of society. The Forestlords rule over this strange realm where talking animals are citizens. The nation challenges assumptions about civilization and nature.',
      // Tian Xia - Maritime
      'Xidao': 'An archipelago of island nations and maritime cultures, Xidao thrives on fishing, trade, and naval tradition. Its people are as comfortable on water as on land. The scattered islands maintain loose confederation while celebrating their oceanic heritage.',
      // Arcadia - Northern
      'Braskoff': 'A frontier nation of settlers and explorers, Braskoff represents expansion into Arcadias northern reaches. Its people face harsh conditions while building new communities. The nation balances ambition with survival.',
      'Briarbough': 'A land of ancient forests and nature-aligned settlements, Briarbough maintains harmony between civilization and wilderness. Its people live within rather than against the environment. The nation exemplifies sustainable coexistence.',
      'Crownpeaks': 'A mountainous realm of mining and metallurgy, Crownpeaks extracts wealth from rich mineral deposits. Its people have adapted to high-altitude life while developing expertise in stonework. The nations foundation is literally built on precious resources.',
      'Halana': 'A nation of agricultural abundance and settled communities, Halana represents stability in northern Arcadia. Its people have cultivated the land into productive farms and ranches. The nation prospers through careful stewardship and hard work.',
      // Arcadia - Central
      'Illani Plains': 'A vast grassland of nomadic peoples and wandering herds, the Illani Plains resist centralized authority. Its inhabitants follow the buffalo and seasons in endless cycles. The land belongs to those strong enough to claim and hold it.',
      'Nalmeras': 'A nation of city-states and regional powers, Nalmeras balances cooperation with competition among its constituent parts. Shared culture unites what politics divides. The nations strength emerges from managed diversity.',
      'Heyopan': 'A land of ancient ruins and resurgent kingdoms, Heyopan builds upon foundations laid by predecessor civilizations. Its people reclaim lost knowledge while forging new traditions. The nation looks to both past and future.',
      // Arcadia - Western
      'Three Craters': 'A region shaped by ancient cataclysm, Three Craters is defined by the massive impact sites that dominate the landscape. Strange phenomena and unique resources make the area both dangerous and valuable. Settlers struggle to thrive in this marked land.',
      'Ghostlands': 'A haunted frontier where the boundary between life and death grows thin, the Ghostlands are avoided by the living. Restless spirits and necromantic energies pervade the region. Only the desperate or foolish venture into this cursed territory.',
      'Degasi': 'A coastal nation of maritime culture and ocean trade, Degasi connects Arcadia to distant lands through sea routes. Its people are skilled sailors and fishers who respect the oceans power. The nations prosperity flows from its relationship with the sea.',
      // Casmaron - Grass Sea
      'Karazh': 'A land of endless steppes and nomadic horse-lords, Karazh prizes mobility and martial prowess. Its tribal confederations resist settlement while raiding neighbors. The grasslands define the people as much as they define the land.',
      // Casmaron - Iblydos
      'Pol-Bailax': 'One of the seven city-states of Iblydos, Pol-Bailax maintains traditions of hero-worship and classical culture. Its people celebrate legendary deeds and divine favor. The city competes with its neighbors for prestige and influence.',
      'Pol-Duraxillis': 'A militaristic Iblydian city-state that values strength and discipline above all. Its warriors train constantly to prove their superiority. The city maintains its independence through martial excellence.',
      'Pol-Liachora': 'An Iblydian city-state known for wisdom and philosophical tradition. Its thinkers debate the nature of reality while its citizens pursue enlightenment. The city influences others through ideas rather than force.',
      'Pol-Ptirmeios': 'An Iblydian city-state of craftsmen and artisans, Pol-Ptirmeios produces works of exceptional beauty. Its guilds maintain ancient techniques passed down through generations. The citys reputation rests on the quality of its creations.',
      'Pol-Sylirica': 'An Iblydian city-state of mystery cults and divine secrets, Pol-Sylirica guards knowledge of the gods. Its priests and mystics commune with powers beyond mortal understanding. The citys influence flows from spiritual authority.',
      'Pol-Ungkore': 'An Iblydian city-state that blends commerce with culture, Pol-Ungkore thrives on trade while maintaining classical traditions. Its merchants connect Iblydos to the wider world. The city balances profit with propriety.',
      'Pol-Xamne': 'An Iblydian city-state known for political intrigue and diplomatic cunning. Its citizens navigate complex alliances and rivalries with skill. The city maintains power through manipulation rather than confrontation.',
      // Casmaron - Kelesh Empire
      'Ayyarad': 'A satrapy of the Kelesh Empire known for its libraries and scholars, Ayyarad preserves knowledge from across the empire. Its academies attract students seeking learning. The regions influence comes from intellectual rather than military power.',
      'Hukaris': 'A martial satrapy of the Kelesh Empire that provides elite soldiers to the emperors armies. Its people are trained from birth for war. The region takes pride in military tradition and discipline.',
      'Khattib': 'A wealthy satrapy controlling important trade routes through the Kelesh Empire. Its merchants grow rich from taxing commerce. The regions prosperity makes it valuable to imperial administration.',
      'Midea': 'A coastal satrapy of the Kelesh Empire with powerful naval traditions. Its fleets patrol imperial waters and project power across the seas. The regions importance lies in maritime dominance.',
      'Mishyria': 'A satrapy of the Kelesh Empire known for mysticism and religious devotion. Its people pursue spiritual understanding through various traditions. The region serves as a center of faith within the empire.',
      'Thieron': 'A frontier satrapy of the Kelesh Empire that guards against external threats. Its fortresses and garrisons protect the empires borders. The region values vigilance and strength.',
      'Unbroken League': 'A confederation that resists Keleshite domination through unity and defiance. Member cities maintain independence through mutual defense. The League stands as an exception to imperial control.',
      'Zelshabbar': 'A satrapy of the Kelesh Empire renowned for its gardens and architecture. Its people create beauty on a massive scale. The region represents the empires cultural sophistication.',
      // Casmaron - Vudra
      'Baghava': 'One of the Impossible Kingdoms of Vudra, Baghava is known for its philosophical schools and debate traditions. Its people pursue truth through rigorous logic and discourse. The kingdom influences others through wisdom.',
      'Danamsa': 'A Vudran kingdom of warriors and martial tradition, Danamsa values honor and combat prowess. Its fighters are renowned across the Impossible Kingdoms. The realm maintains its strength through constant training.',
      'Dharget': 'A Vudran kingdom of merchants and cosmopolitan trade, Dharget connects distant lands through commerce. Its markets offer goods from across the world. The kingdom prospers through shrewd business.',
      'Janvari': 'A Vudran kingdom of artists and performers, Janvari celebrates beauty and creative expression. Its culture influences fashion and art across Vudra. The kingdoms soft power comes from aesthetic excellence.',
      'Japrini': 'A Vudran kingdom of mystery and hidden knowledge, Japrini guards secrets from the uninitiated. Its people maintain ancient traditions few outsiders understand. The kingdoms power lies in what it conceals.',
      'Kaurata': 'A Vudran kingdom of agricultural abundance and careful stewardship, Kaurata feeds much of the Impossible Kingdoms. Its people have mastered cultivation and irrigation. The kingdoms strength comes from productive land.',
      'Khoyadesh': 'A Vudran kingdom of spiritual seekers and holy sites, Khoyadesh attracts pilgrims from across Vudra. Its temples and monasteries serve as centers of devotion. The kingdoms importance is primarily religious.',
      'Mharana': 'A Vudran kingdom of engineering marvels and architectural wonders, Mharana showcases humanitys ability to reshape the world. Its builders create structures that amaze and inspire. The kingdom demonstrates power through construction.',
      'Nayapul': 'A Vudran kingdom of scholars and historical preservation, Nayapul maintains records of the Impossible Kingdoms past. Its libraries contain irreplaceable knowledge. The kingdom serves as Vudras memory.',
      'Pandata': 'A Vudran kingdom of nature-worship and environmental harmony, Pandata maintains balance between civilization and wilderness. Its people live according to natural cycles. The kingdom exemplifies sustainable existence.',
      'Praramdav': 'A Vudran kingdom of luxury and refinement, Praramdav caters to the wealthy and powerful. Its people create comforts for those who can afford them. The kingdom thrives on serving elite tastes.',
      'Saman': 'A Vudran kingdom of mystical tradition and supernatural phenomena, Saman experiences constant interaction with otherworldly forces. Its people navigate between material and spiritual realms. The kingdom exists at realitys boundaries.',
      'Sikari': 'A Vudran kingdom of hunters and wilderness guides, Sikari provides expertise for those venturing into dangerous lands. Its people know the wild places intimately. The kingdom specializes in surviving natures challenges.',
      'Tanadesh': 'A Vudran kingdom of political complexity and courtly intrigue, Tanadesh navigates relationships through diplomacy and manipulation. Its courtiers excel at influence and negotiation. The kingdom maintains power through careful maneuvering.',
      'Vaktai': 'A Vudran kingdom of coastal trade and maritime culture, Vaktai connects Vudra to distant shores through sea routes. Its sailors are renowned for their skill. The kingdom looks outward to the ocean.',
      // Casmaron - Eastern
      'Kaladay': 'A nation of ancient secrets and lost civilizations, Kaladay preserves knowledge from empires that preceded it. Its people study ruins and texts from ages past. The nation serves as a repository of forgotten wisdom.',
      // Casmaron - Western
      'Iobaria': 'Once home to an ancient cyclops empire, Iobaria is a plague-scarred land of abandoned cities and centaur tribes, Iobaria represents what remains after civilizations collapse. Ancient curses and diseases have driven out most settlers. The region serves as a warning about hubris and mortality.',
      'Whistling Plains': 'A mysterious grassland where strange winds create haunting sounds, the Whistling Plains unnerve travelers and natives alike. Its people have adapted to the constant noise. The regions character is defined by these eerie winds.',
      // Crown of the World - Outer Rim
      'Almhult': 'A hardy northern settlement of trappers and traders, Almhult endures extreme conditions to access valuable resources. Its people are resilient and self-reliant. The community survives through toughness and cooperation.',
      'Hasanaliat': 'A trading post where different cultures meet and exchange goods, Hasanaliat serves as a gateway to the Crown of the World. Its people profit from facilitating commerce. The settlement exists because of its strategic location.',
      'Osman Confederation': 'A loose alliance of northern communities that cooperate for mutual benefit, the Osman Confederation maintains independence through unity. Its member settlements share resources and defense. The confederation proves cooperation can overcome isolation.',
      'Yumyzyl': 'A northern nation of shamanic tradition and spirit-worship, Yumyzyl maintains ancient practices in a harsh environment. Its people commune with otherworldly forces for survival. The nation balances material and spiritual needs.',
      // Crown of the World - High Ice
      'Khorkii Clans': 'Nomadic hunters who follow game across the frozen wastes, the Khorkii Clans survive through mobility and adaptation. Their people know the ice better than any settled folk. The clans exist in harmony with the harsh environment.',
      'Ulaagor Clans': 'Warlike tribes that compete for resources in the frozen north, the Ulaagor Clans value strength and cunning. Their constant conflicts harden them against all threats. The clans respect only power and capability.',
      'Urjuk': 'A settlement of outcasts and refugees who have fled to the frozen north, Urjuk accepts those with nowhere else to go. Its people have made peace with exile. The community endures despite having nothing else.',
      // Crown of the World - Boreal Expanse
      'Zavaten Gura': 'A mysterious realm of ice spirits and supernatural cold, Zavaten Gura exists at the boundary between the physical and spiritual. Its inhabitants commune with powers most mortals fear. The land itself seems alive with otherworldly presence.'
    };

    // Helper function to update continent description
    const updateContinentDescription = (continent) => {
      const descriptionBox = html.find('#continent-description');
      if (!continent) {
        descriptionBox.html('<em>Select a continent to see its description...</em>');
        return;
      }

      // Get continent descriptions from module settings
      let continentDescriptions = {};
      try {
        const descriptionsJSON = game.settings.get("intrinsics-pf2e-character-builder", "continentDescriptions");
        continentDescriptions = JSON.parse(descriptionsJSON);
      } catch (error) {
        console.warn('intrinsics-pf2e-character-builder | Could not parse continent descriptions:', error);
      }

      const description = continentDescriptions[continent];
      if (description) {
        descriptionBox.html(`<strong>${continent}:</strong> ${description}`);
      } else {
        descriptionBox.html(`<strong>${continent}:</strong> <em>No description available. You can add descriptions in the module settings.</em>`);
      }
    };

    // Helper function to update nationality description
    const updateNationalityDescription = (nationality) => {
      const descriptionBox = html.find('#nationality-description');
      if (!nationality) {
        descriptionBox.html('<em>Select a country to see its description...</em>');
        return;
      }

      const description = nationDescriptions[nationality];
      if (description) {
        descriptionBox.html(`<strong>${nationality}:</strong> ${description}`);
      } else {
        descriptionBox.html(`<strong>${nationality}:</strong> <em>Description coming soon...</em>`);
      }
    };

    // Helper function to populate country dropdown based on continent
    const populateCountries = (continent) => {
      const countrySelect = html.find('#bio-nationality');
      const currentBio = stateManager.choices.bio || {};

      console.log('intrinsics-pf2e-character-builder | populateCountries called with continent:', continent);

      // Clear existing options
      countrySelect.empty();

      if (!continent) {
        countrySelect.append('<option value="">Select continent first...</option>');
        return;
      }

      const regions = continentCountries[continent];
      console.log('intrinsics-pf2e-character-builder | Regions for', continent, ':', regions);

      if (!regions || Object.keys(regions).length === 0) {
        countrySelect.append('<option value="">No countries available yet...</option>');
        return;
      }

      // Add default option
      countrySelect.append('<option value="">Select country...</option>');

      // Add regions as optgroups with countries
      let optionCount = 0;
      for (const [regionName, countries] of Object.entries(regions)) {
        const optgroup = $('<optgroup>').attr('label', regionName);
        countries.forEach(country => {
          const option = $('<option>')
            .val(country)
            .text(country);
          if (currentBio.nationality === country) {
            option.attr('selected', 'selected');
          }
          optgroup.append(option);
          optionCount++;
        });
        countrySelect.append(optgroup);
      }
      console.log('intrinsics-pf2e-character-builder | Added', optionCount, 'countries to dropdown');
    };

    // Continent change handler
    html.find('#bio-continent').on('change', (ev) => {
      const continent = ev.target.value;
      const currentBio = stateManager.choices.bio || {};

      // Update continent and clear nationality when continent changes
      stateManager.setChoice('bio', { ...currentBio, continent, nationality: '' }, null, true);

      // Update continent description
      updateContinentDescription(continent);

      // Populate countries for selected continent
      populateCountries(continent);

      // Clear nationality description when continent changes
      updateNationalityDescription('');
    });

    // Nationality (country) change handler
    html.find('#bio-nationality').on('change', (ev) => {
      const nationality = ev.target.value;
      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, nationality }, null, true);

      // Update the description box when nationality changes
      updateNationalityDescription(nationality);
    });

    // Initialize country dropdown on load and set continent value explicitly
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      const currentBio = stateManager.choices.bio || {};
      console.log('intrinsics-pf2e-character-builder | Initializing nationality dropdowns, bio:', currentBio);

      if (currentBio.continent) {
        // Set continent dropdown value explicitly
        const continentSelect = html.find('#bio-continent')[0];
        if (continentSelect) {
          continentSelect.value = currentBio.continent;
          console.log('intrinsics-pf2e-character-builder | Set continent to:', currentBio.continent);
        }

        // Update continent description
        updateContinentDescription(currentBio.continent);

        // Populate countries for the selected continent
        populateCountries(currentBio.continent);
        console.log('intrinsics-pf2e-character-builder | Populated countries for:', currentBio.continent);

        // Update description if nationality is already selected
        if (currentBio.nationality) {
          updateNationalityDescription(currentBio.nationality);
        }
      }
    }, 0);

    // Bio step: Roll backstory themes button
    html.find('.roll-themes-btn').click(() => {
      const ALL_BACKSTORY_THEMES = [
        'Seeking Revenge', 'Quest for Knowledge', 'Lost Heirloom', 'Prophecy Fulfillment', 'Redemption Arc',
        'Protect the Innocent', 'Find True Love', 'Escape Past Life', 'Prove Worth to Family', 'Discover Heritage',
        'Break a Curse', 'Atone for Sins', 'Find Missing Person', 'Restore Honor', 'Seek Adventure',
        'Accumulate Wealth', 'Master a Craft', 'Uncover Conspiracy', 'Defeat Ancient Evil', 'Save Homeland',
        'Cure Disease', 'Find Legendary Artifact', 'Avenge Mentor', 'Overthrow Tyrant', 'Unite Kingdoms',
        'Discover Lost Civilization', 'Tame Wild Beast', 'Conquer Fear', 'Escape Destiny', 'Forge New Path',
        'Reclaim Throne', 'Save Loved One', 'Stop Apocalypse', 'Unravel Mystery', 'Redeem Villain',
        'Find Purpose', 'Escape Slavery', 'Prove Innocence', 'Win Tournament', 'Craft Masterpiece',
        'Build Empire', 'Destroy Weapon', 'Find Paradise', 'Stop War', 'Unite Factions',
        'Restore Balance', 'Break Tradition', 'Honor Ancestors', 'Defy Gods', 'Become Legend',
        'Find Peace', 'Seek Enlightenment', 'Master Magic', 'Defeat Rival', 'Save Nature',
        'Explore Unknown', 'Document History', 'Create Legacy', 'End Suffering', 'Bring Justice',
        'Survive Ordeal', 'Unlock Potential', 'Face Demons', 'Embrace Destiny', 'Reject Fate',
        'Find Belonging', 'Earn Respect', 'Gain Power', 'Lose Innocence', 'Find Identity',
        'Escape Prison', 'Clear Name', 'Settle Debt', 'Keep Promise', 'Break Oath',
        'Find Truth', 'Hide Secret', 'Expose Lie', 'Preserve Tradition', 'Start Revolution',
        'End Corruption', 'Save Species', 'Prevent Disaster', 'Complete Quest', 'Pass Test',
        'Earn Title', 'Join Order', 'Leave Order', 'Find Mentor', 'Surpass Teacher',
        'Protect Artifact', 'Destroy Evil', 'Spread Faith', 'Question Beliefs', 'Find Answers',
        'Seek Forgiveness', 'Grant Mercy', 'Show Strength', 'Prove Loyalty', 'Test Limits',
        'Overcome Addiction', 'Face Past', 'Build Future', 'Live Present', 'Defy Odds',
        'Beat System', 'Change World', 'Accept Change', 'Fight Change', 'Embrace Chaos'
      ];

      // Randomly select 2-3 themes
      const numThemes = Math.floor(Math.random() * 2) + 2; // 2 or 3
      const shuffled = [...ALL_BACKSTORY_THEMES].sort(() => Math.random() - 0.5);
      const selectedThemes = shuffled.slice(0, numThemes);

      const currentBio = stateManager.choices.bio || {};
      stateManager.setChoice('bio', { ...currentBio, backstoryThemes: selectedThemes });

      this.updateDisplay();
    });

    // Equipment step: Search for equipment
    html.find('.equipment-search-btn').click(async () => {
      const searchTerm = html.find('#equipment-search-input').val()?.trim();
      const levelMin = parseInt(html.find('#equipment-level-min').val()) || 0;
      const levelMax = parseInt(html.find('#equipment-level-max').val()) || 20;
      const typeFilter = html.find('#equipment-type-filter').val() || 'all';

      if (!searchTerm) {
        ui.notifications.warn("Please enter a search term");
        return;
      }

      console.log(`intrinsics-pf2e-character-builder | Searching for equipment: ${searchTerm}, level range: ${levelMin}-${levelMax}, type: ${typeFilter}`);

      // Search equipment compendium
      const pack = game.packs.get("pf2e.equipment-srd");
      if (!pack) {
        ui.notifications.error("Equipment compendium not found");
        return;
      }

      const documents = await pack.getDocuments();
      const searchLower = searchTerm.toLowerCase();
      const results = documents.filter(doc => {
        const name = doc.name.toLowerCase();
        const type = doc.type?.toLowerCase() || '';
        const hasPrice = doc.system.price?.value !== undefined && doc.system.price?.value !== null;
        const itemLevel = doc.system.level?.value ?? 0;

        // Check level range
        const levelMatch = itemLevel >= levelMin && itemLevel <= levelMax;

        // Check type filter
        const typeMatch = typeFilter === 'all' || type === typeFilter;

        return hasPrice && levelMatch && typeMatch && (name.includes(searchLower) || type.includes(searchLower));
      }).slice(0, 20); // Limit to 20 results

      // Display results
      const resultsHtml = results.length > 0 ? results.map(item => {
        const price = item.system.price?.value?.gp || 0;
        return `
          <div class="equipment-result-card" data-item-uuid="${item.uuid}">
            <img class="result-icon" src="${item.img}" alt="${item.name}">
            <div class="result-info">
              <h4 class="result-name">${item.name}</h4>
              <p class="result-price">${price} GP</p>
              <p class="result-type">${item.type}</p>
            </div>
            <button type="button" class="add-equipment-btn" data-item-uuid="${item.uuid}">
              <i class="fas fa-plus"></i> Add
            </button>
          </div>
        `;
      }).join('') : '<p class="no-results">No equipment found matching your search.</p>';

      html.find('#equipment-search-results').html(resultsHtml);
    });

    // Equipment step: Add item to cart
    // Use event delegation on parent html element to avoid duplicate handlers
    if (!html.hasClass('equipment-handlers-attached')) {
      html.addClass('equipment-handlers-attached');

      html.on('click', '.add-equipment-btn', async (ev) => {
        const uuid = ev.currentTarget.dataset.itemUuid;
        const item = await fromUuid(uuid);

        if (!item) {
          ui.notifications.error("Failed to load item");
          return;
        }

        const equipment = stateManager.choices.equipment || { selectedKit: null, customItems: [], goldSpent: 0 };

        // Check if item already exists
        const existingIndex = equipment.customItems.findIndex(i => i.item.uuid === uuid);
        if (existingIndex !== -1) {
          equipment.customItems[existingIndex].quantity += 1;
        } else {
          equipment.customItems.push({ item, quantity: 1 });
        }

        // Recalculate total gold spent
        equipment.goldSpent = equipment.customItems.reduce((total, i) => {
          const itemPrice = i.item.system.price?.value?.gp || 0;
          return total + (itemPrice * i.quantity);
        }, 0);

        console.log(`intrinsics-pf2e-character-builder | Added ${item.name}, goldSpent now: ${equipment.goldSpent}`);
        stateManager.setChoice('equipment', equipment);
        this.updateDisplay();
        ui.notifications.info(`Added ${item.name} to equipment`);
      });

      // Equipment step: Remove item from cart
      html.on('click', '.remove-item-btn', (ev) => {
        const index = parseInt(ev.currentTarget.dataset.index);
        const equipment = stateManager.choices.equipment;

        equipment.customItems.splice(index, 1);

        // Recalculate total gold spent
        equipment.goldSpent = equipment.customItems.reduce((total, i) => {
          const itemPrice = i.item.system.price?.value?.gp || 0;
          return total + (itemPrice * i.quantity);
        }, 0);

        stateManager.setChoice('equipment', equipment);
        this.updateDisplay();
      });

      // Equipment step: Update item quantity
      html.on('change', '.item-quantity', (ev) => {
        const index = parseInt(ev.currentTarget.dataset.index);
        const newQuantity = parseInt(ev.currentTarget.value) || 1;
        const equipment = stateManager.choices.equipment;

        if (newQuantity < 1) {
          ev.currentTarget.value = 1;
          return;
        }

        equipment.customItems[index].quantity = newQuantity;

        // Recalculate total gold spent
        equipment.goldSpent = equipment.customItems.reduce((total, i) => {
          const itemPrice = i.item.system.price?.value?.gp || 0;
          return total + (itemPrice * i.quantity);
        }, 0);

        stateManager.setChoice('equipment', equipment);
        this.updateDisplay();
      });

      // Equipment step: Select equipment kit (now shows confirmation dialog)
      html.on('click', '.equipment-kit-card', async (ev) => {
        // Don't trigger if clicking the details button or deselect button
        if ($(ev.target).closest('.kit-details-btn, .kit-deselect-btn').length > 0) return;

        const kitId = ev.currentTarget.dataset.kitId;
        const dataProvider = game.characterBuilder.dataProvider;
        const kits = await dataProvider.getEquipmentKits();
        const kit = kits.find(k => k.id === kitId);

        if (!kit) {
          ui.notifications.error("Kit not found");
          return;
        }

        // Initialize equipment state if needed
        if (!stateManager.choices.equipment) {
          stateManager.choices.equipment = { selectedKit: null, cartItems: [], goldSpent: 0 };
        }
        if (!stateManager.choices.equipment.cartItems) {
          stateManager.choices.equipment.cartItems = [];
        }

        const equipment = stateManager.choices.equipment;
        const kitPrice = kit.system.price?.value?.gp || 0;

        // If this kit is already selected, just deselect (keep items in cart)
        if (equipment.selectedKit?.id === kitId) {
          equipment.selectedKit = null;
          ui.notifications.info(`Deselected ${kit.name}. Items remain in cart - remove them individually if needed.`);
          stateManager.setChoice('equipment', equipment);
          this.updateDisplay();
          return;
        }

        // Calculate current gold spent
        const currentGold = equipment.cartItems.reduce((total, i) => {
          const price = i.item.system.price?.value?.gp || 0;
          return total + (price * i.quantity);
        }, 0);

        // Check if adding kit would exceed budget
        if (currentGold + kitPrice > 15) {
          ui.notifications.warn(`Cannot add this kit. It would exceed your 15 GP budget. (Current: ${currentGold} GP, Kit: ${kitPrice} GP)`);
          return;
        }

        // Load kit items and add to cart
        const kitItems = kit.system?.items || {};
        const itemEntries = Object.values(kitItems);

        for (const entry of itemEntries) {
          const item = await fromUuid(entry.uuid);
          if (item) {
            // Check if item already exists in cart
            const existingIndex = equipment.cartItems.findIndex(i => i.item.uuid === item.uuid);
            if (existingIndex !== -1) {
              // Increase quantity
              equipment.cartItems[existingIndex].quantity += 1;
            } else {
              // Add new item
              equipment.cartItems.push({ item, quantity: 1 });
            }
          }
        }

        equipment.selectedKit = kit;

        ui.notifications.info(`Added ${kit.name} to cart`);
        stateManager.setChoice('equipment', equipment);
        this.updateDisplay();
      });

      // Equipment step: View kit details
      html.on('click', '.kit-details-btn', async (ev) => {
        ev.stopPropagation();
        const kitId = ev.currentTarget.dataset.kitId;
        const dataProvider = game.characterBuilder.dataProvider;
        const kits = await dataProvider.getEquipmentKits();
        const kit = kits.find(k => k.id === kitId);

        if (!kit) {
          ui.notifications.error("Kit not found");
          return;
        }

        this.showKitDetailsDialog(kit);
      });

      // Equipment step: Deselect kit
      html.on('click', '.kit-deselect-btn', async (ev) => {
        ev.stopPropagation();
        const kitId = ev.currentTarget.dataset.kitId;
        const dataProvider = game.characterBuilder.dataProvider;
        const kits = await dataProvider.getEquipmentKits();
        const kit = kits.find(k => k.id === kitId);

        if (!kit) {
          ui.notifications.error("Kit not found");
          return;
        }

        // Initialize equipment state if needed
        if (!stateManager.choices.equipment) {
          stateManager.choices.equipment = { selectedKit: null, cartItems: [], goldSpent: 0 };
        }

        const equipment = stateManager.choices.equipment;

        if (equipment.selectedKit?.id === kitId) {
          // Get all items in the kit
          const kitItems = kit.system?.items || {};
          const kitItemUuids = Object.values(kitItems).map(entry => entry.uuid);

          // Remove kit items from cart
          const itemsRemoved = [];
          equipment.cartItems = equipment.cartItems.filter(cartItem => {
            if (kitItemUuids.includes(cartItem.item.uuid)) {
              itemsRemoved.push(cartItem.item.name);
              return false; // Remove from cart
            }
            return true; // Keep in cart
          });

          equipment.selectedKit = null;

          const removedCount = itemsRemoved.length;
          ui.notifications.info(`Deselected ${kit.name} and removed ${removedCount} item${removedCount !== 1 ? 's' : ''} from cart`);
          stateManager.setChoice('equipment', equipment);
          this.updateDisplay();
        }
      });
    }

    // Equipment step: Open compendium browser
    html.find('.open-compendium-btn').click(async () => {
      if (!game.pf2e?.compendiumBrowser) {
        ui.notifications.error("PF2e Compendium Browser not available");
        return;
      }
      await game.pf2e.compendiumBrowser.openTab('equipment');
      ui.notifications.info("Drag items from the Compendium Browser into the shopping cart");
    });

    // Equipment step: Shopping cart drag-and-drop
    const cartElement = html.find('.shopping-cart')[0];
    if (cartElement && !cartElement.dataset.dropHandlerAttached) {
      cartElement.dataset.dropHandlerAttached = 'true';

      cartElement.addEventListener('dragover', (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
        $(cartElement).addClass('drag-over');
      });

      cartElement.addEventListener('dragleave', (ev) => {
        if (!cartElement.contains(ev.relatedTarget)) {
          $(cartElement).removeClass('drag-over');
        }
      });

      cartElement.addEventListener('drop', async (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        $(cartElement).removeClass('drag-over');

        console.log('intrinsics-pf2e-character-builder | Drop event triggered');

        let data;
        try {
          const textData = ev.dataTransfer.getData('text/plain');
          console.log('intrinsics-pf2e-character-builder | Drag data:', textData);
          data = JSON.parse(textData);
        } catch (e) {
          console.warn('intrinsics-pf2e-character-builder | Invalid drag data:', e);
          ui.notifications.warn("Invalid item data. Please drag items from the Compendium Browser.");
          return;
        }

        console.log('intrinsics-pf2e-character-builder | Parsed data:', data);

        if (data.type !== 'Item') {
          console.warn('intrinsics-pf2e-character-builder | Not an Item type:', data.type);
          return;
        }

        const item = await fromUuid(data.uuid);
        if (!item) {
          console.error('intrinsics-pf2e-character-builder | Failed to load item from UUID:', data.uuid);
          ui.notifications.error("Failed to load item");
          return;
        }

        console.log('intrinsics-pf2e-character-builder | Loaded item:', item.name, item);

        // Check if item has a price
        const itemPrice = item.system.price?.value?.gp;
        if (itemPrice === undefined || itemPrice === null) {
          console.warn('intrinsics-pf2e-character-builder | Item has no price:', item.name);
          ui.notifications.warn("This item doesn't have a price and cannot be purchased");
          return;
        }

        // Initialize equipment state if needed
        if (!stateManager.choices.equipment) {
          stateManager.choices.equipment = { selectedKit: null, cartItems: [], goldSpent: 0 };
        }
        if (!stateManager.choices.equipment.cartItems) {
          stateManager.choices.equipment.cartItems = [];
        }

        const equipment = stateManager.choices.equipment;

        // Calculate current gold spent
        let currentGold = equipment.cartItems.reduce((total, i) => {
          const price = i.item.system.price?.value?.gp || 0;
          return total + (price * i.quantity);
        }, 0);

        // Check if adding this item would exceed budget
        if (currentGold + itemPrice > 15) {
          ui.notifications.warn(`Cannot add ${item.name}. It would exceed your 15 GP budget.`);
          return;
        }

        // Check if item already exists in cart
        const existingIndex = equipment.cartItems.findIndex(i => i.item.uuid === data.uuid);
        if (existingIndex !== -1) {
          // Check if incrementing would exceed budget
          const newTotal = currentGold + itemPrice;
          if (newTotal > 15) {
            ui.notifications.warn(`Cannot add more ${item.name}. It would exceed your 15 GP budget.`);
            return;
          }
          equipment.cartItems[existingIndex].quantity += 1;
        } else {
          equipment.cartItems.push({ item, quantity: 1 });
        }

        console.log(`intrinsics-pf2e-character-builder | Added ${item.name} to cart`);
        stateManager.setChoice('equipment', equipment);
        this.updateDisplay();
        ui.notifications.info(`Added ${item.name} to cart`);
      });
    }

    // Equipment step: Cart quantity controls
    html.on('click', '.qty-increase', (ev) => {
      const index = parseInt(ev.currentTarget.dataset.index);
      const equipment = stateManager.choices.equipment;
      if (!equipment || !equipment.cartItems) return;
      const item = equipment.cartItems[index];

      const currentGold = equipment.cartItems.reduce((total, i) => {
        const price = i.item.system.price?.value?.gp || 0;
        return total + (price * i.quantity);
      }, 0);
      const itemPrice = item.item.system.price?.value?.gp || 0;
      const newGold = currentGold + itemPrice;

      if (newGold > 15) {
        ui.notifications.warn("Cannot increase quantity - would exceed 15 GP budget");
        return;
      }

      equipment.cartItems[index].quantity += 1;
      stateManager.setChoice('equipment', equipment);
      this.updateDisplay();
    });

    html.on('click', '.qty-decrease', (ev) => {
      const index = parseInt(ev.currentTarget.dataset.index);
      const equipment = stateManager.choices.equipment;
      if (!equipment || !equipment.cartItems) return;

      if (equipment.cartItems[index].quantity > 1) {
        equipment.cartItems[index].quantity -= 1;
        stateManager.setChoice('equipment', equipment);
        this.updateDisplay();
      }
    });

    html.on('change', '.qty-input', (ev) => {
      const index = parseInt(ev.currentTarget.dataset.index);
      const newQuantity = parseInt(ev.currentTarget.value) || 1;
      const equipment = stateManager.choices.equipment;
      if (!equipment || !equipment.cartItems) return;

      if (newQuantity < 1) {
        ev.currentTarget.value = equipment.cartItems[index].quantity;
        return;
      }

      const itemPrice = equipment.cartItems[index].item.system.price?.value?.gp || 0;
      const otherItemsGold = equipment.cartItems.reduce((total, i, idx) => {
        if (idx === index) return total;
        const price = i.item.system.price?.value?.gp || 0;
        return total + (price * i.quantity);
      }, 0);
      const newGold = otherItemsGold + (itemPrice * newQuantity);

      if (newGold > 15) {
        ui.notifications.warn("Cannot set that quantity - would exceed 15 GP budget");
        ev.currentTarget.value = equipment.cartItems[index].quantity;
        return;
      }

      equipment.cartItems[index].quantity = newQuantity;
      stateManager.setChoice('equipment', equipment);
      this.updateDisplay();
    });

    html.on('click', '.cart-item-remove', (ev) => {
      const index = parseInt(ev.currentTarget.dataset.index);
      const equipment = stateManager.choices.equipment;
      if (!equipment || !equipment.cartItems) return;

      equipment.cartItems.splice(index, 1);
      // Clear selected kit if cart is emptied
      if (equipment.cartItems.length === 0) {
        equipment.selectedKit = null;
      }
      stateManager.setChoice('equipment', equipment);
      this.updateDisplay();
    });
  }

  // Helper: Get kit contents HTML
  async getKitContentsHtml(kit) {
    // PF2e kits store items in system.items as an object (not array)
    // Each key is a unique ID, each value has: img, level, name, uuid
    const kitItems = kit.system?.items || {};

    const itemEntries = Object.values(kitItems);

    if (itemEntries.length === 0) {
      return '<p class="no-contents">This kit contains no items.</p>';
    }

    let contentsHtml = '<h3>Kit Contents:</h3><ul class="kit-contents-list">';
    for (const itemRef of itemEntries) {
      const img = itemRef.img || 'icons/svg/item-bag.svg';
      const name = itemRef.name || 'Unknown Item';
      const level = itemRef.level ? ` (Level ${itemRef.level})` : '';
      contentsHtml += `<li><img src="${img}" class="kit-item-icon"> ${name}${level}</li>`;
    }
    contentsHtml += '</ul>';

    return contentsHtml;
  }

  // Helper: Show kit details dialog (info only, no selection)
  async showKitDetailsDialog(kit) {
    const contentsHtml = await this.getKitContentsHtml(kit);
    const description = kit.system.description?.value ? await TextEditor.enrichHTML(kit.system.description.value, { async: true }) : 'No description available.';

    new Dialog({
      title: kit.name,
      content: `
        <div class="kit-details-dialog">
          <img src="${kit.img || 'icons/svg/item-bag.svg'}" class="kit-detail-image">
          <p><strong>Price:</strong> ${kit.system.price?.value?.gp || 0} GP</p>
          <div class="kit-detail-description">${description}</div>
          ${contentsHtml}
        </div>
      `,
      buttons: {
        close: {
          label: "Close",
          icon: '<i class="fas fa-times"></i>'
        }
      }
    }).render(true);
  }

  // Helper: Show kit confirmation dialog (with contents and confirm button)
  async showKitConfirmationDialog(kit, equipment, stateManager) {
    const contentsHtml = await this.getKitContentsHtml(kit);
    const description = kit.system.description?.value ? await TextEditor.enrichHTML(kit.system.description.value, { async: true }) : 'No description available.';
    const kitPrice = kit.system.price?.value?.gp || 0;

    new Dialog({
      title: `Select ${kit.name}?`,
      content: `
        <div class="kit-details-dialog">
          <img src="${kit.img || 'icons/svg/item-bag.svg'}" class="kit-detail-image">
          <p><strong>Price:</strong> ${kitPrice} GP</p>
          <div class="kit-detail-description">${description}</div>
          ${contentsHtml}
          <p class="kit-confirm-notice">Do you want to purchase this equipment kit?</p>
        </div>
      `,
      buttons: {
        confirm: {
          label: "Purchase Kit",
          icon: '<i class="fas fa-check"></i>',
          callback: () => {
            // Remove previous kit cost if any
            if (equipment.selectedKit) {
              const previousKitPrice = equipment.selectedKit.system.price?.value?.gp || 0;
              equipment.goldSpent -= previousKitPrice;
            }

            // Add new kit
            equipment.selectedKit = kit.toObject();
            equipment.goldSpent += kitPrice;
            ui.notifications.info(`Added ${kit.name} to equipment`);

            stateManager.setChoice('equipment', equipment);
            this.updateDisplay();
          }
        },
        cancel: {
          label: "Cancel",
          icon: '<i class="fas fa-times"></i>'
        }
      },
      default: "confirm"
    }).render(true);
  }

  // Update display (re-render)
  async updateDisplay() {
    if (!this.element) return;

    // Save scroll positions before updating
    const scrollPositions = {
      selectionGrid: this.element.find('.selection-grid').scrollTop() || 0,
      selectionGridColumn: this.element.find('.selection-grid-column').scrollTop() || 0,
      spellSelectionContainer: this.element.find('.spell-selection-container').scrollTop() || 0,
      cantripGrid: this.element.find('.cantrip-grid').scrollTop() || 0,
      level1Grid: this.element.find('.level1-grid').scrollTop() || 0,
      stepSpells: this.element.find('.step-spells').scrollTop() || 0,
      infoPanel: this.element.find('.info-panel').scrollTop() || 0,
      selectionInfoPanel: this.element.find('.selection-info-panel').scrollTop() || 0,
      wizardContent: this.element.find('.wizard-content').scrollTop() || 0
    };

    console.log('intrinsics-pf2e-character-builder | Saved scroll positions:', scrollPositions);

    const html = await this.generateHTML();

    // Update title
    this.element.find('.window-title').text(this.title);

    // Update content
    const content = this.element.find('.window-content');
    if (content.length > 0) {
      // Remove old event handlers to prevent duplicates
      this.element.off();
      content.html(html);
      this.activateListeners(this.element);

      // Restore scroll positions immediately (no delay needed)
      requestAnimationFrame(() => {
        if (scrollPositions.selectionGrid > 0) {
          this.element.find('.selection-grid').scrollTop(scrollPositions.selectionGrid);
        }
        if (scrollPositions.selectionGridColumn > 0) {
          this.element.find('.selection-grid-column').scrollTop(scrollPositions.selectionGridColumn);
        }
        if (scrollPositions.spellSelectionContainer > 0) {
          this.element.find('.spell-selection-container').scrollTop(scrollPositions.spellSelectionContainer);
        }
        if (scrollPositions.cantripGrid > 0) {
          this.element.find('.cantrip-grid').scrollTop(scrollPositions.cantripGrid);
        }
        if (scrollPositions.level1Grid > 0) {
          this.element.find('.level1-grid').scrollTop(scrollPositions.level1Grid);
        }
        if (scrollPositions.stepSpells > 0) {
          this.element.find('.step-spells').scrollTop(scrollPositions.stepSpells);
        }
        if (scrollPositions.infoPanel > 0) {
          this.element.find('.info-panel').scrollTop(scrollPositions.infoPanel);
        }
        if (scrollPositions.selectionInfoPanel > 0) {
          this.element.find('.selection-info-panel').scrollTop(scrollPositions.selectionInfoPanel);
        }
        if (scrollPositions.wizardContent > 0) {
          this.element.find('.wizard-content').scrollTop(scrollPositions.wizardContent);
        }
        console.log('intrinsics-pf2e-character-builder | Restored scroll positions');
      });
    }
  }
}
