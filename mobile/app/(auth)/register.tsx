import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { COLORS, FONTS } from "@/src/constants";
import {
  StaffRole,
  AuthScreen,
  RoleSelector,
  AuthInput,
  PasswordChecklist,
  AuthButton,
} from "@/src/components/AuthKit/AuthKit";
import { useSettingsStore } from "@/src/store/settingsStore";
import { onImpact } from "@/src/utils";
import { useRouter } from "expo-router";
const Page = () => {
  const { width } = useWindowDimensions();
  const { settings } = useSettingsStore();
  const [state, setState] = React.useState<{
    role: StaffRole | null;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    showConfirmPassword: boolean;
    showPassword: boolean;
    loading: boolean;
  }>({
    role: null,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    showConfirmPassword: false,
    showPassword: false,
    loading: false,
  });

  const router = useRouter();

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
    () =>
      Boolean(
        state.role &&
        state.firstName.trim() &&
        state.lastName.trim() &&
        state.email.trim() &&
        passwordValid &&
        state.confirmPassword &&
        state.password === state.confirmPassword,
      ),
    [passwordValid, state],
  );

  const handleRegister = async () => {
    if (settings.haptics) {
      await onImpact();
    }
  };

  return (
    <AuthScreen
      title="Create staff account"
      subtitle="Register with your UFH email and select the team responsible for your reports."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.muted}>Already registered?</Text>

          <Pressable
            onPress={async () => {
              if (settings.haptics) {
                await onImpact();
              }
              router.replace({ pathname: "/(auth)/login" });
            }}
          >
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </View>
      }
    >
      <RoleSelector
        value={state.role}
        onChange={(role) => setState((s) => ({ ...s, role }))}
      />

      <View style={[styles.nameRow, width < 390 && styles.nameColumn]}>
        <AuthInput
          label="First name"
          placeholder="First name"
          value={state.firstName}
          onChangeText={(firstName) => setState((s) => ({ ...s, firstName }))}
          leftIcon="person-outline"
          autoCapitalize="words"
          autoComplete="given-name"
          containerStyle={styles.nameInput}
        />

        <AuthInput
          label="Last name"
          placeholder="Last name"
          value={state.lastName}
          onChangeText={(lastName) => setState((s) => ({ ...s, lastName }))}
          leftIcon="person-outline"
          autoCapitalize="words"
          autoComplete="family-name"
          containerStyle={styles.nameInput}
        />
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
      />

      <AuthInput
        label="Password"
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
        label="Confirm password"
        placeholder="Repeat your password"
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
        title="Create account"
        onPress={handleRegister}
        variant="secondary"
        disabled={!formComplete}
        loading={state.loading}
      />
    </AuthScreen>
  );
};

export default Page;
const styles = StyleSheet.create({
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  nameColumn: {
    flexDirection: "column",
  },
  nameInput: {
    flex: 1,
    minWidth: 0,
  },
  footerRow: {
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
