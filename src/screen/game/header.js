import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

class Header extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {};
  }

  render() {
    return (
      <View style={header.container}>
        <View style={header.wrap}>
          <View style={header.phase}>
            <Text style={header.label}>Phase</Text>
            <Text style={header.value}>{this.props.floor}</Text>
          </View>

          <View style={header.score}>
            <Text style={header.label}>Score</Text>
            <Text style={header.value}>{this.props.score}</Text>
          </View>

          <View style={header.setting}>
            <TouchableOpacity onPress={this.props.optionToggle}>
              <Text style={header.label}>Option</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const header = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  wrap: {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    flexDirection: "row",
    paddingLeft: 24,
    paddingRight: 24,
  },
  phase: {
    flexDirection: "row",
    marginRight: 18,
    alignItems: "center",
  },
  score: {
    flexDirection: "row",
    alignItems: "center",
  },
  setting: {
    marginLeft: "auto",
  },
  label: {
    fontSize: 28,
    fontFamily: "Dungeon",
    color: "#141414",
  },
  value: {
    fontSize: 28,
    fontFamily: "Dungeon",
    marginLeft: 6,
    width: 34,
    color: "#141414",
  },
});

export default Header;
