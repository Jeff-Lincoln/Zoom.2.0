import * as React from 'react';
import { TextInput, Button, View, Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
      Alert.alert('Verification code sent', 'Please check your email for the verification code.');
    } catch (err: any) {
      Alert.alert('Sign Up Error', JSON.stringify(err.errors[0]?.message || err.message));
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/');
      } else {
        Alert.alert('Verification Error', JSON.stringify(completeSignUp));
      }
    } catch (err: any) {
      Alert.alert('Verification Error', JSON.stringify(err.errors[0]?.message || err.message));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <View style={styles.innerContainer}>
        {!pendingVerification ? (
          <>
            <Text style={styles.title}>Create an Account</Text>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Email"
              onChangeText={setEmailAddress}
              placeholderTextColor="#999"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Password"
              secureTextEntry={true}
              onChangeText={setPassword}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.signUpButton} onPress={onSignUpPress}>
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Verify Your Email</Text>
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Verification Code"
              onChangeText={setCode}
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.verifyButton} onPress={onPressVerify}>
              <Text style={styles.verifyButtonText}>Verify Email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  innerContainer: {
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: '#5F5DEC',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
