import { Models } from "react-native-appwrite";

export interface ClassifiedAds extends Models.Document {
    user_id: string,
    title: string,
    description: string,
    price: string,
    images: string[],
}