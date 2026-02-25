// screens/LoginScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { api } from "../services/api";
import { saveToken } from "../services/auth";
import { registerAndSyncPushToken } from "../services/pushNotifications";

export default function LoginScreen({ onLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    try {
      const res = await api.post("/system/api/auth.php?action=login", {
        username,
        password,
      });

      const token =
        res?.data?.token || res?.data?.access_token || res?.data?.data?.token;

      if (!token) {
        Alert.alert("Hata", "Token gelmedi.");
        return;
      }

      // Token'ı kaydet
      await saveToken(token);

      // ✅ Login sonrası 1 kere push token al + backend'e kaydet
      // Not: Push WEB'de çalışmaz. Fiziksel cihaz gerekir.
      try {
        console.log("PUSH REGISTER RESULT:", pushRes);
      } catch (e) {
        console.log("PUSH REGISTER ERROR:", e?.response?.data || e.message || e);
      }

      // Login tamam
      onLoggedIn?.();
    } catch (e) {
      console.log("LOGIN ERR:", e?.response?.data || e.message || e);
      Alert.alert("Hata", "Login başarısız.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giriş</Text>

      <TextInput
        style={styles.input}
        placeholder="Kullanıcı adı"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Giriş Yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "black",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold" },
});