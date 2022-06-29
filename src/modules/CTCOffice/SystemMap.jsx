import React from 'react';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

import './SystemMap.css';
import TrackModel from '../../../data/TrackModel-display.json';
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
      // TODO: Pull up a switch dialogue for changing positions (mmode only)
    });

    this.cy.on('tap', 'edge', function(evt) {
      var node = evt.target;
      console.log( 'tapped ' + node.id() );
      // TODO: Pull out block_name from this?
    });

    // Lock nodes after the layout engine does its thing
    this.setState({
      lockNodes: true
    });

    this.updateBlockOccupancyUI({}, this.props.occupancy);
  }

  componentDidUpdate(prevProps) {
    // if occupancy changed
    if(JSON.stringify(prevProps.occupancy) !== JSON.stringify(this.props.occupancy))
      this.updateBlockOccupancyUI(prevProps.occupancy, this.props.occupancy);

    // Future prop changes here (e.g. signal states)
  }

  updateBlockOccupancyUI(oldOccupancy, newOccupancy) {

    // Detect changes and call cy functions accordingly
    for (const line in newOccupancy) {
      if(line !== 'blue') // TODO: Configure system map to be able to select lines
        continue;

      const newLine = !oldOccupancy[line]; // true if new line occupancy info added

      for (const block in newOccupancy[line]) {
        const newBlock = newLine || !oldOccupancy[line][block];

        // Was an update?
        if(newBlock || (oldOccupancy[line][block] !== newOccupancy[line][block])) {
          const is_occupied = newOccupancy[line][block];

          if(is_occupied) {
            this.cy.$(`[block_id = '${block}']`).style('line-color', 'white');
            this.cy.$(`[block_id = '${block}']`).style('source-arrow-color', 'white');
            this.cy.$(`[block_id = '${block}']`).style('target-arrow-color', 'white');
            this.cy.$(`[block_id = '${block}']`).style('color', 'black');
          } else {
            this.cy.$(`[block_id = '${block}']`).removeStyle('line-color');
            this.cy.$(`[block_id = '${block}']`).removeStyle('source-arrow-color');
            this.cy.$(`[block_id = '${block}']`).removeStyle('target-arrow-color');
            this.cy.$(`[block_id = '${block}']`).removeStyle('color');
          }
        }
      }
    }
  }

  render() {
    const layout = {
      // name: 'dagre',
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
        autolock={false}
        stylesheet={Style['base'].concat(Style['blue_line'])}
      />
    );
  }
};

SystemMap.propTypes = {
  occupancy: PropTypes.object.isRequired,
}

export default SystemMap;
