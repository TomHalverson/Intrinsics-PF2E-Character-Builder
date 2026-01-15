// Custom configuration form for suggested languages
const MODULE_ID = "intrinsics-pf2e-character-builder";

export class SuggestedLanguagesConfig extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'suggested-languages-config',
      title: 'Configure Suggested Languages',
      template: null,
      width: 700,
      height: 600,
      resizable: true,
      submitOnChange: false,
      submitOnClose: false,
      closeOnSubmit: false
    });
  }

  // All available languages organized by rarity
  static LANGUAGES = {
    common: [
      'common', 'taldane', 'draconic', 'dwarven', 'elven', 'fey', 'gnomish',
      'goblin', 'halfling', 'jotun', 'orcish', 'sakvroth'
    ],
    uncommon: [
      'adlet', 'aklo', 'algollthu', 'amarrun', 'arboreal', 'boggard', 'calda',
      'caligni', 'chthonian', 'cyclops', 'daemonic', 'diabolic', 'ekujae',
      'empyrean', 'grippli', 'hallit', 'iruxi', 'kelish', 'kholo', 'kibwani',
      'kitsune', 'lirgeni', 'muan', 'mwangi', 'mzunu', 'nagaji', 'necril',
      'ocotan', 'osiriani', 'petran', 'protean', 'pyric', 'requian',
      'shadowtongue', 'shoanti', 'skald', 'sphinx', 'sussaran', 'tang',
      'tengu', 'thalassic', 'tien', 'utopian', 'vanara', 'varisian',
      'vudrani', 'xanmba', 'wayang', 'ysoki'
    ],
    rare: [
      'akitonian', 'anadi', 'ancient-osiriani', 'androffan', 'anugobu',
      'arcadian', 'azlanti', 'destrachan', 'drooni', 'dziriak', 'elder-thing',
      'erutaki', 'formian', 'garundi', 'girtablilu', 'goloma', 'grioth',
      'hwan', 'iblydan', 'ikeshti', 'immolis', 'jistkan', 'jyoti', 'kaava',
      'kashrishi', 'kovintal', 'lashunta', 'mahwek', 'migo', 'minaten',
      'minkaian', 'munavri', 'okaiyan', 'orvian', 'rasu', 'ratajin',
      'razatlani', 'russian', 'samsaran', 'sasquatch', 'senzar', 'shae',
      'shisk', 'shobhad', 'shoony', 'shory', 'strix', 'surki', 'talican',
      'tanuki', 'tekritanin', 'thassilonian', 'varki', 'vishkanyan',
      'wyrwood', 'yaksha', 'yithian'
    ],
    secret: ['wildsong']
  };

  getData() {
    const currentSetting = game.settings.get(MODULE_ID, "suggestedLanguages");
    const selectedLanguages = currentSetting.split(',').map(s => s.trim()).filter(s => s);

    return {
      selectedLanguages,
      languages: SuggestedLanguagesConfig.LANGUAGES
    };
  }

  async _renderInner(data) {
    const { selectedLanguages, languages } = this.getData();

    // Helper to capitalize language name
    const formatLanguageName = (slug) => {
      return slug.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    let html = `
      <div style="padding: 10px;">
        <p class="notes" style="font-style: italic; margin-bottom: 1em; padding: 0.5em; background: rgba(0,0,0,0.05); border-radius: 3px;">
          Select which languages should be shown as "Suggested Languages" during character creation.
        </p>
    `;

    // Add each rarity section
    const rarityLabels = {
      common: 'Common Languages',
      uncommon: 'Uncommon Languages',
      rare: 'Rare Languages',
      secret: 'Secret Languages'
    };

    for (const [rarity, languageList] of Object.entries(languages)) {
      html += `
        <fieldset style="margin-bottom: 1em;">
          <legend style="font-weight: bold; margin-bottom: 0.5em;">${rarityLabels[rarity]}</legend>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5em;">
      `;

      languageList.forEach(slug => {
        const isChecked = selectedLanguages.includes(slug);
        const label = formatLanguageName(slug);

        html += `
          <label style="display: flex; align-items: center; gap: 0.3em; cursor: pointer;">
            <input type="checkbox" class="language-checkbox" data-language="${slug}" ${isChecked ? 'checked' : ''}>
            <span>${label}</span>
          </label>
        `;
      });

      html += `
          </div>
        </fieldset>
      `;
    }

    html += `
        <footer class="sheet-footer flexrow" style="margin-top: 1em; gap: 0.5em; padding-top: 10px; border-top: 1px solid #ccc;">
          <button type="button" class="select-all-common" style="flex: 0;">
            <i class="fas fa-check-square"></i> Select All Common
          </button>
          <button type="button" class="clear-all" style="flex: 0;">
            <i class="fas fa-times"></i> Clear All
          </button>
          <button type="button" class="save-languages" style="flex: 1;">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </footer>
      </div>
    `;

    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Select all common languages
    html.find('.select-all-common').click(() => {
      html.find('fieldset:first input[type="checkbox"]').prop('checked', true);
    });

    // Clear all selections
    html.find('.clear-all').click(() => {
      html.find('input[type="checkbox"]').prop('checked', false);
    });

    // Save button
    html.find('.save-languages').click(async () => {
      const selectedLanguages = [];
      html.find('input.language-checkbox:checked').each(function() {
        selectedLanguages.push($(this).data('language'));
      });

      console.log(`${MODULE_ID} | Saving suggested languages:`, selectedLanguages);

      // Save as comma-separated string
      const settingValue = selectedLanguages.join(',');

      try {
        await game.settings.set(MODULE_ID, "suggestedLanguages", settingValue);
        ui.notifications.info(`Suggested languages updated! (${selectedLanguages.length} languages selected)`);
        this.close();
      } catch (error) {
        console.error(`${MODULE_ID} | Error saving suggested languages:`, error);
        ui.notifications.error("Failed to save suggested languages");
      }
    });
  }

  async _updateObject(event, formData) {
    // Not used - we handle save with button click
    // But FormApplication requires this method
    return;
  }
}
