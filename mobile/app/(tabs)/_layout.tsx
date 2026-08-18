import HomeHeader from "@/src/components/Headers/HomeHeader";
import SettingsHeader from "@/src/components/Headers/SettingsHeader";
import { COLORS, FONTS } from "@/src/constants";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { useSettingsStore } from "@/src/store/settingsStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const Layout = () => {
  const { settings } = useSettingsStore();
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const TAB_WIDTH = Math.min(width - 40, isTablet ? 500 : 430);
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.tertiary,
          elevation: 0,
          width: TAB_WIDTH,
          bottom: bottom + 20,
          borderRadius: 999,
          height: isTablet ? "auto" : 75,
          position: "absolute",
          marginLeft: width / 2 - TAB_WIDTH / 2,
        },
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: COLORS.main,
        tabBarActiveTintColor: COLORS.primary,
        headerShown: true,
        tabBarLabelStyle: {
          display: "none",
        },
        tabBarItemStyle: {},
        tabBarIconStyle: {
          marginTop: 10,
        },
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={1}
            style={[StyleSheet.absoluteFill]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <View
              style={[
                styles.iconBtn,
                {
                  width: TAB_WIDTH / 5,
                },
              ]}
            >
              <MaterialCommunityIcons name="brain" size={size} color={color} />
              <Text
                style={{
                  color,
                  fontFamily: FONTS.bold,
                  fontSize: isTablet ? 12 : 10,
                }}
              >
                Home
              </Text>
            </View>
          ),
          header: () => <HomeHeader />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <View
              style={[
                styles.iconBtn,
                {
                  width: TAB_WIDTH / 5,
                },
              ]}
            >
              <Ionicons name="settings-outline" color={color} size={size} />
              <Text
                style={{
                  color,
                  fontFamily: FONTS.bold,
                  fontSize: isTablet ? 12 : 10,
                }}
              >
                Settings
              </Text>
            </View>
          ),
          headerShown: true,
          header: () => <SettingsHeader />,
        }}
      />
    </Tabs>
  );
};
export default Layout;

const styles = StyleSheet.create({
  iconBtn: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
  },
});
