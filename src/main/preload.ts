import { contextBridge, ipcRenderer } from 'electron';

import * as Modules from './modules';

contextBridge.exposeInMainWorld('electronAPI', {
  // Called by electron:main to send to this module
  subscribeCTCMessage:              (callback) => ipcRenderer.on(Modules.CTC_OFFICE, callback),
  subscribeTrackControllerMessage:  (callback) => ipcRenderer.on(Modules.TRACK_CONTROLLER, callback),
  subscribeTrackModelMessage:       (callback) => ipcRenderer.on(Modules.TRACK_MODEL, callback),
  subscribeTrainModelMessage:       (callback) => ipcRenderer.on(Modules.TRAIN_MODEL, callback),
  subscribeTrainControllerMessage:  (callback) => ipcRenderer.on(Modules.TRAIN_CONTROLLER, callback),
  subscribeTimerMessage:            (callback) => ipcRenderer.on(Modules.TIMER, callback),

  subscribeFileMessage: (callback) => ipcRenderer.on('file', callback),

  // These will be called by the electron:renderer process for this module
  // send*Message:    Asynchronously send a message (no response expected)
  // receive*Message: Asynchronously send a message (and expect a response)
  sendCTCMessage:                 (payload) => ipcRenderer.send(Modules.CTC_OFFICE, payload),
  sendTrackControllerMessage:     (payload) => ipcRenderer.send(Modules.TRACK_CONTROLLER, payload),
  sendTrackModelMessage:          (payload) => ipcRenderer.send(Modules.TRACK_MODEL, payload),
  sendTrainModelMessage:          (payload) => ipcRenderer.send(Modules.TRAIN_MODEL, payload),
  sendTrainControllerSWMessage:   (payload) => ipcRenderer.send(Modules.TRAIN_CONTROLLER_SW, payload),
  sendTrainControllerHWMessage:   (payload) => ipcRenderer.send(Modules.TRAIN_CONTROLLER_SW, payload),

  sendTrainControllerHWMessage:     (payload) => ipcRenderer.send(Modules.TRAIN_CONTROLLER_SW, payload),
  requestTrainControllerHWMessage:  (payload) => ipcRenderer.invoke(Modules.TRAIN_CONTROLLER_SW, payload),

  sendTimePause:          (doPause) => ipcRenderer.send('timer::pause', doPause),
  sendTimeFastForward:    (timeScalar) => ipcRenderer.send('timer::time-multiplier', timeScalar),

  openFileDialog: (tag) => ipcRenderer.send('file', tag)

});
