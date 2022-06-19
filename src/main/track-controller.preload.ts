import { contextBridge, ipcRenderer } from 'electron';
import * as Channels from './channels';

contextBridge.exposeInMainWorld('electronAPI', {
  // Called by electron:main to send to this module
  relayTrackControllerMessage: (callback) => ipcRenderer.on(Channels.TRACK_CONTROLLER, callback),

  // These will be called by the electron:renderer process for this module
  // send*Message:    Asynchronously send a message (no response expected)
  // receive*Message: Asynchronously send a message (and expect a response)
  sendCTCMessage:    (payload) => ipcRenderer.send(Channels.CTC_OFFICE, payload),
  receiveCTCMessage: (payload) => ipcRenderer.invoke(Channels.CTC_OFFICE, payload),

  sendTrackModelMessage:    (payload) => ipcRenderer.send(Channels.TRACK_MODEL, payload),
  receiveTrackModelMessage: (payload) => ipcRenderer.invoke(Channels.TRACK_MODEL, payload),
};
