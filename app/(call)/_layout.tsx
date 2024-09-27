import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';

const CallRoutesLayout = () => {
  const { isSignedIn } = useAuth();

  // Redirect to auth page if not signed in
  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={({ route }) => ({
          header: () => null,
          tabBarActiveTintColor: '#5F5DEC',
          tabBarStyle: {
            display: route.name === '[id]' ? 'none' : 'flex',
          },
          tabBarLabelStyle: {
            zIndex: 100,
            paddingBottom: 5,
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'All Calls',
            tabBarIcon: ({ color }) => (
              <Ionicons name="call-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="join"
          options={{
            title: 'Join Call',
            headerTitle: 'Enter the Room ID',
            tabBarIcon: ({ color }) => (
              <Ionicons name="enter-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default CallRoutesLayout;
