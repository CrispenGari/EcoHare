import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { ComponentProps, ReactNode, useRef } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { APP_NAME, COLORS, FONTS, IMAGES } from "@/src/constants";

type IconName = ComponentProps<typeof Ionicons>["name"];

interface AuthInputProps extends Omit<
  TextInputProps,
  "style" | "value" | "onChangeText"
> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  helperText,
  containerStyle,
  inputStyle,
  editable = true,
  multiline = false,
  onFocus,
  onBlur,
  ...props
}) => {
  const focused = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      focused.value,
      [0, 1],
      [COLORS.white, COLORS.secondary],
    ),
    borderColor: error
      ? COLORS.red
      : interpolateColor(
          focused.value,
          [0, 1],
          [COLORS.white, COLORS.secondary],
        ),
    shadowOpacity: interpolate(focused.value, [0, 1], [0, 0.12]),
    transform: [
      {
        scale: interpolate(focused.value, [0, 1], [1, 1.005]),
      },
    ],
  }));

  return (
    <View style={[styles.inputWrapper, containerStyle]}>
      <Text style={styles.inputLabel}>{label}</Text>

      <Animated.View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          !editable && styles.disabledInput,
          animatedStyle,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? COLORS.red : COLORS.black}
          />
        )}

        <TextInput
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor={COLORS.gray}
          editable={editable}
          multiline={multiline}
          onFocus={(event) => {
            focused.value = withTiming(1, {
              duration: 180,
            });
            onFocus?.(event);
          }}
          onBlur={(event) => {
            focused.value = withTiming(0, {
              duration: 180,
            });
            onBlur?.(event);
          }}
          accessibilityLabel={label}
          {...props}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.inputIconButton}
            accessibilityRole="button"
          >
            <Ionicons name={rightIcon} size={21} color={COLORS.gray} />
          </Pressable>
        )}
      </Animated.View>

      {!!(error || helperText) && (
        <Text style={[styles.supportText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
}) => {
  const scale = useSharedValue(1);
  const unavailable = loading || disabled;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={unavailable}
      onPressIn={() => {
        scale.value = withSpring(0.98, {
          damping: 18,
          stiffness: 250,
        });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, {
          damping: 18,
          stiffness: 250,
        });
      }}
      style={[
        styles.authButton,
        variant === "primary" ? styles.primaryButton : styles.secondaryButton,
        unavailable && styles.disabledButton,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityState={{
        disabled: unavailable,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? COLORS.black : COLORS.black}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === "primary"
              ? styles.primaryButtonText
              : styles.secondaryButtonText,
          ]}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
};

interface AuthScreenProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  const { width, height } = useWindowDimensions();

  const horizontalPadding = width >= 768 ? 40 : width >= 390 ? 22 : 16;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.topDecoration} />
        <View style={styles.bottomDecoration} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              justifyContent: height >= 760 ? "center" : "flex-start",
            },
          ]}
        >
          <View style={styles.authContent}>
            <Animated.View
              entering={FadeInUp.duration(400)}
              style={styles.logoContainer}
            >
              <Image
                source={IMAGES.logo}
                resizeMode="contain"
                style={styles.logo}
              />

              <Text style={styles.logoName}>{APP_NAME}</Text>

              <Text style={styles.logoCaption}>
                Cleaner campus. Smarter reporting.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(80).duration(430)}
              style={styles.authCard}
            >
              <View style={styles.headingContainer}>
                <Text style={styles.screenTitle}>{title}</Text>

                <Text style={styles.screenSubtitle}>{subtitle}</Text>
              </View>

              <View style={styles.formContainer}>{children}</View>

              {footer && <View style={styles.footer}>{footer}</View>}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export type StaffRole = "waste_staff" | "maintenance_staff";

interface RoleSelectorProps {
  value: StaffRole | null;
  onChange: (role: StaffRole) => void;
}

const roles: Array<{
  value: StaffRole;
  label: string;
  description: string;
  icon: IconName;
}> = [
  {
    value: "waste_staff",
    label: "Waste staff",
    description: "Cleaning and dumped-waste reports",
    icon: "trash-outline",
  },
  {
    value: "maintenance_staff",
    label: "Maintenance",
    description: "Water-leak and maintenance reports",
    icon: "water-outline",
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.roleWrapper}>
      <Text style={styles.inputLabel}>Staff role</Text>

      {roles.map((role, index) => {
        const selected = value === role.value;

        return (
          <Animated.View
            key={role.value}
            entering={FadeInDown.delay(index * 60)}
          >
            <Pressable
              onPress={() => onChange(role.value)}
              style={[styles.roleOption, selected && styles.selectedRole]}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View
                style={[styles.roleIcon, selected && styles.selectedRoleIcon]}
              >
                <Ionicons name={role.icon} size={21} color={COLORS.black} />
              </View>

              <View style={styles.roleText}>
                <Text style={styles.roleTitle}>{role.label}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>

              <Ionicons
                name={selected ? "checkmark-circle" : "ellipse-outline"}
                size={21}
                color={COLORS.black}
              />
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
};

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  length = 6,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, "").slice(0, length));
  };

  return (
    <View style={styles.otpWrapper}>
      <Text style={styles.inputLabel}>Verification code</Text>

      <Pressable
        style={styles.otpRow}
        onPress={() => inputRef.current?.focus()}
      >
        {Array.from({ length }).map((_, index) => {
          const character = value[index] || "";
          const active = index === value.length && value.length < length;

          return (
            <Animated.View
              key={index}
              entering={FadeIn.delay(index * 35)}
              style={[
                styles.otpBox,
                active && styles.activeOtpBox,
                character && styles.filledOtpBox,
              ]}
            >
              <Text style={styles.otpCharacter}>{character}</Text>
            </Animated.View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={length}
        caretHidden
        style={styles.hiddenOtpInput}
      />
    </View>
  );
};

export const PasswordChecklist: React.FC<{
  password: string;
}> = ({ password }) => {
  const requirements = [
    {
      label: "8 or more characters",
      valid: password.length >= 8,
    },
    {
      label: "Uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "Lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "At least one digit",
      valid: /\d/.test(password),
    },
  ];

  return (
    <View style={styles.passwordChecklist}>
      {requirements.map((requirement) => (
        <View key={requirement.label} style={styles.requirement}>
          <Ionicons
            name={requirement.valid ? "checkmark-circle" : "ellipse-outline"}
            size={15}
            color={requirement.valid ? COLORS.black : COLORS.gray}
          />

          <Text
            style={[
              styles.requirementText,
              requirement.valid && styles.validRequirement,
            ]}
          >
            {requirement.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.main,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 32,
  },
  authContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: 22,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoName: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 27,
    marginTop: 4,
  },
  logoCaption: {
    color: COLORS.black,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  topDecoration: {
    position: "absolute",
    top: -110,
    right: -90,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: COLORS.secondary,
  },
  bottomDecoration: {
    position: "absolute",
    bottom: -140,
    left: -100,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "#E3F0EA",
  },
  authCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 5,
  },
  headingContainer: {
    alignItems: "center",
    gap: 7,
    marginBottom: 24,
  },
  screenTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 24,
    lineHeight: 31,
    textAlign: "center",
  },
  screenSubtitle: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  formContainer: {
    gap: 17,
  },
  footer: {
    marginTop: 22,
    alignItems: "center",
  },

  inputWrapper: {
    width: "100%",
    gap: 7,
  },
  inputLabel: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1.2,
    borderRadius: 14,
    paddingHorizontal: 15,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowRadius: 12,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    minWidth: 40,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    fontSize: 14,
    paddingVertical: Platform.select({
      ios: 7,
      default: 0,
    }),
  },
  multilineContainer: {
    alignItems: "flex-start",
    paddingTop: 14,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  disabledInput: {
    opacity: 0.5,
  },
  inputIconButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  supportText: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 10,
  },
  errorText: {
    color: COLORS.red,
  },

  authButton: {
    width: "100%",
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1.2,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  primaryButtonText: {
    color: COLORS.black,
    fontSize: 18,
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: 18,
  },

  roleWrapper: {
    gap: 9,
  },
  roleOption: {
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderWidth: 1.2,
    borderColor: COLORS.tertiary,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    marginBottom: 9,
  },
  selectedRole: {
    borderColor: COLORS.tertiary,
    backgroundColor: COLORS.tertiary,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.secondary,
  },
  selectedRoleIcon: {
    backgroundColor: COLORS.primary,
  },
  roleText: {
    flex: 1,
    gap: 2,
  },
  roleTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  roleDescription: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },

  otpWrapper: {
    gap: 8,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  otpBox: {
    flex: 1,
    maxWidth: 55,
    minWidth: 38,
    aspectRatio: 0.95,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
    borderColor: COLORS.secondary,
    borderRadius: 13,
    backgroundColor: COLORS.secondary,
  },
  activeOtpBox: {
    borderColor: COLORS.tertiary,
    backgroundColor: COLORS.main,
  },
  filledOtpBox: {
    borderColor: COLORS.tertiary,
  },
  otpCharacter: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 19,
  },
  hiddenOtpInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  passwordChecklist: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: -7,
  },
  requirement: {
    minWidth: "46%",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requirementText: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  validRequirement: {
    color: COLORS.black,
    fontSize: 14,
  },
});
