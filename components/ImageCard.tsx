import React from 'react'
import { Image, StyleSheet, View } from 'react-native'

type Props = {
    uri: string
}

const ImageCard = ( {uri}: Props ) => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={ {uri} }/>
    </View>
  )
}

export default ImageCard

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    resizeMode: "cover",
    width: 100,
    height: 100,
    borderRadius: 5,
    backgroundColor: "#D3D3D3",
    padding: 15,
    marginHorizontal: 5,
    
  }
})
