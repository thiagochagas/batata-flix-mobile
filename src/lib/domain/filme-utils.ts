import { GENRE_COLORS, RATING_COLORS } from "@/lib/domain/enums";
import type { Filme } from "@/lib/domain/types";

export function ratingColor(filme: Pick<Filme, "status" | "minhaNota">): string {
  if (filme.status === "quero") return RATING_COLORS.quero;
  const n = filme.minhaNota;
  if (n == null || n === 0) return RATING_COLORS.semNota;
  if (n >= 8) return RATING_COLORS.amei;
  if (n >= 6) return RATING_COLORS.gostei;
  return RATING_COLORS.naoTanto;
}

// No app web isso vira uma CSS linear-gradient; no mobile os dois tons
// alimentam diretamente o <LinearGradient> (expo-linear-gradient) usado
// como pôster de fallback.
export function posterGradColors(filme: Pick<Filme, "generos">): [string, string] {
  const g = filme.generos?.[0] || "Drama";
  return GENRE_COLORS[g] || ["#8b5cf6", "#4c2c99"];
}
