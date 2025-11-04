import { CLASSIFIED_ADS_COLLECTION_ID, databases, DB_ID } from '@/lib/appwrite'
import { ClassifiedAds } from '@/types/database.type'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

const MainPage = () => {
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAds[]>()

  useEffect(() => {
    fetchClassifiedAds()
  }, [])

  const fetchClassifiedAds = async () => {
    try {
      const response = await databases.listDocuments(
        DB_ID,
        CLASSIFIED_ADS_COLLECTION_ID,
      )
      setClassifiedAds(response.documents as unknown as ClassifiedAds[])
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={{ flex: 1, paddingVertical: 25}}>
        {classifiedAds?.length === 0 ? (
        <Text>No classified ads yet.</Text>
      ) : (
        classifiedAds?.map((item, key) => (
          <Pressable style={styles.adContainer} key={key}>
            {item.images.length === 0 ? (
            <Image style={styles.image} source={require('/Users/matvej/VSCode Projects/AdsApp/assets/images/empty-image.jpg')}/>
            ) : (
              <Image style={styles.image} source={ { uri: item.images[0] } }/> 
            )}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{ item.title }</Text>
              <Text style={styles.price}>{ item.price }</Text>
            </View>
            <MaterialIcons style={styles.arrow} name="arrow-forward-ios" size={24} color="black" />
        </Pressable>
        ))
      )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default MainPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
    backgroundColor: "#eee6a9ff"
  },
  adContainer: {
    flexDirection: 'row',
    padding: 10,
    marginBottom: 25,
    backgroundColor: "#FDFDFB",
    borderColor: "#D8DAA7",
    borderWidth: 1,
    borderRadius: 15,
  },
  textContainer: {
    flexDirection: 'column',
    width: 150,
    maxWidth: 150,
    maxHeight: 100,
    marginLeft: 30,
  },
  image: {
    resizeMode: 'cover',
    width: 100,
    height: 100,
    borderRadius: 15,
    padding: 5
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  price: {
    marginTop: 50,
    color: "#16b919ff"
  },
  arrow: {
    alignSelf: 'center',
    left: 15,
  },
})