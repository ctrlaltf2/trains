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

test('CTCOffice::getSwitchIdentifier', () => {
  const CTC = new CTCOffice();

  expect(
    CTC.getSwitchIdentifier([5, 11, 6])
  ).toStrictEqual(
    '5-6-11'
  );

  expect(
    CTC.getSwitchIdentifier([5, 11])
  ).toStrictEqual(
    '5-11'
  );

  expect(
    CTC.getSwitchIdentifier([50, 12, 3])
  ).toStrictEqual(
    '3-12-50'
  );
});

test(`CTCOffice::inferTrainMovement, unknown source`, () => {
  const CTC = new CTCOffice();

  expect(
    CTC.inferTrainMovement('green', '43', true)
  ).toStrictEqual(
    undefined
  );
});

test(`CTCOffice::inferTrainMovement, single possible source`, () => {
  const CTC = new CTCOffice();
  CTC.trainPositions['Thomas'] = '42';

  expect(
    CTC.inferTrainMovement('green', '43', true)
  ).toStrictEqual(
    'Thomas'
  );
});

test(`CTCOffice::inferTrainMovement, multiple possible sources`, () => {
  const CTC = new CTCOffice();
  CTC.trainPositions['Thomas'] = '42';

  expect(
    CTC.inferTrainMovement('green', '43', true)
  ).toStrictEqual(
    'Thomas'
  );
});

test(`CTCOffice::inferTrainMovement, across switch junction, single source`, () => {
  const CTC = new CTCOffice();
  CTC.trainPositions['Thomas'] = '42';

  expect(
    CTC.inferTrainMovement('green', '43', true)
  ).toStrictEqual(
    'Thomas'
  );
});

test(`CTCOffice::inferTrainMovement, across switch junction, multiple source`, () => {

});

describe(`CTCOffice::inferTrainMovement, green junctions`, () => {
  test(`green junction, no 100 -> 86 movement`, () => {
    const CTC = new CTCOffice();
    CTC.trainPositions['Thomas'] = '100';

    expect(
      CTC.inferTrainMovement('green', '86', true)
    ).toBe(
      undefined
    );
  });

  test(`green junction, no 76 -> 101 movement`, () => {
    const CTC = new CTCOffice();
    CTC.trainPositions['Thomas'] = '76';

    expect(
      CTC.inferTrainMovement('green', '101', true)
    ).toBe(
      undefined
    );
  });

  test(`green junction, no 101 -> 76 movement`, () => {
    const CTC = new CTCOffice();
    CTC.trainPositions['Thomas'] = '101';

    expect(
      CTC.inferTrainMovement('green', '76', true)
    ).toBe(
      undefined
    );
  });

  test(`green junction, no 150 -> 30 movement`, () => {
    const CTC = new CTCOffice();
    CTC.trainPositions['Thomas'] = '150';

    expect(
      CTC.inferTrainMovement('green', '30', true)
    ).toBe(
      undefined
    );
  });

  test(`green junction, no 1 -> 12 movement`, () => {
    const CTC = new CTCOffice();
    CTC.trainPositions['Thomas'] = '1';

    expect(
      CTC.inferTrainMovement('green', '12', true)
    ).toBe(
      undefined
    );
  });
});

/* -- UI Tests -- */
