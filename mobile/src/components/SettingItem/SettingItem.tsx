import { COLORS, FONTS } from "@/src/constants";
import React from "react";
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import { SharedValue, useSharedValue } from "react-native-reanimated";
import Switch from "../Switch/Switch";
import { useSettingsStore } from "@/src/store/settingsStore";
import { onImpact } from "@/src/utils";

interface SettingItemProps {
  Icon: React.ReactNode;
  title: string;
  onPress: (value?: boolean) => void;
  labelStyle?: StyleProp<TextStyle>;
  subTitle?: string;
  hasSwitch?: boolean;
  value?: boolean;
  subTitleStyle?: StyleProp<TextStyle>;
}
const SettingItem = ({
  labelStyle,
  Icon,
  title,
  onPress,
  subTitle,
  hasSwitch,
  subTitleStyle,
  value,
}: SettingItemProps) => {
  const isOn = useSharedValue(!!value);
  const { settings } = useSettingsStore();

  return (
    <TouchableOpacity
      disabled={hasSwitch}
      onPress={() => {
        onPress();
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 2,
      }}
    >
      {Icon}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            {
              color: COLORS.black,
              fontFamily: FONTS.bold,
              fontSize: 16,
            },
            labelStyle,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            {
              fontFamily: FONTS.regular,
              fontSize: 10,
              color: COLORS.black,
            },
            subTitleStyle,
          ]}
        >
          {subTitle}
        </Text>
      </View>
      {hasSwitch ? (
        <Switch
          duration={400}
          trackColors={{ off: COLORS.primary, on: COLORS.secondary }}
          value={isOn}
          onPress={async () => {
            if (settings.haptics) {
              await onImpact();
            }
            onPress(!isOn.value);
            isOn.value = !isOn.value;
          }}
          style={{
            width: 50,
            height: 30,
            padding: 5,
          }}
        />
      ) : null}
    </TouchableOpacity>
  );
};

export default SettingItem;
