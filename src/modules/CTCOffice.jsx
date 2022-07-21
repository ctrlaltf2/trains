import React from 'react';
import {
  Button,
  ThemeProvider,
  createTheme,
  Modal,
  TextField,
  Switch,
  FormGroup,
  FormControlLabel,
  Box,
  Typography,
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import cytoscape from 'cytoscape';

import _ from 'lodash';

import SystemMap from './CTCOffice/SystemMap';
import Train from './CTCOffice/Train';
import TrackSwitch from './CTCOffice/Switch';
import TrackModel from '../../data/TrackModel-section-routing.json';
import TrackModelInfo from '../../data/TrackModel-info.json';
import TrackModelDisplay from '../../data/TrackModel-display.json';
import Style from './CTCOffice/SystemMap.cy.json';

import './CTCOffice.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Input = styled('input')({
  display: 'none',
});

// Enum-like structure for all UI states
const UIState = {
  Main:         'Main',
  Viewing: {
    Train:      'ViewingTrain',
  },
  Test:         'Test',
};

class CTCOffice extends React.Component {
  constructor(props) {
    super(props);

    window.electronAPI.subscribeCTCMessage( (_event, payload) => {
      console.log('IPC:CTCOffice: ', payload);

      switch(payload.type) {
        case 'throughput':
          // TODO: message validation
          const throughput = _.cloneDeep(this.state.throughput);
          throughput[payload.line] = payload.value;

          this.setState({
            throughput: throughput
          });
          break;
        case 'occupancy':
          // TODO: message validation
          this.updateBlockOccupancy(payload.line, payload.block_id, payload.value);
          break;
        case 'timing':
          console.log(Date.now() - payload.value);
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    window.electronAPI.subscribeFileMessage( (_event, payload) => {
      console.log(payload);
    });

    this.state = {
      UIMode: UIState.Main,
      isDispatchModalOpen: false,
      throughput: {
        'red': 0,
        'green': 1,
      },
      testUI: {
        lineSelection: undefined,
        trainSelection: undefined,
        blockSelection: undefined,
        throughputValue: undefined,
      },
      occupancy: { // occupancy[line][block_id] = is_occupied: bool
        'red': {},
        'green': {
          '67': true,
          '21': true
        },
      },
      switches: { // switches[line][sorted([blocks connected to]).join('-')] = Switch(...)
        'red': {},
        'green': {
          '85-86-100': new TrackSwitch(undefined, '85', ['86', '100']),
          '76-77-101': new TrackSwitch(undefined, '77', ['76', '101']),
          '29-30-150': new TrackSwitch(undefined, '29', ['30', '150']),
          '1-12-13':   new TrackSwitch(undefined, '13', [ '1',  '12']),
          '57-58':  new TrackSwitch(undefined, '57', ['58', '152']) // TODO: Add yard
        },
        'blue': {
          '5-6-11': new TrackSwitch(undefined, '5', ['6', '11'])
        },
      },
      closures: { // closures[line][block_id] = is_closed;
        'red': {},
        'green': {},
      },
      activeTrainIDs: {
        'red': [],
        'green': [],
      },
      enteredETA: undefined,
      manualMode: false,
      switchModalOpen: false,
      blockModalOpen: false,
      editingSwitch: undefined,
      editingBlock: undefined,
      switchGoingToPosition: undefined,
      activeLine: 'green',
    };

    this.nextTrainID = 1;
    this.trains = {
      '-1': new Train(
        '-1',
        'green',
        'nodestination',
        0,
        29,
        []
      )
    };
    this.trainPositions = {
      '-1': '21'
    }; // str(train id) -> str(block_id)

    this.systemMapRef = React.createRef();
    this.pendingDispatches = {}; // timestamp to send off

    // Off-screen cytoscape element for routing algos and other shenanigans
    // Indexed by line
    this.cy = {
      'red': undefined,
      'green': undefined,
    };

    // Display graphs, not the same as the systemmap ones, used for some more shenanigans
    this.cy_display = {}

    // Generate section-based routing expansions
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

    this.route_green_lookup = {
      '(yard-enter)': [152],
      '(yard-exit)': [151],
      '(yard-Glenbury)': [63, 64],
      'Glenbury::S': [65],
      '(Glenbury-Dormont)': range(66, 72, 1),
      'Dormont::S': [73],
      '(Dormont-MNR)': [74, 75, 76],
      'Mt. Lebanon::W': [77],
      '(Mt. Lebanon-Poplar)': range(78, 87, 1),
      'Poplar': [88],
      '(Poplar-Castle Shannon)': range(89, 95, 1),
      'Castle Shannon': [96],
      '(Castle Shannon-Mt. Lebanon)': [].concat(range(97, 100, 1), range(85, 78, -1)),
      'Mt. Lebanon::E': [77],
      '(Mt. Lebanon-Dormont)': range(101, 104, 1),
      'Dormont::N': [105],
      '(Dormont-Glenbury)': range(106, 113, 1),
      'Glenbury::N': [114],
      '(Glenbury-Overbrook)': range(115, 122, 1),
      'Overbrook::W': [123],
      '(Overbrook-Inglewood)': range(124, 131, 1),
      'Inglewood::W': [132],
      '(Inglewood-Central)': range(133, 140, 1),
      'Central::W': [141],
      '(Central-FGZ)': range(142, 150, 1),
      'South Bank': [31],
      '(South Bank-Central)': range(32, 38, 1),
      'Central::E': [39],
      '(Central-Inglewood)': range(40, 47, 1),
      'Inglewood::E': [48],
      '(Inglewood-Overbrook)': range(49, 56, 1),
      'Overbrook::E': [57],
      'J': range(58, 62, 1),
      '(FGZ-Whited)': range(29, 23, 1),
      'Whited::E': [22],
      '(Whited-UNKNOWN)': range(21, 17, 1),
      'UNKNOWN::E': [16],
      '(Unknown-ACDe)': range(15, 13, 1),
      '(ACDe-Edgebrook)': range(12, 10, 1),
      'Edgebrook': [9],
      '(Edgebrook-Pioneer)': range(8, 3, 1),
      'Pioneer': [2],
      '(Pioneer-ACDw)': [1],
      '(ACDw-UNKNOWN)': [13, 14, 15],
      'UNKNOWN::W': [16],
      '(UNKNOWN-Whited)': range(17, 21, 1),
      'Whited::W': [22],
      '(Whited-South Bank)': range(23, 31, 1),
    };


    this.stations = {
      'green': {
        '57': 'Overbrook',
        '65': 'Glenbury',
        '73': 'Dormont',
        '77': 'Mt. Lebanon',
        '88': 'Poplar',
        '96': 'Castle Shannon',
        '105': 'Dormont',
        '114': 'Glenbury',
        '123': 'Overbrook',
        '132': 'Inglewood',
        '141': 'Central',
        '31': 'South Bank',
        '39': 'Central',
        '48': 'Inglewood',
        '22': 'Whited',
        '16': 'UNKNOWN',
        '2': 'Pioneer',
        '9': 'Edgebrook'
      }
    }

    this.now = 0;

    this.control_points = {
      'green': {
        '57': {
          '152': 1 // Going from 57 to 152 requires authority 1 at 57
        }
      },
      'red': {}
    };

    this.initCy();

    this.manualDispatch('green', 'Overbrook', '15:00');
    this.inferTrainMovement('green', '20', true);
  }

  // With list of stations, generate a route/path of blocks to go to meet station ordering
  generateYardRoute(line, stations, return_last = false) {
    const windowedSlice = function(arr, size) {
      let result = [];
      arr.some((el, i) => {
        if (i + size > arr.length) return true;
        result.push(arr.slice(i, i + size));
      });
      return result;
    };

    // Route, but it's my arbitrary segment definitions
    let segment_route = [];

    // Get initial route out of yard
    let route = this.getInterstationRoute(line, '(yard-exit)', stations[0]);
    segment_route = segment_route.concat(...route);

    let previous_segment = route.at(-1);
    for(let station_pair of windowedSlice(stations, 2)) {
      // Get best route from previous stop segment to next station
      let route = this.getInterstationRoute(line, previous_segment, station_pair[1]);

      // Add to segment-routes
      segment_route = segment_route.concat(...route);

      // Keep track of where the last segment-route left off
      previous_segment = route.at(-1);
    }

    if(return_last) {
      return {
        route: this.resolveSegmentRoutes(this.route_green_lookup, segment_route),
        last_segment: segment_route.at(-1)
      }
    } else {
      return this.resolveSegmentRoutes(this.route_green_lookup, segment_route);
    }
  }

  isinvalidSwitchMovement(line, block_a_, block_b_) {
    const block_a = parseInt(block_a_);
    const block_b = parseInt(block_b_);
    // const search_value = [parseInt(block_a), parseInt(block_b)].sort( (a, b) => a - b );

    const invalid_movements = {
      'green': [
        [13, 1],
        [12, 13],
        [30, 29],
        [29, 150],
        [150, 30],
        [152, 57],
        [58, 57],
        [63, 62],
        [63, 151],
        [76, 101],
        [101, 76],
        [101, 77],
        [77, 76],
        [100, 86],
      ],
      'red': []
    }

    // Sometimes javascript is stupid

    let found = false;
    invalid_movements[line].forEach( (elem) => {
      const [l_a, l_b] = elem;
      if( (block_a === l_a) && (block_b === l_b) ) {
        found = true;
      }
    });

    return found;
  };

  manualDispatch(line, station, eta_ms) {
    const { route, last_segment } = this.generateYardRoute(line, [station], true);
    const authority_table = this.getAuthorityTable(line, route, this.getStationStops(line, route, [station]), [10*1000]);

    // Generate a safe speed table (safe meaning that it's easy for train to stop, when it respects commanded speed)
    const speed_table = this.generateSpeedTable(line, route);
    const safe_speed_table = this.makeSpeedTableSafe(speed_table);

    // Get travel time, used for timing dispatch at the right time
    const travel_time_table = this.getTravelTimeTable(line, route, safe_speed_table);
    const total_travel_time_ms = 1000 * travel_time_table.reduce( (val, sum) => {
      return sum + val;
    });

    // actually dispatch the train once world time is > leave_time
    const leave_time = eta_ms - total_travel_time_ms;

    // And get a return path- send it at full speed who cares when it gets back to the yard
    const return_segment_path = this.getInterstationRoute(line, last_segment, '(yard-enter)');
    const return_block_path = this.resolveSegmentRoutes(this.route_green_lookup, return_segment_path);

    // commanded speed here == speed_limit
    const return_authority_table = this.getAuthorityTable(line, return_block_path, [], []);

    // This is a hack but who cares
    const final_auth_table = [].concat(authority_table, return_authority_table);
    for(let i = 1; i < final_auth_table.length; ++i)
      final_auth_table[i].wait_next_authority = final_auth_table[i - 1].wait_next_authority;

    final_auth_table[0].wait_next_authority = 0;

    // TODO: Dump to authority table used to send to trains and such
    console.log([].concat(authority_table, return_authority_table));
    console.log([].concat(route, return_block_path));
  }

  getAuthorityTable(line, block_route, blocks_stopped_at = [], stop_times = []) {
    const control_points = this.control_points[line];

    // Get indexes in route where the train will have to drop its authority to 0 (not necessarily stop)
    let j = 0; // TODO: Refactor
    const auth_0 = [];
    for(const i in block_route) {
      const block = block_route[i];

      if(blocks_stopped_at.includes(block.toString())) {
        const stop_time = stop_times[j];

        auth_0.push({
          block_route_i: parseInt(i),
          type: 'stop',
          wait_next_authority: stop_time,
          auth_there: 0
        });

        ++j;
      }

      if(Object.keys(control_points).includes(block.toString())) {
        const next_block = block_route[parseInt(i) + 1];

        if(control_points[block][next_block]) {
          auth_0.push({
            block_route_i: parseInt(i),
            type: 'control',
            wait_next_authority: 0,
            auth_there: control_points[block][next_block]
          });
        }
      }
    }

    // Initialize with yard-to-first-auth-0 stop
    const auth_table = [
      {
        authority: auth_0[0].block_route_i,
        wait_next_authority: auth_0[0].type === 'stop' ? auth_0[0].wait_next_authority : 0, // Time until next authority is applied
      }
    ];

    j = 0;
    for(const i_ in auth_0) {
      const i = parseInt(i_);
      const auth_stop = auth_0[i];
      const auth_next_stop = auth_0[i + 1];

      if(!auth_next_stop) {
        /* yard check but its not needed?
        console.log(typeof i, auth_0);
        if(auth_stop.type === 'control') { // Is yard enter? TODO: Better check for that
          auth_table.push({
            authority: auth_stop.auth_there,
            wait_next_authority: 0
          });
        }*/

        break;
      }

      if(auth_stop.type === 'stop') {
        auth_table.push({
          authority: auth_next_stop.block_route_i - auth_stop.block_route_i + 1,
          wait_next_authority: stop_times[j]
        });

        ++j;
      }

      if(auth_stop.type === 'control') {
        auth_table.push({
          authority: auth_stop.auth_there,
          wait_next_authority: 0
        });

        auth_table.push({
          authority: auth_next_stop.block_route_i - auth_stop.block_route_i + 1,
          wait_next_authority: (auth_next_stop.type === 'stop') ? auth_next_stop.wait_next_authority : 0
        });
      }
    }

    return auth_table;
  }

  getStationStops(line, route, stations) {
    // Pull out all stations from route
    const possible_stops = route.map( (block_id) => {
      return block_id.toString();
    }).filter( (block_id) => {
      return Object.keys(this.stations[line]).includes(block_id);
    })
    .filter( (station_id) => {
      const station_name = this.stations[line][station_id];
      return stations.includes(station_name);
    });

    const final_stop_list = []
    let i = 0;
    for(const block_id of possible_stops) {
      const station_name = this.stations[line][block_id];
      if(stations[i] == station_name) {
        ++i;
        final_stop_list.push(block_id);
      }
    }

    return final_stop_list;
  }

  getTravelTimeTable(line, route, safe_speed_table) {
    return _.zip(route, safe_speed_table).map( (block_speed_pair) => {
      const [block_id, speed] = block_speed_pair;
      const block_info = TrackModelInfo[line][block_id];
      const distance = block_info ? block_info['length'] : 50; // ¯\_(ツ)_/¯

      // Speed in km/h
      return distance / ((5.0/18) *  speed);
    });
  }

  generateSpeedTable(line, route) {
    return route.map( (block_id) => {
      const block_info = TrackModelInfo[line][block_id];

      if(block_info)
        return block_info['speed_limit'];
      else
        return 75; // ¯\_(ツ)_/¯
    });
  }

  // this is a mess
  makeSpeedTableSafe(speed_table_) {
    const speed_table = speed_table_.slice();
    let j = 0;
    const decreases = [0.35, 0.6]; // Values chosen by trial-and-error with real life estimates

    for(let i = speed_table.length-1; i >= 0; --i) {
      speed_table[i] = speed_table[i] * decreases[j];

      ++j;
      if(j >= decreases.length)
        break;
    }

    return speed_table;
  }

  resolveSegmentRoutes(route_lookup, segment_route) {
    let block_route = [];
    for(let segment of segment_route)
      block_route = block_route.concat(route_lookup[segment]);

    return block_route;
  }

  // from_station must be an exact section-routing edge
  getInterstationRoute(line, from_station, to_station) {
    const goal_stops = this.cy[line].$(`edge[id ^= '${to_station}']`)
    const routable_graph = this.cy[line];

    const starting_node = routable_graph.$(`edge[id ^= '${from_station}']`).source();

    const routes = goal_stops.map( (edge) => {
      const edge_points_to = edge.targets();

      if(edge_points_to.length > 1) {
        console.warning('Warning: router goal edge has multiple targets, code isn\'t expecting this.');
      } else if (edge_points_to.length === 0) {
        console.error('Error: router goal edge doesn\'t point to anything. Not routing.');
        return undefined;
      }

      const goal_node = edge_points_to[0];
      const goal_node_id = goal_node.data('id');
      const to_dst_route = routable_graph.elements().aStar({
        root: starting_node,
        goal: `node[id = '${goal_node_id}']`,
        weight: (edge) => {
          return 1; // TODO: Cost
          // return edge.data('length') / edge.data('speed_limit'); // Minimize time in blocks
        },
        directed: true
      });

      return to_dst_route;
    });

    // Find minimum cost route
    let min = Infinity;
    let i_best_route = -1;
    for (const i in routes) {
      if(routes[i].distance < min) {
        i_best_route = i
        min = routes[i].distance;
      }
    }

    const best_route = routes[i_best_route].path
      .filter( (elem) => {
        return elem.group() === "edges";
      })
      .map( (elem) => {
        return elem.data('id');
      });

    return best_route;
  }

  componentDidMount() { }

  initCy() {
    for(const line in TrackModel) {
      this.cy[line] = cytoscape({
        elements: TrackModel[line]
      });
    }

    for(const line in TrackModelDisplay.lines) {
      this.cy_display[line] = cytoscape({
        elements: _.cloneDeep(TrackModelDisplay.lines[line])
      });
    }
  }

  getBlocks(line) {
    const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

    switch(line) {
      case 'green':
        return range(1, 150, 1);
      case 'red':
        return range(1, 76, 1);
      default:
        return [];
    }
  }

  /**
   * Get a standardized identifier for a switch given its connected blocks
   */
  getSwitchIdentifier(connected_blocks) {
    // Remove dupes, sort, join all things by -
    return Array.from(new Set(connected_blocks))
            .sort((a, b) => a - b)
            .join('-');
  }

  /**
   * Given an occupancy change on a block, infer a train movement
   */
  inferTrainMovement(line, block_id, new_occupancy) {
    const graph_model_lite = this.cy_display[line];

    // Based on display graph's flow, get every possible edge source for this update (incl. switches- needs filtered for these still)
    const all_possible_source_edges = graph_model_lite.$(`edge[block_id = '${block_id}']`).sources().incomers().edges(`edge[block_id != '${block_id}']`);

    // Filter out invalid movements based on switch restrictions
    const possible_sources = all_possible_source_edges.filter( (edge) => {
      if(this.isinvalidSwitchMovement(line, edge, block_id))
        return false;

      return true;
    }).map( (edge) => {
      return edge.data('block_id');
    });

    for(const [train_id, current_block_id] of Object.entries(this.trainPositions)) {
      if(possible_sources.includes(current_block_id))
        return train_id;
    }

    return undefined;
  }

  updateBlockOccupancy(line, block_id, is_occupied) {
    const occupancy = _.cloneDeep(this.state.occupancy);
    occupancy[line][block_id] = !!is_occupied;

    this.setState({
      occupancy: occupancy,
    });

    const train_id = inferTrainMovement(line, block_id, is_occupied);
    if(train_id) {
      // Decrement authority on train object
      this.trains[train_id].authority--;

      if(this.trains[train_id].authority == 0) {
        const next_auth = this.trains[train_id].auth_table[0];
        if(next_auth)
          scheduleAuthoritySend(next_auth.authority, next_auth.wait_next_authority);
      }
    }
  }

  scheduleAuthoritySend(authority, delay) {

  }

  updateSwitchPosition(line, switch_identifier, new_direction) {
    const switches = _.cloneDeep(this.state.switches);
    switches[line][switch_identifier].point_to(new_direction);
    this.setState({
      switches: switches
    });
  }

  /**
   * Return cytoscape query that points to the starting block out of the yard
   */
  getStartingBlockQuery(line) {
    switch(line) {
      case 'green':
        return `node[id = 'JKy']`;
      default:
        console.warn(`Unimplemented line '${line}' for starting block query detected`);
        return 'oops';
    }
  }

  buildCyBlockQuery(block_id) { return `edge[block_id = '${block_id}']`; }

  // Major TODO: when a block that's part of another train's route changes occupancy state, recalculate route for that other train and relay that to Track Controller
  dispatchTrain(line, destination_block_id, eta, do_circle_back) {
    // TODO: Update to use section router

    // Build route
    // Run A* over the graph complement to route between edges and not nodes
    const routable_graph = this.cy[line];

    // First, yard -> destination_block
    // Do it for all the possible ways to face in a block, take the shortest route
    const goal_edges = routable_graph.filter(this.buildCyBlockQuery(destination_block_id));

    const routes = goal_edges.map( (edge) => {
      const edge_points_to = edge.targets();

      if(edge_points_to.length > 1) {
        console.warning('Warning: router goal edge has multiple targets, code isn\'t expecting this.');
      } else if (edge_points_to.length === 0) {
        console.error('Error: router goal edge doesn\'t point to anything. Not routing.');
        return undefined;
      }

      const goal_node = edge_points_to[0];
      const goal_node_id = goal_node.data('id');
      const to_dst_route = routable_graph.elements().aStar({
        root: this.getStartingBlockQuery(line),
        goal: `node[id = '${goal_node_id}']`,
        weight: (edge) => {
          return edge.data('length') / edge.data('speed_limit'); // Minimize time in blocks
        },
        directed: true
      });

      return to_dst_route;
    });

    // Find minimum cost route
    let min = Infinity;
    let i_best_route = -1;
    for (const i in routes) {
      if(routes[i].distance < min)
        i_best_route = i
    }

    const best_route = routes[i_best_route].path
      .filter( (elem) => {
        return elem.group() === "edges";
      })
      .map( (elem) => {
        return elem.data('block_id');
      });

    if(do_circle_back) {
      // TODO: just reuse this method lmao, for now it doesn't matter
    }

    // Get speed limit coming out of the yard
    // This is spaghetti and I don't care
    const speed_limit = routable_graph.nodes(`node[id = 'y']`)[0].outgoers().edges()[0].data('speed_limit');

    const pain = new Train( // constant pain from trains
      this.nextTrainID,
      line,
      destination_block_id,
      speed_limit,
      best_route.length, // TODO: Settle on a good authority
      best_route
    );

    this.trains.push(pain);

    const activeTrainIDs = _.cloneDeep(this.state.activeTrainIDs);
    activeTrainIDs[line].push(this.nextTrainID);
    this.setState({
      activeTrainIDs: activeTrainIDs
    });

    this.nextTrainID++;

    window.electronAPI.sendTrackControllerMessage({
      type: 'dispatch train',
      value: pain
    });
  }

  handleLineSelect(self, ev, elem) {
    self.setState({
      testUI: {
        ...this.state.testUI,
        lineSelection: ev.target.value
      }
    });
  }

  handleTrainSelect(self, ev, elem) {
    self.setState({
      testUI: {
        ...this.state.testUI,
        trainSelection: ev.target.value
      }
    });
  }

  handleBlockSelect(self, ev, elem) {
    self.setState({
      testUI: {
        ...this.state.testUI,
        blockSelection: ev.target.value
      }
    });
  }

  renderTest() {
    const { lineSelection, trainSelection, blockSelection, throughputValue } = this.state.testUI;
    const { activeTrainIDs, occupancy } = this.state;

    // Parse occupancy from selected stuff
    let selected_block_occupied = false;
    if(lineSelection && blockSelection) {
      if(occupancy[lineSelection] && occupancy[lineSelection][blockSelection])
        selected_block_occupied = occupancy[lineSelection][blockSelection]
    }

    return (
      <ThemeProvider theme={darkTheme}>
        <div className="testUIContainer">
          <div className="inputContainer">
            <h4 className="containerTitle">From Track Controller (Inputs to module)</h4>
            <div className="testUIConfig">
              <FormControl className="testUIConfigDropdown">
                <InputLabel id="line-select-label">Line</InputLabel>
                <Select
                  labelId="line-select-label"
                  value={lineSelection}
                  label="Line"
                  onChange={(ev, elem) => { this.handleLineSelect(this, ev, elem)}}
                >
                  <MenuItem value={'red'}>Red</MenuItem>
                  <MenuItem value={'green'}>Green</MenuItem>
                </Select>
              </FormControl>
              <FormControl className="testUIConfigDropdown">
                <InputLabel id="train-select-label">Train</InputLabel>
                <Select
                  labelId="train-select-label"
                  value={trainSelection}
                  label="Train"
                  onChange={(ev, elem) => { this.handleTrainSelect(this, ev, elem)}}
                >
                  {
                    lineSelection ?
                      activeTrainIDs[lineSelection].map((train_id) => {
                        return <MenuItem value={train_id}>{train_id}</MenuItem>;
                      })
                    :
                      []
                  }
                </Select>
              </FormControl>
              <FormControl className="testUIConfigDropdown">
                <InputLabel id="block-select-label">Block</InputLabel>
                <Select
                  labelId="block-select-label"
                  value={blockSelection}
                  label="Block"
                  onChange={(ev, elem) => { this.handleBlockSelect(this, ev, elem)}}
                >
                  {
                    lineSelection ?
                      Array.from(this.getBlocks(lineSelection)).map((block_id) => {
                        return <MenuItem value={block_id}>{block_id}</MenuItem>;
                      })
                    :
                      []
                  }
                </Select>
              </FormControl>
            </div>
            <div className="horiz-div"/>
            <div className="testUIRow row-title">Line-related</div>
            <div className="testUIRow row-title">
            {
              (lineSelection) ?
                <TextField margin="none" size="small" label="Throughput" variant="standard" onChange={(ev) => {
                  const testUI = _.cloneDeep(this.state.testUI);
                  testUI['throughputValue'] = ev.target.value;

                  this.setState({
                    testUI: testUI
                  });
                }}/>
              :

                <TextField disabled margin="none" size="small" label="Throughput" variant="standard"/>
            }
            {
              (lineSelection && throughputValue) ?
                <Button variant="container" onClick={() => {
                  if(lineSelection && throughputValue) {
                    const throughput = _.cloneDeep(this.state.throughput);
                    throughput[lineSelection] = parseInt(throughputValue, 10);

                    this.setState({
                      throughput: throughput
                    });
                  }
                }}>
                  Commit
                </Button>
              :
                <Button disabled variant="container">
                  Commit
                </Button>
            }
            </div>
            <div className="testUIRow row-title">Train-related</div>
            {
              trainSelection ?
                <Button variant="contained">Brake Failure Event</Button>
              :
                <Button disabled variant="contained">Brake Failure Event</Button>
            }
            {
              trainSelection ?
                <Button variant="contained">Engine Failure Event</Button>
              :
                <Button disabled variant="contained">Engine Failure Event</Button>
            }

            <div className="testUIRow row-title">Block-related</div>
            <FormGroup>
              {
                blockSelection ?
                  <FormControlLabel control={<Switch/>} label="Broken Rail"/>
                :
                  <FormControlLabel disabled control={<Switch/>} label="Broken Rail"/>

              }
            </FormGroup>
            <FormGroup>
              {
                blockSelection ?
                  <FormControlLabel checked={selected_block_occupied} control={<Switch onChange={(ev) => {
                    this.updateBlockOccupancy(lineSelection, blockSelection, ev.target.checked);
                  }}/>} label="Block Occupied"/>
                :
                  <FormControlLabel disabled control={<Switch/>} label="Block Occupied"/>

              }
            </FormGroup>
          </div>
          <div className="outputContainer">
            <h4 className="containerTitle">To Track Controller (Outputs from module)</h4>
            <div className="grow-divider"/>
            <Button variant="contained" onClick={() => {
              this.setState({UIMode: UIState.Main});
            }}>
              Return to dashboard
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  renderMain() {
    const {
      occupancy,
      throughput,
      isDispatchModalOpen,
      enteredETA,
      manualMode,
      blockModalOpen,
      switchModalOpen,
      editingSwitch,
      editingBlock,
      switches,
      closures,
      switchGoingToPosition,
      activeLine,
    } = this.state;

    const { lineSelection, blockSelection } = this.state.testUI;

    const redLineThroughput = throughput['red'];
    const greenLineThroughput = throughput['green'];

    return (
      <ThemeProvider theme={darkTheme}>
        <div id="appContainer">
          <div className="throughputContainer floating">
            <h4 className="throughputTitle">Throughput Statistics</h4>
            <div className="throughputGrid">
              <div className="throughputLabel" id="redLineLabel">Red Line Throughput</div>
              <div className="throughputValue" id="redLineValue">{redLineThroughput} trains/hr</div>
              <div className="throughputLabel" id="greenLineLabel">Green Line Throughput</div>
              <div className="throughputValue" id="greenLineValue">{greenLineThroughput} trains/hr</div>
            </div>
          </div>
          <div id="bottomLeftButtonGroup" className="floating">
            <FormGroup id="manualModeGroup">
              <FormControlLabel checked={manualMode} control={<Switch onChange={(ev) => {
                this.setState({
                  manualMode: ev.target.checked
                });
              }}/>} label="Manual Mode"/>
            </FormGroup>
            {
              manualMode ?
                <Button variant="contained" id="dispatchButton" onClick={() => {
                  this.setState({
                    isDispatchModalOpen: !isDispatchModalOpen
                  });
                }}>
                  Manually Dispatch Train
                </Button>
              :
                <Button disabled variant="contained" id="dispatchButton">
                  Manually Dispatch Train
                </Button>
            }
          </div>
          <Button variant="contained" className="floating" id="testUIButton" onClick={() => {
            this.setState({UIMode: UIState.Test});
          }}>
            Switch to test UI
          </Button>
          <div id="bottomRightButtonGroup" className="floating">
            <label htmlFor="systemScheduleButton">
              <label htmlFor="systemScheduleButton">
                <Input
                  accept="text/csv"
                  id="systemScheduleButton"
                  multiple
                  type="file"
                  onChange={(ev) => {
                    return;
                  }}
                />
                <Button variant="contained" component="span">
                  Upload
                </Button>
              </label>
            </label>
          </div>
          <div id="systemMap" className="floating">
            <SystemMap
              occupancy={occupancy[activeLine]}
              manualMode={manualMode}
              onSwitchEdit={(switch_connections) => this.setState({
                switchModalOpen: true,
                editingSwitch: this.getSwitchIdentifier(switch_connections)
              })}
              onBlockEdit={(block_id) => this.setState({
                blockModalOpen: true,
                editingBlock: block_id,
              })}
              ref={this.systemMapRef}
              displayGraph={TrackModelDisplay.lines[activeLine]}
              stylesheet={Style['base'].concat(Style[activeLine])}
            />
          </div>
          <Modal
            className="modal"
            open={isDispatchModalOpen}
            onClose={() => {
              const testUI = _.cloneDeep(this.state.testUI);
              testUI.lineSelection = undefined;
              testUI.blockSelection = undefined;

              this.setState({
                isDispatchModalOpen: false,
                testUI: testUI,
              });
            }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'var(--background-color)',
                color: 'var(--color)',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4
              }}
            >
              <div className="dispatchModalContainer">
                <Typography variant="h6" component="h2">
                  Dispatch Train
                </Typography>
                <div className="dispatchSelectors">
                  <FormControl className="testUIConfigDropdown">
                    <InputLabel id="line-select-label">Line</InputLabel>
                    <Select
                      labelId="line-select-label"
                      value={lineSelection}
                      label="Line"
                      onChange={(ev, elem) => { this.handleLineSelect(this, ev, elem)}}
                    >
                      <MenuItem value={'red'}>Red</MenuItem>
                      <MenuItem value={'green'}>Green</MenuItem>
                    </Select>
                  </FormControl>
                  {
                    lineSelection ?
                      <FormControl className="testUIConfigDropdown">
                        <InputLabel id="block-select-label">Block</InputLabel>
                        <Select
                          labelId="block-select-label"
                          value={blockSelection}
                          label="Block"
                          onChange={(ev, elem) => { this.handleBlockSelect(this, ev, elem)}}
                        >
                          {
                            lineSelection ?
                              Array.from(new Set(Object.values(this.stations[activeLine]))).map((block_id) => {
                                return <MenuItem value={block_id}>{block_id}</MenuItem>;
                              })
                              :
                              []
                          }
                        </Select>
                      </FormControl>
                    :
                      <FormControl disabled className="testUIConfigDropdown">
                        <InputLabel id="block-select-label">Block</InputLabel>
                        <Select
                          labelId="block-select-label"
                          label="Block"
                          onChange={(ev, elem) => { this.handleBlockSelect(this, ev, elem)}}
                        >
                          {
                            lineSelection ?
                              Array.from(Object.values(this.stations[activeLine])).map((block_id) => {
                                return <MenuItem value={block_id}>{block_id}</MenuItem>;
                              })
                              :
                              []
                          }
                        </Select>
                      </FormControl>
                  }
                  {
                    (lineSelection && blockSelection) ?
                      <TextField margin="none" size="small" label="ETA" type="time" variant="standard" onChange={(ev) => {
                        this.setState({
                          enteredETA: ev.target.value
                        });
                      }}/>
                      :
                      <TextField disabled margin="none" size="small" label="ETA" type="time" variant="standard"/>
                  }
                </div>
                {
                  (lineSelection && blockSelection && enteredETA) ?
                    <Button id="dispatchCommitBtn" variant="contained" onClick={() => {
                      this.manualDispatch(lineSelection, blockSelection, enteredETA);
                      this.setState({
                        isDispatchModalOpen: !isDispatchModalOpen
                      });
                    }}>
                      Commit
                    </Button>
                  :
                    <Button id="dispatchCommitBtn" disabled variant="contained">
                      Commit
                    </Button>
                }
              </div>
            </Box>
          </Modal>
          <Modal
            className="modal"
            open={switchModalOpen}
            onClose={() => {
              this.setState({
                switchModalOpen: false,
              });
            }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'var(--background-color)',
                color: 'var(--color)',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 4
                }}
              >
              <div className="dispatchModalContainer">
                <Typography variant="h6" component="h2">
                  Editing Switch {editingSwitch}
                </Typography>
                {
                  editingSwitch ?
                    <p>Coming from block {switches[activeLine][editingSwitch].coming_from}</p>
                  :
                    []
                }
                <FormControl id="switchPositionCombobox">
                  <InputLabel id="switch-to-label">Set Going To</InputLabel>
                  <Select
                    labelId="block-select-label"
                    value={switchGoingToPosition}
                    label="Set Going To"
                    onChange={(ev, elem) => {}}
                  >
                    {
                      editingSwitch ?
                        switches[activeLine][editingSwitch].going_to_options.map( (sw) => {
                          return <MenuItem value={sw}>{sw}</MenuItem>;
                        })
                        :
                        []
                    }
                  </Select>
                </FormControl>
              </div>
            </Box>
          </Modal>
          <Modal
            className="modal"
            open={blockModalOpen}
            onClose={() => {
              this.setState({
                blockModalOpen: false,
              });
            }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'var(--background-color)',
                color: 'var(--color)',
                  border: '2px solid #000',
                  boxShadow: 24,
                  p: 4
                }}
              >
              <div className="dispatchModalContainer">
                <Typography variant="h6" component="h2">
                  Editing Block {editingBlock}
                </Typography>
                <FormControlLabel
                  checked={closures[activeLine][editingBlock]}
                  control={<Switch onChange={(ev) => {
                    const closures_ = _.cloneDeep(closures);
                    closures_[activeLine][editingBlock] = !!ev.target.checked;

                    this.setState({
                      closures: closures_,
                    });
                    this.systemMapRef.current.updateBlockClosure(editingBlock, ev.target.checked);

                    window.electronAPI.sendTrackControllerMessage({
                      'type': 'closure',
                      'block_id': editingBlock,
                      'is_closed': ev.target.checked
                    });
                }}/>} label="Close for maintenance"/>
              </div>
            </Box>
          </Modal>
        </div>
      </ThemeProvider>
    );
  }

  render() {
    const { UIMode } = this.state;

    switch(UIMode) {
      case UIState.Main:
        return this.renderMain();
      case UIState.Test:
        return this.renderTest();
      default:
        console.warn('Unimplemented UI state: ', UIMode);
        return (
          <p>Unimplemented UI state of {UIMode}</p>
        );
    }
  }
};

export default CTCOffice;
