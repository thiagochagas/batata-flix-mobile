import { Text, View } from "react-native";

export function StatCard({
  icone,
  valor,
  label,
  largura,
}: {
  icone: string;
  valor: string | number;
  label: string;
  largura: number;
}) {
  return (
    <View style={{ width: largura }} className="rounded-xl border border-border bg-card p-4">
      <Text className="text-2xl">{icone}</Text>
      <Text className="mt-2 text-2xl font-black leading-none text-foreground">{valor}</Text>
      <Text className="mt-1.5 text-xs font-medium text-muted-foreground">{label}</Text>
    </View>
  );
}
