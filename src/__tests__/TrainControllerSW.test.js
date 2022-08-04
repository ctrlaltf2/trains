import TrainControllerSW from '../modules/TrainControllerSW';

let TrainControl = new TrainControllerSW();

test('Train Controller exists', () => {
  expect(TrainControl).toBeTruthy();
});

test('Train Controller checks current speed bounds', () => {



  TrainControl.trainAttributes[1].currentSpdover = 75;


  TrainControl.handleCurrentSpeedChange(TrainControl.trainAttributes[1].currentSpdover);
  expect(TrainControl.currentSpeed).toBe(43);

  TrainControl.trainAttributes[1].currentSpdunder = -5;

  TrainControl.handleCurrentSpeedChange(TrainControl.trainAttributes[1].currentSpdunder);
  expect(TrainControl.currentSpeed).toBe(0);

  TrainControl.trainAttributes[1].currentSpdmiddle = 30;

  TrainControl.handleCurrentSpeedChange(TrainControl.trainAttributes[1].currentSpdmiddle);
  expect(TrainControl.currentSpeed).toBe('19');
});
