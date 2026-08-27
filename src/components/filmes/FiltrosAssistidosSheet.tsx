import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GENEROS } from "@/lib/domain/enums";

export type OrdenacaoAssistidos = "minha" | "imdb" | "title" | "year" | "dir" | "date";
export type Premiacao = "" | "oscarWin" | "oscarNom" | "any";

const ORDENAR_OPCOES: { value: OrdenacaoAssistidos; label: string }[] = [
  { value: "minha", label: "↓ Minha nota" },
  { value: "imdb", label: "↓ Nota IMDb" },
  { value: "title", label: "Título A-Z" },
  { value: "year", label: "↓ Ano" },
  { value: "dir", label: "Diretor A-Z" },
  { value: "date", label: "Mais recentes" },
];

const PREMIACAO_OPCOES: { value: Premiacao; label: string }[] = [
  { value: "", label: "Todas" },
  { value: "oscarWin", label: "🏆 Ganhou o Oscar" },
  { value: "oscarNom", label: "🎖️ Indicado ao Oscar" },
  { value: "any", label: "Qualquer prêmio" },
];

function Chip({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${ativo ? "border-transparent bg-accent" : "border-border bg-transparent"}`}
    >
      <Text className={`text-xs font-semibold ${ativo ? "text-white" : "text-foreground"}`}>{label}</Text>
    </Pressable>
  );
}

// Painel único de filtros/ordenação — substitui a barra de <Select>s do
// app web por uma sheet de baixo, mais ergonômica em tela de celular.
export function FiltrosAssistidosSheet({
  visible,
  onClose,
  genero,
  onGenero,
  diretor,
  onDiretor,
  diretoresDisponiveis,
  premiacao,
  onPremiacao,
  ordenar,
  onOrdenar,
}: {
  visible: boolean;
  onClose: () => void;
  genero: string;
  onGenero: (v: string) => void;
  diretor: string;
  onDiretor: (v: string) => void;
  diretoresDisponiveis: string[];
  premiacao: Premiacao;
  onPremiacao: (v: Premiacao) => void;
  ordenar: OrdenacaoAssistidos;
  onOrdenar: (v: OrdenacaoAssistidos) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="max-h-[85%] rounded-t-2xl bg-card"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="text-base font-bold text-foreground">Filtros e ordenação</Text>
            <Pressable onPress={onClose}>
              <Text className="text-sm font-semibold text-accent">Aplicar</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="gap-5 p-4">
            <View className="gap-2">
              <Text className="text-xs font-bold uppercase text-muted-foreground">Gênero</Text>
              <View className="flex-row flex-wrap gap-2">
                <Chip label="Todos" ativo={!genero} onPress={() => onGenero("")} />
                {GENEROS.map((g) => (
                  <Chip key={g} label={g} ativo={genero === g} onPress={() => onGenero(genero === g ? "" : g)} />
                ))}
              </View>
            </View>

            {diretoresDisponiveis.length > 0 && (
              <View className="gap-2">
                <Text className="text-xs font-bold uppercase text-muted-foreground">Direção</Text>
                <View className="flex-row flex-wrap gap-2">
                  <Chip label="Todas" ativo={!diretor} onPress={() => onDiretor("")} />
                  {diretoresDisponiveis.map((d) => (
                    <Chip key={d} label={d} ativo={diretor === d} onPress={() => onDiretor(diretor === d ? "" : d)} />
                  ))}
                </View>
              </View>
            )}

            <View className="gap-2">
              <Text className="text-xs font-bold uppercase text-muted-foreground">Premiação</Text>
              <View className="flex-row flex-wrap gap-2">
                {PREMIACAO_OPCOES.map((o) => (
                  <Chip key={o.value} label={o.label} ativo={premiacao === o.value} onPress={() => onPremiacao(o.value)} />
                ))}
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-xs font-bold uppercase text-muted-foreground">Ordenar por</Text>
              <View className="flex-row flex-wrap gap-2">
                {ORDENAR_OPCOES.map((o) => (
                  <Chip key={o.value} label={o.label} ativo={ordenar === o.value} onPress={() => onOrdenar(o.value)} />
                ))}
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
