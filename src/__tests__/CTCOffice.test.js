import CTCOffice from '../modules/CTCOffice';


/* -- CTC Unit Tests -- */
test('CTC exists', () => {
  const CTC = new CTCOffice();

  expect(CTC).toBeDefined();
});

test('CTC::getStationStops', () => {
  const CTC = new CTCOffice();

  expect(
    CTC.getStationStops('green', [72, 73, 74], ['Dormont'])
  ).toStrictEqual(
    ['73']
  );
});

test('CTC::getStationStops works with strings', () => {
  const CTC = new CTCOffice();

  expect(
    CTC.getStationStops('green', ['72', '73', '74'], ['Dormont'])
  ).toStrictEqual(
    ['73']
  );
});

test('CTC::getStationStops, duplicates case', () => {
  const CTC = new CTCOffice();

  expect(
    CTC.getStationStops('green', [73, 77, 105], ['Dormont', 'Mt. Lebanon'])
  ).toStrictEqual(
    ['73', '77']
  );
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
  const CTC = new CTCOffice();
  CTC.trainPositions['Thomas'] = '29';

  expect(
    CTC.inferTrainMovement('green', '30', true)
  ).toStrictEqual(
    'Thomas'
  );
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

describe(`CTCOffice::initCy loads red and green lines`, () => {
  // Routing graphs
  test(`red routing graph`, () => {
    const CTC = new CTCOffice();

    expect(
      CTC.cy['red']
    ).toBeDefined();
  });

  test(`green routing graph`, () => {
    const CTC = new CTCOffice();

    expect(
      CTC.cy['green']
    ).toBeDefined();
  });

  // Display graphs
  test(`red display graph`, () => {
    const CTC = new CTCOffice();

    expect(
      CTC.cy_display['red']
    ).toBeDefined();
  });

  test(`green display graph`, () => {
    const CTC = new CTCOffice();

    expect(
      CTC.cy_display['green']
    ).toBeDefined();
  });
});

describe(`CTCOffice::getIntersegmentRoute`, () => {
  const CTC = new CTCOffice();

  describe(`Green Line`, () => {
    test('South Bank -> Dormont', () => {
      expect(
        CTC.getIntersegmentRoute('green', 'South Bank', 'Dormont::S')
      ).toStrictEqual(
        [
          'South Bank',
          '(South Bank-Central)',
          'Central::E',
          '(Central-Inglewood)',
          'Inglewood::E',
          '(Inglewood-Overbrook)',
          'Overbrook::E',
          '(J)',
          '(yard-Glenbury)',
          'Glenbury::S',
          '(Glenbury-Dormont)',
          'Dormont::S'
        ]
      );
    });

    test('Central -> Whited', () => {
      expect(
        CTC.getIntersegmentRoute('green', 'Central::W', 'Whited::E')
      ).toStrictEqual(
        [
          'Central::W',
          '(Central-FGZ)',
          '(FGZ-Whited)',
          'Whited::E'
        ]
      );
    });

    test('Mt. Lebanon (due West) -> Dormont', () => {
      expect(
        CTC.getIntersegmentRoute('green', 'Mt. Lebanon::W', 'Dormont::N')
      ).toStrictEqual([
        'Mt. Lebanon::W',
        '(Mt. Lebanon-Poplar)',
        'Poplar',
        '(Poplar-Castle Shannon)',
        'Castle Shannon',
        '(Castle Shannon-Mt. Lebanon)',
        'Mt. Lebanon::E',
        '(Mt. Lebanon-Dormont)',
        'Dormont::N'
      ]);
    });

    test('Sanity check - all segments defined in route_lookup', () => {
      expect(
        CTC.cy['green'].edges().map( (edge) => {
          return edge.data('id');
        })
        .sort()
      ).toStrictEqual(
        Array.from(
          Object.keys(
            CTC.route_lookup['green']
          )
        ).sort()
      );
    });

    test('Sanity check - all stations defined', () => {
      expect(
        Array.from(
          new Set(
            CTC.cy['green'].edges().filter( (edge) => {
              return edge.data('station');
            })
            .map( (edge) => {
              return edge.data('id');
            })
            .map( (station_name) => {
              return station_name.split('::')[0];
            })
          )
        ).sort()
      ).toStrictEqual(
        Array.from(
          new Set(
            Object.values(
              CTC.stations['green']
            )
          )
        ).sort()
      );
    });
  });

  const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

  describe('Red Line', () => {
    test('Yard exit -> Swissville', () => {
      expect(
        CTC.getIntersegmentRoute('red', '(yard-exit)', 'Swissville::D')
      ).toStrictEqual([
        '(yard-exit)',
        '(yard-Shadyside)',
        'Shadyside::D',
        '(Shadyside-Herron Ave.)',
        'Herron Ave.::D',
        '(Herron Ave.-Swissville)',
        'Swissville::D',
      ]);
    });

    test('Swissville (E) -> Swissville (W) (round upper loop)', () => {
      expect(
        CTC.getIntersegmentRoute('red', 'Swissville::U', 'Swissville::D')
      ).toStrictEqual([
        'Swissville::U',
        '(Swissville-Herron Ave.)',
        'Herron Ave.::U',
        '(Herron Ave.-Shadyside)',
        'Shadyside::U',
        '(Shadyside-yard)',
        '(yard-Herron Ave.)',
        'Herron Ave.::D',
        '(Herron Ave.-Swissville)',
        'Swissville::D',
      ]);
    });

    test('First Ave. (U) -> Penn Station (U) (upwards through center)', () => {
      expect(
        CTC.getIntersegmentRoute('red', 'First Ave.::U', 'Penn Station::U')
      ).toStrictEqual([
        'First Ave.::U',
        '(First Ave.-Steel Plaza)',
        'Steel Plaza::U',
        '(Steel Plaza-Penn Station)',
        'Penn Station::U'
      ]);
    });

    test('Penn Station (D) -> First Ave. (D) (downwards through center)', () => {
      expect(
        CTC.getIntersegmentRoute('red', 'Penn Station::D', 'First Ave.::D')
      ).toStrictEqual([
        'Penn Station::D'
        '(Penn Station-Steel Plaza)',
        'Steel Plaza::D',
        '(Steel Plaza-First Ave.)',
        'First Ave.::D'
      ]);
    });

    test('Sanity check - all stations defined', () => {
      expect(
        CTC.cy['red'].edges().map( (edge) => {
          return edge.data('id');
        })
        .sort()
      ).toStrictEqual(
        Array.from(
          Object.keys(
            CTC.route_lookup['red']
          )
        ).sort()
      );
    });

    test('Sanity check - all stations defined', () => {
      expect(
        Array.from(
          new Set(
            CTC.cy['red'].edges().filter( (edge) => {
              return edge.data('station');
            })
            .map( (edge) => {
              return edge.data('id');
            })
            .map( (station_name) => {
              return station_name.split('::')[0];
            })
          )
        ).sort()
      ).toStrictEqual(
        Array.from(
          new Set(
            Object.values(
              CTC.stations['red']
            )
          )
        ).sort()
      );
    });
  });
});

test('CTCOffice:checkShouldDispatch', () => {
  // Run with multiple timestamps, there's some string <-> float conversion happening
  for(let i = 0; i < 1; ++i) {
    const CTC = new CTCOffice();
    window.electronAPI.sendTrackControllerMessage = jest.fn( payload => {} );

    const time = Math.abs(Math.random()) * 20;
    const time_dont_dispatch = time * 0.95;
    const time_do_dispatch = time * 1.10;

    // Make CTC.sendDispatchMessage mock
    CTC.sendDispatchMessage = jest.fn( train => {} );

    // Add a dummy dispatch
    CTC.pendingDispatches[time] = {};

    // Check previous times
    CTC.now = 0;
    CTC.checkShouldDispatch();

    expect(
      CTC.sendDispatchMessage.mock.calls.length
    ).toBe(
      0
    );

    CTC.now = time_dont_dispatch;
    CTC.checkShouldDispatch();

    expect(
      CTC.sendDispatchMessage.mock.calls.length
    ).toBe(
      0
    );

    // Check should dispatch time
    CTC.now = time_do_dispatch;
    CTC.checkShouldDispatch();

    expect(
      CTC.sendDispatchMessage.mock.calls.length
    ).toBe(
      1
    );

    // And make sure it was removed from dispatches
    expect(
      Object.keys(CTC.pendingDispatches).length
    ).toBe(
      0
    );
  }
});

describe('CTCOffice::sendDispatchMessage', () => {
  test('Messages Track Controller', () => {
    const CTC = new CTCOffice();
    window.electronAPI.sendTrackControllerMessage = jest.fn( payload => {} );

    CTC.sendDispatchMessage({});

    expect(
      window.electronAPI.sendTrackControllerMessage.mock.calls.length
    ).toBe(
      1
    );
  });
});
