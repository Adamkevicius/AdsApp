import { BUCKET_ID, CLASSIFIED_ADS_COLLECTION_ID, databases, DB_ID, storage } from '@/lib/appwrite'
import { useAuth } from '@/lib/auth-context'
import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-paper'

type props = {
    id: string
}

type ClassifiedAds = {
    id: string,
    user_id: string
    title: string,
    description: string,
    price: string,
    images: string[],
    contacts: string
}

const ClassifiedAdsDetails = ({id}: props) => {
    const [classifiedAds, setClassifiedAds] = useState<ClassifiedAds>()
    const [images, setImages] = useState<string[]>([])
    const [userId, setUserId] = useState<string>("")
    const { user } = useAuth()

    useEffect(() => {
        fetchClassifiedAd()
    }, [])

    const fetchClassifiedAd = async () => {
        try {
            const response = await databases.getDocument(
            {
                databaseId: DB_ID,
                collectionId: CLASSIFIED_ADS_COLLECTION_ID,
                documentId: id
            }
        )

        const ads = response as unknown as ClassifiedAds
        const imgUserId = ads.user_id

        setUserId(imgUserId)
        setClassifiedAds(ads)

        let imagesIds: string[] = []
        ads.images.forEach((image) => imagesIds.push(image))
        const fetchedImages = await fetchImages(imagesIds)

        setImages(fetchedImages)
        } catch (error) {
            console.log(error)
        }
    }

    const fetchImages = async (imagesIds: string[]) => {
        try {
            const imagePromises = imagesIds.map(id =>
                storage.getFileViewURL(BUCKET_ID, id).href
                )
            
            return await Promise.all(imagePromises)
        } catch (error) {
            console.log(error)
            return []
        }
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}> {classifiedAds?.title} </Text>
      <View style={styles.imageContainer}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
            {images.map((image, key) => (
                <Image style={styles.image} key={key} source={{ uri: image}}/>
            ))}
        </ScrollView>
      </View>
      <Text style={styles.price}> {classifiedAds?.price} </Text>
      <Text style={styles.contacts}> {classifiedAds?.contacts} </Text>
      <Text style={styles.description} > {classifiedAds?.description} </Text>

      {userId === user?.$id && (
        <View style={styles.buttonContainer}>
            <Button style={styles.editButton} mode='contained' textColor="#FDFDFB" onPress={() => {}}>Edit</Button>
            <Button style={styles.deleteButton} mode='contained' textColor="#FDFDFB" onPress={() => {}}>Delete</Button>
      </View>
      )}

      
    </View>
  )
}

export default ClassifiedAdsDetails

const styles = StyleSheet.create({
    container: {
        height: '100%',
        backgroundColor: "#eee6a9ff",
        padding: 25
    },
    title: {
        fontSize: 36,
        alignSelf: 'center',
        fontWeight: 'bold'
    },
    imageContainer: {
        backgroundColor: "#FDFDFB",
        borderRadius: 20,
        marginVertical: 25
    },
    image: {
        resizeMode: 'cover',
        width: 300,
        height: 200,
        borderRadius: 20,
        marginVertical: 25,
        marginHorizontal: 20
    },
    price: {
        fontSize: 20, 
        marginBottom: 5,
        fontWeight: 'bold'
    },
    contacts: {
        fontSize: 20
    },
    description: {
        fontSize: 16,
        backgroundColor: "#FDFDFB",
        fontWeight: 'semibold',
        height: 200,
        borderRadius: 20,
        marginVertical: 15,
        padding: 10,
        letterSpacing: 1,
        lineHeight: 22
    },
    buttonContainer: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    editButton: {
        width: 100,
        backgroundColor: "#577A56",
        right: 30
    },
    deleteButton: {
        width: 100,
        backgroundColor: "#D64545",
        left: 30
    }
})