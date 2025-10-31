import { AuthProvider } from "@/lib/auth-context";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

// const RouteGuard = ({children}: {children: ReactNode}) => {
//   const router = useRouter()
//   const { user, isLoadingUser } = useAuth()
//   const segments = useSegments()

//   useEffect(() => {
//     const inAuthGroup = segments[0] === "auth"

//     if (!user && !inAuthGroup && !isLoadingUser) {
//       router.replace('/auth')
//     }
//     else if (user && inAuthGroup && !isLoadingUser) {
//       console.log("Authenticated")
//       // router.replace('/')
//     }
//   }, [user, segments, router])

//   return <> {children} </>
// }

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="index" options={{headerShown: false}} />
        </Stack>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
