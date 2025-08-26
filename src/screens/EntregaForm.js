// src/screens/EntregaForm.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from "react-native";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { ESTADOS } from "../utils/status";
import { trySendOrQueue } from "../services/api";

export default function EntregaForm({ route, navigation }) {
  const { punto, camion } = route.params;
  const [estado, setEstado] = useState(1);
  const [image, setImage] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const pickImage = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permiso requerido", "Autoriza la cámara.");
      return;
    }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!r.canceled) setImage(r.assets[0].uri);
  };

  const enviar = async () => {
    try {
      setEnviando(true);

      if (ESTADOS[estado].photo === "required" && !image) {
        Alert.alert("Falta foto", "Este estado requiere foto (2 o 4).");
        return;
      }
      if (ESTADOS[estado].photo === "forbidden" && image) {
        Alert.alert("Foto no permitida", "Para estado 3 no adjuntes foto.");
        return;
      }

      // GPS
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Autoriza la ubicación.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});

      // Reducir tamaño si hay foto (1280px, calidad 0.7)
      let sendUri = image;
      if (sendUri) {
        const m = await ImageManipulator.manipulateAsync(
          sendUri,
          [{ resize: { width: 1280 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        sendUri = m.uri;
      }

      const payload = {
        nombre: String(punto.nombre),
        camion,
        litros: Number(punto.litros || 0),
        estado,
        fecha: new Date().toISOString().slice(0, 10),
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
        // trazabilidad básica (opcional; tu backend los ignora si no existen)
        client_uuid: `${camion}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        registrado_por: camion,
      };

      const res = await trySendOrQueue(payload, sendUri);
      if (res?.ok) Alert.alert("OK", "Entrega registrada.");
      else Alert.alert("Sin conexión", "Se guardó y se enviará automáticamente.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", String(e?.message || e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 14 }}>
      <Text style={{ fontWeight: "700" }}>{punto?.nombre}</Text>
      <Text style={{ marginBottom: 8 }}>{punto?.litros} litros · Camión {camion}</Text>

      {Object.entries(ESTADOS).map(([k, cfg]) => (
        <TouchableOpacity
          key={k}
          onPress={() => setEstado(Number(k))}
          style={{
            padding: 12,
            borderWidth: Number(k) === Number(estado) ? 2 : 1,
            borderRadius: 12,
            backgroundColor: Number(k) === Number(estado) ? "#e8f5ff" : "#fff",
            marginVertical: 4,
          }}
        >
          <Text>{k}. {cfg.label}</Text>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>
            {cfg.photo === "required" && "Requiere foto"}
            {cfg.photo === "optional" && "Foto opcional"}
            {cfg.photo === "forbidden" && "No permite foto"}
          </Text>
        </TouchableOpacity>
      ))}

      {(estado === 1 || estado === 2 || estado === 4) && (
        <>
          <TouchableOpacity onPress={pickImage} style={{ padding: 12, borderWidth: 1, borderRadius: 10, marginTop: 8 }}>
            <Text>Tomar foto</Text>
          </TouchableOpacity>
          {image && (
            <TouchableOpacity onLongPress={() => setImage(null)} activeOpacity={0.9}>
              <Image source={{ uri: image }} style={{ width: "100%", height: 220, borderRadius: 8, marginTop: 8 }} />
              <Text style={{ fontSize: 12, opacity: 0.6, textAlign: "center" }}>
                (mantén presionado para quitar)
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <TouchableOpacity
        disabled={enviando}
        onPress={enviar}
        style={{ padding: 16, backgroundColor: "#1976d2", borderRadius: 12, marginTop: 12 }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
          {enviando ? "Enviando..." : "Registrar"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

