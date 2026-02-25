import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
import { api } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerAndSyncPushToken() {
  try {
    if (!Device.isDevice) {
      console.log("PUSH: Emülatörde push token alınamaz. Fiziksel cihazla dene.");
      return { success: false, message: "Emülatörde push token alınamaz" };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("PUSH: İzin verilmedi");
      return { success: false, message: "Push izni verilmedi" };
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    }

    // ✅ EAS APK için projectId'yi garantiye alıyoruz
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      "b6bca8bb-0d2d-4e03-a0df-66397bb3043c";

    console.log("PUSH: projectId:", projectId);

    const tokenRes = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoToken = tokenRes?.data;

    console.log("PUSH: Expo token:", expoToken);

    if (!expoToken) {
      return { success: false, message: "Expo token alınamadı" };
    }

    const res = await api.post(
      "/system/api/notifications.php?action=register",
      {
        expo_token: expoToken,
        platform: Platform.OS,
        device_id:
          Device.osInternalBuildId ||
          Device.modelId ||
          Device.deviceName ||
          "unknown",
      },
      { timeout: 20000 }
    );

    console.log("PUSH: Backend response:", res?.data);

    return res?.data || { success: true };
  } catch (e) {
    console.log("PUSH: Exception:", e?.response?.data || e.message || e);
    Alert.alert(
      "PUSH ERROR",
      (e?.message || "Unknown error") +
        "\n\n" +
        JSON.stringify(e?.response?.data || {}, null, 2)
    );
    throw e;
  }
}

export function addPushResponseListener(onData) {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response?.notification?.request?.content?.data;
    if (!data) return;
    try {
      onData?.(data);
    } catch (err) {
      console.log("PUSH: onData error:", err?.message || err);
    }
  });
}
