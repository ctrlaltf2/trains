import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import '../../assets/css/pico.min.css';

import CTCOffice from '../modules/CTCOffice';

const Main = () => {
  const activeModule = window.location.hash.slice(1);

  let moduleToRender = (<p>Invalid module render selected!</p>);

  switch(activeModule) {
    case 'CTCOffice':
      moduleToRender = (<CTCOffice/>);
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
