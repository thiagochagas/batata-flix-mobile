import { Text, View } from "react-native";
import type { BarItem } from "@/lib/domain/dashboard-stats";

export function BarPanel({ titulo, itens, vazio }: { titulo: string; itens: BarItem[]; vazio: string }) {
  const max = itens.length ? Math.max(...itens.map((i) => i.valor)) : 1;
  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <Text className="text-base font-semibold text-foreground">{titulo}</Text>
      {itens.length === 0 && <Text className="text-sm text-muted-foreground">{vazio}</Text>}
      {itens.map((item) => (
        <View key={item.label} className="flex-row items-center gap-3">
          <Text numberOfLines={1} className="w-24 shrink-0 text-sm font-medium text-foreground">
            {item.label}
          </Text>
          <View className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <View
              className="h-full rounded-full bg-amber-400"
              style={{ width: `${Math.round((item.valor / max) * 100)}%` }}
            />
          </View>
          <Text className="w-6 shrink-0 text-right text-sm font-semibold text-muted-foreground">
            {item.valor}
          </Text>
        </View>
      ))}
    </View>
  );
}
