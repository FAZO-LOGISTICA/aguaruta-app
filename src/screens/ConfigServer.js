// src/screens/ConfigServer.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { getBaseUrl, setBaseUrl, tryAutoBaseUrl } from "../services/api";

export default function ConfigServer() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    getBaseUrl().then(setUrl);
  }, []);

  const guardar = async () => {
    if (!url.startsWith("http")) {
      Alert.alert("URL inválida", "Debes ingresar una URL que comience con http(s)://");
      return;
    }
    await setBaseUrl(url);
    Alert.alert("Guardado", "Servidor actualizado.");
  };

  const probar = async () => {
    try {
      const { data } = await axios.get(`${url.replace(/\/+$/, "")}/health`, { timeout: 6000 });
      Alert.alert("Conexión OK", JSON.stringify(data));
    } catch (e) {
      Alert.alert("Sin respuesta", "No se pudo conectar a /health");
    }
  };

  const autoconfig = async () => {
    const ok = await tryAutoBaseUrl();
    if (ok) {
      const v = await getBaseUrl();
      setUrl(v);
      Alert.alert("Listo", "Servidor configurado automáticamente.");
    } else {
      Alert.alert("Atención", "No se pudo obtener la URL automática.");
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 10 }}>
      <Text style={{ fontWeight: "700" }}>URL del backend (Render/Ngrok)</Text>
      <TextInput
        placeholder="https://tu-backend.onrender.com"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        style={{ borderWidth: 1, borderRadius: 10, padding: 10 }}
      />

      <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
        <TouchableOpacity onPress={guardar} style={{ padding: 14, backgroundColor: "#1976d2", borderRadius: 10, flex: 1 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>Guardar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={probar} style={{ padding: 14, borderWidth: 1, borderRadius: 10, flex: 1 }}>
          <Text style={{ textAlign: "center" }}>Probar /health</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={autoconfig} style={{ padding: 12, marginTop: 8 }}>
        <Text style={{ textAlign: "center", textDecorationLine: "underline" }}>
          Intentar configuración automática (url.txt)
        </Text>
      </TouchableOpacity>
    </View>
  );
}

