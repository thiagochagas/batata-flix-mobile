import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FilmeForm } from "@/components/forms/FilmeForm";
import type { StatusFilme } from "@/lib/domain/types";

export default function NovoFilmeScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const statusValido: StatusFilme = status === "quero" ? "quero" : "assistido";

  return (
    <View className="flex-1 bg-background">
      <FilmeForm status={statusValido} filme={null} />
    </View>
  );
}
