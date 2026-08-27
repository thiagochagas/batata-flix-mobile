import { Pressable, View } from "react-native";
import { ACCENTS } from "@/lib/domain/enums";

// Porte RN dos "swatches" de cor de destaque do AparenciaForm.tsx do app
// web — mesmos 7 presets, anel duplo (borda + halo) no selecionado.
export function AccentSwatches({ valor, onChange }: { valor: string; onChange: (cor: string) => void }) {
  return (
    <View className="flex-row flex-wrap gap-2.5">
      {ACCENTS.map(([cor, cor2]) => {
        const ativo = valor === cor;
        return (
          <Pressable
            key={cor}
            onPress={() => onChange(cor)}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              backgroundColor: cor,
              borderWidth: 2,
              borderColor: ativo ? "#fff" : "transparent",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                borderRadius: 10,
                borderWidth: ativo ? 2 : 0,
                borderColor: cor2,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
