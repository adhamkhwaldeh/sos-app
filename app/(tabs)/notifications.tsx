import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { Fonts } from '@/src/styles/theme';
import { DB_EVENTS, dbEventEmitter } from '@/src/utils/eventEmitter';
import { addManualNotification, clearAllNotifications, showLocalNotification } from '@/src/utils/notificationService';
import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppState, FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Button, Modal, Portal, Text, TextInput } from 'react-native-paper';

interface NotificationFormData {
  title: string;
  message: string;
  status: string;
}

export default function TabTwoScreen() {
  const { notifications: logs, fetchNotifications } = useNotificationStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { translations } = useContext(LocalizationContext);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<NotificationFormData>({
    defaultValues: {
      title: '',
      message: '',
      status: 'pending'
    }
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
      console.log('Notifications updated event received, refreshing UI...');
      handleRefresh();
    };

    const sub = dbEventEmitter.on(DB_EVENTS.NOTIFICATIONS_UPDATED, onNotificationsUpdated);

    // 2. Refresh when app comes to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        console.log('App came to foreground, refreshing notifications...');
        handleRefresh();
      }
    });

    return () => {
      dbEventEmitter.off(sub);
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
      <Appbar style={{ backgroundColor: 'rgba(0, 210, 238, 1)' }}>
        <Appbar.Content title={`${translations.notifications} (${logs?.length || '0'})`} titleStyle={{ fontFamily: Fonts.rounded }} />
        <Appbar.Action icon="plus" onPress={() => setIsModalVisible(true)} />
        <Appbar.Action icon="bell-ring" onPress={async () => {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            alert(translations.notificationPermissionDenied);
            return;
          }

          console.log("Attempting to show test notification...");
          const res = await showLocalNotification(
            translations.testNotificationTitle,
            translations.testNotificationBody
          );
          console.log('Notification result:', res);
          if (res) {
            console.log('Notification showed successfully with ID:', res);
          } else {
            console.log('Notification failed to show');
          }
        }} />
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
                {notification.status && (
                  <Text style={styles.notificationStatus}>
                    {notification.status}
                  </Text>
                )}
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noNotifications}>{translations.noNotifications}</Text>
            </View>
          }
        />
      </View>

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={() => setIsModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>{translations.addNotification}</Text>

          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.title}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.title}
                style={styles.input}
                mode="outlined"
              />
            )}
            name="title"
          />
          {errors.title && <Text style={styles.errorText}>{translations.fieldRequired}</Text>}

          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.message}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.message}
                style={styles.input}
                mode="outlined"
                multiline
              />
            )}
            name="message"
          />
          {errors.message && <Text style={styles.errorText}>{translations.fieldRequired}</Text>}

          <Controller
            control={control}
            rules={{ required: true }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label={translations.status}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={!!errors.status}
                style={styles.input}
                mode="outlined"
              />
            )}
            name="status"
          />
          {errors.status && <Text style={styles.errorText}>{translations.fieldRequired}</Text>}

          <View style={styles.buttonContainer}>
            <Button mode="outlined" onPress={() => setIsModalVisible(false)} style={styles.button}>
              {translations.cancel}
            </Button>
            <Button mode="contained" onPress={handleSubmit(onSubmit)} style={styles.button}>
              {translations.save}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(0, 210, 238, 1)',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationStatus: {
    fontSize: 12,
    backgroundColor: 'rgba(0, 210, 238, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: 'rgba(0, 150, 170, 1)',
  },
  notificationContent: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
  },
  noNotifications: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.5,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
