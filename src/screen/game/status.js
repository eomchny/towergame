import React, { useRef, useState } from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";

const status_assets = {
  back: require("../../imgs/backgrounds/controller_bg.png"),
  attack: require("../../imgs/icons/status/attack.png"),
  defend: require("../../imgs/icons/status/defend.png"),
  recover: require("../../imgs/icons/status/recover.png"),
  gold: require("../../imgs/icons/status/gold.png"),
  heart: require("../../imgs/icons/status/heart.png"),
};

const StatusBar = (props) => {
  const attack = props.status.attack;
  const defend = props.status.defend;
  const recover = props.status.recover;
  const gold = props.status.gold;
  const user = props.user;

  const [maskLength, setMaskLength] = useState(0);
  const goldRef = useRef(null);
  const goldMeasure = async () => {
    goldRef.current.measure((fx, fy, width, height, px, py) => {
      setMaskLength(px + width + 16);
    });
  };

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

        <View style={style.textarea}>
          <Text style={style.font}>{attack}</Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.defend}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{defend}</Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.recover}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{recover}</Text>
        </View>
      </View>

      <View style={style.wrap} onLayout={goldMeasure} ref={goldRef}>
        <View style={style.icon}>
          <ImageBackground
            source={status_assets.gold}
            style={{ flex: 1 }}
          ></ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{gold}</Text>
        </View>
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
