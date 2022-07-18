/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

const fs = require('fs');

import * as Modules from './modules';
import Timer from './Timer';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// Dict[ModuleName: string, moduleWindow: BrowserWindow]
const moduleWindows = {};

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const activeModules = [
  //  'CTCOffice',
  // 'TrackController',
  'TrackModel',
  //  'TrainModel',
  //  'TrainControllerHW',
  //  'TrainControllerSW',
  'CTCOffice',
  //'TrackController',
  // 'TrackModel',
  // 'TrainModel',
  // 'TrainControllerHW',
  //'TrainControllerSW',
  'Timer',
];

const createWindow = async (moduleName: string) => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  let moduleWindow;
  if (moduleName === Modules.TIMER) {
    moduleWindow = new BrowserWindow({
      show: false,
      width: 350,
      height: 250,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });
  } else {
    moduleWindow = new BrowserWindow({
      show: false,
      width: 1024,
      height: 728,
      icon: getAssetPath('icon.png'),
      webPreferences: {
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
    });
  }

  moduleWindows[moduleName] = moduleWindow;

  moduleWindow.loadURL(`${resolveHtmlPath('index.html')}#${moduleName}`);

  moduleWindow.on('ready-to-show', () => {
    if (!moduleWindow) {
      throw new Error(`"moduleWindow: ${moduleWindow}" is not defined.`);
    }
    if (process.env.START_MINIMIZED) {
      moduleWindow.minimize();
    } else {
      moduleWindow.show();
    }
  });

  moduleWindow.on('closed', () => {
    moduleWindow = null;
  });

  const menuBuilder = new MenuBuilder(moduleWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  moduleWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const t = new Timer(100, 8 * 60 * 60 * 1000);

app
  .whenReady()
  .then(() => {
    activeModules.forEach((mod) => createWindow(mod));
    /*
    for(const activeModule of activeModules)
      createWindow(activeModule); */

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      activeModules.forEach((mod) => {
        if (moduleWindows[mod] === undefined) createWindow(mod);
      });
    });

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

    Object.values(Modules.ALL_MODULES).forEach((moduleName) => {
      ipcMain.on(moduleName, (_event, payload) => {
        moduleWindows[moduleName].webContents.send(moduleName, payload);
      });
    });

    ipcMain.on('timer::pause', (_event, payload) => {
      // TODO: Message validation
      console.log('timer::pause', payload);
      t.pause(payload);
    });

    ipcMain.on('timer::time-multiplier', (_event, payload) => {
      // TODO: Message validation
      console.log('timer::time-multiplier', payload);
      t.setTimeScalar(payload);
    });

    t.onClock((timestamp) => {
      activeModules.forEach((moduleName) => {
        moduleWindows[moduleName].webContents.send(Modules.TIMER, {
          timestamp: timestamp,
        });
      });
    });

    t.start();

    ipcMain.on('file', (_event, tag) => {
      dialog
        .showOpenDialog({
          properties: ['openFile'],
        })
        .then((response) => {
          if (!response.canceled) {
            _event.sender.send('file', response.filePaths[0]);

            fs.readFile(response.filePaths[0], 'utf8', (err, data) => {
              if (err) {
                _event.sender.send('file', {
                  tag: tag,
                  status: 'error',
                  payload: err,
                });

                return;
              }

              _event.sender.send('file', {
                tag: tag,
                status: 'success',
                payload: data,
              });
            });
          } else {
            _event.sender.send('file', {
              tag: tag,
              status: 'error',
              payload: 'cancelled',
            });
          }
        });
    });
  })
  .catch(console.log);
