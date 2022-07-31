import CTCOffice from '../modules/CTCOffice';

let CTC = new CTCOffice();

test('CTC exists', () => {
  expect(CTC).toBeTruthy();
});

test('CTC::getStationStops', () => {
  expect(CTC.getStationStops('green', [72, 73, 74], ['Dormont'])).toStrictEqual(['73']);
});
