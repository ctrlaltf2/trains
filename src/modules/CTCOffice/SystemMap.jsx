import React from 'react';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

import './SystemMap.css';
import TrackModel from '../../../data/TrackModelV1.json';

Cytoscape.use(dagre);

class SystemMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log(TrackModel);
    const layout = {
      name: 'dagre',
      rankDir: 'LR',
    };

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
