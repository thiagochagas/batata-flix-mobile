import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { GENRE_COLORS, RATING_COLORS } from "@/lib/domain/enums";
import type { Filme } from "@/lib/domain/types";

// Linha de lista com prioridade (▲▼) — porte RN de FilmeRow.tsx do app web,
// usado em Quero Ver e Quero Rever.
export function FilmeRow({
  filme,
  posicao,
  total,
  manual,
  mostrarNota,
  acaoLabel,
  onAcao,
  onMoveUp,
  onMoveDown,
  onPress,
}: {
  filme: Filme;
  posicao: number;
  total: number;
  manual: boolean;
  mostrarNota?: boolean;
  acaoLabel: string;
  onAcao: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onPress: () => void;
}) {
  const gcor = (GENRE_COLORS[filme.generos[0]] || ["#25d0c0"])[0];

  return (
    <Pressable
      onPress={onPress}
      style={{ borderLeftWidth: 4, borderLeftColor: gcor }}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-card p-2.5 pl-3"
    >
      <Text className="w-6 shrink-0 text-center text-base font-black text-amber-400">{posicao}</Text>
      {manual && (
        <View className="shrink-0 gap-0.5">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={posicao === 1}
            className="h-6 w-7 items-center justify-center rounded border border-border disabled:opacity-30"
          >
            <Text className="text-[11px] leading-none text-muted-foreground">▲</Text>
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={posicao === total}
            className="h-6 w-7 items-center justify-center rounded border border-border disabled:opacity-30"
          >
            <Text className="text-[11px] leading-none text-muted-foreground">▼</Text>
          </Pressable>
        </View>
      )}
      {filme.posterUrl && (
        <Image source={{ uri: filme.posterUrl }} style={{ width: 40, height: 56, borderRadius: 6 }} contentFit="cover" />
      )}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-sm font-bold text-foreground">
          {filme.titulo} {filme.ano ? `(${filme.ano})` : ""}
        </Text>
        <Text numberOfLines={1} className="text-xs text-muted-foreground">
          {mostrarNota && filme.minhaNota != null && filme.minhaNota > 0 ? (
            <Text style={{ color: RATING_COLORS.amei }} className="font-extrabold">
              ⭐ {filme.minhaNota} ·{" "}
            </Text>
          ) : null}
          {filme.generos.join(", ") || "sem gênero"}
          {!mostrarNota && filme.notaImdb != null ? (
            <Text className="text-amber-400"> · IMDb {filme.notaImdb.toFixed(1)}</Text>
          ) : null}
        </Text>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onAcao();
        }}
        className="shrink-0 rounded-md bg-accent px-3 py-2"
      >
        <Text className="text-xs font-semibold text-white">{acaoLabel}</Text>
      </Pressable>
    </Pressable>
  );
}
