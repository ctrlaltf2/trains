import TrackController from '../modules/TrackController';

let TC = new TrackController();

test('CTC exists', () => {
  expect(CTC).toBeTruthy();
});

test('CTC::getStationStops', () => {
  expect(CTC.getStationStops('green', [72, 73, 74], ['Dormont'])).toStrictEqual(['73']);
});
