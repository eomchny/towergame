import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const assets = {
  left: {
    pi: require("../../imgs/buttons/rotate_left_press_in.png"),
    po: require("../../imgs/buttons/rotate_left_press_out.png"),
  },
  right: {
    pi: require("../../imgs/buttons/rotate_right_press_in.png"),
    po: require("../../imgs/buttons/rotate_right_press_out.png"),
  },
  vertical: {
    pi: require("../../imgs/buttons/rotate_vertical_press_in.png"),
    po: require("../../imgs/buttons/rotate_vertical_press_out.png"),
  },
  horizontal: {
    pi: require("../../imgs/buttons/rotate_horizontal_press_in.png"),
    po: require("../../imgs/buttons/rotate_horizontal_press_out.png"),
  },
};

const Controller = (props) => {
  return (
    <View style={style.container(props.elementWidth)}>
      <View style={{ marginBottom: 4 }}>
        <ControllButton
          rotate={props.rotateLeft}
          type="left"
          size={props.elementWidth * 1.5}
        />
      </View>

      <View>
        <ControllButton
          rotate={props.rotateRight}
          type="right"
          size={props.elementWidth * 1.5}
        />
      </View>
      <View style={{ right: 16 }}>
        <ControllButton
          rotate={props.rotateVerticalt}
          type="vertical"
          size={props.elementWidth * 1.5}
        />
      </View>
      <View style={{ right: 16 }}>
        <ControllButton
          rotate={props.rotateHorizontal}
          type="horizontal"
          size={props.elementWidth * 1.5}
        />
      </View>
    </View>
  );
};

const ControllButton = (props) => {
  const size = props.size;

  const [buttonPressIn, setbuttonPressIn] = useState(false);

  const rotate = () => {
    props.rotate();
  };

  return (
    <View style={{ width: size, height: size }}>
      <ImageBackground
        source={buttonPressIn ? assets[props.type].pi : assets[props.type].po}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={style.button}
          onPress={rotate}
          onPressIn={() => {
            setbuttonPressIn(true);
          }}
          onPressOut={() => {
            setbuttonPressIn(false);
          }}
        ></TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

const style = StyleSheet.create({
  container: (el_w) => {
    return {
      width: el_w * 3.5,
      flexDirection: "row",
      flexWrap: "wrap",
    };
  },
  button: {
    flex: 1,
  },
});

export default Controller;
