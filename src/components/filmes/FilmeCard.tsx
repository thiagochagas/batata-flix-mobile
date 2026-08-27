import { Pressable, Text, View } from "react-native";
import { Poster } from "@/components/Poster";
import { ratingColor } from "@/lib/domain/filme-utils";
import type { Filme } from "@/lib/domain/types";

// Card de grade pra Assistidos — porte RN de FilmeCard.tsx do app web
// (pôster com badges de oscar/favorito/ano/nota sobrepostos + rodapé com
// título, direção/elenco, IMDb e gêneros).
export function FilmeCard({ filme, largura, onPress }: { filme: Filme; largura: number; onPress: () => void }) {
  const cor = ratingColor(filme);
  const amei = (filme.minhaNota ?? 0) >= 8;
  const notaTxt = filme.minhaNota == null || filme.minhaNota === 0 ? "" : String(filme.minhaNota);
  const alturaPoster = Math.round(largura * 1.28);

  return (
    <Pressable
      onPress={onPress}
      style={{ width: largura }}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      <View style={{ height: 6, backgroundColor: cor }} />
      <Poster filme={filme} width={largura} height={alturaPoster} radius={0}>
        {filme.oscar === "ganhou" && (
          <Text style={{ position: "absolute", left: 10, top: 8, fontSize: 20 }}>🏆</Text>
        )}
        {filme.oscar === "indicado" && (
          <Text style={{ position: "absolute", left: 10, top: 8, fontSize: 20 }}>🎖️</Text>
        )}
        {filme.favorito && <Text style={{ position: "absolute", right: 10, top: 8, fontSize: 20 }}>⭐</Text>}
        {filme.ano && (
          <View className="absolute bottom-2.5 left-2.5 rounded-full bg-black/65 px-2 py-0.5">
            <Text className="text-xs font-bold text-white">{filme.ano}</Text>
          </View>
        )}
        {notaTxt !== "" && (
          <View
            className="absolute bottom-2 right-2.5 size-9 items-center justify-center rounded-full border-2 border-white/85"
            style={{ backgroundColor: cor }}
          >
            <Text className="text-sm font-black text-white">{notaTxt}</Text>
          </View>
        )}
      </Poster>
      <View className="gap-1 p-3">
        <Text
          numberOfLines={2}
          className={`text-sm font-extrabold leading-snug ${amei ? "text-green-500" : "text-foreground"}`}
        >
          {filme.titulo}
        </Text>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {filme.diretor ? `🎬 ${filme.diretor}` : filme.atores || " "}
        </Text>
        {filme.notaImdb != null && (
          <View className="flex-row items-center gap-1.5">
            <View className="rounded bg-amber-400 px-1.5 py-0.5">
              <Text className="text-[10px] font-black text-black">IMDb</Text>
            </View>
            <Text className="text-xs text-muted-foreground">{filme.notaImdb.toFixed(1)}</Text>
          </View>
        )}
        {filme.generos.length > 0 && (
          <View className="flex-row flex-wrap gap-1 pt-0.5">
            {filme.generos.slice(0, 2).map((g) => (
              <View key={g} className="rounded-full border border-border bg-secondary px-2 py-0.5">
                <Text className="text-[10px] font-bold text-muted-foreground">{g}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
