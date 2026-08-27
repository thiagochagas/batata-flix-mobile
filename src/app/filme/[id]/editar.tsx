import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { buscarFilme } from "@/lib/actions/filmes";
import { FilmeForm } from "@/components/forms/FilmeForm";
import type { Filme } from "@/lib/domain/types";

export default function EditarFilmeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filme, setFilme] = useState<Filme | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarFilme(id).then((resultado) => {
      if (!resultado.ok || !resultado.data) {
        setErro(resultado.error ?? "Filme não encontrado.");
      } else {
        setFilme(resultado.data);
      }
      setCarregando(false);
    });
  }, [id]);

  if (carregando) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (erro || !filme) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-sm text-destructive">{erro ?? "Filme não encontrado."}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FilmeForm status={filme.status} filme={filme} />
    </View>
  );
}
