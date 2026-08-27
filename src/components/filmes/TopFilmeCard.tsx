import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import type { TopFilmeItem } from "@/lib/domain/types";

// Card de grade pro Top IMDb — porte RN do TopCard interno de
// TopImdbView.tsx do app web.
export function TopFilmeCard({
  item,
  largura,
  noAcervo,
  adicionando,
  onAdicionar,
}: {
  item: TopFilmeItem;
  largura: number;
  noAcervo: boolean;
  adicionando: boolean;
  onAdicionar: (status: "quero" | "assistido") => void;
}) {
  const inicial = (item.titulo || "?").trim()[0]?.toUpperCase() ?? "?";
  const alturaPoster = Math.round(largura * 1.28);

  return (
    <View style={{ width: largura }} className="overflow-hidden rounded-2xl border border-border bg-card">
      <View className="h-1.5 bg-amber-400" />
      <View style={{ width: largura, height: alturaPoster }} className="items-center justify-center bg-amber-900">
        {item.posterUrl ? (
          <Image source={{ uri: item.posterUrl }} style={{ width: largura, height: alturaPoster }} contentFit="cover" />
        ) : (
          <Text className="text-5xl font-black text-white/90">{inicial}</Text>
        )}
        {item.voto != null && (
          <View className="absolute bottom-2 right-2.5 size-9 items-center justify-center rounded-full border-2 border-white/85 bg-amber-400">
            <Text className="text-sm font-black text-black">{item.voto.toFixed(1)}</Text>
          </View>
        )}
        {item.ano && (
          <View className="absolute bottom-2.5 left-2.5 rounded-full bg-black/65 px-2 py-0.5">
            <Text className="text-xs font-bold text-white">{item.ano}</Text>
          </View>
        )}
        {noAcervo && (
          <View className="absolute left-2.5 top-2 rounded-full bg-green-500 px-2.5 py-1">
            <Text className="text-[10px] font-extrabold text-green-950">✓ No acervo</Text>
          </View>
        )}
      </View>
      <View className="gap-2 p-3">
        <Text numberOfLines={2} className="min-h-[2.4em] text-sm font-extrabold leading-snug text-foreground">
          {item.titulo}
        </Text>
        {noAcervo ? (
          <Text className="py-1 text-xs text-muted-foreground">Já está no seu BatataFlix</Text>
        ) : (
          <View className="flex-row gap-1.5">
            <Pressable
              onPress={() => onAdicionar("quero")}
              disabled={adicionando}
              className="flex-1 items-center rounded-md bg-amber-400 py-2 disabled:opacity-50"
            >
              <Text className="text-xs font-bold text-black">🎯 Quero</Text>
            </Pressable>
            <Pressable
              onPress={() => onAdicionar("assistido")}
              disabled={adicionando}
              className="flex-1 items-center rounded-md bg-accent py-2 disabled:opacity-50"
            >
              <Text className="text-xs font-bold text-white">🍿 Assisti</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
