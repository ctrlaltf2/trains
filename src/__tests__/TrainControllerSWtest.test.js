import TrainControllerSW from '../modules/TrainControllerSW';

let TrainControl = new TrainControllerSW();

test('Train Controller exists', () => {
  expect(TrainControl).toBeTruthy();
});

test('Train Controller checks current speed bounds', () => {
  let overBound = {
    target: {
      value: '75'
    }
  };

  TrainControl.handleCurrentSpeedChange(overBound);
  expect(TrainControl.currentSpeed).toBe(70);

  let underBound = {
    target: {
      value: '-5'
    }
  };

  TrainControl.handleCurrentSpeedChange(underBound);
  expect(TrainControl.currentSpeed).toBe(0);

  let inBetweenBound = {
    target: {
      value: '30'
    }
  };

  TrainControl.handleCurrentSpeedChange(inBetweenBound);
  expect(TrainControl.currentSpeed).toBe('30');
});
