import { Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { posterGradColors } from "@/lib/domain/filme-utils";
import type { Filme } from "@/lib/domain/types";

// Pôster com fallback em gradiente por gênero (equivalente RN de
// posterGrad() do app web, que gera um CSS linear-gradient).
export function Poster({
  filme,
  width,
  height,
  radius = 12,
  children,
}: {
  filme: Pick<Filme, "generos" | "titulo" | "posterUrl">;
  width: number;
  height: number;
  radius?: number;
  children?: React.ReactNode;
}) {
  const [c1, c2] = posterGradColors(filme);
  const inicial = (filme.titulo || "?").trim()[0]?.toUpperCase() ?? "?";

  return (
    <View style={{ width, height, borderRadius: radius, overflow: "hidden" }}>
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!filme.posterUrl && (
          <Text style={{ fontSize: Math.min(width, height) * 0.4, fontWeight: "900", color: "rgba(255,255,255,0.9)" }}>
            {inicial}
          </Text>
        )}
      </LinearGradient>
      {filme.posterUrl && (
        <Image
          source={{ uri: filme.posterUrl }}
          style={{ width, height }}
          contentFit="cover"
          transition={150}
        />
      )}
      {children}
    </View>
  );
}
