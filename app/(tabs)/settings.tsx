import { useThemeContext } from '@/src/context/ThemeContext';
import DimensHelper from '@/src/helpers/DimensHelper';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { Fonts } from '@/src/styles/theme';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, List, Switch, Text, useTheme } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

export default function SettingsScreen() {

    const { translations, setAppLanguage } = useContext(LocalizationContext);
    const theme = useTheme();
    const { isDark, setThemeMode } = useThemeContext();

    const handleSetLanguage = async (language: string) => {
        await setAppLanguage(language);
    };

    const [selectedLanguage, setSelectedLanguage] = useState(translations.getLanguage());

    const languageOptions = [
        { label: 'English', value: 'en' },
        { label: 'العربية', value: 'ar' },
        { label: 'Deutsch', value: 'de' },
    ];

    const handleThemeToggle = async (value: boolean) => {
        await setThemeMode(value ? 'dark' : 'light');
    };

    return (
        <View style={{ flex: 1 }}>
            <Appbar style={{ backgroundColor: theme.colors.primary }}>
                <Appbar.Content title={translations.settings} titleStyle={theme.fonts.titleLarge} />
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
                                value={isDark}
                                onValueChange={handleThemeToggle}
                                color="rgba(0, 210, 238, 1)"
                            />
                        )}
                    />

                </List.Section>
                <View>
                    <Text style={{ margin: DimensHelper.marginMd }}>
                        {translations.profileDetails}
                    </Text>

                    <View style={{ margin: DimensHelper.marginMd }}>
                        <Dropdown
                            label={translations.changeLanguage}
                            options={languageOptions}
                            value={selectedLanguage}
                            onSelect={(value: any) => {
                                setSelectedLanguage(value);
                                handleSetLanguage(value);
                            }}
                            hideMenuHeader={true}
                            mode="outlined"
                        />
                    </View>

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
