import TrainModel from '../modules/TrainModel';

let trainModel = new TrainModel();

/* test('Train Model exists', () => {
  expect(trainModel).toBeTruthy();
}); */

test('Check Length Function', () => {

  expect(trainModel.calculateLength()).toBe(211.2);

});
