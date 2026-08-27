import { Text, TextInput, View, type TextInputProps } from "react-native";

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  autoFocus,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs text-muted-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        autoFocus={autoFocus}
        numberOfLines={multiline ? 4 : undefined}
        textAlignVertical={multiline ? "top" : undefined}
        placeholderTextColor="#737373"
        className="rounded-md border border-border px-3 py-2.5 text-sm text-foreground"
      />
    </View>
  );
}
