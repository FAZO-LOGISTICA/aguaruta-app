// src/screens/Ruta.js
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { fetchRutas } from "../services/api";
import { hoyNombreDia, norm } from "../utils/status";

export default function Ruta({ route, navigation }) {
  const camion = route.params?.camion;
  const [q, setQ] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const dia = hoyNombreDia();

  const cargar = async () => {
    try {
      setLoading(true);
      const raw = await fetchRutas({ camion, dia });
      setData(Array.isArray(raw) ? raw : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const qn = norm(q);
    return (data || [])
      .filter((p) => !qn || norm(p.nombre).includes(qn))
      .filter((p) => !camion || String(p.camion || "").toUpperCase() === String(camion).toUpperCase());
  }, [data, q, camion]);

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <Text style={{ fontWeight: "700", marginBottom: 6 }}>{camion} · {dia}</Text>

      <TextInput
        placeholder="Buscar por nombre..."
        value={q}
        onChangeText={setQ}
        style={{ borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 }}
      />

      <FlatList
        data={filtrados}
        keyExtractor={(item, idx) => `${item.id ?? item.nombre}_${idx}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={cargar} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("EntregaForm", { punto: item, camion })}
            style={{ padding: 14, borderWidth: 1, borderRadius: 12, marginVertical: 6 }}
          >
            <Text style={{ fontWeight: "600" }}>{item.nombre}</Text>
            <Text>{item.litros} litros</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && (
          <Text style={{ textAlign: "center", marginTop: 20 }}>Sin rutas cargadas.</Text>
        )}
      />
    </View>
  );
}

