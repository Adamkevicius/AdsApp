import { BUCKET_ID, CLASSIFIED_ADS_COLLECTION_ID, databases, DB_ID, storage } from '@/lib/appwrite'
import { useAuth } from '@/lib/auth-context'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import * as ImagePicker from "expo-image-picker"
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { ID } from 'react-native-appwrite'
import { Button } from 'react-native-paper'
import AnimatedCircularProgressBar from './AnimatedCircularProgressBar'

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

const ClassifiedAdsDetails = ({ id }: props) => {
    const [images, setImages] = useState<string[]>([])
    const [userId, setUserId] = useState<string>("")
    const [imagesIds, setImagesIds] = useState<string[]>([])
    const [title, setTitle] = useState<string>("")
    const [contacts, setContacts] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    const [price, setPrice] = useState<string>("")
    const [editable, setEditable] = useState<boolean>(false)
    const [totalNumberOfImages, setTotalNumberOfImages] = useState<number>(0)
    const [temporaryDeletedImages ,setTemporaryDeletedImages] = useState<string[]>([])
    const [imagesIdsToDelete, setImagesIdsToDelete] = useState<string[]>([])
    const [onDelete, setOnDelete] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        const init = async () => {
            await new Promise(resolve => setTimeout(resolve, 1500))

            fetchClassifiedAd()
        }

        init()

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
        const numberOfImages = ads.images.length

        setTitle(ads.title)
        setPrice(ads.price)
        setContacts(ads.contacts)
        setDescription(ads.description)
        setUserId(imgUserId)
        setTotalNumberOfImages(numberOfImages)

        let imagesIds: string[] = []
        ads.images.forEach((image) => imagesIds.push(image))
        const fetchedImages = await fetchImages(imagesIds)

        setImagesIds(imagesIds)
        setImages(fetchedImages)

        setIsLoading(false)
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

    const deleteClassifiedAd = async () => {
        try {
            await databases.deleteDocument(
                DB_ID,
                CLASSIFIED_ADS_COLLECTION_ID,
                id
            )

            await Promise.all(
                imagesIds.map(imageId => storage.deleteFile(BUCKET_ID, imageId))
            ) 

            router.back()
        } catch (error) {
            console.log(error)
        }
    }

     const storeNewImages = async () => {
        const numberOfImages = images.length
        if (numberOfImages === 0 ) return

        const localFilteredImages = images.filter(image => !image.includes('https://'))
        const uploadedImagesIds = []

        try {
            for (let i = 0; i < localFilteredImages.length; i++) {
                const uploadNewImage = await storage.createFile(
                    BUCKET_ID,
                    ID.unique(),
                    {
                        name: 'image.jpg',
                        type: 'image/jpeg',
                        size: 1234567,
                        uri: localFilteredImages[i]
                    }
                )
                uploadedImagesIds.push(uploadNewImage.$id)
            }

            const newUploadedImagesIds = [...imagesIds, ...uploadedImagesIds]

            return newUploadedImagesIds
        } catch (error) {
            console.log("Error was occured while storing new images ", error)
        }
     }

    const updateClassifiedAdDetails = async () => {
        setIsLoading(true)
        try {

            const imagesIds: string[] = (await storeNewImages() ?? [])
            const totalImagesToDelete = imagesIdsToDelete.length

            if (totalImagesToDelete !== 0) {
                for (let i = 0; i < totalImagesToDelete; i++) {
                    await storage.deleteFile(
                        BUCKET_ID,
                        imagesIdsToDelete[i]
                    )
                }
            }

            await databases.updateDocument(
                DB_ID,
                CLASSIFIED_ADS_COLLECTION_ID,
                id, 
                {
                    title: title,
                    description: description,
                    price: price,
                    images: imagesIds,
                    contacts: contacts
                }
            )

            setEditable(false)
            setIsLoading(false)
        } catch (error) {
            console.log("Error was occured while updating details ", error)
        }
    }

    const deleteImage = async (imageUrl: string) => {
        const updatedImages = images.filter(image => image !== imageUrl)

        const deletedImageId = getImageIdFromUrl(imageUrl)

        setTemporaryDeletedImages(prev => [...prev, imageUrl])
        setImages(updatedImages)
        setImagesIdsToDelete(prev => [...prev, deletedImageId])
        setImagesIds(prev => prev.filter(id => id !== deletedImageId))
        setOnDelete(true)
    }

    const addImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
            const pickedImages: string[] = []
        
        
            if (status !== "granted") {
              Alert.alert(
                "Permission Denied",
                `Sorry, we need camera
                roll permission to upload images.`
              )
            }
            else {
              const result = await ImagePicker.launchImageLibraryAsync({
                allowsMultipleSelection: true,
                selectionLimit: 5 - totalNumberOfImages
              })
        
              if(!result.canceled) {
                for (let i = 0; i < result.assets.length; i++) {
                  pickedImages.push(result.assets[i].uri)
                }
        
            const newImages = [...images, ...pickedImages]
            const newNumber = newImages.length
            setImages(prev => [...prev, ...pickedImages])
            setTotalNumberOfImages(newNumber)
          }
        }

    }

    const exitEditing = () => {
        if (temporaryDeletedImages.length === 0) {
            setEditable(false)
        }
        else {
            fetchClassifiedAd()
            setEditable(false)
        }
    }

    const getImageIdFromUrl = (url: string) => {
        try {
            const match = url.match(/\/files\/([^/]+)/)
            return match ? match[1] : " "
        } catch (error) {
            console.log(error)
            return " "
        }
    }

  return (
    <View style={styles.container}>
      { isLoading ? (
        <AnimatedCircularProgressBar />
      ) : (
        <View>
            <View >
                <TextInput style={styles.title} editable={editable} value={title} onChangeText={setTitle}/>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} >
                    {images.map((image, key) => (
                        <View key={key}>
                            {editable ? (
                                <Pressable onPress={() => deleteImage(image)}>
                                    <MaterialCommunityIcons style={styles.deleteImageButton} name="close-circle-outline" size={24} color="black" />
                                </Pressable>
                            ) : (<></>)}
                            <Image 
                                style={
                                    [
                                        styles.image, 
                                        editable ? { marginTop: -15} : {marginTop: 0}, 
                                        totalNumberOfImages === 5 ? { marginBottom: 25} : { marginBottom: 0}
                                    ]
                                }  
                                key={key} 
                                source={{ uri: image}}/>
                        </View>
                    ))}
                </ScrollView>
                {editable && totalNumberOfImages < 5 && !onDelete ? (
                    <Button style={{ marginTop: 5}} mode='text' textColor='black' onPress={addImage}>Add Image</Button>
                ) : (<></>)}
            </View>

            <TextInput style={[styles.price, !editable ? {marginTop: 25} : {marginTop: 0}]} editable={editable} value={price} onChangeText={setPrice}/>
            <TextInput style={styles.contacts} editable={editable} value={contacts} onChangeText={setContacts}/>
            <TextInput style={styles.description} multiline={true} editable={editable} value={description} onChangeText={setDescription}/>
            {userId === user?.$id && (
                <View >
                    {!editable ? (
                        <View style={styles.buttonContainer}>
                            <Button style={styles.editButton} mode='contained' textColor="#FDFDFB" onPress={() => setEditable(true)}>Edit</Button>
                            <Button style={styles.deleteButton} mode='contained' textColor="#FDFDFB" onPress={deleteClassifiedAd}>Delete</Button>
                        </View>
                    ) : (
                        <View style={styles.buttonContainer}>
                            <Button style={styles.saveButton} mode='contained' textColor="#FDFDFB" onPress={updateClassifiedAdDetails}>Save</Button>
                            <Button style={styles.exitButton} mode='contained' textColor="#FDFDFB" onPress={exitEditing}>X</Button>
                        </View>
                    )}
                </View>
            )}
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
        marginBottom: 25,
        alignSelf: 'center',
        fontWeight: 'bold'
    },
    image: {
        resizeMode: 'cover',
        width: 300,
        height: 200,
        borderRadius: 20,
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
    },
    saveButton: {
        width: 250,
        backgroundColor: "#577A56",
        right: 20
    },
    exitButton: {
        width: 40,
        height: 40,
        backgroundColor: "#D64545",
    },
    deleteImageButton: {
        alignSelf: 'flex-end',
    }
    
})