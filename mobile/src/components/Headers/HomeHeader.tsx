import { APP_NAME, COLORS, FONTS, IMAGES } from "@/src/constants";

import { useSettingsStore } from "@/src/store/settingsStore";
import { onImpact } from "@/src/utils";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeHeader = () => {
  const profileBottomSheetRef = React.useRef<BottomSheetModal>(null);
  const { settings } = useSettingsStore();

  const [loaded, setLoaded] = React.useState(false);

  return (
    <>
      {/* <ProfileBottomSheet ref={profileBottomSheetRef} /> */}
      <SafeAreaView
        style={{
          backgroundColor: COLORS.tertiary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            height: 100,
            flexDirection: "row",
            paddingHorizontal: 20,
            paddingVertical: 30,
            gap: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.white,
                fontSize: 20,
              }}
            >
              User
            </Text>
            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: 16,
                color: COLORS.white,
              }}
            >
              Welocme
            </Text>
          </View>
          <TouchableOpacity
            hitSlop={30}
            style={{
              borderRadius: 45,
            }}
            onPress={async () => {
              if (settings.haptics) {
                await onImpact();
              }
              profileBottomSheetRef.current?.present();
            }}
          >
            {/* {!network.isInternetReachable || !!!me?.imageUrl ? (
              <Animated.Image
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 50,
                }}
                source={IMAGES.profile}
              />
            ) : (
              <>
                {!loaded ? (
                  <ContentLoader
                    style={{
                      position: "absolute",
                      backgroundColor: COLORS.white,
                      overflow: "hidden",
                      width: 50,
                      height: 50,
                      borderRadius: 50,
                      zIndex: 1,
                    }}
                  />
                ) : null}
                <Animated.Image
                  source={{ uri: me?.imageUrl }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 50,
                  }}
                  onError={(_error) => {
                    setLoaded(true);
                  }}
                  onLoad={() => {
                    setLoaded(true);
                  }}
                />
              </>
            )} */}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default HomeHeader;
