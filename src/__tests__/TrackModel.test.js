import TrackModel from '../modules/TrackModel';
import Switch from '../modules/TrackComponents/Switch';
import Track from '../modules/TrackComponents/Track';

import Green from '../modules/TrackComponents/TrackJSON/VF2/green.json'
import Red from '../modules/TrackComponents/TrackJSON/VF2/red.json'

//  TESTS
test('Track Model Exists', () => {
  const TM = new TrackModel();
  expect(TM).toBeTruthy();
});

test('Track Object Exists', () => {
  const T = new Track();
});

// test('Track can generate from JSON object', () => {
//   const T = new Track();
//   expect(T.load(Green)).toBeTruthy();
//   expect(T.blocks).toBeTruthy();
//   expect(T.blocks[1].line).toEqual('Green');
// })