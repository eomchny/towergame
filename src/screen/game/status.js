import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Animated,
} from "react-native";

const status_assets = {
  back: require("../../imgs/backgrounds/controller_bg.png"),
  attack: require("../../imgs/icons/status/attack.png"),
  defend: require("../../imgs/icons/status/defend.png"),
  recover: require("../../imgs/icons/status/recover.png"),
  gold: require("../../imgs/icons/status/gold.png"),
  heart: require("../../imgs/icons/status/heart.png"),
};

const StatusBar = (props) => {
  const user = props.user;
  const attack = props.status.attack;
  const defend = props.status.defend;
  const recover = props.status.recover;
  let ms = false;

  /*Gold*/
  const gold = props.status.gold;
  const [prevGold, setPrevGold] = useState(props.status.gold);

  /*골드 변화 애니메이션*/
  const goldUpDownAnimationValue = useRef(new Animated.Value(0)).current;
  const goldUpDownAnimation = (type) => {
    Animated.sequence([
      Animated.timing(goldUpDownAnimationValue, {
        toValue: type === "up" ? -8 : 8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(goldUpDownAnimationValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /*골드가 바뀌었을때, 이전 골드와 얼마나 차이나는지 확인 후 애니메이션*/
  useEffect(() => {
    if (props.status.gold >= prevGold) {
      goldUpDownAnimation("up");
    } else if (props.status.gold < prevGold) {
      goldUpDownAnimation("down");
    }

    setPrevGold(props.status.gold);
  }, [props.status.gold]);

  /*스테이터스 바를 감싸는 검은색 마스크의 길이를 지정*/
  const [maskLength, setMaskLength] = useState(0);
  const goldRef = useRef(null);
  const goldMeasure = async () => {
    goldRef.current.measure((fx, fy, width, height, px, py) => {
      setMaskLength(px + width + 16);

      if (!ms) {
        props.statusObjectPositions({
          attack: {
            px: px - 120,
            py: py + 24,
          },
          defend: {
            px: px - 80,
            py: py + 24,
          },
          recover: {
            px: px - 40,
            py: py + 24,
          },
          gold: {
            px: px,
            py: py + 24,
          },
        });
        ms = true;
      }
    });
  };

  /*공격, 방어, 회복량이 바뀌었을때, 한번 올렸다 내림*/
  const attackUpDownAnimationValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(attackUpDownAnimationValue, {
        toValue: -12,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(attackUpDownAnimationValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [props.status.attack]);

  const defendUpDownAnimationValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(defendUpDownAnimationValue, {
        toValue: -12,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(defendUpDownAnimationValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [props.status.defend]);

  const recoverUpDownAnimationValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(recoverUpDownAnimationValue, {
        toValue: -12,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(recoverUpDownAnimationValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [props.status.recover]);

  return (
    <View style={style.container}>
      <View style={[style.mask, { width: maskLength }]}></View>
      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.heart}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>
            {user.now_hp}/{user.max_hp}
          </Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.attack}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <Animated.View style={[
          style.textarea,
          { transform: [{ translateY: attackUpDownAnimationValue }] },
        ]}>
          <Text style={style.font}>{attack}</Text>
        </Animated.View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.defend}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <Animated.View style={[
          style.textarea,
          { transform: [{ translateY: defendUpDownAnimationValue }] },
        ]}>
          <Text style={style.font}>{defend}</Text>
        </Animated.View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.recover}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <Animated.View style={[
          style.textarea,
          { transform: [{ translateY: recoverUpDownAnimationValue }] },
        ]}>
          <Text style={style.font}>{recover}</Text>
        </Animated.View>
      </View>

      <View style={style.wrap} onLayout={goldMeasure} ref={goldRef}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.gold}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <Animated.View
          style={[
            style.textarea,
            { transform: [{ translateY: goldUpDownAnimationValue }] },
          ]}
        >
          <Text style={style.font}>{gold}</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingLeft: 18,
    marginTop: 6,
    paddingTop: 6,
    paddingBottom: 4,
  },
  wrap: {
    flexDirection: "row",
    marginRight: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  textarea: {
    justifyContent: "center",
  },
  font: {
    fontFamily: "Dungeon",
    marginLeft: 6,
    marginRight: 4,
    fontWeight: "bold",
    fontSize: 22,
    letterSpacing: 2,
    color: "#f5f5dc",
  },
  mask: {
    borderWidth: 1,
    position: "absolute",
    left: 0,
    top: 0,
    height: 24 + 12,
    borderTopRightRadius: "100%",
    borderBottomRightRadius: "100%",
    backgroundColor: "black",
    opacity: 0.7,
  },
});

export default StatusBar;
