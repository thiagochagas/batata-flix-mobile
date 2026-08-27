import { Pressable, Text, View } from "react-native";
import { GENEROS } from "@/lib/domain/enums";

// Seletor múltiplo de gêneros em chips — equivalente RN do grid de botões
// de gênero no FilmeFormDialog do app web.
export function GenreChips({
  selecionados,
  onToggle,
}: {
  selecionados: string[];
  onToggle: (genero: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-1.5">
      {GENEROS.map((g) => {
        const ativo = selecionados.includes(g);
        return (
          <Pressable
            key={g}
            onPress={() => onToggle(g)}
            className={`rounded-full border px-3 py-1.5 ${
              ativo ? "border-transparent bg-accent" : "border-border bg-transparent"
            }`}
          >
            <Text className={`text-xs font-semibold ${ativo ? "text-white" : "text-foreground"}`}>
              {g}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
