import type { 
  Settlement, 
  District, 
  NPC, 
  Rival,
  BiomeType,
  SubregionCategory,
  DistrictType,
  Ancestry,
  NpcRole 
} from "@shared/schema";

// === 5 BIOMES ===
export const BIOMES: Record<BiomeType, { name: string; description: string }> = {
  COASTAL_LOWLANDS: {
    name: "Siltmere Coast",
    description: "A temperate coastline of harbors, fishing villages, and trade ports. Salt air and merchant wealth."
  },
  RIVER_BASIN: {
    name: "Veridian Basin",
    description: "Fertile floodplains fed by the Great Serpent River. Breadbasket of the mainland."
  },
  HIGHLAND_PLATEAU: {
    name: "Thornback Heights",
    description: "Rocky highlands dotted with fortresses and mines. Cold winds and proud clans."
  },
  FOREST_INTERIOR: {
    name: "Deepwood Reaches",
    description: "Ancient forests where old pacts still hold. Elven groves and hidden shrines."
  },
  ARID_FRONTIER: {
    name: "Dustmarch Expanse",
    description: "Sun-scorched frontier of orc clanholds and contested borderlands."
  }
};

// === SUBREGION CATEGORIES ===
export const SUBREGION_CATEGORIES: Record<SubregionCategory, { name: string; description: string }> = {
  TRADE_HUB: { name: "Trade Hub", description: "Major commerce and merchant activity" },
  AGRICULTURAL: { name: "Agricultural", description: "Farming and food production centers" },
  MILITARY_FRONTIER: { name: "Military Frontier", description: "Fortified borders and garrison posts" },
  SACRED_GROUNDS: { name: "Sacred Grounds", description: "Religious sites and temple complexes" },
  INDUSTRIAL: { name: "Industrial", description: "Mining, forging, and manufacturing" }
};

// === 20 SETTLEMENTS ===
export const SETTLEMENTS: Settlement[] = [
  // COASTAL_LOWLANDS (4)
  { id: "s1", name: "Salthollow", biome: "COASTAL_LOWLANDS", subregionCategory: "TRADE_HUB", population: "CITY", description: "The largest port city, gateway to overseas trade.", culturalTaboo: "Never speak ill of the sea", witnessTradition: "Salt oaths sworn before harbor masters" },
  { id: "s2", name: "Tidecrest", biome: "COASTAL_LOWLANDS", subregionCategory: "TRADE_HUB", population: "TOWN", description: "Wealthy merchant town known for its banking houses.", witnessTradition: "Contracts sealed with wax and witness sigils" },
  { id: "s3", name: "Gillswatch", biome: "COASTAL_LOWLANDS", subregionCategory: "MILITARY_FRONTIER", population: "TOWN", description: "Naval garrison protecting the coast from raiders.", culturalTaboo: "Deserters are shunned for three generations" },
  { id: "s4", name: "Brackenmoor", biome: "COASTAL_LOWLANDS", subregionCategory: "AGRICULTURAL", population: "VILLAGE", description: "Fishing and kelp farming community in the marshes." },

  // RIVER_BASIN (4)
  { id: "s5", name: "Hearthford", biome: "RIVER_BASIN", subregionCategory: "AGRICULTURAL", population: "CITY", description: "Major grain market and administrative center.", culturalTaboo: "Wasting food is a minor crime", witnessTradition: "Grain-weight oaths before harvest" },
  { id: "s6", name: "Millbrook", biome: "RIVER_BASIN", subregionCategory: "INDUSTRIAL", population: "TOWN", description: "Water-powered mills and textile production.", witnessTradition: "Witnesses marked with mill-dust" },
  { id: "s7", name: "Serpentbend", biome: "RIVER_BASIN", subregionCategory: "TRADE_HUB", population: "TOWN", description: "River trading post where three tributaries meet." },
  { id: "s8", name: "Vinewall", biome: "RIVER_BASIN", subregionCategory: "AGRICULTURAL", population: "VILLAGE", description: "Famous vineyards producing the region's finest wines." },

  // HIGHLAND_PLATEAU (4)
  { id: "s9", name: "Ironpeak Hold", biome: "HIGHLAND_PLATEAU", subregionCategory: "MILITARY_FRONTIER", population: "CITY", description: "Fortress city controlling the mountain passes.", culturalTaboo: "Breaking guest-right means exile", witnessTradition: "Stone-carved proof chains" },
  { id: "s10", name: "Coalvein", biome: "HIGHLAND_PLATEAU", subregionCategory: "INDUSTRIAL", population: "TOWN", description: "Mining town rich in ore and precious metals." },
  { id: "s11", name: "Windspire", biome: "HIGHLAND_PLATEAU", subregionCategory: "SACRED_GROUNDS", population: "TOWN", description: "High temple complex dedicated to sky worship.", culturalTaboo: "Never cover your head in temple grounds" },
  { id: "s12", name: "Sheepfold", biome: "HIGHLAND_PLATEAU", subregionCategory: "AGRICULTURAL", population: "HAMLET", description: "Remote herding community producing fine wool." },

  // FOREST_INTERIOR (4)
  { id: "s13", name: "Greenbough", biome: "FOREST_INTERIOR", subregionCategory: "SACRED_GROUNDS", population: "TOWN", description: "Elven-dominated settlement around an ancient grove.", culturalTaboo: "No fire magic within town limits", witnessTradition: "Leaf-bound testimonies pressed into books" },
  { id: "s14", name: "Rootholme", biome: "FOREST_INTERIOR", subregionCategory: "TRADE_HUB", population: "TOWN", description: "Mixed-race trading post at the forest edge." },
  { id: "s15", name: "Mushroom Dell", biome: "FOREST_INTERIOR", subregionCategory: "AGRICULTURAL", population: "VILLAGE", description: "Halfling farming community known for fungi cultivation." },
  { id: "s16", name: "Huntsman's Rest", biome: "FOREST_INTERIOR", subregionCategory: "MILITARY_FRONTIER", population: "HAMLET", description: "Ranger outpost monitoring the deep woods." },

  // ARID_FRONTIER (4)
  { id: "s17", name: "Redstone Fortress", biome: "ARID_FRONTIER", subregionCategory: "MILITARY_FRONTIER", population: "CITY", description: "Orc stronghold and seat of clan councils.", culturalTaboo: "Challenge must be answered or status lost", witnessTradition: "Three Marks evaluation before testimony" },
  { id: "s18", name: "Dustwell", biome: "ARID_FRONTIER", subregionCategory: "TRADE_HUB", population: "TOWN", description: "Oasis trading post on the caravan routes." },
  { id: "s19", name: "Sunscorch Camp", biome: "ARID_FRONTIER", subregionCategory: "INDUSTRIAL", population: "VILLAGE", description: "Glass-making and metalwork using desert heat." },
  { id: "s20", name: "Bonepile Shrine", biome: "ARID_FRONTIER", subregionCategory: "SACRED_GROUNDS", population: "HAMLET", description: "Ancestor worship site marking old battlefields." }
];

// === DISTRICTS (4-6 per major settlement) ===
// Black market exists everywhere EXCEPT Elven and Halfling districts (clean hubs)
function hasBlackMarket(type: DistrictType): boolean {
  return type !== "ELVEN_ENCLAVE" && type !== "HALFLING_QUARTER";
}

export const DISTRICTS: District[] = [
  // Salthollow (6 districts)
  { id: "d1", settlementId: "s1", name: "Harbor Quarter", type: "DOCKS", hasBlackMarket: true, description: "Bustling docks with warehouses and taverns." },
  { id: "d2", settlementId: "s1", name: "Coin Row", type: "MIXED_MARKET", hasBlackMarket: true, description: "Banking houses and luxury merchants." },
  { id: "d3", settlementId: "s1", name: "The Shallows", type: "HUMAN_COMMONS", hasBlackMarket: true, description: "Working class housing near the wharves." },
  { id: "d4", settlementId: "s1", name: "Elvenmist", type: "ELVEN_ENCLAVE", hasBlackMarket: false, description: "Refined elven quarter with clean streets.", dominantAncestry: "ELF" },
  { id: "d5", settlementId: "s1", name: "Ironmonger's Lane", type: "CRAFTSMAN", hasBlackMarket: true, description: "Smiths and shipwrights." },
  { id: "d6", settlementId: "s1", name: "Garrison Point", type: "GARRISON", hasBlackMarket: true, description: "Military barracks and training grounds." },

  // Hearthford (5 districts)
  { id: "d7", settlementId: "s5", name: "Granary Row", type: "MIXED_MARKET", hasBlackMarket: true, description: "Grain merchants and food traders." },
  { id: "d8", settlementId: "s5", name: "Burrowside", type: "HALFLING_QUARTER", hasBlackMarket: false, description: "Cozy halfling neighborhood with gardens.", dominantAncestry: "HALFLING" },
  { id: "d9", settlementId: "s5", name: "Tanner's Bend", type: "CRAFTSMAN", hasBlackMarket: true, description: "Leather workers and tanners." },
  { id: "d10", settlementId: "s5", name: "Temple Hill", type: "TEMPLE", hasBlackMarket: true, description: "Religious complex for harvest gods." },
  { id: "d11", settlementId: "s5", name: "Lowtown", type: "HUMAN_COMMONS", hasBlackMarket: true, description: "Densely packed housing for laborers." },

  // Ironpeak Hold (5 districts)
  { id: "d12", settlementId: "s9", name: "The Forge", type: "DWARVEN_WORKS", hasBlackMarket: true, description: "Dwarven smithies producing legendary arms.", dominantAncestry: "DWARF" },
  { id: "d13", settlementId: "s9", name: "Bastion Walk", type: "GARRISON", hasBlackMarket: true, description: "Military district along the walls." },
  { id: "d14", settlementId: "s9", name: "Trader's Rest", type: "MIXED_MARKET", hasBlackMarket: true, description: "Inns and merchant stalls." },
  { id: "d15", settlementId: "s9", name: "Stone Quarter", type: "HUMAN_COMMONS", hasBlackMarket: true, description: "Carved stone housing for common folk." },
  { id: "d16", settlementId: "s9", name: "Leafshadow", type: "ELVEN_ENCLAVE", hasBlackMarket: false, description: "Small elven community of scribes.", dominantAncestry: "ELF" },

  // Redstone Fortress (6 districts)
  { id: "d17", settlementId: "s17", name: "Warchief's Ring", type: "GARRISON", hasBlackMarket: true, description: "Inner fortress and clan halls." },
  { id: "d18", settlementId: "s17", name: "Bloodmarket", type: "MIXED_MARKET", hasBlackMarket: true, description: "Trading bazaar with arena." },
  { id: "d19", settlementId: "s17", name: "Tusker's Ward", type: "ORCISH_WARD", hasBlackMarket: true, description: "Traditional orc housing.", dominantAncestry: "ORC" },
  { id: "d20", settlementId: "s17", name: "Outsider's Camp", type: "HUMAN_COMMONS", hasBlackMarket: true, description: "Non-orc visitors and traders." },
  { id: "d21", settlementId: "s17", name: "Bone Shrine", type: "TEMPLE", hasBlackMarket: true, description: "Ancestor worship temples." },
  { id: "d22", settlementId: "s17", name: "Smith's Row", type: "CRAFTSMAN", hasBlackMarket: true, description: "Weapon forges and armor makers." },

  // Greenbough (4 districts)
  { id: "d23", settlementId: "s13", name: "The Grove", type: "ELVEN_ENCLAVE", hasBlackMarket: false, description: "Sacred center around the ancient tree.", dominantAncestry: "ELF" },
  { id: "d24", settlementId: "s13", name: "Fernside", type: "HALFLING_QUARTER", hasBlackMarket: false, description: "Halfling herbalists and healers.", dominantAncestry: "HALFLING" },
  { id: "d25", settlementId: "s13", name: "Wanderer's Gate", type: "MIXED_MARKET", hasBlackMarket: true, description: "Where outsiders can trade." },
  { id: "d26", settlementId: "s13", name: "Woodshaper's Lane", type: "CRAFTSMAN", hasBlackMarket: true, description: "Elven woodworkers and bow makers." }
];

// === FIXTURE NPCs (4-6 per district) ===
const NPC_TEMPLATES: Omit<NPC, "id">[] = [
  // Salthollow - Harbor Quarter
  { name: "Varn Saltbeard", ancestry: "DWARF", role: "MERCHANT", districtId: "d1", isTraveler: false, description: "Gruff ship chandler with connections to smugglers.", recruitmentRequirements: { minTrust: 30, minStanding: 10 }, recruited: false },
  { name: "Mira Wavecrest", ancestry: "HUMAN", role: "INFORMANT", districtId: "d1", isTraveler: false, description: "Dock supervisor who sees everything.", recruitmentRequirements: { minTrust: 40, minStanding: 20, requiredRoleTier: { role: "spymasterTier", tier: 3 } }, recruited: false },
  { name: "Kellin Thornback", ancestry: "HALFLING", role: "CRIMINAL", districtId: "d1", isTraveler: false, description: "Fence for stolen goods, surprisingly trustworthy.", recruitmentRequirements: { minTrust: 50, minStanding: -10 }, recruited: false },
  { name: "Captain Orsova", ancestry: "ORC", role: "GUARD", districtId: "d1", isTraveler: false, description: "Retired pirate turned harbor patrol.", recruitmentRequirements: { minTrust: 35, minStanding: 25, requiredRoleTier: { role: "commanderTier", tier: 4 } }, recruited: false },
  { name: "Selia Windchime", ancestry: "ELF", role: "SCHOLAR", districtId: "d1", isTraveler: false, description: "Cartographer mapping trade routes.", recruitmentRequirements: { minTrust: 25, minStanding: 30 }, recruited: false },

  // Salthollow - Elvenmist
  { name: "Tharivol Moonweave", ancestry: "ELF", role: "NOBLE", districtId: "d4", isTraveler: false, description: "Elder overseeing the enclave's affairs.", recruitmentRequirements: { minTrust: 60, minStanding: 50, forbiddenFlag: "hardLineViolated" }, recruited: false },
  { name: "Lirel Starhollow", ancestry: "ELF", role: "PRIEST", districtId: "d4", isTraveler: false, description: "Keeper of the small shrine.", recruitmentRequirements: { minTrust: 40, minStanding: 35 }, recruited: false },
  { name: "Aethan Brightleaf", ancestry: "ELF", role: "ARTISAN", districtId: "d4", isTraveler: false, description: "Jeweler creating exquisite pieces.", recruitmentRequirements: { minTrust: 30, minStanding: 20 }, recruited: false },
  { name: "Fiora Duskpetal", ancestry: "ELF", role: "INFORMANT", districtId: "d4", isTraveler: false, description: "Socialite who knows everyone's secrets.", recruitmentRequirements: { minTrust: 55, minStanding: 40, requiredRoleTier: { role: "spymasterTier", tier: 5 } }, recruited: false },

  // Hearthford - Burrowside
  { name: "Pippin Greenthumb", ancestry: "HALFLING", role: "MERCHANT", districtId: "d8", isTraveler: false, description: "Cheerful produce seller with extensive contacts.", recruitmentRequirements: { minTrust: 20, minStanding: 15 }, recruited: false },
  { name: "Rose Bramblefoot", ancestry: "HALFLING", role: "ARTISAN", districtId: "d8", isTraveler: false, description: "Master baker whose pies are currency.", recruitmentRequirements: { minTrust: 25, minStanding: 10 }, recruited: false },
  { name: "Old Barley", ancestry: "HALFLING", role: "INFORMANT", districtId: "d8", isTraveler: false, description: "Retired adventurer with stories and intel.", recruitmentRequirements: { minTrust: 35, minStanding: 25 }, recruited: false },
  { name: "Willa Copperkettle", ancestry: "HALFLING", role: "PRIEST", districtId: "d8", isTraveler: false, description: "Community healer and mediator.", recruitmentRequirements: { minTrust: 30, minStanding: 30, requiredRoleTier: { role: "stewardTier", tier: 3 } }, recruited: false },

  // Ironpeak Hold - The Forge
  { name: "Thorgrim Anvilbreaker", ancestry: "DWARF", role: "ARTISAN", districtId: "d12", isTraveler: false, description: "Master weaponsmith, pride of the hold.", recruitmentRequirements: { minTrust: 40, minStanding: 35, requiredRoleTier: { role: "commanderTier", tier: 5 } }, recruited: false },
  { name: "Brunhild Stoneheart", ancestry: "DWARF", role: "GUARD", districtId: "d12", isTraveler: false, description: "Sergeant of the forge guard.", recruitmentRequirements: { minTrust: 35, minStanding: 30 }, recruited: false },
  { name: "Dolgrim the Quiet", ancestry: "DWARF", role: "INFORMANT", districtId: "d12", isTraveler: false, description: "Deaf smith who reads lips perfectly.", recruitmentRequirements: { minTrust: 50, minStanding: 20, requiredRoleTier: { role: "spymasterTier", tier: 4 } }, recruited: false },
  { name: "Kettil Copperbeard", ancestry: "DWARF", role: "MERCHANT", districtId: "d12", isTraveler: false, description: "Ore buyer with underworld connections.", recruitmentRequirements: { minTrust: 45, minStanding: 15 }, recruited: false },
  { name: "Freya Goldvein", ancestry: "DWARF", role: "NOBLE", districtId: "d12", isTraveler: false, description: "Clan daughter overseeing trade deals.", recruitmentRequirements: { minTrust: 55, minStanding: 45, requiredRoleTier: { role: "stewardTier", tier: 6 } }, recruited: false },

  // Redstone Fortress - Tusker's Ward
  { name: "Grukash Ironhide", ancestry: "ORC", role: "GUARD", districtId: "d19", isTraveler: false, description: "Veteran warrior with many scars.", recruitmentRequirements: { minTrust: 30, minStanding: 25, requiredRoleTier: { role: "commanderTier", tier: 3 } }, recruited: false },
  { name: "Shakara the Wise", ancestry: "ORC", role: "SCHOLAR", districtId: "d19", isTraveler: false, description: "Keeper of oral histories and laws.", recruitmentRequirements: { minTrust: 40, minStanding: 40, requiredRoleTier: { role: "arbitorTier", tier: 4 } }, recruited: false },
  { name: "Mogra Bonecrusher", ancestry: "ORC", role: "ARTISAN", districtId: "d19", isTraveler: false, description: "Armor smith famous for brutal designs.", recruitmentRequirements: { minTrust: 35, minStanding: 20 }, recruited: false },
  { name: "Urzok the Branded", ancestry: "ORC", role: "CRIMINAL", districtId: "d19", isTraveler: false, description: "Exiled clansman running underground fights.", recruitmentRequirements: { minTrust: 45, minStanding: -20 }, recruited: false },
  { name: "Yazara Sunbane", ancestry: "ORC", role: "PRIEST", districtId: "d19", isTraveler: false, description: "Ancestor speaker at Bone Shrine.", recruitmentRequirements: { minTrust: 50, minStanding: 45, forbiddenFlag: "hardLineViolated" }, recruited: false },

  // Greenbough - The Grove
  { name: "Silvanis Rootsong", ancestry: "ELF", role: "PRIEST", districtId: "d23", isTraveler: false, description: "High keeper of the ancient tree.", recruitmentRequirements: { minTrust: 65, minStanding: 55, forbiddenFlag: "hardLineViolated" }, recruited: false },
  { name: "Eryn Willowshade", ancestry: "ELF", role: "SCHOLAR", districtId: "d23", isTraveler: false, description: "Lorekeeper of the old pacts.", recruitmentRequirements: { minTrust: 45, minStanding: 40 }, recruited: false },
  { name: "Caelum Mistwalker", ancestry: "ELF", role: "GUARD", districtId: "d23", isTraveler: false, description: "Silent warden of grove boundaries.", recruitmentRequirements: { minTrust: 40, minStanding: 35, requiredRoleTier: { role: "commanderTier", tier: 4 } }, recruited: false },
  { name: "Thessaly Dewdrop", ancestry: "ELF", role: "ARTISAN", districtId: "d23", isTraveler: false, description: "Weaver of enchanted cloth.", recruitmentRequirements: { minTrust: 35, minStanding: 30 }, recruited: false },
];

// Generate NPCs with IDs
export const NPCS: NPC[] = NPC_TEMPLATES.map((npc, idx) => ({
  ...npc,
  id: `npc_${idx + 1}`
}));

// === TRAVELERS (5 roaming NPCs) ===
export const TRAVELERS: NPC[] = [
  { id: "trav_1", name: "Corbin Dustwalker", ancestry: "HUMAN", role: "MERCHANT", isTraveler: true, description: "Wandering peddler selling rare goods from distant lands.", recruitmentRequirements: { minTrust: 30, minStanding: 15 }, recruited: false },
  { id: "trav_2", name: "Zephyr Stormchaser", ancestry: "TIEFLING", role: "INFORMANT", isTraveler: true, description: "Mysterious messenger who knows too much.", recruitmentRequirements: { minTrust: 55, minStanding: 10, requiredRoleTier: { role: "spymasterTier", tier: 5 } }, recruited: false },
  { id: "trav_3", name: "Brother Aldric", ancestry: "HUMAN", role: "PRIEST", isTraveler: true, description: "Wandering healer on a pilgrimage.", recruitmentRequirements: { minTrust: 40, minStanding: 35, forbiddenFlag: "hardLineViolated" }, recruited: false },
  { id: "trav_4", name: "Nixie Quickfingers", ancestry: "GNOME", role: "CRIMINAL", isTraveler: true, description: "Traveling tinkerer and occasional thief.", recruitmentRequirements: { minTrust: 45, minStanding: -5 }, recruited: false },
  { id: "trav_5", name: "Valka Bloodstone", ancestry: "ORC", role: "GUARD", isTraveler: true, description: "Mercenary captain seeking worthy contracts.", recruitmentRequirements: { minTrust: 35, minStanding: 20, requiredRoleTier: { role: "commanderTier", tier: 6 } }, recruited: false }
];

// === 4 MAJOR RIVALS (Stages 0-5) ===
export const RIVALS: Rival[] = [
  {
    id: "rival_1",
    name: "Lord Cassius Vane",
    ancestry: "HUMAN",
    title: "The Silver Serpent",
    stage: 0,
    description: "Wealthy merchant prince who sees you as competition for trade influence.",
    escalationTriggers: [
      "Gain 50+ Renown",
      "Reach Steward Tier 5",
      "Control any Trade Hub settlement"
    ],
    currentThreat: "Spreading rumors to undermine your reputation."
  },
  {
    id: "rival_2",
    name: "Warchief Gorruk",
    ancestry: "ORC",
    title: "The Unbroken",
    stage: 0,
    description: "Traditional warchief who questions your Three Marks legitimacy.",
    escalationTriggers: [
      "Gain 30+ Three Marks (Strength)",
      "Reach Commander Tier 6",
      "Enter Dustmarch Expanse"
    ],
    currentThreat: "Challenging your right to speak in clan councils."
  },
  {
    id: "rival_3",
    name: "Inquisitor Moira",
    ancestry: "HUMAN",
    title: "The Purifier",
    stage: 0,
    description: "Religious zealot investigating your 'heretical' methods.",
    escalationTriggers: [
      "Violate Hard Lines",
      "Reach Arbitor Tier 5",
      "Use too many COVERT contract methods"
    ],
    currentThreat: "Gathering witnesses against you."
  },
  {
    id: "rival_4",
    name: "Shadowmaster Vel",
    ancestry: "ELF",
    title: "The Unseen",
    stage: 0,
    description: "Rival spymaster who considers you an amateur intruding on their territory.",
    escalationTriggers: [
      "Reach Spymaster Tier 6",
      "Recruit 5+ Informants",
      "Gain 100+ Leverage"
    ],
    currentThreat: "Testing your networks with false information."
  }
];

// === CULTURAL DATA ===
export const CULTURAL_TABOOS = {
  GENERAL: [
    "Breaking guest-right is never forgotten",
    "Oaths witnessed by three or more cannot be undone",
    "Killing non-combatants destroys your word forever"
  ],
  ORC: [
    "Challenge must be answered or status lost",
    "Three Marks evaluation is sacred law",
    "Ancestors speak through proof chains"
  ],
  ELF: [
    "The old pacts supersede new laws",
    "Fire magic is forbidden in sacred spaces",
    "Memory-keepers cannot be harmed"
  ],
  DWARF: [
    "Debts pass to descendants",
    "Stone-carved oaths are eternal",
    "Craft secrets die with their makers"
  ],
  HALFLING: [
    "Hospitality cannot be refused",
    "Gossip is currency but truth is gold",
    "Gardens are sacred ground"
  ]
};

// === THREE MARKS SYSTEM (Orc Legitimacy) ===
export const THREE_MARKS = {
  STRENGTH: {
    name: "Mark of Strength",
    description: "Physical prowess, combat victories, protection of the weak",
    gainedBy: ["Winning challenges", "Defending territory", "Proving martial skill"]
  },
  MIND: {
    name: "Mark of Mind",
    description: "Wisdom, strategy, knowledge of law and lore",
    gainedBy: ["Clever solutions", "Strategic victories", "Knowing the old ways"]
  },
  STEWARDSHIP: {
    name: "Mark of Stewardship",
    description: "Care for clan, resource management, future planning",
    gainedBy: ["Building prosperity", "Fair resource distribution", "Long-term thinking"]
  }
};

// === ALL NPCs COMBINED ===
export const ALL_NPCS = [...NPCS, ...TRAVELERS];

// === HELPER FUNCTIONS ===
export function getDistrictsBySettlement(settlementId: string): District[] {
  return DISTRICTS.filter(d => d.settlementId === settlementId);
}

export function getNPCsByDistrict(districtId: string): NPC[] {
  return NPCS.filter(n => n.districtId === districtId);
}

export function getSettlementsByBiome(biome: BiomeType): Settlement[] {
  return SETTLEMENTS.filter(s => s.biome === biome);
}
