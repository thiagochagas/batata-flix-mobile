// Porte verbatim de src/lib/domain/enums.ts do BatataFlix Web — mesmos
// valores, sem inventar novos (só sem VIDEO_EXT, que só serve pro
// importador de pasta, feature desktop-only fora de escopo no mobile).

export const GENEROS = [
  "Ação",
  "Aventura",
  "Animação",
  "Biografia",
  "Comédia",
  "Crime",
  "Documentário",
  "Drama",
  "Esporte",
  "Família",
  "Fantasia",
  "Faroeste",
  "Ficção Científica",
  "Guerra",
  "História",
  "Musical",
  "Mistério",
  "Romance",
  "Suspense",
  "Terror",
] as const;

export type Genero = (typeof GENEROS)[number];

export const GENRE_COLORS: Record<string, [string, string]> = {
  Ação: ["#e50914", "#7a0208"],
  Aventura: ["#f5942b", "#a85200"],
  Animação: ["#2ecc71", "#12653a"],
  Biografia: ["#c98a3a", "#6b4413"],
  Comédia: ["#f5c518", "#b38a00"],
  Crime: ["#556270", "#22303c"],
  Documentário: ["#94a3b8", "#3a4560"],
  Drama: ["#8b5cf6", "#4c2c99"],
  Esporte: ["#22a06b", "#0f5236"],
  Família: ["#ff9d4d", "#a85a12"],
  Fantasia: ["#a855f7", "#5b1f99"],
  Faroeste: ["#d99a4e", "#6b3f14"],
  "Ficção Científica": ["#25d0c0", "#0a5f58"],
  Guerra: ["#8d6e4f", "#3e2c1c"],
  História: ["#b08968", "#5c4127"],
  Musical: ["#ff7ac2", "#992e6e"],
  Mistério: ["#5b7cff", "#1f2f8a"],
  Romance: ["#ff5c8a", "#a01245"],
  Suspense: ["#5b7cff", "#1f2f8a"],
  Terror: ["#e5093f", "#3a0210"],
};

// [cor, cor2, rótulo] — mesmos 7 presets do app web.
export const ACCENTS: [string, string, string][] = [
  ["#e50914", "#b0060e", "Vermelho"],
  ["#f5a20a", "#c47f00", "Dourado"],
  ["#17b5a8", "#0d8579", "Teal"],
  ["#8b5cf6", "#6d28d9", "Roxo"],
  ["#3b82f6", "#1d4ed8", "Azul"],
  ["#22a06b", "#15764d", "Verde"],
  ["#ec4899", "#be185d", "Rosa"],
];

export const ONDE_ASSISTIR_OPCOES = [
  "Netflix",
  "Prime Video",
  "Disney+",
  "Max",
  "Apple TV+",
  "Globoplay",
  "Cinema",
  "Arquivo local",
  "Blu-ray/DVD",
  "Outro",
];

export const COMPANHIA_OPCOES = [
  "Sozinho",
  "Em família",
  "Com amigos",
  "Com o(a) par",
  "No cinema",
  "Outro",
];

// Cores de nota/status dos cards — mesmos valores de --green/--gold/--bad/--teal
// do BatataFlix original (são fixos, não mudam entre tema claro/escuro).
export const RATING_COLORS = {
  amei: "#2ecc71",
  gostei: "#f5c518",
  naoTanto: "#ff2d3a",
  semNota: "#5a637a",
  quero: "#25d0c0",
};
