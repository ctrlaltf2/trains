import TrainControllerSW from '../modules/TrainControllerSW';

let TrainControl = new TrainControllerSW();

test('Train Controller exists', () => {
  expect(TrainControl).toBeTruthy();
});

test('Train Controller checks suggested speed bounds', () => {



  let suggestedSpdover = 75;

  TrainControl.handleCurrentSpeedChange(suggestedSpdover);
  expect(TrainControl.trainAttributes[1].suggestedSpeed).toBe(43);

  let suggestedSpdunder = -5;

  TrainControl.handleCurrentSpeedChange(suggestedSpdunder);
  expect(TrainControl.trainAttributes[1].suggestedSpeed).toBe(0);

  let suggestedSpdmiddle = 30;

  TrainControl.handleCurrentSpeedChange(suggestedSpdmiddle);
  expect(TrainControl.trainAttributes[1].suggestedSpeed).toBe('19');
});
