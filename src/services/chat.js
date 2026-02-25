import { api } from "./api";
import { getToken } from "./auth";

const BASE_URL = "https://efetosun.com";

async function authHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getContacts() {
  const headers = await authHeaders();
  const res = await api.get("/api/chat/get-contacts.php", { headers });
  return res.data;
}

export async function getConversation(contact_id, limit = 50) {
  const headers = await authHeaders();
  const res = await api.get(
    `/api/chat/get-conversation.php?contact_id=${encodeURIComponent(
      contact_id
    )}&limit=${encodeURIComponent(limit)}`,
    { headers }
  );
  return res.data;
}

/**
 * ✅ FIX: Expo/RN Android'de axios + FormData -> ERR_NETWORK olabildiği için
 * send.php isteğini fetch ile gönderiyoruz.
 * (Content-Type yazmıyoruz; fetch boundary'i kendi ekler.)
 */
export async function sendMessage({ receiver_id, message }) {
  const token = await getToken();

  const form = new FormData();
  form.append("receiver_id", String(receiver_id));
  form.append("message", String(message ?? ""));

  const url = `${BASE_URL}/api/chat/send.php`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      // ❌ Content-Type yazma!
    },
    body: form,
  });

  const json = await resp.json().catch(() => null);

  // HTTP seviyesi hata
  if (!resp.ok) {
    throw new Error(
      `HTTP ${resp.status}\n` + JSON.stringify(json || {}, null, 2)
    );
  }

  return json;
}
