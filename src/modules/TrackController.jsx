/* eslint-disable max-classes-per-file */
import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  Button,
  Grid,
  Box,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  createTheme,
  ThemeProvider,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
} from '@mui/material';

import blueLine from './blue.json';

import './TrackController.css';

console.log(blueLine);


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

window.electronAPI.subscribeTrackControllerMessage((_event, payload) => {
  console.log('IPC:TrackController: ', payload);
});

// class Block {
//   constructor(id, position) {
//     this.state = {
//       id,
//       transitLight: null,
//       occupancy: null,
//       switchPosition: position,
//       engineFailure: false,
//       lightFailure: false,
//       // brakeFailure: true,
//       signalFailure: false,
//       // railFailure: true,
//     };

//     let railFailure = false;
//     let brakeFailure = true;

//     this.brakeFail = this.brakeFail.bind(this);
//   }

//   brakeFail() {
//     this.railFailure = !this.brakeFailure;
//   }

//   getBrakeFailure() {
//     return this.brakeFailure;
//   }
// }

class TrackController extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    // Bad practice, should be seperate block class --- will rework later
    const blocks = [];
    for (const key in blueLine){
      blocks.push({
        id: blueLine[key]['Block Number'],
        transitLight: 'green',
        occupancy: false,
        switchPosition: blueLine[key]['switch'],
        engineFailure: false,
        lightFailure: false,
        brakeFailure: false,
        signalFailure: false,
        railFailure: false,
      });
      console.log(blueLine[key]);
    }

    this.state = {
      testMode: false,
      blocks,
      maintenanceMode: false,
      currBlock: blocks[0],
      appState: false,
      direction: true,
      trackLine: 'blue',
      // inputFile: useRef(null),
    };

    // For inputting file
    this.inputFileRef = React.createRef(null);
    this.onFileChange = this.handleFileChange.bind(this);
    this.onBtnClick = this.handleBtnClick.bind(this);
    // this.readPLC = this.readPLC.bind(this);
    // this.triggerInputFile = this.triggerInputFile.bind(this);

    this.toggle = this.toggle.bind(this);
    this.mmMode = this.mmMode.bind(this);
    this.toggleDirection = this.toggleDirection.bind(this);
    this.occupancy = this.occupancy.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.railFailure = this.railFailure.bind(this);
    this.lightFailure = this.lightFailure.bind(this);
    this.signalFailure = this.signalFailure.bind(this);

    // this.initializeBlocks = this.initializeBlocks.bind(this);
  }

  occupancy() {
    this.state.currBlock.occupancy = !this.state.currBlock.occupancy;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
    console.log(this.state.currBlock.occupancy);
  }


  handleFileChange(e) {
    /* Selected files data can be collected here. */
    console.log(e.target.files);
    console.log(e.target.files[0].path);
    this.readPLC(String(e.target.files[0].path))
  }

  handleBtnClick() {
    /* Collecting node-element and performing click */
    this.inputFileRef.current.click();
  }

  handleChange(event) {
    this.setState({
      activeBlock: event.target.value - 1,
      // currBlock: this.state.blocks.find(block => block.id === event.target.value),
      currBlock: this.state.blocks[event.target.value - 1],
    });
  }

  toggle() {
    this.setState((prevState) => ({
      testMode: !prevState.testMode,
    }));
  }

  mmMode() {
    this.setState((prevState) => ({
      maintenanceMode: !prevState.maintenanceMode,
    }));
  }

  toggleDirection() {
    this.setState((prevState) => ({
      direction: !prevState.direction,
    }));  }

  brakeFailure() {
    this.state.currBlock.brakeFailure = !this.state.currBlock.brakeFailure;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
  }

  engineFailure() {
    this.state.currBlock.engineFailure = !this.state.currBlock.engineFailure;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
  }

  railFailure() {
    this.state.currBlock.railFailure = !this.state.currBlock.railFailure;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
  }

  lightFailure() {
    this.state.currBlock.lightFailure = !this.state.currBlock.lightFailure;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
  }

  signalFailure() {
    this.state.currBlock.signalFailure = !this.state.currBlock.signalFailure;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
  }

  // readPLC(path) {
  //   const reader = new FileReader();
  //   reader.addEventListener('load', (event) => {
  //     const result = event.target.result;
  //     // Do something with result
  //   });

  //   reader.addEventListener('progress', (event) => {
  //     if (event.loaded && event.total) {
  //       const percent = (event.loaded / event.total) * 100;
  //       console.log(`Progress: ${Math.round(percent)}`);
  //     }
  //   });
  //   reader.readAsDataURL(path);
  // }

  // brakeFail() {
  //   console.log("brake fail");
  //   this.setState((prevState) => ({
  //     this.state.blocks[this.state.activeBlock].brakeFailure: !prevbrakeFailure,
  //   }))
  // }

  // initializeBlocks() {
  //   this.setState({
  //     // eslint-disable-next-line react/destructuring-assignment
  //     blocks: [this.state.blocks, new Block],
  //   });
  //   console.log(this.state.blocks)
  // }

  // eslint-disable-next-line class-methods-use-this
  testUI() {
    return (
      <div>
        <ThemeProvider theme={darkTheme}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={12}>
              <Grid item xs={3}>
                <div className="left">
                  <FormControl fullWidth>
                    <InputLabel id="select-Block">Block</InputLabel>
                    <Select
                      labelId="select-Block"
                      id="select-Block"
                      value={this.state.currBlock.id}
                      label="Blocks"
                      onChange={this.handleChange}
                    >
                      {this.state.blocks.map((block) => (
                        <MenuItem key={block.id} value={block.id}>
                          {String(block.id)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={6}>
              <div className="text-centered"><Button onClick={this.toggleDirection}>Test Panel: {this.state.direction ? 'forward' : 'backward'}</Button></div>
              </Grid>
              <Grid item xs={3}>
                <div className="text-centered">Track Line: {this.state.trackLine}</div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs={4}>
                <div className="left">
                  <Chip
                    label={`Switch Position: ${this.state.currBlock.switchPosition}`}
                    color="success"
                    variant="outlined"
                  />
                </div>
              </Grid>
              <Grid item xs="auto">
                <div className="centered">
                  {this.state.maintenanceMode ? (
                    <Chip
                      onClick={this.mmMode}
                      label="Maintenence Mode Activated"
                      color="warning"
                      variant="filled"
                    />
                  ) : (
                    <Chip
                      onClick={this.mmMode}
                      label="Maintenence Mode Deactivated"
                      color="success"
                      variant="filled"
                    />
                  )}
                </div>
              </Grid>
              <Grid item xs>
                <div className="right">
                  <Chip label="Light" color="success" variant="outlined" />
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs="auto">
                <TableContainer className="metrics">
                  <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Train Metrics</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Suggested Velocity</TableCell>
                        <TableCell align="right">mph</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Authority</TableCell>
                        <TableCell align="right">miles</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Track Metrics</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Gates</TableCell>
                        <TableCell align="right">status</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Crossing Lights</TableCell>
                        <TableCell align="right">status</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th"><Button onClick={this.occupancy}>Track Occupancy</Button></TableCell>
                        <TableCell align="right">{String(this.state.currBlock.occupancy)}</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Direction</TableCell>
                        <TableCell align="right">bool</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs="auto">
                <TableContainer>
                  <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Failures</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">
                          <Button onClick={this.railFailure}>Rail</Button>
                        </TableCell>
                        {this.state.currBlock.railFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">
                          <Button onClick={this.lightFailure}>Light</Button>
                        </TableCell>
                        {this.state.currBlock.lightFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">
                          <Button onClick={this.engineFailure}>Engine</Button>
                        </TableCell>
                        {this.state.currBlock.engineFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">
                          <Button onClick={this.signalFailure}>Signal</Button>
                        </TableCell>
                        {this.state.currBlock.signalFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">
                          <Button onClick={this.brakeFailure}>Brake</Button>
                        </TableCell>
                        {this.state.currBlock.brakeFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs>
                <div className="centered">
                  <Button variant="contained">Load plc</Button>
                </div>
              </Grid>
            </Grid>
          </Box>
        </ThemeProvider>
        <Button variant="contained" onClick={this.toggle}>
          toggle test ui
        </Button>
      </div>
    );
  }

  render() {
    if (this.state.testMode) return this.testUI();

    const mmMode = this.maintenanceMode;

    return (
      <div>
        <ThemeProvider theme={darkTheme}>
          <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={12}>
              <Grid item xs={3}>
                <div className="left">
                  <FormControl fullWidth>
                    <InputLabel id="select-Block">Block</InputLabel>
                    <Select
                      labelId="select-Block"
                      id="select-Block"
                      value={this.state.currBlock.id}
                      label="Blocks"
                      onChange={this.handleChange}
                    >
                      {this.state.blocks.map((block, index) => (
                        <MenuItem key={block.id} value={block.id}>
                          {String(block.id)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="text-centered"><Button onClick={this.toggleDirection}>Track Controller {this.state.direction ? 'forward' : 'backward'}</Button></div>
              </Grid>
              <Grid item xs={3}>
                <div className="text-centered">Track Line: {this.state.trackLine}</div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs={4}>
                <div className="left">
                  <Chip
                    label={`Switch Position: ${this.state.currBlock.switchPosition}`}
                    color="success"
                    variant="outlined"
                  />
                </div>
              </Grid>
              <Grid item xs="auto">
                <div className="centered">
                  {this.state.maintenanceMode ? (
                    <Chip
                      label="Maintenence Mode Activated"
                      color="warning"
                      variant="filled"
                    />
                  ) : (
                    <Chip
                      label="Maintenence Mode Deactivated"
                      color="success"
                      variant="filled"
                    />
                  )}
                </div>
              </Grid>
              <Grid item xs>
                <div className="right">
                  <Chip label="Light" color="success" variant="outlined" />
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs="auto">
                <TableContainer className="metrics">
                  <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Train Metrics</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Suggested Velocity</TableCell>
                        <TableCell align="right">mph</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Authority</TableCell>
                        <TableCell align="right">miles</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Track Metrics</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Gates</TableCell>
                        <TableCell align="right">status</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Crossing Lights</TableCell>
                        <TableCell align="right">status</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Track Occupency</TableCell>
                        <TableCell align="right">{String(this.state.currBlock.occupancy)}</TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Direction</TableCell>
                        <TableCell align="right">bool</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs="auto">
                <TableContainer>
                  <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell>Failures</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Rail</TableCell>
                        {this.state.currBlock.railFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Light</TableCell>
                        {this.state.currBlock.lightFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Engine</TableCell>
                        {this.state.currBlock.engineFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Signal</TableCell>
                        {this.state.currBlock.signalFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Brake</TableCell>
                        {this.state.currBlock.brakeFailure ? (
                          <TableCell align="right">FAIL</TableCell>
                        ) : (
                          <TableCell align="right">OK</TableCell>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs>
                <div className="centered">
                  <input
                    type="file"
                    ref={this.inputFileRef}
                    onChange={this.onFileChange}
                    style={{display:'none'}}
                  />
                  <button variant="contained" onClick={this.onBtnClick}>
                    Load plc
                  </button>
                </div>
              </Grid>
            </Grid>
          </Box>
        </ThemeProvider>
        <Button variant="contained" onClick={this.toggle}>
          toggle test ui
        </Button>
      </div>
    );
  }
}

export default TrackController;
