// src/screens/SelectCamion.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchConductores } from "../services/api";

export default function SelectCamion({ navigation }) {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    (async () => {
      const c = await AsyncStorage.getItem("CAMION_SEL");
      if (c) {
        navigation.replace("Ruta", { camion: c });
        return;
      }
      const cams = await fetchConductores();
      setLista(cams);
    })();
  }, []);

  const elegir = async (c) => {
    await AsyncStorage.setItem("CAMION_SEL", c);
    navigation.replace("Ruta", { camion: c });
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "center" }}>
      <Text style={{ fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 10 }}>
        Selecciona tu camión (usuario)
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {lista.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => elegir(c)}
            style={{
              padding: 14,
              borderWidth: 1,
              borderRadius: 12,
              margin: 6,
              minWidth: 90,
              backgroundColor: "#fff",
            }}
          >
            <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "600" }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("ConfigServer")} style={{ marginTop: 24, alignSelf: "center" }}>
        <Text style={{ textDecorationLine: "underline" }}>Configurar servidor</Text>
      </TouchableOpacity>
    </View>
  );
}

