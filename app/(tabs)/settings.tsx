import { ThemedView } from '@/src/components/themed-view';
import { ThemeMode, useTheme } from '@/src/context/ThemeContext';
import DimensHelper from '@/src/helpers/DimensHelper';
import { LocalizationContext } from '@/src/localization/LocalizationContext';
import { Fonts } from '@/src/styles/theme';
import { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, Divider, List, Switch, Text, useTheme as usePaperTheme } from 'react-native-paper';

export default function SettingsScreen() {

    const { translations, setAppLanguage } = useContext(LocalizationContext);
    const handleSetLanguage = async (language: string) => {
        setAppLanguage(language);
    };

    const { themeMode, setThemeMode, theme } = useTheme();
    const paperTheme = usePaperTheme();

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
                    <List.Subheader style={{ fontFamily: Fonts.rounded }}>Appearance</List.Subheader>

                    <List.Item
                        title="Dark Mode"
                        description="Toggle between light and dark theme"
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
                        title="Follow System"
                        description="Use system theme settings"
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
                    <Button
                        mode="contained"

                        onPress={() => {
                            if (translations.getLanguage() == 'ar') {
                                handleSetLanguage('en');
                            } else {
                                handleSetLanguage('ar');
                            }
                            // navigation.pop();
                        }}>
                        {/* style={styles.buttonText} */}
                        <Text >{translations.changeLanguage}</Text>
                    </Button>

                </View>

                <List.Section>
                    <List.Subheader style={{ fontFamily: Fonts.rounded }}>About</List.Subheader>
                    <List.Item
                        title="Version"
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
