
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const { signIn, signUp } = useAuth()

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill all fields")
      return
    }

    if (password.length < 6) {
      setError("Passwords must be at least 6 characters long.")
      return
    }

    setError(null)

    if(isSignUp) {
      const error = await signUp(email, password)

      if (error) {
        setError(error)
        return
      }

      router.replace("/")
    }
    else {
      const error = await signIn(email, password)

      if (error) {
        setError(error)
        return
      }

      router.replace("/")
    }
  }

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev)
    setError(null)
  }


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant='headlineLarge' style={styles.title}>
           { isSignUp ? "Create Account" : "Welcome Back!" } 
        </Text>

        <TextInput 
          mode='outlined'
          label={"Email"}
          activeOutlineColor='#466145'
          style={styles.input}
          onChangeText={setEmail}
          autoCapitalize='none'
          autoCorrect={false}
          textContentType='emailAddress'
        />

        <TextInput 
          mode="outlined"
          label="Password"
          activeOutlineColor='#466145'
          style={styles.input}
          secureTextEntry
          onChangeText={setPassword}
          autoCapitalize='none'
          autoCorrect={false}
          textContentType='password'
        />

        { error && <Text style={styles.error}> { error } </Text>}

        <Button mode='contained' style={styles.button} onPress={handleAuth}>
          { isSignUp ? "Sign up" : "Sign in"}
        </Button>

        <Button mode='text' textColor='black' onPress={handleSwitchMode}>
          { isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

export default AuthScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee6a9ff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    borderWidth: 1
  },
  title: {
    marginBottom: 70,
    textAlign: "center"
  },
  input: {
    height: 40,
    borderColor: "#D8DAA7",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#577A56",
    marginTop: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
  }
})
