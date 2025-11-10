import AnimatedCircularProgressBar from "@/components/AnimatedCircularProgressBar";
import ImageCard from "@/components/ImageCard";
import { BUCKET_ID, CLASSIFIED_ADS_COLLECTION_ID, databases, DB_ID, storage } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ID } from 'react-native-appwrite';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, TextInput } from 'react-native-paper';


const CreateAdvertisment = () => {
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [price, setPrice] = useState<string>("")
  const [currency, setCurrency] = useState<string>("€")
  const [images, setImages] = useState<string[]>([])
  const [contacts, setContacts] = useState<string>("")
  const [error, setError] = useState<string | null>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useAuth()
  const router = useRouter()

    let currencyData = [
    {label: "€", value: "€"},
    {label: "$", value: "$"},
  ]

  const pickImage = async () => {
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
        selectionLimit: 5
      })

      if(!result.canceled) {
        for (let i = 0; i < result.assets.length; i++) {
          pickedImages.push(result.assets[i].uri)
        }

        setImages(pickedImages)
        setError(null)
      }
    }
  }

  const storeImages = async () => {
    if (images.length === 0) return

    const numberOfImages = images.length
    const uploadedImagesIds = []

    for (let i = 0; i< numberOfImages; i++) {
      try {
        const uploadImage = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          {
            name: 'image.jpg',
            type: 'image/jpeg',
            size: 1234567,
            uri: images[i]
          }
        )

        uploadedImagesIds.push(uploadImage.$id)
      } catch (error) {
        Alert.alert(
          "Failed",
          "Failed to upload images."
        )
      }
    }

    return uploadedImagesIds
  }

  const handlePost = async () => {
    setIsLoading(true)
    try {
      if (!user) return

      var imagesIds = await storeImages()

      await databases.createDocument(
        DB_ID,
        CLASSIFIED_ADS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          price: price + currency,
          images: imagesIds,
          contacts: contacts
        }
      )

      router.back()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        return
      }

      setError("There was an error occured while creating classified ads.")
    }

    setTitle("")
    setDescription("")
    setPrice("")
    setImages([])
    setContacts("")

    setIsLoading(false)
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >      
      {isLoading ? (
        <AnimatedCircularProgressBar />
      ) : (
        <View style={[styles.content, styles.shadowProp]}>
          <TextInput 
            mode='outlined' 
            label={"Title"} 
            style={styles.input}
            textColor="#000000"
            outlineColor="#f2efefff"
            activeOutlineColor='#466145'
            value={title}
            onChangeText={setTitle}
          />
        

          <TextInput 
            mode='outlined' 
            label={"Description"} 
            textColor="#000000"
            multiline={true}
            numberOfLines={8}
            style={styles.descriptionInput}
            outlineColor="#f2efefff"
            activeOutlineColor='#466145'
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.priceContainer}>
            <TextInput 
              mode='outlined' 
              label={"Price"} 
              textColor="#000000"
              style={styles.priceInput}
              outlineColor="#f2efefff"
              activeOutlineColor='#466145'
              value={price}
              onChangeText={setPrice}
            />
            <Dropdown 
              style={styles.dropdown} 
              data={currencyData} 
              labelField={"label"} 
              valueField={"value"} 
              placeholder="€" value={currency}
              onChange={item => setCurrency(item.value)}
            />
          </View>

          {images ? (
            <ScrollView
            style={styles.imagesContainer}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
            >
              {images.map((uri, index) => (
                <ImageCard key={index} uri={uri} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.error}> {error} </Text>
          )}

          <Button mode="text" textColor="#000000" style={images.length === 0 ? {marginTop: -33} : {marginTop: 0}} onPress={pickImage}>
            Choose image
          </Button>

          <TextInput 
            mode='outlined' 
            label={"Contacts"} 
            style={[styles.input, {marginTop: 25}]}
            textColor="#000000"
            outlineColor="#f2efefff"
            activeOutlineColor='#466145'
            value={contacts}
            onChangeText={setContacts}
          />

          <Button mode='contained' textColor="#FDFDFB" style={styles.button} onPress={handlePost}>Post</Button>    
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

export default CreateAdvertisment

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: "#eee6a9ff",
  },
  content: {
    padding: 25,
  },
  input: {
    height: 40,
    backgroundColor: "#FDFDFB",
    marginBottom: 10,
  },
  descriptionInput: {
    height: 150,
    backgroundColor: "#FDFDFB",
    marginBottom: 10  
  },
  button: {
    backgroundColor: "#577A56",
    marginTop: 10,
    fontWeight: "bold"
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#FDFDFB",
    marginRight: 5
  },
  dropdown: {
    width: 50,
    height: 50,
    padding: 10,
    marginBottom: -6,
    borderRadius: 5,
    backgroundColor: "#FDFDFB",
  },  
  imagesContainer: {
    backgroundColor: "#FDFDFB",
    // height: 100,
    marginTop: 25,
    borderRadius: 5,
    padding: 15,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  error: {
    color: "red",
    textAlign: "center",
  },
})