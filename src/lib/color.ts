// Converte "#rrggbb" para o formato "R G B" que as CSS vars do global.css
// esperam (rgb(var(--x) / <alpha-value>)) — usado pelo AccentProvider para
// aplicar a cor de destaque escolhida em Configurações via nativewind vars().
export function hexParaTriplet(hex: string): string {
  const limpo = hex.replace("#", "");
  const r = parseInt(limpo.slice(0, 2), 16);
  const g = parseInt(limpo.slice(2, 4), 16);
  const b = parseInt(limpo.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "229 9 20";
  return `${r} ${g} ${b}`;
}
