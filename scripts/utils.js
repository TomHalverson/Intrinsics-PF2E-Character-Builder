// Utility Functions

export const ABILITIES = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma'
};

export const SKILLS = {
  acrobatics: { label: 'Acrobatics', ability: 'dex' },
  arcana: { label: 'Arcana', ability: 'int' },
  athletics: { label: 'Athletics', ability: 'str' },
  crafting: { label: 'Crafting', ability: 'int' },
  deception: { label: 'Deception', ability: 'cha' },
  diplomacy: { label: 'Diplomacy', ability: 'cha' },
  intimidation: { label: 'Intimidation', ability: 'cha' },
  medicine: { label: 'Medicine', ability: 'wis' },
  nature: { label: 'Nature', ability: 'wis' },
  occultism: { label: 'Occultism', ability: 'int' },
  performance: { label: 'Performance', ability: 'cha' },
  religion: { label: 'Religion', ability: 'wis' },
  society: { label: 'Society', ability: 'int' },
  stealth: { label: 'Stealth', ability: 'dex' },
  survival: { label: 'Survival', ability: 'wis' },
  thievery: { label: 'Thievery', ability: 'dex' }
};

// Get ability label
export function getAbilityLabel(abilityKey) {
  if (abilityKey === 'free') return 'Free';
  return ABILITIES[abilityKey]?.substring(0, 3).toUpperCase() || abilityKey.toUpperCase();
}

// Get ability full name
export function getAbilityName(abilityKey) {
  if (abilityKey === 'free') return 'Free Choice';
  return ABILITIES[abilityKey] || abilityKey;
}

// Format boosts for display
export function formatBoosts(boosts) {
  if (!boosts) return '';

  const boostList = [];

  // Iterate through boost slots
  for (const key in boosts) {
    const boostData = boosts[key];
    const abilities = boostData.value || [];

    if (abilities.length === 0) continue;

    if (abilities.length === 1) {
      // Fixed boost
      boostList.push(getAbilityLabel(abilities[0]));
    } else {
      // Choice of boosts
      boostList.push(`Choice (${abilities.map(getAbilityLabel).join('/')})`);
    }
  }

  if (boostList.length === 0) return '';

  return `<i class="fas fa-plus-circle"></i> Boosts: ${boostList.join(', ')}`;
}

// Format traits for display
export function formatTraits(traits) {
  if (!traits || traits.length === 0) return '';

  return traits
    .map(trait => `<span class="trait-badge">${trait.capitalize()}</span>`)
    .join('');
}

// Calculate ability modifier
export function getAbilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

// Format ability modifier for display
export function formatModifier(modifier) {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

// Get skill label
export function getSkillLabel(skillKey) {
  return SKILLS[skillKey]?.label || skillKey.capitalize();
}

// Get skill ability
export function getSkillAbility(skillKey) {
  return SKILLS[skillKey]?.ability || 'int';
}

// Truncate text
export function truncate(text, maxLength = 200) {
  if (!text) return '';

  // Remove HTML tags
  const stripped = text.replace(/<[^>]*>/g, '');

  if (stripped.length <= maxLength) return stripped;

  return stripped.substring(0, maxLength) + '...';
}

// Format spell components
export function formatSpellComponents(spell) {
  const components = [];

  if (spell.system.time?.value) {
    const actions = spell.system.time.value;
    components.push(`${actions} actions`);
  }

  return components.join(', ');
}

// Get spell tradition icon
export function getSpellTraditionIcon(tradition) {
  const icons = {
    'arcane': 'fa-hat-wizard',
    'divine': 'fa-cross',
    'occult': 'fa-eye',
    'primal': 'fa-leaf'
  };

  return icons[tradition] || 'fa-magic';
}

// Format array to list
export function formatList(items, conjunction = 'and') {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

  const lastItem = items[items.length - 1];
  const otherItems = items.slice(0, -1);

  return `${otherItems.join(', ')}, ${conjunction} ${lastItem}`;
}
