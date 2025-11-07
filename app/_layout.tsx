import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { ReactNode, useEffect, useState } from "react";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

const RouteGuard = ({children}: {children: ReactNode}) => {

  const router = useRouter()
  const [ready, setReady] = useState(false)
  const { user, isLoadingUser } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    setReady(true)
  }, [])
  
  useEffect(() => {
    const inAuthGroup = segments[0] === "auth"
    if (ready && !user && !inAuthGroup && !isLoadingUser) {
      router.replace('/auth')
    }
    else if (user && inAuthGroup && !isLoadingUser) {
      router.replace("/")
    }
  }, [ready, user, segments, router])

  if (!ready) return null

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="auth" options={{headerShown: false}} />
                <Stack.Screen name="(tabs)" options={{headerShown: false}} />
                <Stack.Screen 
                  name="ad-details/[id]" 
                  options={{
                    headerShown: true,
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: "#eee6a9ff" },
                    headerTitle: "",
                    headerBackButtonDisplayMode: 'generic'
                  }} 
                />
              </Stack>
            </RouteGuard>
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
