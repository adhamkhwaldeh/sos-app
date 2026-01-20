import { ThemedView } from '@/src/components/themed-view';
import { ThemeMode, useTheme } from '@/src/context/ThemeContext';
import DimensHelper from '@/src/helpers/DimensHelper';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { Fonts } from '@/src/styles/theme';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Divider, List, Menu, Switch, Text, useTheme as usePaperTheme } from 'react-native-paper';

export default function SettingsScreen() {

    const { translations, setAppLanguage } = useContext(LocalizationContext);
    const handleSetLanguage = async (language: string) => {
        await setAppLanguage(language);
    };

    const { themeMode, setThemeMode, theme } = useTheme();
    const paperTheme = usePaperTheme();

    const [menuVisible, setMenuVisible] = useState(false);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const handleThemeChange = (mode: ThemeMode) => {
        setThemeMode(mode);
    };

    return (
        <ThemedView style={{ flex: 1 }}>
            <Appbar.Header style={{ backgroundColor: 'rgba(0, 210, 238, 1)' }}>
                <Appbar.Content title={translations.settings} titleStyle={{ fontFamily: Fonts.rounded, color: 'white' }} />
            </Appbar.Header>

            <ScrollView style={styles.container}>
                <List.Section>
                    <List.Subheader style={{ fontFamily: Fonts.rounded }}>{translations.appearance}</List.Subheader>

                    <List.Item
                        title={translations.darkMode}
                        description={translations.toggleBetweenLightAndDarkTheme}
                        left={props => <List.Icon {...props} icon="brightness-6" />}
                        right={() => (
                            <Switch
                                value={theme === 'dark'}
                                onValueChange={(value) => handleThemeChange(value ? 'dark' : 'light')}
                                color="rgba(0, 210, 238, 1)"
                            />
                        )}
                    />

                    <Divider />

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
                    />
                </List.Section>
                <View>
                    <Text style={{ margin: DimensHelper.marginMd }}>
                        {translations.profileDetails}
                    </Text>

                    {/* style={styles.normalButtonMargin} */}
                    <Menu
                        visible={menuVisible}
                        onDismiss={closeMenu}
                        anchor={
                            <Button
                                mode="contained"
                                onPress={openMenu}
                                style={{ marginHorizontal: DimensHelper.marginMd }}
                            >
                                {translations.changeLanguage} ({translations.getLanguage().toUpperCase()})
                            </Button>
                        }>
                        <Menu.Item onPress={() => { handleSetLanguage('en'); closeMenu(); }} title="English" />
                        <Menu.Item onPress={() => { handleSetLanguage('ar'); closeMenu(); }} title="العربية" />
                        <Menu.Item onPress={() => { handleSetLanguage('de'); closeMenu(); }} title="Deutsch" />
                    </Menu>

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
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
