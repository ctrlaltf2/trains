import TrackController from '../modules/TrackController';
import Switch from '../modules/TrackComponents/Switch';
import Track from '../modules/TrackComponents/Track';

test('Track Controller exists', () => {
  const TC = new TrackController();
  expect(TC).toBeTruthy();
});

test('Switch exists', () => {
  const SW = new Switch(1, 2, 3);
  expect(SW).toBeTruthy();
});

test('Switch::setPosition', () => {
  const SW = new Switch(1, 2, 3);
  SW.setPosition(2);
  expect(SW.position).toEqual(2);
});

test('Switch::setPosition2', () => {
  const SW = new Switch(1, 2, 3);
  SW.setPosition(3);
  expect(SW.position).toEqual(3);
});

test('TrackController::MaintenanceMode', () => {
  const TC = new TrackController();
  TC.CTCMMode(1, 'green', true);
  expect(TC.getBlock(1, 'green').maintenanceMode).toEqual(true);
});

test('TrackController::setSwitchTrue', () => {
  const TC = new TrackController();
  TC.setSwitchCTC(13, 1, 'green');
  expect(TC.getSwitchPos(13, 'green')).toEqual(1);
});

test('TrackController::setSwitchFalse', () => {
  const TC = new TrackController();
  TC.setSwitchCTC(13, 12, 'green');
  expect(TC.getSwitchPos(13, 'green')).toEqual(12);
});

test('TrackController::occupy', () => {
  const TC = new TrackController();
  TC.occupy(13, 'green', true);
  expect(TC.getBlock(13, 'green').occupancy).toEqual(true);
  expect(TC.getBlock(12, 'green').occupancy).toEqual(false);
});

//PLC must be preloaded in TrackController.jsx in order for tests to run
test('TrackController::plcSW', () => {
  const TC = new TrackController();

  TC.occupy(13, 'green', true);
  TC.plc();
  expect(TC.getSwitchPos(13, 'green')).toEqual(12);

  TC.occupy(13, 'green', false);
  TC.plc();
  expect(TC.getSwitchPos(13, 'green')).toEqual(1);
});

test('TrackController::plcLight', () => {
  const TC = new TrackController();

  TC.occupy(1, 'green', true);
  TC.plc();
  expect(TC.getBlock(13, 'green').transitLight).toEqual('red');

  TC.occupy(1, 'green', false);
  TC.plc();
  expect(TC.getBlock(13, 'green').transitLight).toEqual('green');
});

test('TrackController::plcCrossing', () => {
  const TC = new TrackController();

  expect(TC.getBlock(19, 'green').crossing).toEqual(false);

  TC.occupy(19, 'green', true);
  TC.plc();
  expect(TC.getBlock(19, 'green').crossing).toEqual(true);
});
