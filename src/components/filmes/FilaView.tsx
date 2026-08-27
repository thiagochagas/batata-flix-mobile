import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { FormSelect } from "@/components/FormSelect";
import { FilmeRow } from "@/components/filmes/FilmeRow";
import { RouletteModal } from "@/components/filmes/RouletteModal";
import { reordenarFilmes } from "@/lib/actions/filmes";
import type { Filme } from "@/lib/domain/types";

type Ordenacao = "ordem" | "title" | "type" | "imdb" | "year";

const ORDENAR_OPCOES = [
  { value: "ordem", label: "Prioridade (↑↓)" },
  { value: "title", label: "Título A-Z" },
  { value: "type", label: "Por tipo/gênero" },
  { value: "imdb", label: "↓ Nota IMDb" },
  { value: "year", label: "↓ Ano" },
];

// Compartilhado por Quero Ver e Quero Rever — mesma mecânica de
// PriorityList.tsx/QueroVerView.tsx do app web (fila ordenável, ação rápida,
// roleta opcional).
export function FilaView({
  filmes,
  carregando,
  campo,
  acaoLabel,
  onAcao,
  onReordenado,
  mostrarNota,
  mostrarRoleta,
  fabHref,
  emoji,
  tituloVazio,
  subtituloVazio,
  legenda,
}: {
  filmes: Filme[];
  carregando: boolean;
  campo: "ordem" | "ordemRever";
  acaoLabel: string;
  onAcao: (filme: Filme) => void;
  onReordenado: () => void;
  mostrarNota?: boolean;
  mostrarRoleta?: boolean;
  fabHref?: string;
  emoji: string;
  tituloVazio: string;
  subtituloVazio: string;
  legenda: string;
}) {
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState<Ordenacao>("ordem");
  const [roletaAberta, setRoletaAberta] = useState(false);

  const lista = useMemo(() => {
    let l = filmes;
    const q = busca.toLowerCase();
    if (q) l = l.filter((f) => `${f.titulo} ${f.diretor ?? ""}`.toLowerCase().includes(q));

    return [...l].sort((a, b) => {
      if (ordenar === "title") return a.titulo.localeCompare(b.titulo);
      if (ordenar === "type") return (a.generos[0] || "zzz").localeCompare(b.generos[0] || "zzz");
      if (ordenar === "imdb") return (b.notaImdb ?? 0) - (a.notaImdb ?? 0);
      if (ordenar === "year") return (b.ano ?? 0) - (a.ano ?? 0);
      const chaveA = campo === "ordem" ? a.ordem : a.ordemRever;
      const chaveB = campo === "ordem" ? b.ordem : b.ordemRever;
      return (chaveA ?? 0) - (chaveB ?? 0);
    });
  }, [filmes, busca, ordenar, campo]);

  async function mover(idA: string, idB: string) {
    const resultado = await reordenarFilmes(idA, idB, campo);
    if (resultado.ok) onReordenado();
  }

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="gap-2 p-4 pb-2">
        <View className="flex-row gap-2">
          <TextInput
            value={busca}
            onChangeText={setBusca}
            placeholder="Buscar na fila..."
            placeholderTextColor="#737373"
            className="flex-1 rounded-md border border-border px-3 py-2.5 text-sm text-foreground"
          />
          {mostrarRoleta && (
            <Pressable
              onPress={() => setRoletaAberta(true)}
              disabled={filmes.length === 0}
              className="items-center justify-center rounded-md border border-border px-3.5 disabled:opacity-40"
            >
              <Text className="text-base">🎲</Text>
            </Pressable>
          )}
        </View>
        <FormSelect
          label=""
          value={ordenar}
          onChange={(v) => setOrdenar(v as Ordenacao)}
          options={ORDENAR_OPCOES}
        />
        <Text className="text-xs text-muted-foreground">{legenda}</Text>
      </View>

      {lista.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3 px-8 pb-20">
          <Text className="text-5xl">{emoji}</Text>
          <Text className="text-center text-lg font-bold text-foreground">{tituloVazio}</Text>
          <Text className="text-center text-sm text-muted-foreground">{subtituloVazio}</Text>
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          renderItem={({ item, index }) => (
            <FilmeRow
              filme={item}
              posicao={index + 1}
              total={lista.length}
              manual={ordenar === "ordem"}
              mostrarNota={mostrarNota}
              acaoLabel={acaoLabel}
              onAcao={() => onAcao(item)}
              onMoveUp={() => index > 0 && mover(item.id, lista[index - 1].id)}
              onMoveDown={() => index < lista.length - 1 && mover(item.id, lista[index + 1].id)}
              onPress={() => router.push(`/filme/${item.id}`)}
            />
          )}
        />
      )}

      {fabHref && (
        <Pressable
          onPress={() => router.push(fabHref as never)}
          className="absolute bottom-6 right-6 size-14 items-center justify-center rounded-full bg-accent shadow-lg"
        >
          <Text className="text-2xl text-white">+</Text>
        </Pressable>
      )}

      {mostrarRoleta && (
        <RouletteModal
          visible={roletaAberta}
          onClose={() => setRoletaAberta(false)}
          filmes={filmes}
          onVerFilme={(f) => {
            setRoletaAberta(false);
            router.push(`/filme/${f.id}`);
          }}
        />
      )}
    </View>
  );
}
