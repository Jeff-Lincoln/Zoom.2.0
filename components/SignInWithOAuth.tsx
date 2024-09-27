import React, { useCallback, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { useOAuth } from '@clerk/clerk-expo';
import StyledButton from './StyledButton';

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Warm up the Android browser for smoother OAuth flow
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const SignInWithOAuth = () => {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL('/dashboard', { scheme: 'myapp' }), // Make sure 'myapp' scheme is configured in app.json
      });

      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
      } else {
        // Handle additional steps like MFA if needed
        Alert.alert('Sign-in', 'Sign-in requires additional steps.');
      }
    } catch (err) {
      console.error('OAuth error', err);
      Alert.alert('OAuth Error', 'Failed to sign in with Google. Please try again.');
    }
  }, [startOAuthFlow]); // Add startOAuthFlow as a dependency

  return (
    <StyledButton title="Sign in with Google" onPress={onPress} />
  );
};

export default SignInWithOAuth;
