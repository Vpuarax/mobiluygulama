import React from "react";
import { Pressable, Text, View } from "react-native";

export default function TaskCard({ item, onPress, accent, priorityText, styles }) {
  const safeId = item.id ?? item.task_id;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.95, transform: [{ scale: 0.99 }] },
      ]}
    >
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title || `Task #${safeId}`}
      </Text>

      {!!item.description && (
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.idChip}>
          <Text style={styles.idChipText}>#{safeId}</Text>
        </View>

        <View style={[styles.smallDot, { backgroundColor: accent }]} />

        {priorityText ? (
          <View style={styles.softChip}>
            <Text style={styles.softChipText}>{priorityText}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
