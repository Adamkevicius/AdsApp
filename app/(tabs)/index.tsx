import AnimatedCircularProgressBar from '@/components/AnimatedCircularProgressBar'
import { BUCKET_ID, CLASSIFIED_ADS_COLLECTION_ID, client, databases, DB_ID, RealTimeResponse, storage } from '@/lib/appwrite'
import { useAuth } from '@/lib/auth-context'
import { ClassifiedAds } from '@/types/database.type'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'
import { Searchbar, Text } from 'react-native-paper'

const MainPage = () => {
  const [classifiedAds, setClassifiedAds] = useState<ClassifiedAds[]>([])
  const [classifiedAdsImages, setClassifiedAdsImages] = useState<string[]>([])
  const [search, setSearch] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<string>("")
  const [filteredAds, setFilteredAds] = useState<ClassifiedAds[]>([])
  const { user } = useAuth()

  const dropDownData = [
    { label: "Show my", value: "Show my" },
    { label: "Show all", value: "Show all" },
    { label: "Oldest", value: "Oldest" },
    { label: "Newest", value: "Newest" },
  ]

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000))

      if (user) {
        const channel = `databases.${DB_ID}.collections.${CLASSIFIED_ADS_COLLECTION_ID}.documents`
        const subscription = client.subscribe(
          channel,
          (response: RealTimeResponse) => {
            if (
              response.events.includes("databases.*.collections.*.documents.*.create") || 
              response.events.includes("databases.*.collections.*.documents.*.update") || 
              response.events.includes("databases.*.collections.*.documents.*.delete")) 
            {
              fetchClassifiedAds()
            }
          }
        )

       fetchClassifiedAds()
       filterItems()
       return () => {
          subscription()
        }
      }
    }

    init()
    
  }, [user])

  useEffect(() => {
    filterItems()
  }, [filter, classifiedAds])


  const fetchClassifiedAds = async () => {
    try {
      const response = await databases.listDocuments(DB_ID, CLASSIFIED_ADS_COLLECTION_ID)
      const ads = response.documents as unknown as ClassifiedAds[]
      setClassifiedAds(ads)

      const imagesFirstIds = await getImageFirstId(ads)

      setClassifiedAdsImages(imagesFirstIds)

      setIsLoading(false)
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

  const filterItems = async () => {
    if (filter === "Show my") {
      const filteredItems = classifiedAds.filter(item => item.user_id === user?.$id)

      const imagesFirstIds = await getImageFirstId(filteredItems)

      setFilteredAds(filteredItems)
      setClassifiedAdsImages(imagesFirstIds)
    }
    else if (filter === "Show all") {
      setFilteredAds(classifiedAds)

      const imagesFirstIds = await getImageFirstId(classifiedAds)

      setClassifiedAdsImages(imagesFirstIds)

    }
    else if (filter === "Oldest") {
      const sortedItems = [...classifiedAds].sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime())

      const imagesFirstIds = await getImageFirstId(sortedItems)

      setFilteredAds(sortedItems)
      setClassifiedAdsImages(imagesFirstIds)
    }
    else if (filter === "Newest") {
      const sortedItems = [...classifiedAds].sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime())
      
      const imagesFirstIds = await getImageFirstId(sortedItems)

      setFilteredAds(sortedItems)
      setClassifiedAdsImages(imagesFirstIds)
    }
    else {
      setFilteredAds(classifiedAds)
    }
  }

  const getImageFirstId = async (imagesArray: ClassifiedAds[]) => {
    const firstImageId = imagesArray.map(ad => ad.images[0])

      const filteredImagesIds = await fetchImages(firstImageId) 

      return filteredImagesIds
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      { isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <AnimatedCircularProgressBar />
          </View>
      ) : (
          <View style={{ height: "100%"}}>
            <Searchbar placeholder='Search' style={styles.search} onChangeText={setSearch} value={search} />
            <FlatList 
              style={{ flex: 1}}
              data={filteredAds}
              keyExtractor={item => item.$id}
              renderItem={({item, index}) => (
                <Pressable style={styles.adContainer} onPress={() => router.push(`/ad-details/${item.$id}`)}>
                  { item.images.length === 0 ? (
                    <Image style={styles.image} source={require('../../assets/images/empty-image.jpg')} />
                  ) : (
                    <Image style={styles.image} source={ { uri: classifiedAdsImages[index] } }
                  />
                  )}
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
            <View style={styles.filterContainer}>
                <Dropdown 
                  style={styles.dropdown}
                  itemTextStyle={{fontSize: 12}}
                  dropdownPosition='top' 
                  data={dropDownData}
                  labelField={"label"}
                  valueField={"value"}
                  placeholder=''
                  onChange={item => setFilter(item.value)}
                  renderLeftIcon={() => (<MaterialCommunityIcons style={{ marginLeft: 32 }} name="filter-outline" size={24} color="black" />)}
                  renderRightIcon={() => null}
                  renderInputSearch={() => null}
                />              
            </View>
          </View>
      )}
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
    marginBottom: 20
  },
  filterContainer: {
    flex: 1,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    position: "absolute",
    marginTop: 600,
  },
  dropdown: {
    width: 90,
    height: 100,
    justifyContent: 'center'
  }
})