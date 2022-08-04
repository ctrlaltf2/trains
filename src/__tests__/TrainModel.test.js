import TrainModel from '../modules/TrainModel';

// TESTS
test('Train Model Exists', () => {
  const newTrain = new TrainModel();
  expect(newTrain).toBeTruthy();
});

test('Murphy Breaks Train Engine', () => {
  const newTrain = new TrainModel();

  newTrain.toggleTrainEngineStatus();
  expect(newTrain.trainEngineStatusTest).toEqual(false);
});

test('Murphy Resets Train Engine', () => {
  const newTrain = new TrainModel();
  newTrain.trainEngineStatusTest = false;

  newTrain.toggleTrainEngineStatus();
  expect(newTrain.trainEngineStatusTest).toEqual(true);
});

test('Murphy Breaks Brakes', () => {
  const newTrain = new TrainModel();

  newTrain.toggleBrakeStatus();
  expect(newTrain.brakeStatusTest).toEqual(false);
});

test('Murphy Resets Brakes', () => {
  const newTrain = new TrainModel();
  newTrain.brakeStatusTest = false;

  newTrain.toggleBrakeStatus();
  expect(newTrain.brakeStatusTest).toEqual(true);
});

test('Murphy Breaks Signal Pickup', () => {
  const newTrain = new TrainModel();

  newTrain.toggleSignalPickupStatus();
  expect(newTrain.signalPickupStatusTest).toEqual(false);
});

test('Murphy Resets Signal Pickup', () => {
  const newTrain = new TrainModel();
  newTrain.signalPickupStatusTest = false;

  newTrain.toggleSignalPickupStatus();
  expect(newTrain.signalPickupStatusTest).toEqual(true);
});

test('Murphy Resets All Statuses', () => {
  const newTrain = new TrainModel();

  newTrain.resetAll();
  expect(newTrain.signalPickupStatusTest).toEqual(true);
  expect(newTrain.brakeStatusTest).toEqual(true);
  expect(newTrain.trainEngineStatusTest).toEqual(true);
});

test('Passenger Pulls E Brake', () => {
  const newTrain = new TrainModel();

  newTrain.toggleEmergencyBrake();
  expect(newTrain.emergencyBrakeTest).toEqual(true);
});
