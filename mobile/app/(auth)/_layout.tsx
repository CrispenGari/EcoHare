import { Stack } from "expo-router";
import React from "react";

const Layout = () => {
  return (
    <Stack
      initialRouteName="landing"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="landing" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
};

export default Layout;
