import { BUCKET_ID, CLASSIFIED_ADS_COLLECTION_ID, client, databases, DB_ID, RealTimeResponse, storage } from '@/lib/appwrite'
import { useAuth } from '@/lib/auth-context'
import { ClassifiedAds } from '@/types/database.type'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Searchbar, Text } from 'react-native-paper'

const MainPage = () => {
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAds[]>([])
  const [classifiedAdsImages, setClassifiedAdsImages] = useState<string[]>([])
  const [search, setSearch] = useState<string>("")
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const channel = `databases.${DB_ID}.collections.${CLASSIFIED_ADS_COLLECTION_ID}.documents`
      const subscription = client.subscribe(
        channel,
        (response: RealTimeResponse) => {
          if (response.events.includes("databases.*.collections.*.documents.*.create")) {
            fetchClassifiedAds()
          }
          else if (response.events.includes("databases.*.collections.*.documents.*.update")) {
            fetchClassifiedAds()
          }
          else if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
            fetchClassifiedAds()
          }
        }
      )

      fetchClassifiedAds()

      return () => {
        subscription()
      }
    }
  }, [user])


  const fetchClassifiedAds = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, CLASSIFIED_ADS_COLLECTION_ID)
      const ads = response.documents as unknown as ClassifiedAds[]
      setClassifiedAds(ads)

      const firstImageId = ads.map(ad => ad.images[0])

      const fetchedImages = await fetchImages(firstImageId)

      setClassifiedAdsImages(fetchedImages)
    } catch (error) {
      console.log(error)
    }
  }

  const fetchImages = async (imgIds: string[]) => {
    try {
      const imagePromises = imgIds.map(id =>
        storage.getFileViewURL(BUCKET_ID, id).href
      )

      return await Promise.all(imagePromises)
    } catch (error) {
      console.log(error)
      return []
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Searchbar placeholder='Search' style={styles.search} onChangeText={setSearch} value={search} />
      <FlatList 
        style={{ flex: 1, paddingVertical: 25}}
        data={classifiedAds}
        keyExtractor={item => item.$id}
        renderItem={({item, index}) => (
          <Pressable style={styles.adContainer}>
            <Image style={styles.image} 
              source={
                classifiedAdsImages[index]
                  ? { uri: classifiedAdsImages[index] }
                  : require('../../assets/images/empty-image.jpg')
              }
            />
            <View style={styles.textContainer}>
              <Text style={styles.title}> {item.title} </Text>
              <Text style={styles.price}> {item.price} </Text>
              <MaterialIcons style={styles.arrow} name="arrow-forward-ios" size={24} color="black" />
            </View>
          </Pressable>
        )}
        ListEmptyComponent={<Text>No classified ads yet.</Text>}
        showsVerticalScrollIndicator={false}
      />
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
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
    maxWidth: 180,
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
    maxWidth: 150,
    maxHeight: 70,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  price: {
    position: 'absolute',
    marginTop: 80,
    color: "#16b919ff",
  },
  arrow: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: 40,
    marginLeft: 140,
    left: 20,
    fontSize: 20
  },
  search: {
    marginTop: 25,
    marginBottom: 10
  }
})