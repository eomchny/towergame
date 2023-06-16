import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  View,
  ImageBackground,
  Text,
  Dimensions,
} from "react-native";

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

const Battle = React.forwardRef((props, ref) => {
  /*State*/
  const [userAnimationImage, setUserAnimationImage] = useState("0");
  const [animationSpeed, setAnimationSpeed] = useState(1250);

  /*애니메이션*/
  const userInitAnimationValue = useRef(new Animated.Value(-56)).current;
  const userInitAnimationStyle = {
    transform: [{ translateX: userInitAnimationValue }],
  };
  const userOpacityAnimatedValue = useRef(new Animated.Value(0)).current;
  const userOpacityAnimatedStyle = { opacity: userOpacityAnimatedValue };

  /*몬스터 애니메이션*/
  const monsterInitAnimationValue = useRef(new Animated.Value(70)).current;
  const monsterInitAnimationStyle = {
    transform: [{ translateX: monsterInitAnimationValue }],
  };
  const monsterOpacityAnimatedValue = useRef(new Animated.Value(1)).current;
  const monsterOpacityAnimatedStyle = { opacity: monsterOpacityAnimatedValue };

  /*Timers*/
  let ch_timer = null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(userInitAnimationValue, {
        toValue: 56,
        duration: animationSpeed,
        useNativeDriver: true,
      }),
      Animated.timing(userOpacityAnimatedValue, {
        toValue: 1,
        duration: animationSpeed,
        useNativeDriver: true,
      }),
    ]).start(() => {
      ch_timer = setInterval(() => {
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

  const createAndDisplayMonster = (monster) => {
    /*몬스터로 스탯 보여주기 상태 변경 후 애니메이션 실행*/
    return Animated.parallel([
      Animated.timing(monsterInitAnimationValue, {
        toValue: -70,
        duration: animationSpeed,
        useNativeDriver: true,
      }),
      Animated.timing(monsterOpacityAnimatedValue, {
        toValue: 1,
        duration: animationSpeed,
        useNativeDriver: true,
      }),
    ]);
  };

  const userRunToMonster = () => {
    return Animated.timing(userInitAnimationValue, {
      toValue: Dimensions.get("screen").width - 56 - 70 - 56,
      duration: animationSpeed * 0.7,
      useNativeDriver: true,
    });
  };

  const userBackFromMonster = () => {
    return Animated.timing(userInitAnimationValue, {
      toValue: 56,
      duration: animationSpeed * 0.7,
      useNativeDriver: true,
    });
  };

  React.useImperativeHandle(ref, () => ({
    createAndDisplayMonster,
    userRunToMonster,
    userBackFromMonster,
  }));

  return (
    <View style={battle.container}>
      <Animated.View style={[userInitAnimationStyle, userOpacityAnimatedStyle]}>
        <ImageBackground
          source={getCharacterSprite()}
          style={battle.objects.ch}
          resizeMode="contain"
        ></ImageBackground>
      </Animated.View>

      <Animated.View
        style={[monsterInitAnimationStyle, monsterOpacityAnimatedStyle]}
      >
        <View style={battle.objects.monster}>
          <Text>몬스터</Text>
        </View>
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
});

const battle = StyleSheet.create({
  container: {
    height: bottom_frame_height + character_height + grass_height + 60,
    justifyContent: "flex-end",
  },

  objects: {
    ch: {
      width: 56,
      height: 56,
      position: "absolute",
      bottom: -8,
    },
    monster: {
      width: 56,
      height: 56,
      position: "absolute",
      bottom: -8,
      borderWidth: 2,
      right: 0,
      backgroundColor: "red",
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
