import TrackModel from '../modules/TrackModel';
import { shallow } from 'enzyme';
import { constants } from 'http2';

//  const TM = new TrackModel();
const TM = shallow(<TrackModel />);

test('Track Model Exists', () => {
  expect(TM).toBeTruthy();
});

test('TrackModel::checkTrackHeaters', () => {
  //TM.state.enviornmentTemp = 20;
  TM.setState({
    enviornmentTemp: 20,
  });

  TM.checkTrackHeaters();

  console.log(TM.state.enviornmentTemp);

  expect(TM.state.trackHeaterStatus).toBe('enabled');
});
