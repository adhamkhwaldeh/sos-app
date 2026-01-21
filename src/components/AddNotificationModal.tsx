import { LocalizationContext } from "@/src/localization/LocalizationContext";
import { useContext } from "react";
import {
  Controller,
  FieldErrors,
  FieldValues,
  UseFormHandleSubmit
} from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, Modal, Text, TextInput, useTheme } from "react-native-paper";

interface AddNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  control: any;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  errors: FieldErrors<FieldValues>;
  onSubmit: (data: any) => Promise<void>;
}

export default function AddNotificationModal({
  visible,
  onClose,
  control,
  handleSubmit,
  errors,
  onSubmit,
}: AddNotificationModalProps) {
  const { translations } = useContext(LocalizationContext);
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      style={[
        styles.modalContainer,
        { backgroundColor: theme.colors.background, flex: 1 },
      ]}
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
      {errors.title && (
        <Text style={styles.errorText}>{translations.fieldRequired}</Text>
      )}

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
      {errors.message && (
        <Text style={styles.errorText}>{translations.fieldRequired}</Text>
      )}

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
      {errors.status && (
        <Text style={styles.errorText}>{translations.fieldRequired}</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onClose} style={styles.button}>
          {translations.cancel}
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.button}
        >
          {translations.save}
        </Button>
      </View>

    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});
