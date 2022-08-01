import CTCOffice from '../modules/CTCOffice';


/* -- CTC Unit Tests -- */
test('CTC exists', () => {
  const CTC = new CTCOffice();

  expect(CTC).toBeTruthy();
});

test('CTC::getStationStops', () => {
  const CTC = new CTCOffice();

  expect(CTC.getStationStops('green', [72, 73, 74], ['Dormont'])).toStrictEqual(['73']);
});

// Query Speed limits for a list of blocks on a line
test(`CTC::generateSpeedTable('green')`, () => {
  const CTC = new CTCOffice();

  expect(
    CTC.generateSpeedTable('green', [5, 14, 19, 24, 27]))
  .toEqual(
    [45, 70, 60, 70, 30]
  );

  expect(
    CTC.generateSpeedTable('green', ['5', '14', '19', '24', '27']))
  .toEqual(
    [45, 70, 60, 70, 30]
  );
});

test(`CTC::makeSpeedTableSafe`, () => {
  const CTC = new CTCOffice();

  const first_decrease = 0.6;
  const second_decrease = 0.35;

  expect(
    CTC.makeSpeedTableSafe([45, 70, 60, 70, 30]))
  .toEqual(
    [45, 70, 60, 70*first_decrease, 30*second_decrease]
  );

  expect(
    CTC.makeSpeedTableSafe([45, 70]))
  .toEqual(
    [45*first_decrease, 70*second_decrease]
  );

  expect(
    CTC.makeSpeedTableSafe([45]))
  .toEqual(
    [45*second_decrease]
  );

  expect(
    CTC.makeSpeedTableSafe([45]))
  .toEqual(
    [45*second_decrease]
  );

  expect(
    CTC.makeSpeedTableSafe([]))
  .toEqual(
    []
  );
});

test(`CTC::resolveSegmentRoutes('green')`, () => {
  const CTC = new CTCOffice();
  console.log(CTC.resolveSegmentRoutes('green', ['(ACDw-UNKNOWN)', 'Whited::E', '(ACDe-Edgebrook)']));

  expect(
    CTC.resolveSegmentRoutes('green', ['(ACDw-UNKNOWN)', 'Whited::E', '(ACDe-Edgebrook)']))
  .toEqual(
    [13, 14, 15, 22, 12, 11, 10]
  );
});


/* -- UI Tests -- */
