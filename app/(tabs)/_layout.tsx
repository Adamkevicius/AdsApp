import { useAuth } from '@/lib/auth-context';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

const TabsLayout = () => {
    const { signOut } = useAuth()
  return (
    <Tabs
        screenOptions={{
            headerStyle: { backgroundColor: "#eee6a9ff" },
            headerShadowVisible: false,
            tabBarStyle: {
                backgroundColor: "#FDFDFB",
            },
            tabBarActiveTintColor: "#379534ff",
            tabBarInactiveTintColor: "#6C7A63"
        }}
    >
        <Tabs.Screen 
            name="index" 
            options={{
                title: "Advertisments",
                headerTitleStyle: styles.tabBarTitle,
                headerRight: () => (
                <Pressable style={styles.tabBarButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={24} color="black" />
                </Pressable>
            ),
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons
                        name='advertisements'
                        size={size}
                        color={color} 
                    />
                )
            }}
        />
        
        <Tabs.Screen 
            name="create-ad"
            options={{
                title: "Post an Ad",
                headerTitleStyle: styles.tabBarTitle,
                headerRight: () => (
                <Pressable style={styles.tabBarButton} onPress={signOut}>
                    <Ionicons name="log-out-outline" size={24} color="black" />
                </Pressable>
            ),
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons 
                        name='post-add'
                        size={size}
                        color={color}
                    />
                )
                
            }}
        />
    </Tabs>
  )
}

export default TabsLayout

const styles = StyleSheet.create ({
    tabBarTitle: {
        fontSize: 24,
        fontWeight: "bold"
    },
    tabBarButton: {
        marginRight: 25
    }
})