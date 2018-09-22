import React from 'react';
import { withAudios } from 'audios';

const Transport = (props) => {
  const { url, audios } = props;
  return (
    <div>
       {audios.state.currentTime}
    </div>
  )
}

export default withAudios(Transport);
