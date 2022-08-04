import TrainControllerSW from '../modules/TrainControllerSW';

let TrainControl = new TrainControllerSW();

test('Train Controller exists', () => {
  expect(TrainControl).toBeTruthy();
});

test('Train Controller emergency brake works', () => {

  TrainControl.emergencyBrake();
  expect(TrainControl.trainAttributes[1].emergencyButton).toEqual(true);

});
test('Train Controller service brake works', () => {

  TrainControl.toggleServiceBrake();
  expect(TrainControl.trainAttributes[1].brakeStatus).toEqual(true);

});
test('Train Controller left doors open', () => {

  TrainControl.openLeftDoors();
  expect(TrainControl.trainAttributes[1].leftDoors).toEqual(false);

});
test('Train Controller right doors open', () => {

  TrainControl.openRightDoors();
  expect(TrainControl.trainAttributes[1].rightDoors).toEqual(false);

});
test('Train Controller train lights turn on', () => {

  TrainControl.trainLightsOnOff();
  expect(TrainControl.trainAttributes[1].trainLights).toEqual(false);

});
test('Train Controller cabin lights turn on', () => {

  TrainControl.cabinLightsOnOff();
  expect(TrainControl.trainAttributes[1].cabinLights).toEqual(false);


});
test('Train Controller activates manual mode', () => {

  TrainControl.toggleAutomatic();
  expect(TrainControl.trainAttributes[1].automaticMode).toEqual(false);

});
test('Train Controller receives brake failure', () => {

  TrainControl.brakeFailure(true);
  expect(TrainControl.trainAttributes[1].breakFail).toEqual(true);

});
test('Train Controller receives engine failure', () => {

  TrainControl.engineFailure(true);
  expect(TrainControl.trainAttributes[1].engineFail).toEqual(true);

});
test('Train Controller receives signal pickup failure', () => {

  TrainControl.signalPickupFailure(true);
  expect(TrainControl.trainAttributes[1].signalPickupFail).toEqual(true);

});

