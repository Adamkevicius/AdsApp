import React from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'

const MainPage = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
    </KeyboardAvoidingView>
  )
}

export default MainPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "#eee6a9ff"
  }
})