// Configuración central de ¡Aventura Retro 1930!
export const APP_VERSION = '1.0.1';
export const GITHUB_REPO = 'waventura/miniJuegoRetro1930';

export const STAGE_W = 1340;
export const STAGE_H = 800;
export const WORLD_W = 2400;
export const WORLD_H = 1440;
export const CARTOON_FPS = 12;

export const CHARACTERS = {
  carlos: {
    id: 'carlos',
    name: 'Carlos',
    title: 'Explorador Valiente',
    perkText: '+15% fuerza con Espada y Hacha',
    greeting: '¡Hola! Soy Carlos. ¡Vamos a explorar y vencer a los villanos!',
    speed: 255,
    maxHearts: 5,
    meleeBonus: 1.15,
    magicBonus: 1.0,
    gatherBonus: 1.05,
    colors: {
      primary: '#c94038',    // Gorra y corbatín rojo vintage
      secondary: '#3d6b99',  // Overol mezclilla 1930
      accent: '#e8b343',     // Botones dorados
      skin: '#fce2c4',
      hair: '#3b2417',
      shoes: '#6e3f23'
    }
  },
  mateo: {
    id: 'mateo',
    name: 'Mateo',
    title: 'Inventor Veloz',
    perkText: '+15% velocidad y recolección rápida',
    greeting: '¡Yuju! Soy Mateo. ¡Hora de crear herramientas increíbles!',
    speed: 292,
    maxHearts: 5,
    meleeBonus: 1.0,
    magicBonus: 1.0,
    gatherBonus: 1.25,
    colors: {
      primary: '#3f8a58',    // Chaleco verde esmeralda vintage
      secondary: '#e8a838',  // Tirantes y gafas de aviador
      accent: '#c94a38',     // Pañuelo coral
      skin: '#f8d8b6',
      hair: '#2b1e16',
      shoes: '#385e7a'
    }
  },
  ariel: {
    id: 'ariel',
    name: 'Ariel',
    title: 'Estrella Mágica',
    perkText: '+20% poder con Varita y +1 Corazón',
    greeting: '¡Qué emoción! Soy Ariel. ¡A descubrir tesoros secretos!',
    speed: 265,
    maxHearts: 6,
    meleeBonus: 1.0,
    magicBonus: 1.22,
    gatherBonus: 1.05,
    colors: {
      primary: '#d95b7a',    // Vestido rosa coral 1930
      secondary: '#f2c144',  // Moño y estrella dorada
      accent: '#5798b8',     // Cuello marinero azul
      skin: '#fce3c8',
      hair: '#4a2b18',
      shoes: '#8a2b43'
    }
  }
};

export const RECIPES = [
  {
    id: 'hacha',
    name: 'Hacha Retro',
    slot: 'weapon',
    icon: '🪓',
    desc: 'Tala árboles al doble de velocidad y da golpes fuertes.',
    cost: { wood: 3, stone: 2, crystal: 0 },
    damage: 24,
    range: 92,
    woodBonus: 2,
    stoneBonus: 1,
    crystalBonus: 1
  },
  {
    id: 'espada',
    name: 'Espada Clásica',
    slot: 'weapon',
    icon: '⚔️',
    desc: 'Arco amplio y gran daño contra villanos y jefes cómicos.',
    cost: { wood: 2, stone: 4, crystal: 0 },
    damage: 34,
    range: 108,
    woodBonus: 1,
    stoneBonus: 1,
    crystalBonus: 1
  },
  {
    id: 'pico',
    name: 'Pico de Cristal',
    slot: 'weapon',
    icon: '⛏️',
    desc: 'Rompe piedras y cristales rapidísimo y aturde enemigos.',
    cost: { wood: 2, stone: 3, crystal: 2 },
    damage: 30,
    range: 98,
    woodBonus: 1,
    stoneBonus: 2,
    crystalBonus: 2
  },
  {
    id: 'varita',
    name: 'Varita Estelar',
    slot: 'weapon',
    icon: '🪄',
    desc: '¡Ataque mágico a distancia! Dispara estrellas doradas brillantes.',
    cost: { wood: 2, stone: 0, crystal: 4 },
    damage: 28,
    range: 480,
    ranged: true,
    woodBonus: 1,
    stoneBonus: 1,
    crystalBonus: 2
  },
  {
    id: 'escudo',
    name: 'Escudo Dorado',
    slot: 'shield',
    icon: '🛡️',
    desc: 'Bloquea ataques de villanos y reduce todo el daño recibido.',
    cost: { wood: 0, stone: 3, crystal: 3 },
    damageReduction: 0.5
  },
  {
    id: 'pocion',
    name: 'Poción Burbujeante',
    slot: 'consumable',
    icon: '🧪',
    desc: 'Restaura 3 corazones al instante con burbujas mágicas.',
    cost: { wood: 1, stone: 0, crystal: 2 },
    heal: 3
  }
];

export const WORLDS = [
  {
    id: 'bosque',
    name: 'Bosque Encantado',
    subtitle: 'Árboles sonrientes y hongos saltarines',
    intro: '¡Bienvenidos al Bosque Encantado! Reúne madera y derrota a Don Tronco Gruñón.',
    medalName: 'Medalla Hoja Dorada',
    icon: '🌲',
    palette: {
      base: '#dce5c4',
      wash1: '#b9d19b',
      wash2: '#89b37c',
      wash3: '#f2e4bd',
      path: '#d7be91',
      water: '#78b3c2',
      accent: '#d45a46'
    },
    resources: { wood: 14, stone: 8, crystal: 5 },
    minionType: 'honguito',
    minionName: 'Honguito Saltarín',
    boss: {
      id: 'boss_bosque',
      name: 'Don Tronco Gruñón',
      taunt: '¡Nadie corta mis ramas! ¡A saltar!',
      defeatLine: '¡Uy, qué mareo! ¡Ganaste la Medalla del Bosque!',
      hp: 210,
      speed: 96,
      color: '#7a4d2c',
      accent: '#548c44',
      projectileColor: '#a86932'
    }
  },
  {
    id: 'desierto',
    name: 'Desierto Dorado',
    subtitle: 'Dunas cálidas, oasis y pirámides chistosas',
    intro: '¡Llegamos al Desierto Dorado! Busca cristales del sol y vence al Faraón Chistoso.',
    medalName: 'Medalla Sol de Oro',
    icon: '🏜️',
    palette: {
      base: '#f4dfb6',
      wash1: '#e8be7a',
      wash2: '#d9995b',
      wash3: '#faeac8',
      path: '#cfa166',
      water: '#5ea9b8',
      accent: '#c94c38'
    },
    resources: { wood: 7, stone: 13, crystal: 9 },
    minionType: 'cactus',
    minionName: 'Cactus Bailarín',
    boss: {
      id: 'boss_desierto',
      name: 'Rey Tut-Tón',
      taunt: '¡Baila como momia o prueba mis bolas de arena!',
      defeatLine: '¡Se me desenredaron las vendas! ¡La Medalla del Desierto es tuya!',
      hp: 260,
      speed: 112,
      color: '#e5c158',
      accent: '#2c6f91',
      projectileColor: '#d99a4e'
    }
  },
  {
    id: 'pirata',
    name: 'Mares Piratas',
    subtitle: 'Muelles de madera, palmeras y tesoros ocultos',
    intro: '¡Al abordaje en Mares Piratas! Encuentra los cofres y derrota al Capitán Pulpo Bigotes.',
    medalName: 'Medalla Timón Pirata',
    icon: '🏴‍☠️',
    palette: {
      base: '#f0e3c2',
      wash1: '#8cc7cf',
      wash2: '#5ea1b8',
      wash3: '#e8cca0',
      path: '#b58454',
      water: '#4f9bb5',
      accent: '#c94038'
    },
    resources: { wood: 11, stone: 9, crystal: 10 },
    minionType: 'cangrejo',
    minionName: 'Cangrejo Pinzas',
    boss: {
      id: 'boss_pirata',
      name: 'Capitán Pulpo Bigotes',
      taunt: '¡Arrr! ¡Mis ocho tentáculos cuidan este tesoro!',
      defeatLine: '¡Glub glub! ¡Qué gran pirata eres! Toma la Medalla de los Mares.',
      hp: 310,
      speed: 118,
      color: '#9e4770',
      accent: '#e8b343',
      projectileColor: '#3c2e4a'
    }
  },
  {
    id: 'montana',
    name: 'Montaña Nevada',
    subtitle: 'Picos helados, cristales brillantes y nieve',
    intro: '¡Brrr! ¡Bienvenidos a la Montaña Nevada! Prepárate para retar al Yeti Helado.',
    medalName: 'Medalla Estrella Polar',
    icon: '🏔️',
    palette: {
      base: '#e5edf2',
      wash1: '#bfd4e3',
      wash2: '#9cb9d1',
      wash3: '#f5f1e6',
      path: '#b4c6d4',
      water: '#7ab5d6',
      accent: '#d9504a'
    },
    resources: { wood: 9, stone: 10, crystal: 13 },
    minionType: 'muneco',
    minionName: 'Muñeco Travieso',
    boss: {
      id: 'boss_montana',
      name: 'Yeti Helado Señor Brrr',
      taunt: '¡Brrr! ¡Guerra de bolas de nieve gigantes!',
      defeatLine: '¡Achuús! ¡Me diste un abrazo calentito! ¡Ganaste la Medalla Polar!',
      hp: 360,
      speed: 124,
      color: '#dce9f2',
      accent: '#d64545',
      projectileColor: '#b3ddf2'
    }
  }
];
