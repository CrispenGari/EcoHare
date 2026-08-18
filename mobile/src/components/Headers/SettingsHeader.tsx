import { COLORS, FONTS } from "@/src/constants";
import { useSettingsStore } from "@/src/store/settingsStore";
import { onImpact } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HelpBottomSheet from "../BottomSheets/HelpBottomSheet";

const SettingsHeader = () => {
  const { settings } = useSettingsStore();
  const helpBottomSheetRef = React.useRef<BottomSheetModal>(null);
  return (
    <SafeAreaView
      style={{
        backgroundColor: COLORS.tertiary,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          paddingHorizontal: 20,
        }}
      >
        <HelpBottomSheet ref={helpBottomSheetRef} />
        <Text
          style={{
            textAlign: "center",
            fontFamily: FONTS.bold,
            color: COLORS.white,
            fontSize: 20,
          }}
        >
          Settings
        </Text>
        <TouchableOpacity
          hitSlop={30}
          style={{
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
            width: 45,
            height: 45,
            borderRadius: 45,
          }}
          onPress={async () => {
            if (settings.haptics) {
              await onImpact();
            }
            helpBottomSheetRef.current?.present();
          }}
        >
          <Ionicons name="help" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SettingsHeader;
