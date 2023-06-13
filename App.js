import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';

/*Screens*/
import Index from './src/screen/index/index';
import Game  from './src/screen/game/game';

/*Nav*/
const Stack = createStackNavigator();

const images = [
  require('./src/imgs/icons/element_attack.png'),
  require('./src/imgs/icons/element_defend.png'),
  require('./src/imgs/icons/element_recover.png'),
  require('./src/imgs/icons/element_gold.png'),
  require('./src/imgs/icons/frame.png'),

  /*Status*/
  require('./src/imgs/icons/status/attack.png'),
  require('./src/imgs/icons/status/defend.png'),
  require('./src/imgs/icons/status/recover.png'),
  require('./src/imgs/icons/status/gold.png'),
  require('./src/imgs/icons/status/heart.png'),

  /*Buttons*/
  require('./src/imgs/buttons/decide_available.png'),
  require('./src/imgs/buttons/decide_disable.png'),
  require('./src/imgs/buttons/cancel_available.png'),
  require('./src/imgs/buttons/cancel_disable.png'),

  /*Backgrounds*/
  require('./src/imgs/backgrounds/battle_top.png'),
  require('./src/imgs/backgrounds/battle_bottom.png'),
  require('./src/imgs/backgrounds/battle_cloud.png'),
  require('./src/imgs/backgrounds/battle_sky.png'),
  require('./src/imgs/backgrounds/book_left.png'),
  require('./src/imgs/backgrounds/tile.png'),
  require('./src/imgs/backgrounds/board/origbig.png'),
  require('./src/imgs/backgrounds/controller_bg.png'),

  /*Controll Images*/
  require('./src/imgs/buttons/cancel_press_in.png'),
  require('./src/imgs/buttons/cancel_press_out.png'),
  require('./src/imgs/buttons/decide_press_in.png'),
  require('./src/imgs/buttons/decide_press_out.png'),
  require('./src/imgs/buttons/rotate_left_press_in.png'),
  require('./src/imgs/buttons/rotate_left_press_out.png'),
  require('./src/imgs/buttons/rotate_right_press_in.png'),
  require('./src/imgs/buttons/rotate_right_press_out.png'),
  require('./src/imgs/buttons/rotate_vertical_press_in.png'),
  require('./src/imgs/buttons/rotate_vertical_press_out.png'),
  require('./src/imgs/buttons/rotate_horizontal_press_in.png'),
  require('./src/imgs/buttons/rotate_horizontal_press_out.png'),

  /*Character*/
  require('./src/imgs/character/moving_0.png'),
  require('./src/imgs/character/moving_1.png'),
];

export default function App() {
  const cacheImages = async (images) => {
    const promises = images.map((image) => {
      return Asset.fromModule(image).downloadAsync();
    });
    await Promise.all(promises);
  };

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'Dot-font': require('./src/fonts/DotGothic16-Regular.ttf'),
        'Ancient': require('./src/fonts/Ancient.ttf'),
        'Dungeon': require('./src/fonts/DungeonFont.ttf'),
      });
    };

    loadFonts();
    cacheImages(images);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Index"
          component={Index}
          options={{
            headerShown:false,
            animationEnabled: false,
          }}
        />

        <Stack.Screen
          name="Game"
          component={Game}
          options={{
            headerShown:false,
            animationEnabled: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
