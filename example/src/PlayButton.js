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
