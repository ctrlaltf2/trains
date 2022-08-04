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
  IconButton,
} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
          payload.line = payload.line.toLowerCase();
          // console.log(payload);
          this.updateBlockOccupancy(payload.line, payload.block_id, payload.value);
          break;
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    window.electronAPI.subscribeFileMessage( (_event, payload) => {
      console.log(payload);

      if(payload.status !== 'success')
        return;

      switch(payload.tag) {
        case 'schedule':
          this.parseSchedule(payload.payload);
          break;
        default:
          console.warn(`Unknown file tag sent '${payload.tag}'`);
          break;
      };
    });


    window.electronAPI.subscribeTimerMessage( (_event, payload) => {
      this.now = payload.timestamp;
      this.checkShouldDispatch();
      this.checkShouldSendAuthority();
    });

    this.state = {
      UIMode: UIState.Main,
      isDispatchModalOpen: false,
      throughput: {
        'red': '-',
        'green': '-',
      },
      testUI: {
        lineSelection: undefined,
        trainSelection: undefined,
        blockSelection: undefined,
        throughputValue: undefined,
      },
      occupancy: { // occupancy[line][block_id] = is_occupied: trainID of occupee
        'red': {},
        'green': {},
      },
      switches: { // switches[line][sorted([blocks connected to]).join('-')] = Switch(...)
        'red': {
          '1-15-16':   new TrackSwitch(undefined, '15', [ '1', '16']),
          '0-9-10':    new TrackSwitch(undefined,  '9', [ '0', '10']),
          '27-28-76':  new TrackSwitch(undefined, '27', ['28', '76']),
          '32-33-72':  new TrackSwitch(undefined, '33', ['32', '72']),
          '38-39-71':  new TrackSwitch(undefined, '38', ['39', '71']),
          '43-44-67':  new TrackSwitch(undefined, '44', ['43', '67']),
          '52-53-66':  new TrackSwitch(undefined, '52', ['53', '66']),
        },
        'green': {
          '85-86-100': new TrackSwitch(undefined, '85', ['86', '100']),
          '76-77-101': new TrackSwitch(undefined, '77', ['76', '101']),
          '29-30-150': new TrackSwitch(undefined, '29', ['30', '150']),
          '1-12-13':   new TrackSwitch(undefined, '13', [ '1',  '12']),
          '57-58':     new TrackSwitch(undefined, '57', ['58', '152']) // TODO: Add yard
        },
        'blue': {
          '5-6-11':    new TrackSwitch(undefined, '5', ['6', '11'])
        },
      },
      closures: { // closures[line][block_id] = is_closed;
        'red': {},
        'green': {},
      },
      switchesOverridden: {
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
      activeLine: 'red',
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
      'red': {},
      'green': {},
    }; // str(train id) -> str(block_id)

    this.systemMapRef = React.createRef();
    this.pendingDispatches = {}; // timestamp to send off
    this.pendingAuthorities = []; // { time, train_id, authority }

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
    this.route_lookup = {
      'green': {
        '(yard-enter)': [151],
        '(yard-exit)': [0],
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
        '(J)': range(58, 62, 1),
        '(FGZ-Whited)': range(29, 23, -1),
        'Whited::E': [22],
        '(Whited-UNKNOWN)': range(21, 17, -1),
        'UNKNOWN::E': [16],
        '(Unknown-ACDe)': range(15, 13, -1),
        '(ACDe-Edgebrook)': range(12, 10, -1),
        'Edgebrook': [9],
        '(Edgebrook-Pioneer)': range(8, 3, -1),
        'Pioneer': [2],
        '(Pioneer-ACDw)': [1],
        '(ACDw-UNKNOWN)': [13, 14, 15],
        'UNKNOWN::W': [16],
        '(UNKNOWN-Whited)': range(17, 21, 1),
        'Whited::W': [22],
        '(Whited-South Bank)': range(23, 31, 1),
      },
      'red': {
        '(Station Square-South Hills Junction)': range(49, 59, 1),
        'South Hills Junction': [60],
        '(South Hills Junction-Station Square)': [].concat(range(61, 66, 1), range(52, 49, -1)),
        'Penn Station::D': [25],
        '(Penn Station-Steel Plaza)': range(26, 34, 1),
        '(Steel Plaza-Penn Station)': [].concat([34, 33], range(71, 76, 1), [27, 26]),
        'Steel Plaza::D': [35],
        '(Steel Plaza-First Ave.)': range(36, 44, 1),
        '(First Ave.-Steel Plaza)': [].concat([44], range(67, 71, 1), range(38, 36, -1)),
        'First Ave.::D': [45],
        '(First Ave.-Station Square)': [46, 47],
        'Station Square::D': [48],
        'Station Square::U': [48],
        '(Station Square-First Ave.)': [47, 46],
        'First Ave.::U': [45],
        'Steel Plaza::U': [35],
        'Penn Station::U': [25],
        '(yard-exit)': [0],
        '(yard-Shadyside)': [9, 8],
        'Shadyside::D': [7],
        '(Shadyside-Herron Ave.)': range(6, 1, -1),
        'Herron Ave.::D': [16],
        '(Herron Ave.-Swissville)': range(17, 20, 1),
        'Swissville::D': [21],
        '(Swissville-Penn Station)': range(22, 24, 1),
        '(Penn Station-Swissville)': range(24, 22, -1),
        'Swissville::U': [21],
        '(Swissville-Herron Ave.)': range(20, 17, -1),
        'Herron Ave.::U': [16],
        '(Herron Ave.-Shadyside)': range(1, 6, 1),
        'Shadyside::U': [7],
        '(Shadyside-yard)': [8, 9],
        '(yard-enter)': [0],
        '(yard-Herron Ave.)': range(10, 15, 1)
      }
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
      },
      'red': {
        '7': 'Shadyside',
        '16': 'Herron Ave.',
        '21': 'Swissville',
        '25': 'Penn Station',
        '35': 'Steel Plaza',
        '45': 'First Ave.',
        '48': 'Station Square',
        '60': 'South Hills Junction',
      }
    }

    this.now = 0;

    this.control_points = {
      'green': {
        '57': {
          '151': 1 // Going from 57 to 151 requires authority 1 at 57
        }
      },
      'red': {
        '9': {
          '0': 1 // Going from 9 to 0 requires authority 1 at 9
        }
      }
    };

    this.initCy();
  }

  parseSchedule(data) {
    // Ayo, pipe-and-filter???
    data
      .replace('\r', '')  // Remove stupid carriage returns (thanks microsoft)
      .split('\n')        // Split by newline
      .map( (line) => {   // Split by comma
        return line.split(',');
      })
      .filter( (line_array, index) => { // Filter empty lines and header
        return (index !== 0) && line_array.length === 3;
      })
      .forEach( (row) => { // Parse out each row
        const [line, station, eta_str] = row;
        console.log('Scheduling dispatch for ', line.toLowerCase(), station, eta_str);
        this.manualDispatch(line.toLowerCase(), station, eta_str);
      });

    console.log('Pending dispatches present after loading schedule: ', this.pendingDispatches);
  }

  // tested
  checkShouldDispatch() {
    const deleted = [];
    for(const pendingTimestamp_ of Array.from(Object.keys(this.pendingDispatches))) {
      const pendingTimestamp = parseFloat(pendingTimestamp_);

      if(this.now > pendingTimestamp) {
        const train = this.pendingDispatches[pendingTimestamp]
        this.sendDispatchMessage(train);

        // This should be a queue but you're hilarious if you think we're going to be dispatching multiple trains
        // Better yet, trackmodel sends a confirmation message on train deployment, confirmation has the ID that got deployed, things get initialized there.
        // Give train inference algo some initial values
        const occupancy = _.cloneDeep(this.state.occupancy);
        occupancy[train.line][0] = true;

        // Initialize position
        this.trainPositions[train.line][0] = train.id;

        this.setState({
          occupancy: occupancy,
        });

        deleted.push(pendingTimestamp_);

        ++this.nextTrainID;
      }
    }

    for(const delete_ of deleted) {
      delete this.pendingDispatches[delete_];
    }
  }

  checkShouldSendAuthority() {
    // Send things that need to be sent
    const sentItems = [];
    for(let i = 0; i < this.pendingAuthorities.length; ++i) {
      const scheduledAuth = this.pendingAuthorities[i];
      if(this.now > scheduledAuth.timestamp) {
        this.sendAuthorityMessage(train_id, authority);
        sentItems.push(i);
      }
    }

    // Remove ones that got sent
    this.pendingAuthorities = this.pendingAuthorities.filter( (_, index) => {
      return !(sentItems.includes(index));
    });
  }

  // tested
  sendDispatchMessage(train) {
    const payload = {
      type: 'dispatch',
      train: train
    };

    window.electronAPI.sendTrackControllerMessage(payload);
  }

  sendAuthorityMessage(train_id, authority) {
    // TODO: Check this is the right module
    window.electronAPI.sendTrainControllerMessage({
      'type': 'authority',
      'train': train_id,
      'value': authority,
    });
  }

  // With list of stations, generate a route/path of blocks to go to meet station ordering
  // tested
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
    let route = this.getIntersegmentRoute(line, '(yard-exit)', stations[0]);
    segment_route = segment_route.concat(...route);

    let previous_segment = route.at(-1);
    for(let station_pair of windowedSlice(stations, 2)) {
      // Get best route from previous stop segment to next station
      let route = this.getIntersegmentRoute(line, previous_segment, station_pair[1]);

      // Pop off the first segment, since that was covered in the previous loop/initial route
      route = route.slice(1);

      // Add to segment-routes
      segment_route = segment_route.concat(...route);

      // Keep track of where the last segment-route left off
      previous_segment = route.at(-1);
    }

    if(return_last) {
      return {
        route: this.resolveSegmentRoutes(line, segment_route),
        last_segment: segment_route.at(-1)
      }
    } else {
      return this.resolveSegmentRoutes(line, segment_route);
    }
  }

  // tested
  /**
   * Assumes directionality has been checked. Determines if, given a movement
   * across a junction, does the switch connect that way and allow a movement.
   */
  isInvalidSwitchMovement(line, block_a_, block_b_) {
    const block_a = parseInt(block_a_);
    const block_b = parseInt(block_b_);
    // const search_value = [parseInt(block_a), parseInt(block_b)].sort( (a, b) => a - b );

    const invalid_movements = {
      'green': [
        [13, 1],
        [150, 30],
        [152, 57],
        [63, 151],
        [76, 101],
        [101, 76],
        [101, 77],
        [77, 76],
        [100, 86],
        [1, 12]
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

  // TODO: test?
  manualDispatch(line, station, eta_str) {
    const [hh, mm] = eta_str.split(':');
    const eta_ms = parseInt(hh) * 60 * 60 * 1000 + parseInt(mm) * 60 * 1000;

    const { route, last_segment } = this.generateYardRoute(line, [station], true);
    const authority_table = this.getAuthorityTable(line, route, this.getStationStops(line, route, [station]), [10*1000]);

    // Generate a safe speed table (safe meaning that it's easy for train to stop, when it respects commanded speed)
    let speed_table = this.generateSpeedTable(line, route);
    const safe_speed_table = this.makeSpeedTableSafe(speed_table);

    // Get travel time, used for timing dispatch at the right time
    const travel_time_table = this.getTravelTimeTable(line, route, safe_speed_table);
    const total_travel_time_ms = 1000 * travel_time_table.reduce( (val, sum) => {
      return sum + val;
    });

    // actually dispatch the train once world time is > leave_time
    const leave_time = eta_ms - total_travel_time_ms;

    // And get a return path- send it at full speed who cares when it gets back to the yard
    const return_segment_path = this.getIntersegmentRoute(line, last_segment, '(yard-enter)');
    const return_block_path = this.resolveSegmentRoutes(line, return_segment_path);
    speed_table = speed_table.concat(this.generateSpeedTable(line, return_block_path));

    // commanded speed here == speed_limit
    const return_authority_table = this.getAuthorityTable(line, return_block_path, [], []);

    // This is a hack but who cares
    const final_auth_table = [].concat(authority_table, return_authority_table);
    for(let i = 1; i < final_auth_table.length; ++i)
      final_auth_table[i].wait_next_authority = final_auth_table[i - 1].wait_next_authority;

    final_auth_table[0].wait_next_authority = 0;

    // TODO: Dump to authority table used to send to trains and such
    const total_auth  = [].concat(authority_table, return_authority_table);
    const total_route = [].concat(route, return_block_path);

    const pain = new Train( // constant pain from trains
      this.nextTrainID,
      line,
      75,
      1,
      total_route
    );

    pain.auth_table = total_auth;
    pain.speed_table = speed_table;

    console.log(pain);

    this.pendingDispatches[leave_time] = pain;

    ++this.nextTrainID;
  }

  // TODO: test
  getAuthorityTable(line, block_route, blocks_stopped_at = [], stop_times = []) {
    console.log(line, block_route, blocks_stopped_at, stop_times);
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

    console.log(auth_0);

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
          wait_next_authority: 1000
        });

        auth_table.push({
          authority: auth_next_stop.block_route_i - auth_stop.block_route_i + 1,
          wait_next_authority: (auth_next_stop.type === 'stop') ? auth_next_stop.wait_next_authority : 1000
        });
      }
    }

    return auth_table;
  }

  // tested
  // Given a block route and list of stations to stop at, output
  // block ids that need to be stopped at
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

  // TODO: test? though not sure where this could go wrong
  // NOTE: Speeds assumed km/h
  getTravelTimeTable(line, route, safe_speed_table) {
    return _.zip(route, safe_speed_table).map( (block_speed_pair) => {
      const [block_id, speed] = block_speed_pair;
      const block_info = TrackModelInfo[line][block_id];
      const distance = block_info ? block_info['length'] : 50; // ¯\_(ツ)_/¯

      // Speed in km/h
      return distance / ((5.0/18) *  speed);
    });
  }

  // tested
  generateSpeedTable(line, route) {
    return route.map( (block_id) => {
      const block_info = TrackModelInfo[line][block_id];

      if(block_info)
        return block_info['speed_limit'];
      else
        return 75; // ¯\_(ツ)_/¯
    });
  }

  // tested
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

  // tested
  resolveSegmentRoutes(line, segment_route) {
    let block_route = [];
    for(let segment of segment_route) {
      block_route = block_route.concat(this.route_lookup[line][segment]);
    }

    return block_route;
  }

  // tested
  /**
   * Given two segment-routing segments, route between them,
   * producing an ordered list of segments to get between the two.
   */
  getIntersegmentRoute(line, from_segment, to_segment) {
    const goal_stops = this.cy[line].$(`edge[id ^= '${to_segment}']`)
    const routable_graph = this.cy[line];

    const starting_node = routable_graph.$(`edge[id ^= '${from_segment}']`).source();

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

  // tested
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

  // trivial, no test needed
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

  // tested
  /**
   * Get a standardized identifier for a switch given its connected blocks
   */
  getSwitchIdentifier(connected_blocks) {
    // Remove dupes, sort, join all things by -
    return Array.from(new Set(connected_blocks))
            .sort((a, b) => a - b)
            .join('-');
  }

  // tested
  /**
   * Given an occupancy change on a block, infer a train movement
   */
  inferTrainMovement(line, block_id, new_occupancy) {
    if(new_occupancy === false) { // A train left a block
      // Find train that was on that block
      for(const [train_id, current_position_list] of Object.entries(this.trainPositions[line])) {
        const back = current_position_list.slice(-1);
        const current_positions_str = current_position_list.map( e => { return e.toString(); });

        // Pop its occupancy from it
        if(current_positions_str.includes(back.toString())) {
          this.trainPositions[line][train_id].pop();
          return train_id;
        }
      }

      return undefined;
    } else { // A train entered a block
      const graph_model_lite = this.cy_display[line];

      // Based on display graph's flow, get every possible edge source for this update (incl. switches- needs filtered for these still)
      const all_possible_source_edges = graph_model_lite.$(`edge[block_id = '${block_id}']`).sources().incomers().edges(`edge[block_id != '${block_id}']`);

      // Filter out invalid movements based on switch restrictions
      const possible_sources = all_possible_source_edges.filter( (edge) => {
        if(this.isInvalidSwitchMovement(line, edge.data('block_id'), block_id))
          return false;

        return true;
      }).map( (edge) => {
        return edge.data('block_id').toString();
      });

      for(const [train_id, current_position_list] of Object.entries(this.trainPositions[line])) {
        const front = current_position_list[0];

        if(possible_sources.includes(front.toString())) {
          // Add block to front of array
          this.trainPositions[line][train_id].unshift(block_id.toString());
          console.log(`Train with id '`, train_id, `' with front on block`, front, 'now has leading block', block_id);
          return train_id;
        }
      }

      return undefined;
    }
  }

  // too complex to unit test?
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

      window.electronAPI.sendTrackControllerMessage({
        type: 'authorityUpdated',
        line: line,
        block_id: block_id,
        authority: this.trains[train_id].authority,
      });

      if(this.trains[train_id].authority === 0) {
        const next_auth = this.trains[train_id].auth_table[0];
        // Send (block_id, authority) to TC
        // Workaround until TrainModel relays its authority down to nearby waysides

        if(next_auth)
          scheduleAuthoritySend(train_id, next_auth.authority, this.now + next_auth.wait_next_authority);
      }

      this.sendSuggestedSpeedMessage(train_id, block_id);
    }
  }

  // Called when a train moves onto a block on its route
  sendSuggestedSpeedMessage(train_id, block_id) {
    // Get the suggested speed to send
    const train = this.trains[train_id];
    if(train === undefined) {
      console.log("Warning: unknown train ID in sendSuggestedSpeedMessage '", train_id, "'");
      return;
    }

    const speed_mps = this.trains[train_id].speed_table[block_id];
    if(!(speed_mps >= 0)) { // undefined
      console.log("Warning: unknown speed for (train_id, block_id) = ", train_id, block_id);
      return;
    }

    const value_in_kmh = speed_mps * 3.6;
    window.electronAPI.sendTrainControllerMessage({
      payload: 'suggestedSpeed',
      suggestedSpeed: value_in_kmh
    });

    window.electronAPI.sendTrackControllerMessage({
      payload: 'suggestedSpeed',
      suggestedSpeed: value_in_kmh,
      block_id, block_id
    });
  }

  // trivial, no test
  scheduleAuthoritySend(train_id, authority, when) {
    this.pendingAuthorities.append({
      timestamp: when,
      authority: authority,
      train_id: train_id
    });
  }

  // too trivial to be worth testing?
  updateSwitchPosition(line, switch_identifier, new_direction) {
    const switches = _.cloneDeep(this.state.switches);
    switches[line][switch_identifier].point_to(new_direction);
    this.setState({
      switches: switches
    });
  }

  // TODO: s/getStartingBlockQuery/getStartingNodeQuery/g
  // too trivial to test
  /**
   * Return cytoscape query that points to the starting block out of the yard
   */
  getStartingBlockQuery(line) {
    switch(line) {
      case 'green':
        return `node[id = 'JKy']`;
      case 'green':
        return `node[id = '10d']`;
      default:
        console.warn(`Unimplemented line '${line}' for starting block query detected`);
        return 'oops';
    }
  }

  // trivial to test
  buildCyBlockQuery(block_id) { return `edge[block_id = '${block_id}']`; }

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

  handleMapSwitcherClick() {
    const { activeLine } = this.state;

    if(activeLine === 'red')
      this.setState({
        activeLine: 'green'
      });
    else
      this.setState({
        activeLine: 'red'
      });

    // Clean up modals and stuff
    this.setState({
      lineSelection: undefined,
      blockSelection: undefined,
      trainSelection: undefined,
      editingSwitch: undefined,
      editingBlock: undefined,
      switchModalOpen: false,
      blockModalOpen: false
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
      switchesOverridden,
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
          <div id="leftMapToggle" className="floating">
            <IconButton
              color="default"
              aria-label="switch map"
              component="span"
              size="large"
              onClick={() => { this.handleMapSwitcherClick(); }}
            >
              <ChevronLeftIcon/>
            </IconButton>
          </div>
          <div id="rightMapToggle" className="floating">
            <IconButton
              color="default"
              aria-label="switch map"
              component="span"
              size="large"
              onClick={() => { this.handleMapSwitcherClick(); }}
            >
              <ChevronRightIcon/>
            </IconButton>
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
                <Button
                  variant="contained"
                  component="span"
                  onClick={() => {
                    window.electronAPI.openFileDialog('schedule');
                  }}
                >
                  Upload Schedule
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
                              Array.from(new Set(Object.values(this.stations[lineSelection.toLowerCase()]))).map((block_id) => {
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
                        isDispatchModalOpen: isDispatchModalOpen
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
                <div id="switchControlGroup">
                  {
                    editingSwitch ?
                      <p>Join {switches[activeLine][editingSwitch].coming_from} to </p>
                    :
                      []
                  }
                  <FormControl id="switchPositionCombobox">
                    {
                      switchesOverridden[activeLine][editingSwitch] ?
                        <Select
                          labelId="block-select-label"
                          value={switches[activeLine][editingSwitch]._going_to || ''}
                          label="join root to"
                          onChange={(ev, elem) => {
                            console.log(switches);
                            // Get value selected
                            const point_to = ev.target.value;

                            // Update state
                            const switches_ = _.cloneDeep(switches);
                            console.log(switches_[activeLine][editingSwitch]);
                            switches_[activeLine][editingSwitch]._going_to = point_to;

                            this.setState({
                              switches: switches_,
                            });

                            window.electronAPI.sendTrackControllerMessage({
                              'type': 'switchOverride',
                              'line': activeLine,
                              'root': switches[activeLine][editingSwitch].coming_from,
                              'goingTo': point_to,
                            });
                          }}
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
                      :
                        <Select
                          disabled={true}
                          labelId="block-select-label"
                          value={(switches[activeLine][editingSwitch] && switches[activeLine][editingSwitch]._going_to) || ''}
                          label="join root to"
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
                    }
                  </FormControl>
                  <FormControlLabel
                    checked={switchesOverridden[activeLine][editingSwitch]}
                    control={<Switch onChange={(ev) => {
                      const switchesOverridden_ = _.cloneDeep(switchesOverridden);
                      switchesOverridden_[activeLine][editingSwitch] = !!ev.target.checked;

                      // Ending maintenance mode
                      if(!ev.target.checked) {
                        // Send reset message
                        const root = switches[activeLine][editingSwitch].coming_from;
                        window.electronAPI.sendTrackControllerMessage({
                          type: 'releaseMaintenanceMode',
                          line: activeLine,
                          root: root
                        });
                      }

                      this.setState({
                        switchesOverridden: switchesOverridden_,
                      });
                  }}/>} label="Maintenance Mode"/>
                </div>
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
                      'line': activeLine,
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
