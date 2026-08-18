import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "@/src/constants";
import {
  AuthButton,
  AuthInput,
  AuthScreen,
} from "@/src/components/AuthKit/AuthKit";
import { onImpact } from "@/src/utils";
import { useSettingsStore } from "@/src/store/settingsStore";

const Page = () => {
  const [state, setState] = React.useState({
    email: "",
    loading: false,
    showPassword: false,
    password: "",
  });

  const router = useRouter();

  const { settings } = useSettingsStore();
  const handleLogin = async () => {
    if (settings.haptics) {
      await onImpact();
    }
  };

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Sign in to manage and resolve environmental reports across the Alice campus."
      footer={
        <View style={styles.row}>
          <Text style={styles.muted}>New to EcoHare?</Text>

          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.link}>Create staff account</Text>
          </Pressable>
        </View>
      }
    >
      <AuthInput
        label="UFH email"
        placeholder="name@ufh.ac.za"
        value={state.email}
        onChangeText={(e) => setState((s) => ({ ...s, email: e }))}
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="username"
      />

      <AuthInput
        label="Password"
        placeholder="Enter your password"
        value={state.password}
        onChangeText={(e) => setState((s) => ({ ...s, password: e }))}
        leftIcon="lock-closed-outline"
        rightIcon={state.showPassword ? "eye-off-outline" : "eye-outline"}
        onRightIconPress={() =>
          setState((s) => ({ ...s, showPassword: !s.showPassword }))
        }
        secureTextEntry={!state.showPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
      />

      <Pressable
        style={styles.forgot}
        onPress={async () => {
          if (settings.haptics) {
            await onImpact();
          }

          router.navigate({ pathname: "/(auth)/forgot-password" });
        }}
      >
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>

      <AuthButton
        title="Sign in"
        onPress={handleLogin}
        disabled={!state.email.trim() || !state.password}
        loading={state.loading}
        variant="secondary"
      />
    </AuthScreen>
  );
};

export default Page;
const styles = StyleSheet.create({
  forgot: {
    alignSelf: "flex-end",
    marginTop: -6,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
  },
  muted: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  link: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
