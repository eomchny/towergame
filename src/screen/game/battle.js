import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, Animated, View, ImageBackground } from "react-native";

/*Assets*/
const bg_assets = {
  //배경 에셋
  frame: require("../../imgs/backgrounds/battle_top.png"),
  grass: require("../../imgs/backgrounds/battle_bottom.png"),
};

const ch_assets = {
  //캐릭터 에셋
  moving_0: require("../../imgs/character/moving_0.png"),
  moving_1: require("../../imgs/character/moving_1.png"),
};

const bottom_frame_height = 6;
const character_height = 56;
const grass_height = 32;

const Battle = (props) => {
  /*State*/
  const [userAnimationImage, setUserAnimationImage] = useState("0");

  /*애니메이션*/
  const userInitAnimationValue = useRef(new Animated.Value(-56)).current;
  const userInitAnimationStyle = {
    transform: [{ translateX: userInitAnimationValue }],
  };
  const userOpacityAnimatedValue = useRef(new Animated.Value(0)).current;
  const userOpacityAnimatedStyle = { opacity: userOpacityAnimatedValue };

  /*Timers*/
  let ch_timer = null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(userInitAnimationValue, {
        toValue: 56,
        duration: 1250,
        useNativeDriver: true,
      }),
      Animated.timing(userOpacityAnimatedValue, {
        toValue: 1,
        duration: 1250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      ch_timer = setInterval(() => {
        const page = userAnimationImage;
        setUserAnimationImage((prev) => {
          return prev === "0" ? "1" : "0";
        });
      }, 500);
    });

    return () => {
      clearInterval(ch_timer);
    };
  }, []);

  const getCharacterSprite = () => {
    return userAnimationImage === "0" ? ch_assets.moving_0 : ch_assets.moving_1;
  };

  return (
    <View style={battle.container}>
      <Animated.View style={[userInitAnimationStyle, userOpacityAnimatedStyle]}>
        <ImageBackground
          source={getCharacterSprite()}
          style={battle.objects.ch}
          resizeMode="contain"
        ></ImageBackground>
      </Animated.View>

      <ImageBackground
        source={bg_assets.grass}
        style={battle.objects.grass}
      ></ImageBackground>

      <ImageBackground
        source={bg_assets.frame}
        style={battle.objects.frame}
      ></ImageBackground>
    </View>
  );
};

const battle = StyleSheet.create({
  container: {
    height: bottom_frame_height + character_height + grass_height + 40,
    justifyContent: "flex-end",
  },

  objects: {
    ch: {
      width: 56,
      height: 56,
      position: "absolute",
      bottom: -8,
    },
    grass: {
      height: grass_height,
    },
    frame: {
      height: bottom_frame_height,
    },
  },
});

export default Battle;

/*

        <ImageBackground
          source={bg_assets.top}
          style={{
            flex: 1,
            position: "absolute",
            width: "100%",
            height: 6,
            top: 0,
            zIndex: 3,
          }}
          resizeMode="repeat"
        ></ImageBackground>

        <ImageBackground
          source={bg_assets.cloud}
          style={{
            flex: 1,
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        ></ImageBackground>

        <ImageBackground
          source={bg_assets.sky}
          style={{
            flex: 1,
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 2,
          }}
        ></ImageBackground>

        <View
          style={{
            height: 32,
            position: "absolute",
            width: "100%",
            bottom: 0,
            zIndex: 3,
          }}
        >
          <ImageBackground
            source={bg_assets.bottom}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>


        <Animated.View
        style={[
          {
            zIndex: 4,
            position: "absolute",
            bottom: 24,
            width: 64,
            height: 64,
          },
          userInitAnimationStyle,
          userOpacityAnimatedStyle,
        ]}
      >
        <ImageBackground
          source={
            userAnimationImage === "0" ? ch_assets.moving_0 : ch_assets.moving_1
          }
          style={{ flex: 1 }}
          resizeMode="contain"
        ></ImageBackground>
      </Animated.View>
*/
