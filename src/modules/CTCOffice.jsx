import React, { useState } from 'react';
import ReactDOM from 'react-dom';

window.electronAPI.subscribeCTCMessage( (_event, payload) => {
  console.log('IPC:CTCOffice: ', payload);
});

class CTCOffice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      testMode: false,
    };
  }

  testUI() {
    return (
      <p>CTC Office Test UI</p>
    );
  }

  render() {
    if(this.state.testMode)
      return this.testUI();

    return (
      <p>I just want to graduate already</p>
    );
  }
};

export default CTCOffice;
