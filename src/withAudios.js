import React from 'react';
import { Subscribe } from 'unstated';
import AudiosContainer from './AudiosContainer';

const withAudios = PassedComponent =>
  class WithPlayer extends React.Component {
    render() {
      return (
        <Subscribe to={[AudiosContainer]}>
          {audios => (
            <PassedComponent
              {...this.props}
              audios={audios}
            />
          )}
        </Subscribe>
      );
    }
  };

export default withAudios;
