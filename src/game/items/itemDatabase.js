// Item Database - 40 unique items with varying effects and stats
export const itemDatabase = [
    // COMMON ITEMS (15)
    {
        id: 'minor_health_potion',
        name: 'Minor Health Potion',
        description: 'Restores 2 health points.',
        type: 'consumable',
        rarity: 'common',
        value: 15,
        consumable: true,
        stats: { healing: 2 }
    },
    {
        id: 'minor_mana_potion',
        name: 'Minor Mana Potion',
        description: 'Restores 15 mana points.',
        type: 'consumable',
        rarity: 'common',
        value: 15,
        consumable: true,
        stats: { manaRestore: 15 }
    },
    {
        id: 'copper_ring',
        name: 'Copper Ring',
        description: 'A simple copper ring.',
        type: 'accessory',
        rarity: 'common',
        value: 20,
        stats: { evasion: 1 }
    },
    {
        id: 'leather_gloves',
        name: 'Leather Gloves',
        description: 'Basic leather gloves that improve grip.',
        type: 'armor',
        rarity: 'common',
        value: 25,
        stats: { attackSpeed: 0.5 }
    },
    {
        id: 'small_quiver',
        name: 'Small Quiver',
        description: 'A small quiver that provides extra ammo.',
        type: 'accessory',
        rarity: 'common',
        value: 15,
        stats: { ammo: 5 }
    },
    {
        id: 'cloth_hood',
        name: 'Cloth Hood',
        description: 'A simple cloth hood that offers minimal protection.',
        type: 'armor',
        rarity: 'common',
        value: 20,
        stats: { armor: 1 }
    },
    {
        id: 'leather_boots',
        name: 'Leather Boots',
        description: 'Basic leather boots that increase mobility.',
        type: 'armor',
        rarity: 'common',
        value: 30,
        stats: { speed: 0.2 }
    },
    {
        id: 'wooden_talisman',
        name: 'Wooden Talisman',
        description: 'A simple talisman carved from oak.',
        type: 'accessory',
        rarity: 'common',
        value: 25,
        stats: { healthRegen: 0.05 }
    },
    {
        id: 'iron_bracelet',
        name: 'Iron Bracelet',
        description: 'A sturdy iron bracelet.',
        type: 'accessory',
        rarity: 'common',
        value: 25,
        stats: { armor: 2 }
    },
    {
        id: 'hunters_charm',
        name: 'Hunter\'s Charm',
        description: 'A charm used by hunters to find prey.',
        type: 'accessory',
        rarity: 'common',
        value: 20,
        stats: { collection: 0.3 }
    },
    {
        id: 'ammo_pouch',
        name: 'Ammo Pouch',
        description: 'A small pouch that holds extra ammunition.',
        type: 'accessory',
        rarity: 'common',
        value: 25,
        stats: { ammo: 10 }
    },
    {
        id: 'reinforced_vest',
        name: 'Reinforced Vest',
        description: 'A vest reinforced with metal plates.',
        type: 'armor',
        rarity: 'common',
        value: 35,
        stats: { armor: 3, speed: -0.1 }
    },
    {
        id: 'training_weights',
        name: 'Training Weights',
        description: 'Weights that increase strength when worn.',
        type: 'accessory',
        rarity: 'common',
        value: 30,
        stats: { damage: 0.5, speed: -0.1 }
    },
    {
        id: 'glass_amulet',
        name: 'Glass Amulet',
        description: 'A fragile amulet that enhances magical ability.',
        type: 'accessory',
        rarity: 'common',
        value: 25,
        stats: { manaRegen: 0.1 }
    },
    {
        id: 'bandage_kit',
        name: 'Bandage Kit',
        description: 'A kit of bandages that help wounds heal faster.',
        type: 'consumable',
        rarity: 'common',
        value: 20,
        consumable: true,
        stats: { healing: 1, healthRegen: 0.1 }
    },
    
    // UNCOMMON ITEMS (13)
    {
        id: 'health_potion',
        name: 'Health Potion',
        description: 'Restores 5 health points immediately.',
        type: 'consumable',
        rarity: 'uncommon',
        value: 40,
        consumable: true,
        stats: { healing: 5 }
    },
    {
        id: 'mana_potion',
        name: 'Mana Potion',
        description: 'Restores 30 mana points immediately.',
        type: 'consumable',
        rarity: 'uncommon',
        value: 40,
        consumable: true,
        stats: { manaRestore: 30 }
    },
    {
        id: 'silver_ring',
        name: 'Silver Ring',
        description: 'A finely crafted silver ring that enhances agility.',
        type: 'accessory',
        rarity: 'uncommon',
        value: 50,
        stats: { evasion: 3, speed: 0.2 }
    },
    {
        id: 'reinforced_gloves',
        name: 'Reinforced Gloves',
        description: 'Gloves reinforced with metal plates for better protection.',
        type: 'armor',
        rarity: 'uncommon',
        value: 60,
        stats: { armor: 2, damage: 0.5 }
    },
    {
        id: 'quiver',
        name: 'Quiver',
        description: 'A standard quiver that holds a good amount of ammo.',
        type: 'accessory',
        rarity: 'uncommon',
        value: 45,
        stats: { ammo: 15, attackSpeed: 0.5 }
    },
    {
        id: 'chainmail_hood',
        name: 'Chainmail Hood',
        description: 'A hood made of chainmail that offers good protection.',
        type: 'armor',
        rarity: 'uncommon',
        value: 55,
        stats: { armor: 4, healthRegen: 0.05 }
    },
    {
        id: 'explorers_boots',
        name: 'Explorer\'s Boots',
        description: 'Boots designed for long journeys and difficult terrain.',
        type: 'armor',
        rarity: 'uncommon',
        value: 65,
        stats: { speed: 0.5, collection: 0.5 }
    },
    {
        id: 'crystal_talisman',
        name: 'Crystal Talisman',
        description: 'A talisman with a glowing crystal that enhances magical ability.',
        type: 'accessory',
        rarity: 'uncommon',
        value: 70,
        stats: { manaRegen: 0.3, mana: 10 }
    },
    {
        id: 'steel_bracers',
        name: 'Steel Bracers',
        description: 'Strong bracers made of steel that protect the forearms.',
        type: 'armor',
        rarity: 'uncommon',
        value: 60,
        stats: { armor: 3, attackSpeed: -0.2, damage: 0.8 }
    },
    {
        id: 'marksman_scope',
        name: 'Marksman\'s Scope',
        description: 'A scope that improves accuracy and damage at range.',
        type: 'weapon',
        rarity: 'uncommon',
        value: 75,
        stats: { damage: 1.0, attackSpeed: -0.1 }
    },
    {
        id: 'healing_herbs',
        name: 'Healing Herbs',
        description: 'Medicinal herbs that accelerate natural healing.',
        type: 'consumable',
        rarity: 'uncommon',
        value: 55,
        consumable: true,
        stats: { healing: 3, healthRegen: 0.2 }
    },
    {
        id: 'mana_crystal',
        name: 'Mana Crystal',
        description: 'A crystal that resonates with magical energy.',
        type: 'accessory',
        rarity: 'uncommon',
        value: 65,
        stats: { mana: 20, manaRegen: 0.2 }
    },
    {
        id: 'treasure_finder',
        name: 'Treasure Finder',
        description: 'A magical device that helps locate valuable items.',
        type: 'accessory',
        rarity: 'uncommon',
        value: 60,
        stats: { collection: 1.0 }
    },
    
    // RARE ITEMS (8)
    {
        id: 'greater_health_potion',
        name: 'Greater Health Potion',
        description: 'Restores 10 health points immediately.',
        type: 'consumable',
        rarity: 'rare',
        value: 100,
        consumable: true,
        stats: { healing: 10 }
    },
    {
        id: 'greater_mana_potion',
        name: 'Greater Mana Potion',
        description: 'Restores 60 mana points immediately.',
        type: 'consumable',
        rarity: 'rare',
        value: 100,
        consumable: true,
        stats: { manaRestore: 60 }
    },
    {
        id: 'gold_ring',
        name: 'Gold Ring',
        description: 'An exquisite gold ring with magical properties.',
        type: 'accessory',
        rarity: 'rare',
        value: 150,
        stats: { evasion: 5, manaRegen: 0.3, healthRegen: 0.2 }
    },
    {
        id: 'plate_gauntlets',
        name: 'Plate Gauntlets',
        description: 'Heavy gauntlets that provide excellent protection.',
        type: 'armor',
        rarity: 'rare',
        value: 175,
        stats: { armor: 5, damage: 1.5, attackSpeed: -0.3 }
    },
    {
        id: 'enchanted_quiver',
        name: 'Enchanted Quiver',
        description: 'A magically enhanced quiver that generates ammo over time.',
        type: 'accessory',
        rarity: 'rare',
        value: 200,
        stats: { ammo: 25, attackSpeed: 1.0 }
    },
    {
        id: 'speed_boots',
        name: 'Speed Boots',
        description: 'Boots enchanted with wind magic that greatly increase movement speed.',
        type: 'armor',
        rarity: 'rare',
        value: 180,
        stats: { speed: 1.0, evasion: 3 }
    },
    {
        id: 'life_pendant',
        name: 'Life Pendant',
        description: 'A pendant that pulses with life-giving energy.',
        type: 'accessory',
        rarity: 'rare',
        value: 200,
        stats: { health: 3, healthRegen: 0.4 }
    },
    {
        id: 'rapid_fire_mechanism',
        name: 'Rapid Fire Mechanism',
        description: 'A complex mechanism that greatly increases firing rate.',
        type: 'weapon',
        rarity: 'rare',
        value: 225,
        stats: { attackSpeed: 2.0, damage: -0.2 }
    },
    
    // EPIC ITEMS (4)
    {
        id: 'legendary_health_elixir',
        name: 'Legendary Health Elixir',
        description: 'Instantly restores all health and increases maximum health.',
        type: 'consumable',
        rarity: 'epic',
        value: 350,
        consumable: true,
        stats: { healing: 999, health: 2 }
    },
    {
        id: 'crown_of_wisdom',
        name: 'Crown of Wisdom',
        description: 'A crown worn by ancient mages that greatly enhances magical abilities.',
        type: 'accessory',
        rarity: 'epic',
        value: 400,
        stats: { mana: 50, manaRegen: 1.0, healthRegen: 0.3 }
    },
    {
        id: 'dragonscale_armor',
        name: 'Dragonscale Armor',
        description: 'Armor forged from the scales of a dragon, providing incredible protection.',
        type: 'armor',
        rarity: 'epic',
        value: 450,
        stats: { armor: 10, health: 5, evasion: 3 }
    },
    {
        id: 'infinity_quiver',
        name: 'Infinity Quiver',
        description: 'A mythical quiver that never runs out of ammunition.',
        type: 'accessory',
        rarity: 'epic',
        value: 500,
        stats: { ammo: 100, attackSpeed: 2.0, damage: 1.0 }
    }
]; 