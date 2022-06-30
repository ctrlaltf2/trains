import React from 'react';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

import './SystemMap.css';
import TrackModel from '../../../data/TrackModel-display.json';
import Style from './SystemMap.cy.json';

Cytoscape.use(dagre);

// TODO: Decide if SystemMap is per-line basis- probably easier if so.

class SystemMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lockNodes: false,
    };

    // TODO: Propogate this upwards
    this.block_closures = {}; // indexed by block_id
  }

  componentDidMount() {
    this.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      if(!this.props.manualMode)
        return;

      if(node.data('switch') === true) {
        // Get connected blocks
        const all_connected_edges = Array.from(new Set(node
                                      .connectedEdges()
                                      .map( (edge) => edge.data('block_id') )));

        console.log(`Opening switch edit modal with all_connected_edges=${all_connected_edges}`);
        console.log(all_connected_edges)
        this.props.onSwitchEdit(all_connected_edges);
      }
    });

    this.cy.on('tap', 'edge', (evt) => {
      const block = evt.target;
      const block_id = block.data('block_id');
      if(block_id && this.props.manualMode) {
        console.log(`Opening block edit modal with block_id=${block_id}`);
        this.props.onBlockEdit(block_id);
      }
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

  updateBlockClosure(block_id, is_closed) {
    console.log('Updating block closure style...');

    if(is_closed)
      this.cy.$(`[block_id = '${block_id}']`).style('opacity', 0.25);
    else
      this.cy.$(`[block_id = '${block_id}']`).removeStyle('opacity');
    // this.forceRender();
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

  // TODO: propogate closure states upwards
  updateBlockClosedUI() { }

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
        motionBlur={true}
      />
    );
  }
};

SystemMap.propTypes = {
  occupancy:    PropTypes.object.isRequired,
  onSwitchEdit: PropTypes.func.isRequired,
  // switches: PropTypes.object.isRequired,
  onBlockEdit:  PropTypes.func.isRequired,
  // blockClosures: PropTypes.object.isRequired,
  // onSwitchChange: PropTypes.func.isRequired,
  manualMode:   PropTypes.bool.isRequired,
};

export default SystemMap;
