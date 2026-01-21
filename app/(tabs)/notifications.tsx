import AddNotificationModal from "@/src/components/AddNotificationModal";
import { DB_EVENTS, emitter } from "@/src/eventBus/eventEmitter";
import { LocalizationContext } from "@/src/localization/LocalizationContext";
import {
  addManualNotification,
  clearAllNotifications,
  showLocalNotification,
} from "@/src/services/notificationService";
import { useNotificationStore } from "@/src/store/useNotificationStore";
import * as Notifications from "expo-notifications";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppState, FlatList, StyleSheet, View } from "react-native";
import { Appbar, Portal, Text, useTheme } from "react-native-paper";

interface NotificationFormData {
  title: string;
  message: string;
  status: string;
}

export default function TabTwoScreen() {
  const { notifications: logs, fetchNotifications } = useNotificationStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NotificationFormData>({
    defaultValues: {
      title: "",
      message: "",
      status: "pending",
    },
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = () => {
    fetchNotifications();
  };

  useEffect(() => {
    // 1. Listen for real-time DB updates
    const onNotificationsUpdated = () => {
      console.log("Notifications updated event received, refreshing UI...");
      handleRefresh();
    };

    emitter.on(DB_EVENTS.NOTIFICATIONS_UPDATED, onNotificationsUpdated);

    // 2. Refresh when app comes to foreground
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        console.log("App came to foreground, refreshing notifications...");
        handleRefresh();
      }
    });

    return () => {
      emitter.removeListener(
        DB_EVENTS.NOTIFICATIONS_UPDATED,
        onNotificationsUpdated,
      );
      subscription.remove();
    };
  }, []);

  const onSubmit = async (data: NotificationFormData) => {
    await addManualNotification(data.title, data.message, data.status);
    setIsModalVisible(false);
    reset();
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar style={{ backgroundColor: theme.colors.primary }}>
        <Appbar.Content
          title={`${translations.notifications} (${logs?.length || "0"})`}
          titleStyle={theme.fonts.titleLarge}
        />
        <Appbar.Action icon="plus" onPress={() => setIsModalVisible(true)} />
        <Appbar.Action
          icon="bell-ring"
          onPress={async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== "granted") {
              alert(translations.notificationPermissionDenied);
              return;
            }

            console.log("Attempting to show test notification...");
            const res = await showLocalNotification(
              translations.testNotificationTitle,
              translations.testNotificationBody,
            );
            console.log("Notification result:", res);
            if (res) {
              console.log("Notification showed successfully with ID:", res);
            } else {
              console.log("Notification failed to show");
            }
          }}
        />
        <Appbar.Action icon="refresh" onPress={handleRefresh} />
        <Appbar.Action icon="delete" onPress={clearAllNotifications} />
      </Appbar>

      <View style={{ flex: 1 }}>
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: notification }) => (
            <View style={styles.notificationItem}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                {/* {notification.status && (
                  <Text style={styles.notificationStatus}>
                    {notification.status}
                  </Text>
                )} */}
              </View>
              <Text style={styles.notificationContent}>
                {notification.content}
              </Text>
              <Text style={styles.notificationTimestamp}>
                {new Date(notification.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={styles.noNotifications}>
                {translations.noNotifications}
              </Text>
            </View>
          }
        />
      </View>

      <Portal>
        <AddNotificationModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          control={control}
          handleSubmit={handleSubmit}
          errors={errors}
          onSubmit={onSubmit}
        />
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderLeftWidth: 4,
    borderLeftColor: "rgba(0, 210, 238, 1)",
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  notificationStatus: {
    fontSize: 12,
    backgroundColor: "rgba(0, 210, 238, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: "rgba(0, 150, 170, 1)",
  },
  notificationContent: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: "right",
  },
  noNotifications: {
    textAlign: "center",
    padding: 20,
    opacity: 0.5,
  },
});
