import React, { Component } from 'react';
import { StyleSheet, Text, View, Button, TextInput, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, Alert, Dimensions } from 'react-native';

class Index extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {
    }
  }

  render() {
		return (
				<SafeAreaView style={{flex:1}}>
          <View style={style.container}>
            <View style={style.buttons}>
              <StartButton navigation={this.props.navigation}/>
              <SettingButton/>
            </View>
          </View>
				</SafeAreaView>
		)
  }
}

const StartButton = (props) => {
  const navigateGameScreen = () => {
    props.navigation.navigate('Game');
  }

  return (
    <View style={style.button}>
      <TouchableOpacity onPress={navigateGameScreen}>
        <Text style={style.button.text}>
          시작
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const SettingButton = (props) => {
  return (
    <View style={style.button}>
      <TouchableOpacity>
        <Text style={style.button.text}>
          설정
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const style = StyleSheet.create({
  container : {
    flex:1,
    justifyContent: 'center'
  },
  buttons : {
    borderWidth: 1,
    alignItems: 'center'
  },
  button : {
    borderWidth: 1,
    borderColor: 'red',
    width: '50%',
    marginTop: 16,
    text : {
      textAlign: 'center',
      padding: 16
    }
  }
})

export default Index;
