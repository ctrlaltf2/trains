import { contextBridge, ipcRenderer } from 'electron';
import * as Channels from './channels';

// main: send a message to renderer -> pattern 3, use main::webcontents.send + renderer.on
// renderer: call main and get result -> pattern 2, use invoke and handle (async)
// renderer: send to main with no result -> pattern 1, use renderer.send and handle in main with main.on

/*
Cases:
 1. Module sends data to another module (no reply expected)
  1. Pattern 1: send message from renderer to main
  2. Pattern 3: relay that message from main to renderer, selecting the correct module window
 2. Module requests data from another module
  1. Pattern 2: async call main with request
  2. Pattern ?: from main, request data from module (webcontents?)
  3. Pattern 2: finish up async call and send data back
*/

contextBridge.exposeInMainWorld('electronAPI', {
  // Called by electron:main to send to this module
  relayCTCMessage: (callback) => ipcRenderer.on(Channels.CTC_OFFICE, callback),

  // These will be called by the electron:renderer process for this module
  // send*Message:    Asynchronously send a message (no response expected)
  // receive*Message: Asynchronously send a message (and expect a response)
  sendTrackControllerMessage:    (payload) => ipcRenderer.send(Channels.TRACK_CONTROLLER, payload),
  receiveTrackControllerMessage: (payload) => ipcRenderer.invoke(Channels.TRACK_CONTROLLER, payload),

  receiveTrackModelMessage:      (payload) => ipcRenderer.invoke(Channels.TRACK_MODEL, payload),
};
