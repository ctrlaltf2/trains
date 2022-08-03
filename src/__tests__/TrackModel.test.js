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

  console.log('red array', TM.redBlocks);
  console.log('green array', TM.greenBlocks);
});
// test('Track Model objects have no block occupancy by default', () => {
//   const TM = new TrackModel();
//   let OccuBool = false;
//   const f = TM.redBlocks.length;
//   for(let i = 0; i < f; i++)
//   {
//     if(TM.redBlocks[i].Occupied !== 'Unoccupied')
//     {
//       OccuBool = true;
//     }
//   }
//   expect(OccuBool).toBe(false);
// });


