import { Pressable, Text, View } from "react-native";

function corNota(v: number) {
  if (v === 0) return { bg: "#38383b", fg: "#a3a3a3" };
  if (v >= 8) return { bg: "#2ecc71", fg: "#fff" };
  if (v >= 6) return { bg: "#f5c518", fg: "#20160a" };
  return { bg: "#ff2d3a", fg: "#fff" };
}

const NOTAS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Seletor de 0 a 10 pra "minha nota" — botões em vez de um slider nativo
// (evita depender de um módulo com código nativo próprio; 11 valores
// discretos também são mais fáceis de acertar no toque do que arrastar).
export function RatingSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const cor = corNota(value);
  return (
    <View className="gap-3 rounded-lg border border-border p-3">
      <View className="flex-row items-center gap-3">
        <View className="size-12 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: cor.bg }}>
          <Text style={{ color: cor.fg }} className="text-lg font-black">
            {value === 0 ? "—" : value}
          </Text>
        </View>
        <Text className="flex-1 text-xs text-muted-foreground">Toque num número pra avaliar (0 = sem nota).</Text>
      </View>
      <View className="flex-row flex-wrap gap-1.5">
        {NOTAS.map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            className={`size-9 items-center justify-center rounded-md border ${
              n === value ? "border-primary bg-primary" : "border-border bg-transparent"
            }`}
          >
            <Text className={`text-sm font-bold ${n === value ? "text-primary-foreground" : "text-foreground"}`}>
              {n === 0 ? "—" : n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
