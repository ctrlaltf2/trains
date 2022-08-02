import TrackController from '../modules/TrackController';
import Switch from '../modules/TrackComponents/Switch';
import Track from '../modules/TrackComponents/Track';
import PLCReader from '../modules/PLCReader';
import Block from '../modules/TrackComponents/Block';
import Wayside from  '../modules/Wayside';

// json files
import SW13 from '../modules/PLC/Green/SW13.json';
import green from '../modules/TrackComponents/TrackJSON/VF2/green.json';
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

// sets all blocks for track controller including switches
test('Track::setInfrastructure - switch', () => {
  const track = new Track();
  track.loadTrack(green);
  track.setInfrastructure();

  const SW = new Switch("13",1,12);

  expect(track.blocks[12].switch).toEqual(SW);
});

test('Track::setInfrastructure - crossing', () => {
  const track = new Track();
  track.loadTrack(green);
  track.setInfrastructure();

  // initializes to false 
  expect(track.blocks[18].crossing).toEqual(false);
});

test('Track::setInfrastructure - no crossing', () => {
  const track = new Track();
  track.loadTrack(green);
  track.setInfrastructure();

  // initializes to false 
  expect(track.blocks[17].crossing).toEqual('no crossing data');
});

test('TrackController::setPLC - per controller without any plc', () => {
  // Need block data
  const track = new Track();
  track.loadTrack(green);
  track.setInfrastructure();

  // PLC reader to compare
  const plc = new PLCReader();
  
  const controller = new Wayside(1, track.blocks.slice(1,20), 12, 'green');
  expect(controller.plc).toEqual(plc);
});

test('TrackController::setPLC - per controller', () => {
  // Need block data
  const track = new Track();
  track.loadTrack(green);
  track.setInfrastructure();

  // PLC reader to compare
  const plc = new PLCReader();
  plc.parse(SW13);
  
  const controller = new Wayside(1, track.blocks.slice(1,20), 12, 'green');
  controller.setPLC(SW13);
  expect(controller.plc).toEqual(plc);
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

test('TrackController::plcLight - green', () => {
  const TC = new TrackController();

  TC.occupy(1, 'green', false);
  TC.plc();
  expect(TC.getBlock(13, 'green').transitLight).toEqual('green');
});

test('TrackController::plcLight - yellow', () => {
  const TC = new TrackController();

  TC.occupy(1, 'red', true);
  TC.plc();
  expect(TC.getBlock(15, 'red').transitLight).toEqual('yellow');

  // check resets properly back to green
  TC.occupy(1, 'red', false);
  TC.plc();
  expect(TC.getBlock(15, 'red').transitLight).toEqual('green');
});

test('TrackController::plcLight - red', () => {
  const TC = new TrackController();

  TC.occupy(1, 'green', true);
  TC.plc();
  expect(TC.getBlock(13, 'green').transitLight).toEqual('red');

  // Resets properly back to green 
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

test('TrackController::loadPLC', () => {
  const PLCRead = new PLCReader();
  PLCRead.parse(SW13);
  const TC = new TrackController();
  TC.getController(1).setPLC(SW13);

  expect(TC.getController(1).plc).toEqual(PLCRead);
});
