import { NotificationFormData } from "@/src/data/forms/NotificationFormData";
import { AddNotificationModalProps } from "@/src/data/props/AddNotificationModalProps";
import { LocalizationContext } from "@/src/localization/LocalizationContext";
import { addManualNotification } from "@/src/services/notificationService";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Modal, Text, TextInput, useTheme } from "react-native-paper";

export default function AddNotificationModal({
  visible,
  onClose,
}: AddNotificationModalProps) {
  const { translations } = useContext(LocalizationContext);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<NotificationFormData>({
    defaultValues: {
      title: "",
      message: "",
      status: "pending",
    },
  });

  const onSubmit = (data: NotificationFormData) => {
    addManualNotification(data.title, data.message, data.status);
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      contentContainerStyle={styles.contentContainer}
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={styles.modalTitle}>{translations.addNotification}</Text>

        <Controller
          control={control}
          rules={{ required: { value: true, message: translations.fieldRequired } }}
          name="title"
          render={({
            field: { onChange, onBlur, value, ref },
            fieldState: { invalid, isTouched, isDirty, error },
            formState: { errors },
          }) => (
            <View style={styles.input}>
              <TextInput
                label={translations.title}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                mode="outlined"
                ref={ref}
                error={invalid}
              />
              {invalid && (
                <HelperText type="error" visible={invalid}>
                  {error ? error.message : null}
                </HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          rules={{ required: { value: true, message: translations.fieldRequired } }}
          name="message"
          render={({
            field: { onChange, onBlur, value, ref },
            fieldState: { invalid, isTouched, isDirty, error },
            formState: { errors }
          }) => (
            <View style={styles.input}>
              <TextInput
                label={translations.message}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={invalid}
                ref={ref}
                mode="outlined"
                multiline
              />

              {invalid && (
                <HelperText type="error" visible={invalid}>
                  {error ? error.message : null}
                </HelperText>
              )}
            </View>
          )}
        />

        <Controller
          control={control}
          rules={{ required: { value: true, message: translations.fieldRequired } }}
          name="status"
          render={({
            field: { onChange, onBlur, value, ref },
            fieldState: { invalid, isTouched, isDirty, error },
            formState: { errors }
          }) => (
            <View style={styles.input}>
              <TextInput
                label={translations.status}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={invalid}
                ref={ref}
                mode="outlined"
              />

              {invalid && (
                <HelperText type="error" visible={invalid}>
                  {error ? error.message : null}
                </HelperText>
              )}
            </View>
          )}

        />

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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  modalContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
    backgroundColor: "#fff",
    width: "90%",
    maxWidth: 400,
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
