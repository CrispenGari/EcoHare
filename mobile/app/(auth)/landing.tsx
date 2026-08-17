import { View, Text } from "react-native";
import React from "react";
import { APP_NAME, COLORS, FONTS, IMAGES } from "@/src/constants";
import Animated, { ZoomInEasyUp } from "react-native-reanimated";
import Footer from "@/src/components/Footer/Footer";
import Button from "@/src/components/Button/Button";
import { FontAwesome6, Fontisto } from "@expo/vector-icons";
import { useSettingsStore } from "@/src/store/settingsStore";
import { useRouter } from "expo-router";
import { onImpact } from "@/src/utils";

const Page = () => {
  const { settings, update } = useSettingsStore();
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.main,
      }}
    >
      <View
        style={{
          flex: 0.75,
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          padding: 20,
        }}
      >
        <Animated.Image
          entering={ZoomInEasyUp}
          style={{
            width: 150,
            height: 150,
          }}
          source={IMAGES.logo}
        />
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: 30,
            textAlign: "left",
            width: "100%",
          }}
        >
          Welcome to {APP_NAME}
        </Text>
        <Text
          style={{
            fontFamily: FONTS.regular,
            fontSize: 18,
          }}
        >
          EcoHare is an AI-assisted bilingual mobile platform for reporting,
          mapping and tracking dumped waste and visible water leaks at the
          University of Fort Hare Alice campus.
        </Text>
      </View>
      <View
        style={{
          flex: 0.25,
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Button
          title="Continue as Student"
          style={{
            width: "100%",
            maxWidth: 300,
            height: 60,
          }}
          Icon={
            <FontAwesome6 name="user-graduate" size={24} color={COLORS.black} />
          }
          titleStyle={{
            color: COLORS.black,
          }}
          onPress={async () => {
            if (settings.haptics) {
              await onImpact();
            }
            update({ ...settings, new: false });
            router.replace({ pathname: "/" });
          }}
        />

        <Button
          title="Continue as Staff"
          style={{
            width: "100%",
            maxWidth: 300,
            height: 60,
            backgroundColor: COLORS.tertiary,
          }}
          onPress={async () => {
            if (settings.haptics) {
              await onImpact();
            }
            router.replace({ pathname: "/(auth)/login" });
          }}
          Icon={<Fontisto name="person" size={24} color={COLORS.black} />}
          titleStyle={{
            color: COLORS.black,
          }}
        />
      </View>

      <Footer />
    </View>
  );
};

export default Page;
