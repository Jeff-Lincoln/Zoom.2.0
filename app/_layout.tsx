import React from 'react';
import * as SecureStore from 'expo-secure-store';
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo';
import { Slot } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (error) {
      console.error('SecureStore get item error: ', error);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore save token error: ', err);
    }
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

if (!publishableKey || publishableKey === '') {
  throw new Error(
    'Publishable Key is missing or not defined. Please check your .env file.'
  );
}

export default function App() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <ClerkLoaded>
        <RootSiblingParent>
        <SafeAreaProvider>
        <GestureHandlerRootView>
        <Slot />
        </GestureHandlerRootView>
      </SafeAreaProvider>
        </RootSiblingParent>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
