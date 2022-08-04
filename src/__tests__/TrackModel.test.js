/* eslint-disable no-plusplus */
import TrackModel from '../modules/TrackModel';
import Switch from '../modules/TrackComponents/Switch';
import Track from '../modules/TrackComponents/Track';

import Green from '../modules/TrackComponents/TrackJSON/VF2/green.json'
import Red from '../modules/TrackComponents/TrackJSON/VF2/red.json'
import { object } from 'prop-types';

//  TESTS
test('Track Model Exists', () => {
  const TM = new TrackModel();
  expect(TM).toBeTruthy();
});

test('Track Object Exists', () => {
  const T = new Track();
  expect(T).toBeTruthy();
});

test('Track Object loads new Track from JSON', () => {
  const T = new Track();
  T.loadTrack(Green);
  expect(T.getBlocks()).toBeTruthy();
});

test('Track Model creates Track Objects', () => {
  const TM = new TrackModel();
  expect.objectContaining({
    redLineObject: expect.any(object),
    greenLineObject: expect.any(object),
  });
});

test('Track Model creates Track Object block arrayys', () => {
  const TM = new TrackModel();
  expect.objectContaining({
    redBlocks: expect.any(object),
    greenBlocks: expect.any(object),
  });

  console.log('arrays', TM.getTrackModelArrays());
});


test('Track Model objects have no block occupancy by default', () => {
  const TM = new TrackModel();
  let OccuBool = false;
  const Blocks = TM.getTrackModelArrays();
  const r = Blocks.redBlocks.length;
  const g  = Blocks.greenBlocks.length;
  for(let i = 0; i < r; i++)
  {
    if(Blocks.redBlocks[i].occupancy !== false)
    {
      OccuBool = true;
    }
  }
  for(let i = 0; i < g; i++)
  {
    if(Blocks.greenBlocks[i].occupancy !== false)
    {
      OccuBool = true;
    }
  }
  expect(OccuBool).toBe(false);
});

test('Track Model creates persons waiting at station', () => {
  const TM = new TrackModel();
  //  look at both sets of blocks
  //  red and green -- all the blocks with stations should have pos ints of people
  //  that are waiting at station
  const Blocks = TM.getTrackModelArrays()
  const greenBlocks = Blocks.greenBlocks;
  const redBlocks = Blocks.redBlocks;

  for (let i = 0; i < greenBlocks.length; i++)
  {
    if(!(greenBlocks[i].stationSide === ''))
    {
      expect(greenBlocks[i].peopleAtStation >= 1).toBeTruthy();
    }
  }
  for (let i = 0; i < redBlocks.length; i++)
  {
    if(!(redBlocks[i].stationSide === ''))
    {
      expect(redBlocks[i].peopleAtStation >= 1).toBeTruthy();
    }
  }

});

test('Track Model creates an enviornment temperature for green line', () => {
  const TM = new TrackModel();
  let sysVars = TM.getSystemVars();
  //  variable greenEVTemp
  expect(sysVars.greenEVTemp >= 0 ).toBeTruthy();
});


test('Track Model creates an enviornment temperature for red line', () => {
  const TM = new TrackModel();
  let sysVars = TM.getSystemVars();
  //  variable greenEVTemp
  expect(sysVars.redEVTemp >= 0 ).toBeTruthy();
});

test('Track model heaters kick in when temps are below freezing', () => {
  const TM = new TrackModel();
  let sys = TM.getSystemVars();

  sys.greenEVTemp = 20;
  sys.redEVTemp = 15;
  TM.checkTrackHeaters(sys.redEVTemp, sys.greenEVTemp);
  sys = TM.getSystemVars(); //  update
  expect(sys.greenTHStatus).toBe('enabled');
  expect(sys.redTHStatus).toBe('enabled');
});

test('Track model heaters are disabled in when temps are above freezing', () => {
  const TM = new TrackModel();
  let sys = TM.getSystemVars();

  sys.greenEVTemp = 35;
  sys.redEVTemp = 115;
  TM.checkTrackHeaters(sys.redEVTemp, sys.greenEVTemp);
  sys = TM.getSystemVars(); //  update
  expect(sys.greenTHStatus).toBe('disabled');
  expect(sys.redTHStatus).toBe('disabled');
});
