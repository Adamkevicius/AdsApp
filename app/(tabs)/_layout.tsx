import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  return (
    <Tabs
    screenOptions={{
        headerStyle: { backgroundColor: "#f5f5f5" },
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
                title: "Post ad",
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