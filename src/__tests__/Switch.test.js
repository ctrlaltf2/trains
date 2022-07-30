import Switch from '../modules/TrackComponents/Switch.js';

let sw = new Switch(1,2,3);

test('Switch exists', () => {
  expect(sw).toBeTruthy();
});

test('Switch set position low', () => {
  expect(sw.setPosition(2)).toStrictEqual(2);
});


test('Switch set position high', () => {
    expect(sw.setPosition(3)).toStrictEqual(3);
  });
