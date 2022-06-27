import React from 'react';
import PropTypes from 'prop-types';
import CytoscapeComponent from 'react-cytoscapejs';

import './SystemMap.css';
import TrackModel from '../../../data/TrackModelV1.json';

class SystemMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log(TrackModel);
    const layout = { name: 'random' };

    return (
      <CytoscapeComponent
        id="cy"
        elements={CytoscapeComponent.normalizeElements(TrackModel.lines.blue)}
        layout={layout}
        cy={(cy) => { this.cy = cy }}
      />
    );
  }
};

SystemMap.propTypes = {
  occupancy: PropTypes.object.isRequired,
}

export default SystemMap;
