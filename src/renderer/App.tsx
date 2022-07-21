import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import '../../assets/css/pico.min.css';

import CTCOffice from '../modules/CTCOffice';
import TrackController from '../modules/TrackController';
import TrackModel from '../modules/TrackModel';
import TrainModel from '../modules/TrainModel';
import TrainControllerHW from '../modules/TrainControllerHW';
import TrainControllerSW from '../modules/TrainControllerSW';

const Main = () => {
  const activeModule = window.location.hash.slice(1);

  let moduleToRender;

  switch(activeModule) {
    case 'CTCOffice':
      moduleToRender = (<CTCOffice/>);
      break;
    case 'TrackController':
      moduleToRender = (<TrackController/>);
      break;
    case 'TrackModel':
      moduleToRender = (<TrackModel/>);
      break;
    case 'TrainModel':
      moduleToRender = (<TrainModel/>);
      break;
    case 'TrainController':
      moduleToRender = (<TrainControllerSW/>);
      break;
    case 'TrainControllerHW':
      moduleToRender = (<TrainControllerHW/>);
      break;
    default:
      moduleToRender = (<p>Invalid module render selected!</p>);
  };

  return moduleToRender;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main/>} />
      </Routes>
    </Router>
  );
}
