// const TrackController = require('../modules/TrackController');
import TrackController from  '../modules/TrackController';

let TC = new TrackController();

test('Track Controller exists', () => {
  expect(TC).toBeTruthy();
});

// test('CTC::getStationStops', () => {
//   expect(TrackController.getStationStops('green', [72, 73, 74], ['Dormont'])).toStrictEqual(['73']);
// });
