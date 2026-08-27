import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Filme } from "@/lib/domain/types";

// Backup em JSON — mesma ideia do BackupPanel.tsx do app web (que baixa um
// Blob no navegador), adaptado pro padrão de compartilhamento nativo usado
// em ExportButton.tsx do APP_INVESTIMENTOS_MOBILE.
async function exportarJSON(filmes: Filme[]) {
  const nomeArquivo = `batataflix-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const conteudo = JSON.stringify(filmes, null, 2);

  if (Platform.OS === "web") {
    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const caminho = `${FileSystem.cacheDirectory}${nomeArquivo}`;
  await FileSystem.writeAsStringAsync(caminho, conteudo);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(caminho, { mimeType: "application/json" });
  }
}

export function BackupButtons({ filmes }: { filmes: Filme[] }) {
  const [processando, setProcessando] = useState(false);

  async function baixar() {
    setProcessando(true);
    try {
      await exportarJSON(filmes);
    } finally {
      setProcessando(false);
    }
  }

  return (
    <View className="gap-2">
      <Pressable
        onPress={baixar}
        disabled={processando || filmes.length === 0}
        className="items-center rounded-md border border-border py-2.5 disabled:opacity-50"
      >
        <Text className="text-sm font-medium text-foreground">
          {processando ? "Preparando..." : "⬇️ Backup (.json)"}
        </Text>
      </Pressable>
    </View>
  );
}
