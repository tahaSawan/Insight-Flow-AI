import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: true,
              presentation: 'modal',
              headerStyle: { backgroundColor: '#12121A' },
              headerTintColor: '#FFFFFF',
              title: 'Settings',
            }}
          />
        </Stack>
      </AppProvider>
    </ThemeProvider>
  );
}