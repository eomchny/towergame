import React, { Component } from 'react';
import { View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

class Loading extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View>
        <Spinner visible={this.props.visible}/>
      </View>
    );
  }
}

export default Loading;
