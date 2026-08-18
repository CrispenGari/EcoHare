import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { COLORS, FONTS } from "@/src/constants";
import {
  AuthButton,
  AuthInput,
  AuthScreen,
  OTPInput,
  PasswordChecklist,
} from "@/src/components/AuthKit/AuthKit";
import { useSettingsStore } from "@/src/store/settingsStore";

const Page = () => {
  const { email } = useLocalSearchParams<{ email: string }>();

  const { settings } = useSettingsStore();
  const [state, setState] = React.useState<{
    email: string;
    password: string;
    confirmPassword: string;
    showConfirmPassword: boolean;
    showPassword: boolean;
    loading: boolean;
    otp: string;
    error: string;
  }>({
    email: email || "",
    password: "",
    confirmPassword: "",
    otp: "",
    showConfirmPassword: false,
    showPassword: false,
    loading: false,
    error: "",
  });

  const passwordsMatch = React.useMemo(
    () =>
      state.confirmPassword.length === 0 ||
      state.password === state.confirmPassword,
    [state],
  );

  const passwordValid = React.useMemo(
    () =>
      state.password.length >= 8 &&
      /[A-Z]/.test(state.password) &&
      /[a-z]/.test(state.password) &&
      /\d/.test(state.password),
    [state],
  );

  const formComplete = React.useMemo(
    () => state.otp.length === 6 && passwordValid && passwordsMatch,
    [state],
  );

  const router = useRouter();
  const handleResetPassword = () => {
    router.replace({ pathname: "/(auth)/login" });
  };

  const handleResendCode = () => {
    // Add your resend OTP API request here.
    console.log("Resend code to:", email);
  };

  return (
    <AuthScreen
      title="Set a new password"
      subtitle="Enter your verification code and choose a new password for your EcoHare account."
      footer={
        <Pressable
          onPress={() => router.replace("/(auth)/login")}
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
      {!!email && (
        <View style={styles.emailChip}>
          <Ionicons name="mail-outline" size={16} color={COLORS.black} />
          <Text style={styles.emailText} numberOfLines={1}>
            Code sent to {email}
          </Text>
        </View>
      )}

      <OTPInput
        value={state.otp}
        onChange={(otp) => setState((s) => ({ ...s, otp }))}
      />

      <View style={styles.resendRow}>
        <Text style={styles.muted}>Did not receive the code?</Text>

        <Pressable onPress={handleResendCode}>
          <Text style={styles.link}>Resend code</Text>
        </Pressable>
      </View>

      <AuthInput
        label="New password"
        placeholder="Create a secure password"
        value={state.password}
        onChangeText={(password) => setState((s) => ({ ...s, password }))}
        leftIcon="lock-closed-outline"
        rightIcon={state.showPassword ? "eye-off-outline" : "eye-outline"}
        onRightIconPress={() =>
          setState((s) => ({ ...s, showPassword: !s.showPassword }))
        }
        secureTextEntry={!state.showPassword}
        autoCapitalize="none"
        autoComplete="new-password"
      />

      <PasswordChecklist password={state.password} />

      <AuthInput
        label="Confirm new password"
        placeholder="Repeat your new password"
        value={state.confirmPassword}
        onChangeText={(confirmPassword) =>
          setState((s) => ({ ...s, confirmPassword }))
        }
        leftIcon="shield-checkmark-outline"
        rightIcon={
          state.showConfirmPassword ? "eye-off-outline" : "eye-outline"
        }
        onRightIconPress={() =>
          setState((s) => ({
            ...s,
            showConfirmPassword: !s.showConfirmPassword,
          }))
        }
        secureTextEntry={!state.showConfirmPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        error={passwordsMatch ? undefined : "Passwords do not match."}
      />

      <AuthButton
        title="Reset password"
        onPress={handleResetPassword}
        disabled={!formComplete}
        variant="secondary"
        loading={state.loading}
      />
    </AuthScreen>
  );
};

export default Page;

const styles = StyleSheet.create({
  emailChip: {
    alignSelf: "center",
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.white,
  },
  emailText: {
    flexShrink: 1,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  resendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 5,
    marginTop: -5,
  },
  muted: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  link: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
