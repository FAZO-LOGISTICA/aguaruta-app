import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SelectCamion from "./src/screens/SelectCamion";
import Ruta from "./src/screens/Ruta";
import EntregaForm from "./src/screens/EntregaForm";
import ConfigServer from "./src/screens/ConfigServer";
import useOutboxSync from "./src/hooks/useOutboxSync";
import { getBaseUrl, tryAutoBaseUrl } from "./src/services/api";

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  useOutboxSync();

  useEffect(() => {
    (async () => {
      const current = await getBaseUrl();
      if (!current) await tryAutoBaseUrl();
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTitle: "AguaRuta - Conductores" }}>
        <Stack.Screen name="SelectCamion" component={SelectCamion} options={{ title: "Selecciona tu camión" }}/>
        <Stack.Screen name="Ruta" component={Ruta} options={{ title: "Mi ruta de hoy" }}/>
        <Stack.Screen name="EntregaForm" component={EntregaForm} options={{ title: "Registrar entrega" }}/>
        <Stack.Screen name="ConfigServer" component={ConfigServer} options={{ title: "Servidor" }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
