import React from 'react'
import ReactDOM from 'react-dom'

window.electronAPI.subscribeCTCMessage( (_event, payload) => {
  console.log('IPC:CTCOfficeTestUI: ', payload);
});

function CTCOfficeTest() {
  return (
    <p>CTC Office Test UI</p>
  );
};

export default CTCOfficeTest;
