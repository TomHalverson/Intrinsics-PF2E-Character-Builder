// Equipment Tab Reminders for Clerics, Champions, and Runesmiths

/**
 * Check if class is Cleric
 * @param {Object} classItem The class item
 * @returns {boolean}
 */
function isCleric(classItem) {
  return classItem?.slug === "cleric" || classItem?.name?.toLowerCase() === "cleric";
}

/**
 * Check if class is Champion
 * @param {Object} classItem The class item
 * @returns {boolean}
 */
function isChampion(classItem) {
  return classItem?.slug === "champion" || classItem?.name?.toLowerCase() === "champion";
}

/**
 * Check if class is Runesmith
 * @param {Object} classItem The class item
 * @returns {boolean}
 */
function isRunesmith(classItem) {
  return classItem?.slug === "runesmith" || classItem?.name?.toLowerCase() === "runesmith";
}

/**
 * Get the character's deity from actor items
 * @param {Actor} actor The character actor
 * @returns {Object|null} The deity item or null if not found
 */
function getDeityFromActor(actor) {
  if (!actor || !actor.items) return null;

  // Find the deity item in the actor's items
  const deityItem = actor.items.find(item => item.type === 'deity');
  return deityItem || null;
}

/**
 * Get the deity's favored weapon from deity data
 * @param {Object} deity The deity item
 * @returns {string|null} The favored weapon name or null if not found
 */
function getFavoredWeapon(deity) {
  if (!deity) return null;

  // Check for favored weapon in deity system data
  const favoredWeapon = deity.system?.weapons;
  if (Array.isArray(favoredWeapon) && favoredWeapon.length > 0) {
    return favoredWeapon[0];
  }

  // Alternative: check in traits or rules
  if (deity.system?.traits?.value) {
    const weaponTrait = deity.system.traits.value.find(t => t.startsWith('weapon:'));
    if (weaponTrait) {
      return weaponTrait.replace('weapon:', '');
    }
  }

  return null;
}

/**
 * Format weapon name for display (capitalize and replace hyphens)
 * @param {string} weaponSlug The weapon slug
 * @returns {string} Formatted weapon name
 */
function formatWeaponName(weaponSlug) {
  if (!weaponSlug) return "Unknown";

  return weaponSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate equipment reminder HTML for the character builder
 * @param {Object} stateManager The character state manager with choices
 * @returns {string} HTML string for reminders, or empty string if no reminders needed
 */
export function generateEquipmentReminders(stateManager) {
  const selectedClass = stateManager.choices.class?.item;
  const actor = stateManager.targetActor;

  if (!selectedClass) return '';

  // Check if character is a Cleric, Champion, or Runesmith
  const isClericChar = isCleric(selectedClass);
  const isChampionChar = isChampion(selectedClass);
  const isRunesmithChar = isRunesmith(selectedClass);

  // If none of these classes, don't add any reminders
  if (!isClericChar && !isChampionChar && !isRunesmithChar) {
    return '';
  }

  let reminderHtml = '';

  // Add Cleric/Champion reminder
  if (isClericChar || isChampionChar) {
    const className = isClericChar ? "Cleric" : "Champion";

    // Get deity from actor's items (clerics/champions select deity when class is added)
    const deityItem = getDeityFromActor(actor);
    const deityName = deityItem?.name || "your chosen deity";
    const weaponSlug = getFavoredWeapon(deityItem);
    const weaponName = formatWeaponName(weaponSlug);

    reminderHtml += `
      <div class="equipment-reminder deity-reminder">
        <div class="reminder-content">
          <strong>${className} Reminder:</strong>
          <p>Do not forget to locate your deity's Favored Weapon in the compendium.</p>
          <p class="reminder-detail"><strong>Deity:</strong> ${deityName}</p>
          <p class="reminder-detail"><strong>Favored Weapon:</strong> ${weaponName}</p>
        </div>
      </div>
    `;
  }

  // Add Runesmith reminder
  if (isRunesmithChar) {
    reminderHtml += `
      <div class="equipment-reminder runesmith-reminder">
        <div class="reminder-content">
          <strong>Runesmith Reminder:</strong>
          <p>Do not forget to give yourself 4 level 1 runes. These can be found by searching for the <strong>Runesmith</strong> trait in the compendium.</p>
        </div>
      </div>
    `;
  }

  if (!reminderHtml) return '';

  // Wrap reminders in a section
  return `
    <div class="equipment-reminder-section">
      ${reminderHtml}
    </div>
  `;
}
