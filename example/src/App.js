import React, { Component } from 'react';
import PlayButton from './PlayButton';
import Transport from './Transport';

export default class App extends Component {
  render () {
    return (
      <div>
        <PlayButton url="http://api.sound.farm/v1/test/mp3" />
        <Transport />
      </div>
    )
  }
}
