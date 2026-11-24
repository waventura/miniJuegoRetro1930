// Configuración central de ¡Aventura Retro 1930! — Colección de Minijuegos
export const APP_VERSION = '1.1.0';
export const GITHUB_REPO = 'waventura/miniJuegoRetro1930';

export const STAGE_W = 1340;
export const STAGE_H = 800;
export const CARTOON_FPS = 12;

export const CHARACTERS = {
  carlos: {
    id: 'carlos',
    name: 'Carlos',
    title: 'Campeón del Mazo',
    greeting: '¡Hola! Soy Carlos. ¡Vamos a romper récords en los minijuegos!',
    colors: {
      primary: '#c94038',
      secondary: '#3d6b99',
      accent: '#e8b343',
      skin: '#fce2c4',
      hair: '#3b2417',
      shoes: '#6e3f23'
    }
  },
  mateo: {
    id: 'mateo',
    name: 'Mateo',
    title: 'Rayo de Puntería',
    greeting: '¡Yuju! Soy Mateo. ¡Nadie me gana en puntería rápida!',
    colors: {
      primary: '#3f8a58',
      secondary: '#e8a838',
      accent: '#c94a38',
      skin: '#f8d8b6',
      hair: '#2b1e16',
      shoes: '#385e7a'
    }
  },
  ariel: {
    id: 'ariel',
    name: 'Ariel',
    title: 'Estrella de la Feria',
    greeting: '¡Qué emoción! Soy Ariel. ¡A ganar todas las estrellas!',
    colors: {
      primary: '#d95b7a',
      secondary: '#f2c144',
      accent: '#5798b8',
      skin: '#fce3c8',
      hair: '#4a2b18',
      shoes: '#8a2b43'
    }
  }
};

export const MINIGAMES = [
  {
    id: 'topos',
    name: '¡Aplastatopos 1930!',
    icon: '🔨',
    badge: 'ACCIÓN',
    color: '#d95345',
    bg: '#dce5c4',
    desc: '¡Toca a los topos y hongos traviesos antes de que se escondan! Cuidado con los patitos.',
    intro: '¡Aplastatopos! Toca rápido a los topos y hongos traviesos, pero no golpees a los patitos.',
    duration: 45,
    stars: [120, 260, 420]
  },
  {
    id: 'pasteles',
    name: '¡Guerra de Pasteles!',
    icon: '🥧',
    badge: 'PUNTERÍA',
    color: '#e08b36',
    bg: '#f5dfb8',
    desc: '¡Lanza pasteles de crema a los villanos cómicos de la feria retro!',
    intro: '¡Guerra de Pasteles! Toca a los villanos cómicos para lanzarles pasteles de crema.',
    duration: 45,
    stars: [140, 280, 450]
  },
  {
    id: 'globos',
    name: '¡Feria de Globos!',
    icon: '🎈',
    badge: 'REFLEJOS',
    color: '#468fb8',
    bg: '#d9ecf5',
    desc: '¡Revienta globos de colores y globos gigantes dorados antes de que se escapen!',
    intro: '¡Feria de Globos! Revienta todos los globos que puedas y atrapa los globos dorados.',
    duration: 45,
    stars: [160, 320, 500]
  },
  {
    id: 'patos',
    name: '¡Tiro al Pato Retro!',
    icon: '🦆',
    badge: 'GALERÍA',
    color: '#4a945b',
    bg: '#e6edd4',
    desc: '¡Dispara estrellas de corcho en la galería de patos y piratas de hojalata!',
    intro: '¡Tiro al Pato Retro! Apunta y toca los patos y blancos dorados de la feria.',
    duration: 45,
    stars: [150, 300, 480]
  },
  {
    id: 'tesoros',
    name: '¡Lluvia de Tesoros!',
    icon: '⭐',
    badge: 'DESTREZA',
    color: '#c9567d',
    bg: '#f5e1e8',
    desc: '¡Mueve tu canasta para atrapar estrellas y pastelitos, y toca las bombas para explotarlas!',
    intro: '¡Lluvia de Tesoros! Atrapa estrellas y dulces con tu personaje, y toca las bombas en el aire.',
    duration: 45,
    stars: [140, 280, 440]
  },
  {
    id: 'pinata',
    name: '¡Fiesta de Piñata!',
    icon: '🪅',
    badge: 'FRENESÍ',
    color: '#8f59a8',
    bg: '#ebe0f2',
    desc: '¡Golpea rápido la piñata estelar saltarina y atrapa todos los dulces y estrellas!',
    intro: '¡Fiesta de Piñata! Toca muy rápido la piñata saltarina para llenarte de estrellas y dulces.',
    duration: 40,
    stars: [180, 360, 560]
  }
];
