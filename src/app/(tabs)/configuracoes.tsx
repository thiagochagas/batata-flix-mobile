import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AccentSwatches } from "@/components/config/AccentSwatches";
import { EnrichAllModal } from "@/components/config/EnrichAllModal";
import { BackupButtons } from "@/components/config/BackupButtons";
import { useConfiguracoes } from "@/contexts/ConfiguracoesContext";
import { listarFilmes } from "@/lib/actions/filmes";
import { supabase } from "@/lib/supabase/client";
import type { Filme, Tema } from "@/lib/domain/types";

export default function ConfiguracoesScreen() {
  const { configuracoes, salvar } = useConfiguracoes();
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [enriquecerAberto, setEnriquecerAberto] = useState(false);
  const [saindo, setSaindo] = useState(false);

  const carregar = useCallback(() => {
    listarFilmes().then((resultado) => {
      if (resultado.ok && resultado.data) setFilmes(resultado.data);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const pendentes = useMemo(() => filmes.filter((f) => !f.tmdbId), [filmes]);

  function definirTema(tema: Tema) {
    salvar({ tema });
  }

  async function sair() {
    setSaindo(true);
    await supabase.auth.signOut();
    setSaindo(false);
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 p-4 pb-10">
      <View className="gap-3 rounded-xl border border-border bg-card p-4">
        <Text className="text-base font-semibold text-foreground">🎨 Aparência</Text>

        <View className="gap-1.5">
          <Text className="text-xs text-muted-foreground">Esquema de cores</Text>
          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => definirTema("dark")}
              className={`rounded-md border px-4 py-2 ${configuracoes?.tema === "dark" ? "border-accent bg-accent/15" : "border-border"}`}
            >
              <Text className="text-sm font-medium text-foreground">🌙 Escuro</Text>
            </Pressable>
            <Pressable
              onPress={() => definirTema("light")}
              className={`rounded-md border px-4 py-2 ${configuracoes?.tema === "light" ? "border-accent bg-accent/15" : "border-border"}`}
            >
              <Text className="text-sm font-medium text-foreground">☀️ Claro</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-1.5">
          <Text className="text-xs text-muted-foreground">Cor de destaque</Text>
          <AccentSwatches
            valor={configuracoes?.corDestaque ?? ""}
            onChange={(cor) => salvar({ corDestaque: cor })}
          />
        </View>
      </View>

      <View className="gap-3 rounded-xl border border-border bg-card p-4">
        <Text className="text-base font-semibold text-foreground">🔍 Acervo</Text>
        <Text className="text-sm text-muted-foreground">
          Busca automaticamente pôster, sinopse, elenco e nota IMDb dos filmes que ainda não têm
          esses dados ({pendentes.length} pendente(s)).
        </Text>
        <Pressable
          onPress={() => setEnriquecerAberto(true)}
          disabled={pendentes.length === 0}
          className="items-center rounded-md bg-accent py-2.5 disabled:opacity-50"
        >
          <Text className="text-sm font-semibold text-white">Enriquecer acervo</Text>
        </Pressable>
      </View>

      <View className="gap-3 rounded-xl border border-border bg-card p-4">
        <Text className="text-base font-semibold text-foreground">💾 Backup</Text>
        <Text className="text-sm text-muted-foreground">
          Seus filmes ficam salvos no Supabase — isso aqui é só uma cópia de segurança extra.
        </Text>
        <BackupButtons filmes={filmes} />
      </View>

      <Pressable
        onPress={sair}
        disabled={saindo}
        className="items-center rounded-md border border-destructive py-3 disabled:opacity-50"
      >
        <Text className="text-sm font-semibold text-destructive">
          {saindo ? "Saindo..." : "Sair da conta"}
        </Text>
      </Pressable>

      <EnrichAllModal
        visible={enriquecerAberto}
        onClose={() => setEnriquecerAberto(false)}
        pendentes={pendentes}
        onConcluido={carregar}
      />
    </ScrollView>
  );
}
