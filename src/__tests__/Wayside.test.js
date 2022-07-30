const Wayside = require('../modules//Wayside.ts');

let w = new Wayside(1, [0,1,2,3,4,5,6,7,8,9,10,11,12,13], 13));

test('Track Controller exists', () => {
  expect(w).toBeTruthy();
});

// test('CTC::getStationStops', () => {
//   expect(TrackController.getStationStops('green', [72, 73, 74], ['Dormont'])).toStrictEqual(['73']);
// });
