import { Account, Client, Databases, Storage } from 'react-native-appwrite'

export const client = new Client()
.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
.setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)
.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

export const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!
export const CLASSIFIED_ADS_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!

export const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_IMAGE_BUCKET_ID!

export interface RealTimeResponse {
    events: string[],
    payload: any,
}
