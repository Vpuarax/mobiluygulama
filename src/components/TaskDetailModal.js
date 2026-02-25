import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Linking from "expo-linking";

export default function TaskDetailModal({
  visible,
  onClose,
  selectedTask,
  taskId,
  detail,
  loadingDetail,
  columns,
  updating,
  accentForStatus,
  updateStatus,
  // steps
  newStep,
  setNewStep,
  stepWorking,
  onAddStep,
  onToggleStep,
  onDeleteStep,
  // upload
  uploading,
  onPickAndUpload,
  // comments
  commentText,
  setCommentText,
  commentSending,
  onSendComment,
  styles,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalGrabber} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Görev Detayı</Text>

            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>Kapat</Text>
            </Pressable>
          </View>

          {loadingDetail ? (
            <View style={{ paddingVertical: 30, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 10, color: "#64748B", fontWeight: "800" }}>
                Detay yükleniyor...
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.detailTitle}>
                {detail?.title || selectedTask?.title || `Task #${taskId}`}
              </Text>

              {!!(detail?.description || selectedTask?.description) && (
                <Text style={styles.descFull}>
                  {detail?.description || selectedTask?.description}
                </Text>
              )}

              {/* Status */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Durumu Değiştir</Text>
                <View style={styles.statusRow}>
                  {columns.map((c) => {
                    const active = (detail?.status_code || selectedTask?.status_code) === c.key;
                    const a = accentForStatus(c.key);
                    return (
                      <Pressable
                        key={c.key}
                        disabled={updating}
                        onPress={() => updateStatus(taskId, c.key)}
                        style={({ pressed }) => [
                          styles.statusPill,
                          active && {
                            borderColor: a,
                            borderWidth: 2,
                            backgroundColor: "#F8FAFC",
                          },
                          pressed && !updating && { opacity: 0.95, transform: [{ scale: 0.99 }] },
                          updating && { opacity: 0.6 },
                        ]}
                      >
                        <View style={[styles.pillDot, { backgroundColor: a }]} />
                        <Text style={styles.statusPillText}>{c.title}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Steps */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Aşamalar</Text>

                {(detail?.steps || []).length ? (
                  <View style={{ gap: 8 }}>
                    {detail.steps.map((s) => {
                      const done = Number(s.is_completed) === 1;

                      return (
                        <View key={String(s.id)} style={styles.stepRow}>
                          <Pressable
                            onPress={() => onToggleStep(s.id, !done)}
                            style={[styles.checkBox, done && styles.checkBoxOn]}
                          >
                            <Text style={[styles.checkText, done && { color: "#fff" }]}> 
                              {done ? "✓" : ""}
                            </Text>
                          </Pressable>

                          <Text
                            style={[styles.stepText, done && styles.stepTextDone]}
                            numberOfLines={2}
                          >
                            {s.step_title}
                          </Text>

                          <Pressable onPress={() => onDeleteStep(s.id)} style={styles.stepDelBtn}>
                            <Text style={styles.stepDelText}>Sil</Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.muted}>Henüz aşama yok.</Text>
                )}

                <View style={styles.inputRow}>
                  <TextInput
                    value={newStep}
                    onChangeText={setNewStep}
                    placeholder="Yeni aşama..."
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                  />
                  <Pressable
                    onPress={onAddStep}
                    disabled={!newStep.trim() || stepWorking}
                    style={[styles.sendBtn, (!newStep.trim() || stepWorking) && { opacity: 0.5 }]}
                  >
                    <Text style={styles.sendBtnText}>Ekle</Text>
                  </Pressable>
                </View>
              </View>

              {/* Attachments */}
              <View style={styles.modalSection}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.modalSectionTitle}>Dosyalar</Text>
                  <Pressable
                    onPress={onPickAndUpload}
                    disabled={uploading}
                    style={[styles.uploadBtn, uploading && { opacity: 0.6 }]}
                  >
                    <Text style={styles.uploadBtnText}>
                      {uploading ? "Yükleniyor..." : "Dosya Ekle"}
                    </Text>
                  </Pressable>
                </View>

                {(detail?.attachments || []).length ? (
                  <View style={{ marginTop: 10, gap: 8 }}>
                    {detail.attachments.map((a) => {
                      const path = a.file_path || a.path || a.file || "";
                      const url = a.file_url || (path ? `https://efetosun.com/${path}` : "");

                      return (
                        <Pressable
                          key={String(a.id)}
                          style={styles.fileRow}
                          onPress={async () => {
                            if (!url) {
                              Alert.alert("Hata", "Dosya linki bulunamadı");
                              return;
                            }
                            const can = await Linking.canOpenURL(url);
                            if (!can) {
                              Alert.alert("Hata", "Dosya açılamadı");
                              return;
                            }
                            Linking.openURL(url);
                          }}
                        >
                          <Text style={styles.fileName} numberOfLines={1}>
                            {a.file_name || "Dosya"}
                          </Text>

                          <Text style={styles.fileMeta}>
                            {(a.file_size ? Math.round(a.file_size / 1024) : 0)} KB
                          </Text>

                          <Text style={{ marginTop: 6, color: "#2563EB", fontWeight: "900" }}>
                            Aç
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.muted}>Henüz dosya yok.</Text>
                )}
              </View>

              {/* Comments */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Yorumlar</Text>

                {(detail?.comments || []).length ? (
                  <View style={{ gap: 8 }}>
                    {detail.comments.map((c, idx) => (
                      <View key={String(c.id || idx)} style={styles.commentBox}>
                        <Text style={styles.commentMeta}>
                          {c.full_name || "Kullanıcı"} • {c.created_at || ""}
                        </Text>
                        <Text style={styles.commentText}>{c.comment}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.muted}>Henüz yorum yok.</Text>
                )}

                <View style={styles.inputRow}>
                  <TextInput
                    value={commentText}
                    onChangeText={setCommentText}
                    placeholder="Yorum yaz..."
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                  />
                  <Pressable
                    onPress={onSendComment}
                    disabled={!commentText.trim() || commentSending}
                    style={[
                      styles.sendBtn,
                      (!commentText.trim() || commentSending) && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.sendBtnText}>Gönder</Text>
                  </Pressable>
                </View>
              </View>

              <View style={{ height: 28 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
