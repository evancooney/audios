# audios

> Stateful audio playback for React

NOTE: This module is being used in production but is still experimental and may
change significantly

Features
--------
* Play / load audio from any component
* Broadcast / receive player state across your entire app
* Leverages Web Audio API via the excellent Howler.js
* Wraps core Howler.js functions in promises and adds current time

[![NPM](https://img.shields.io/npm/v/audios.svg)](https://www.npmjs.com/package/audios) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save audios
```

## Usage
Wrap your app with an Audios component
```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { Audios } from 'audios';

import App from './App';

ReactDOM.render(
  <Audios>
    <App />
  </Audios>,
   document.getElementById('root'));
```
Create a play button
```jsx
import React from 'react';
import { withAudios } from 'audios';

const PlayButton = (props) => {
  const { url, audios } = props;
  return (
    <div>
      {audios.state.isPlaying && audios.state.url === url
      ? <button onClick={() => audios.pause()} > Pause </button>
      : <button onClick={() => audios.play(url)} > Play </button>
      }
    </div>
  )
}
export default withAudios(PlayButton);
```

State Variables
--------
Accessible from props.audios.state in the withAudio HOC

url: string
filename: string
currentTime: number
currentTimeAsPercentage: number
duration: number
volume: number
isLoading: boolean
isPlaying: boolean
isError: boolean
html5: boolean

Methods
--------
Accessible from via props.audios in the withAudio HOC

play(url)

pause()

seek(timeInSeconds)

## License

MIT © [evancooney](https://github.com/evancooney)
