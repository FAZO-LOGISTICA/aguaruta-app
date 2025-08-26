// src/hooks/useOutboxSync.js
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { getOutbox, clearOneFromOutbox, postEntrega } from "../services/api";

export default function useOutboxSync() {
  useEffect(() => {
    const timer = setInterval(async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected) return;

      const outbox = await getOutbox();
      // enviamos de a 1 para no saturar datos móviles
      for (let i = 0; i < outbox.length; i++) {
        const { payload, imageUri } = outbox[i];
        try {
          await postEntrega(payload, imageUri);
          await clearOneFromOutbox(i);
          break; // esperamos al próximo ciclo
        } catch {
          // si falla, probamos en el siguiente ciclo
        }
      }
    }, 8000);

    return () => clearInterval(timer);
  }, []);
}

