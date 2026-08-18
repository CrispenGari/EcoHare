import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "@/src/constants";
import {
  AuthButton,
  AuthInput,
  AuthScreen,
} from "@/src/components/AuthKit/AuthKit";
import { useSettingsStore } from "@/src/store/settingsStore";
import { onImpact } from "@/src/utils";
import { useRouter } from "expo-router";

const Page = () => {
  const [state, setState] = React.useState({
    email: "",
    loading: false,
    error: "",
  });

  const router = useRouter();
  const { settings } = useSettingsStore();
  const handleSendCode = async () => {
    if (settings.haptics) {
      await onImpact();
    }
    router.push({
      pathname: "/(auth)/reset-password",
      params: {
        email: state.email.trim().toLowerCase(),
      },
    });
  };

  return (
    <AuthScreen
      title="Forgot password?"
      subtitle="Enter your registered UFH email and we will send you a six-digit verification code."
      footer={
        <Pressable
          onPress={async () => {
            if (settings.haptics) {
              await onImpact();

              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace({ pathname: "/(auth)/login" });
              }
            }
          }}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back-outline"
            size={17}
            color={COLORS.primary}
          />

          <Text style={styles.link}>Back to sign in</Text>
        </Pressable>
      }
    >
      <View style={styles.notice}>
        <Ionicons name="mail-unread-outline" size={25} color={COLORS.black} />
        <Text style={styles.noticeText}>
          Use the @ufh.ac.za email associated with your staff account.
        </Text>
      </View>

      <AuthInput
        label="UFH email"
        placeholder="name@ufh.ac.za"
        value={state.email}
        onChangeText={(email) => setState((s) => ({ ...s, email }))}
        leftIcon="mail-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        error={state.error}
      />

      <AuthButton
        title="Send verification code"
        onPress={handleSendCode}
        disabled={!state.email.trim()}
        loading={state.loading}
        variant="secondary"
      />
    </AuthScreen>
  );
};

export default Page;
const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 15,
    backgroundColor: COLORS.tertiary,
  },
  noticeText: {
    flex: 1,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 17,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  link: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
});
