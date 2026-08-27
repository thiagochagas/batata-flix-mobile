import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Clapperboard, LayoutDashboard, RotateCcw, Settings, Target, Trophy } from "lucide-react-native";
import { useConfiguracoes, corDestaqueAtual } from "@/contexts/ConfiguracoesContext";

export default function TabsLayout() {
  const scheme = useColorScheme();
  const { configuracoes } = useConfiguracoes();
  const [accent] = corDestaqueAtual(configuracoes);
  const inativo = scheme === "dark" ? "#737373" : "#a3a3a3";
  const fundo = scheme === "dark" ? "#000000" : "#ffffff";
  const borda = scheme === "dark" ? "#262626" : "#e5e5e5";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: inativo,
        tabBarStyle: { backgroundColor: fundo, borderTopColor: borda },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Painel",
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="assistidos"
        options={{
          title: "Assistidos",
          tabBarIcon: ({ color, size }) => <Clapperboard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quero-ver"
        options={{
          title: "Quero Ver",
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quero-rever"
        options={{
          title: "Quero Rever",
          tabBarIcon: ({ color, size }) => <RotateCcw color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="top-imdb"
        options={{
          title: "Top IMDb",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
