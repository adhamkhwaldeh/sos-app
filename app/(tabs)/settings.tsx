// import { ThemeMode, useTheme } from '@/src/context/ThemeContext';
import DimensHelper from '@/src/helpers/DimensHelper';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { Fonts } from '@/src/styles/theme';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, List, Switch, Text, useTheme } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

export default function SettingsScreen() {

    const { translations, setAppLanguage } = useContext(LocalizationContext);
    const handleSetLanguage = async (language: string) => {
        await setAppLanguage(language);
    };

    const theme = useTheme();

    const [selectedLanguage, setSelectedLanguage] = useState(translations.getLanguage());


    const languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'العربية', value: 'ar' },
        { label: 'Deutsch', value: 'de' },
    ];

    return (
        <View style={{ flex: 1 }}>
            <Appbar style={{ backgroundColor: 'rgba(0, 210, 238, 1)' }}>
                <Appbar.Content title={translations.settings} titleStyle={{ fontFamily: Fonts.rounded, color: 'white' }} />
            </Appbar>

            <ScrollView style={styles.container}>
                <List.Section>
                    <List.Subheader style={{ fontFamily: Fonts.rounded }}>{translations.appearance}</List.Subheader>

                    <List.Item
                        title={translations.darkMode}
                        description={translations.toggleBetweenLightAndDarkTheme}
                        left={props => <List.Icon {...props} icon="brightness-6" />}
                        right={() => (
                            <Switch
                                value={theme.dark}
                                onValueChange={(value) => {
                                    theme.dark = value;

                                    // handleThemeChange(value ? 'dark' : 'light');
                                }}
                                color="rgba(0, 210, 238, 1)"
                            />
                        )}
                    />

                    {/* <Divider />

                    <List.Item
                        title={translations.followSystem}
                        description={translations.useSystemThemeSettings}
                        left={props => <List.Icon {...props} icon="cellphone-cog" />}
                        right={() => (
                            <Switch
                                value={themeMode === 'system'}
                                onValueChange={(value) => handleThemeChange(value ? 'system' : theme)}
                                color="rgba(0, 210, 238, 1)"
                            />
                        )}
                    /> */}

                </List.Section>
                <View>
                    <Text style={{ margin: DimensHelper.marginMd }}>
                        {translations.profileDetails}
                    </Text>

                    <Dropdown
                        label={translations.changeLanguage}

                        options={languageOptions}
                        value={selectedLanguage}
                        onSelect={(value: any) => {
                            setSelectedLanguage(value);
                            handleSetLanguage(value);
                        }}
                        mode="outlined"
                    />

                </View>

                <List.Section>
                    <List.Subheader style={{ fontFamily: Fonts.rounded }}>{translations.about}</List.Subheader>
                    <List.Item
                        title={translations.version}
                        description="1.0.0"
                        left={props => <List.Icon {...props} icon="information" />}
                    />
                </List.Section>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
