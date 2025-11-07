import ClassifiedAdsDetails from '@/components/ClassifiedAdsDetails'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const AdDetails = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <View>
      <ClassifiedAdsDetails id={id} />
    </View>
  )
}

export default AdDetails

const styles = StyleSheet.create({})  