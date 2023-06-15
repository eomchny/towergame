import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

const assets = {
  back: require("../../imgs/backgrounds/option.png"),
};

const Option = (props) => {
  return (
    <View style={style.container}>
      <View
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          opacity: "0.5",
        }}
      ></View>

      <View style={style.box}>
        <ImageBackground source={assets.back} style={{ flex: 1, padding: 40 }}>
          <View style={style.header}>
            <TouchableOpacity style={style.close} onPress={props.optionToggle}>
              <Text style={style.close.label}>CLOSE</Text>
            </TouchableOpacity>
          </View>

          <View style={style.options}>
            <TouchableOpacity
              style={style.options.buttons.xlarge}
              onPress={props.gameReset}
            >
              <Text style={style.options.buttons.xlarge.label}>Retry</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    position: "absolute",
    zIndex: 30,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  box: {
    width: "80%",
    height: "55%",
    borderRadius: 15,
    overflow: "hidden",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  close: {
    justifyContent: "center",

    label: {
      fontFamily: "Dungeon",
      color: "#f5f5dc",
      fontSize: 32,
    },
  },

  options: {
    flex: 1,
    justifyContent: "center",

    buttons: {
      xlarge: {
        borderWidth: 1,
        width: "100%",
        backgroundColor: "gray",
        padding: 12,

        label: {
          fontFamily: "Dungeon",
          color: "#f5f5dc",
          fontSize: 32,
          textAlign: "center",
        },
      },
    },
  },
});

export default Option;
