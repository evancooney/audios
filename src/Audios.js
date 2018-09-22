import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'unstated';

export default class Audios extends Component {
  static propTypes = {
    children: PropTypes.array
  }

  render() {
    const {
      children
    } = this.props;

    return (
      <Provider>
        {children}
      </Provider>
    );
  }
}
