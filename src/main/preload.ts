import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

import * as Channels from './channels';

contextBridge.exposeInMainWorld('electronAPI', {
  // Called by electron:main to send to this module
  relayCTCMessage:              (callback) => ipcRenderer.on(Channels.CTC_OFFICE, callback),
  relayTrackControllerMessage:  (callback) => ipcRenderer.on(Channels.TRACK_CONTROLLER, callback),
  relayTrackModelMessage:       (callback) => ipcRenderer.on(Channels.TRACK_MODEL, callback),
  relayTrainModelMessage:       (callback) => ipcRenderer.on(Channels.TRAIN_MODEL, callback),
  relayTrainControllerMessage:  (callback) => ipcRenderer.on(Channels.TRAIN_CONTROLLER, callback),

  // These will be called by the electron:renderer process for this module
  // send*Message:    Asynchronously send a message (no response expected)
  // receive*Message: Asynchronously send a message (and expect a response)
  sendCTCMessage:                 (payload) => ipcRenderer.send(Channels.CTC_OFFICE, payload),
  requestCTCMessage:              (payload) => ipcRenderer.invoke(Channels.CTC_OFFICE, payload),

  sendTrackControllerMessage:     (payload) => ipcRenderer.send(Channels.TRACK_CONTROLLER, payload),
  requestTrackControllerMessage:  (payload) => ipcRenderer.invoke(Channels.TRACK_CONTROLLER, payload),

  sendTrackModelMessage:          (payload) => ipcRenderer.send(Channels.TRACK_MODEL, payload),
  requestTrackModelMessage:       (payload) => ipcRenderer.invoke(Channels.TRACK_MODEL, payload),

  sendTrainModelMessage:          (payload) => ipcRenderer.send(Channels.TRAIN_MODEL, payload),
  requestTrainModelMessage:       (payload) => ipcRenderer.invoke(Channels.TRAIN_MODEL, payload),

  sendTrainControllerMessage:     (payload) => ipcRenderer.send(Channels.TRAIN_CONTROLLER, payload),
  requestTrainControllerMessage:  (payload) => ipcRenderer.invoke(Channels.TRAIN_CONTROLLER, payload),
});
