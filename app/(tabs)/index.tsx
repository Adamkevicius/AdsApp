import { useAuth } from '@/lib/auth-context'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'

const MainPage = () => {
  const { signOut } = useAuth()
  return (
    <View>
      <Button onPress={signOut}>Sign out</Button>
    </View>
  )
}

export default MainPage

const styles = StyleSheet.create({})