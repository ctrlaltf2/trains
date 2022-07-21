import React from 'react';
import PropTypes from 'prop-types';
import Cytoscape from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';
import dagre from 'cytoscape-dagre';

import './SystemMap.css';

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
    console.log(oldOccupancy, newOccupancy);
    // Detect changes and call cy functions accordingly
    for (const block in newOccupancy) {
      const newBlock = !oldOccupancy[block];

      // Was an update?
      if(newBlock || (oldOccupancy[block] !== newOccupancy[block])) {
        const is_occupied = newOccupancy[block];

        const blockstr = block.toString();

        if(is_occupied) {
          this.cy.$(`[block_id = '${blockstr}']`).style('line-color', 'white');
          this.cy.$(`[block_id = '${blockstr}']`).style('source-arrow-color', 'white');
          this.cy.$(`[block_id = '${blockstr}']`).style('target-arrow-color', 'white');
          this.cy.$(`[block_id = '${blockstr}']`).style('color', 'black');
        } else {
          this.cy.$(`[block_id = '${blockstr}']`).removeStyle('line-color');
          this.cy.$(`[block_id = '${blockstr}']`).removeStyle('source-arrow-color');
          this.cy.$(`[block_id = '${blockstr}']`).removeStyle('target-arrow-color');
          this.cy.$(`[block_id = '${blockstr}']`).removeStyle('color');
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
    const { stylesheet, displayGraph } = this.props;

    return (
      <CytoscapeComponent
        id="cy"
        elements={CytoscapeComponent.normalizeElements(displayGraph)}
        cy={(cy) => { this.cy = cy }}
        autolock={lockNodes}
        stylesheet={stylesheet}
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
  displayGraph: PropTypes.object.isRequired,
  stylesheet:   PropTypes.object.isRequired,
};

export default SystemMap;
