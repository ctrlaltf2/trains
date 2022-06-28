import React from 'react';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

import './SystemMap.css';
import TrackModel from '../../../data/TrackModelV1.json';
import Style from './SystemMap.cy.json';

Cytoscape.use(dagre);

class SystemMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNodes: false,
    };
  }

  componentDidMount() {
    console.log('Mounted', this.cy);
    this.cy.on('tap', 'node', function(evt) {
      var node = evt.target;
      console.log( 'tapped ' + node.id() );
    });

    this.cy.on('tap', 'edge', function(evt) {
      var node = evt.target;
      console.log( 'tapped ' + node.id() );
    });

    // Lock nodes after the layout engine does its thing
    this.setState({
      lockNodes: true
    });
  }

  render() {
    console.log(TrackModel);
    const layout = {
      name: 'dagre',
      rankDir: 'LR',
      minLen: function(edge) { return 2; }
    };

    const { lockNodes } = this.state

    return (
      <CytoscapeComponent
        id="cy"
        elements={CytoscapeComponent.normalizeElements(TrackModel.lines.blue)}
        layout={layout}
        cy={(cy) => { this.cy = cy }}
        autolock={lockNodes}
        stylesheet={Style['base'].concat(Style['blue_line'])}
      />
    );
  }
};

SystemMap.propTypes = {
  occupancy: PropTypes.object.isRequired,
}

export default SystemMap;
