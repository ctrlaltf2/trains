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
  TextField,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';

import { Track } from './TrackComponents/Track';
import { PLCReader } from './PLCReader';
import { Wayside } from './Wayside.ts';
import blueJSON from './TrackComponents/TrackJSON/blue.json';

import blueLine from './TrackComponents/TrackJSON/blue.json';
import greenPLC from './PLC/Green/allPLC.json';
import greenLine from './TrackComponents/TrackJSON/VF2/green.json';
import redLine from './TrackComponents/TrackJSON/VF2/red.json';
import './TrackController.css';
import Wayside from './wayside';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

window.electronAPI.subscribeTrackControllerMessage((_event, payload) => {
  console.log('IPC:TrackController: ', payload);
});

class TrackController extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.currTrack = null;

    // Testing sub classes
    this.trackGreen = new Track('green');
    this.trackGreen.loadTrack(greenLine);
    this.trackGreen.setInfrastructure();

    this.controller = new Wayside(greenLine);

    // console.log(this.trackRed.sections);
    this.currTrack = this.trackGreen;

    // WIP
    this.PLCReader = new PLCReader(greenPLC, 'green');
    this.PLCReader.parse();
    console.log(this.PLCReader.switchLogic);

    this.state = {
      testMode: false,
      track: this.trackGreen,
      blocks: this.currTrack.blocks,
      currBlock: this.currTrack.blocks[0],
      maintenanceMode: false,
      currController: this.currTrack.blocks[0],
      appState: false,
      direction: true,
      trackLine: 'green',
      currSection: this.currTrack.blocks[0].section,
      sections: this.currTrack.sections,
      selectedPLC: '',
      schedule: parseInt(0),
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
    this.toggleSection = this.toggleSection.bind(this);
    this.occupancy = this.occupancy.bind(this);
    this.suggSpeed = this.suggSpeed.bind(this);
    this.schedule = this.schedule.bind(this);
    this.setSwitch = this.setSwitch.bind(this);
    this.blockDirection = this.blockDirection.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSection = this.handleChangeSection.bind(this);

    // this.plc = this.plc.bind(this);
    this.handleChangePLC = this.handleChangePLC.bind(this);

    this.reset = this.reset.bind(this);

    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.railFailure = this.railFailure.bind(this);
    this.lightFailure = this.lightFailure.bind(this);
    this.signalFailure = this.signalFailure.bind(this);
  }

  handleChangePLC(event) {
    this.setState({
      selectedPLC: event.target.value,
    });

    if (event.target.value === 'A') {
      console.log('running plc a');
      this.plc(blueA);
      this.state.sections[0].plc = true;
    } else if (event.target.value === 'B') {
      this.plc(blueB);
      this.state.sections[1].plc = true;
    } else if (event.target.value === 'C') {
      this.plc(blueC);
      this.state.sections[2].plc = true;
    }
  }

  // Always keep status of blocks ----- executes PLC logic
  componentDidMount() {
    const interval = setInterval(() => {
      // console.log(this.state.blocks.length);
      var status = [];

      for (let j = 0; j < this.PLCReader.switchLogic.length; j++) {
        // Run 3x for vitality
        status = [true, true, true]
        for (let vitality = 0; vitality < 3; vitality++) {
          for (
            let k = 0;
            k < this.PLCReader.switchLogic[j].logicTrue.length;
            k++
          ) {
            // AND
            if (this.PLCReader.switchLogic[j].logicTrue[k] === '&&') {
            }
            // NOT
            else if (this.PLCReader.switchLogic[j].logicTrue[k].includes('!')) {
              if (
                this.state.blocks[
                  parseInt(
                    this.PLCReader.switchLogic[j].logicTrue[k].substring(1)
                  ) - 1
                ].occupancy
              ) {
                status[vitality] = false;
              }
            }
            // Regular
            else {
              if (
                !this.state.blocks[
                  parseInt(this.PLCReader.switchLogic[j].logicTrue[k]) - 1
                ].occupancy
              ) {
                status[vitality] = false;
              }
            }
          }
        }
        console.log(status);
        // Vitality check before setting switch position
        if (status.every((val) => val === true)) {
          this.state.blocks[
            parseInt(this.PLCReader.switchLogic[j].switchNumber) - 1
          ].switch.position = true;
          console.log(
            this.state.blocks[
              parseInt(this.PLCReader.switchLogic[j].switchNumber) - 1
            ].switch.position
          );
        } else {
          this.state.blocks[
            parseInt(this.PLCReader.switchLogic[j].switchNumber) - 1
          ].switch.position = false;
          console.log(
            this.state.blocks[
              parseInt(this.PLCReader.switchLogic[j].switchNumber) - 1
            ].switch.position
          );
        }
      }

      this.setState((prevState) => ({
        appSate: !prevState.appState,
      }));
      console.log('Blocks up to date');
    }, 1000);
  }

  reset() {
    for (let i = 0; i < this.state.blocks.length; i++) {
      this.state.blocks[i].occupancy = false;
      this.state.blocks[i].authority = false;
      this.state.blocks[i].suggSpeed = 0;
    }
  }

  schedule(e) {
    if (!isNaN(e.target.value)) {
      for (let i = 0; i < this.state.blocks.length; i++) {
        this.state.blocks[i].occupancy = true;
        for (let j = 0; j < 500000; j++) {
          this.state.blocks[i].occupancy = false;
        }
      }
    }
  }

  suggSpeed(e) {
    if (!isNaN(e.target.value)) {
      this.state.currBlock.suggSpeed = e.target.value;

      this.setState((prevState) => ({
        appSate: !prevState.appState,
      }));
    }
  }

  setSwitch(block, position) {
    this.state.blocks[block].switch.position(position);

    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
  }

  occupancy() {
    this.state.currBlock.occupancy = !this.state.currBlock.occupancy;
    this.setState((prevState) => ({
      appState: !prevState.appState,
    }));
    console.log(this.state.currBlock.occupancy);
  }

  blockDirection() {
    this.state.currSection.direction = !this.state.currSection.direction;
    this.setState((prevState) => ({
      appSate: !prevState.appState,
    }));
    console.log(this.state.currSection.direction);
  }

  handleFileChange(e) {
    /* Selected files data can be collected here. */
    console.log(e.target.result);

    const reader = new FileReader();
    reader.readAsText(event.target.files[0]);
  }

  handleBtnClick() {
    /* Collecting node-element and performing click */
    this.inputFileRef.current.click();
  }

  handleChange(event) {
    this.setState({
      currBlock: this.state.blocks[event.target.value - 1],
    });
  }

  handleChangeSection(event) {
    this.setState({
      currSection: this.state.sections[event.target.value.charCodeAt(0) - 65],
      // currBlock: this.state.blocks
      // .filter(
      //   (block) => block.section === event.target.value.charCodeAt(0) - 65
      // )[0],
    });

    console.log(this.state.sections);
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

  toggleSection(section) {
    this.setState({
      currSection: section,
    });
  }

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

  // eslint-disable-next-line class-methods-use-this
  testUI() {
    return (
      <div>
        <ThemeProvider theme={darkTheme}>
          <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
              <Toolbar variant="dense">
                <Typography variant="h6" color="white" component="div">
                  Track Controller Test Panel
                </Typography>
              </Toolbar>
            </AppBar>
          </Box>
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
                <div className="centered">
                  <FormControl fullWidth>
                    <InputLabel id="select-section">
                      Track Controller
                    </InputLabel>
                    <Select
                      labelId="select-section"
                      id="select-section"
                      value={this.state.currSection.id}
                      label="Sections"
                      onChange={this.handleChangeSection}
                    >
                      {this.state.sections.map((section) => (
                        <MenuItem key={section} value={section}>
                          {String(section)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="text-centered">
                  Track Line: {this.state.trackLine}
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs={4}>
                <div className="left">
                  { this.state.currBlock.switch != undefined &&
                  this.state.maintenanceMode ? (
                    <Chip
                      onClick={this.setSwitch}
                      label={`Switch Position: ${this.state.currBlock.switch.position}`}
                      color={ 'success'
                      }
                      variant="outlined"
                    />
                  ) : (this.state.currBlock.switch != undefined ? (
                    <Chip
                    label={`Switch Position: ${this.state.currBlock.switch.position}`}
                    color={ 'success' }
                    variant="outlined"
                  />
                  ): <div></div>) }
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
                  <Chip
                    label="Light"
                    color={
                      this.state.currBlock.transitLight === 'green'
                        ? 'success'
                        : this.state.currBlock.transitLight === 'yellow'
                        ? 'warning'
                        : this.state.currBlock.transitLight === 'red'
                        ? 'error'
                        : 'default'
                    }
                    variant="filled"
                  />
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
                        <TableCell component="th">Suggested Speed</TableCell>
                        <TableCell align="right">
                          <TextField
                            value={this.state.currBlock.suggSpeed}
                            onChange={this.suggSpeed}
                            id="standard-basic"
                            label="Speed"
                            variant="standard"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Authority</TableCell>
                        <TableCell align="right">
                          {' '}
                          <Chip
                            label={String(this.state.currBlock.authority)}
                            color={
                              this.state.currBlock.authority === false
                                ? 'error'
                                : this.state.currBlock.authority === true
                                ? 'success'
                                : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
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
                        <TableCell align="right">
                          {' '}
                          <Chip
                            label={
                              this.state.currBlock.crossing === false
                                ? 'Not active'
                                : this.state.currBlock.crossing === true
                                ? 'Active'
                                : 'default'
                            }
                            color={
                              this.state.currBlock.crossing === false
                                ? 'success'
                                : this.state.currBlock.crossing === true
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Crossing Lights</TableCell>
                        <TableCell align="right">
                          {' '}
                          <Chip
                            label={
                              this.state.currBlock.crossing === false
                                ? 'Not active'
                                : this.state.currBlock.crossing === true
                                ? 'Active'
                                : 'default'
                            }
                            color={
                              this.state.currBlock.crossing === false
                                ? 'success'
                                : this.state.currBlock.crossing === true
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">
                          <Button onClick={this.occupancy}>
                            Track Occupancy
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={
                              this.state.currBlock.occupancy === false
                                ? 'Not occupied'
                                : this.state.currBlock.occupancy === true
                                ? 'Occupied'
                                : ''
                            }
                            color={
                              this.state.currBlock.occupancy === false
                                ? 'success'
                                : this.state.currBlock.occupancy === true
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                          />{' '}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        {/* <TableCell component="th">
                          <Button onClick={this.blockDirection}>
                            Direction
                          </Button>
                        </TableCell>
                        <TableCell align="right">
                          {this.state.currSection.direction
                            ? 'forward'
                            : 'backward'}
                        </TableCell> */}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs>
                <div className="centered">
                  <TextField
                    value={this.state.schedule}
                    onChange={this.schedule}
                    id="standard-basic"
                    label="Schedule train"
                    variant="standard"
                  />
                  <div style={{ margin: '1rem' }}>
                    <Button variant="contained" onClick={this.reset}>
                      reset
                    </Button>
                  </div>
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
            <AppBar position="static">
              <Toolbar variant="dense">
                <Typography variant="h6" color="white" component="div">
                  Track Controller
                </Typography>
              </Toolbar>
            </AppBar>
          </Box>
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
                      {this.state.blocks
                        .filter(
                          (block) => block.section === this.state.currSection
                        )
                        .map((block) => (
                          <MenuItem key={block.id} value={block.id}>
                            {String(block.id)}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="centered">
                  <FormControl fullWidth>
                    <InputLabel id="select-section">
                      Track Controller
                    </InputLabel>
                    <Select
                      labelId="select-section"
                      id="select-section"
                      value={this.state.currSection}
                      label="Sections"
                      onChange={this.handleChangeSection}
                    >
                      {this.state.sections.map((section) => (
                        <MenuItem key={section} value={section}>
                          {String(section)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="text-centered">
                  Track Line: {this.state.trackLine}
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs={4}>
                <div className="left">
                  {this.state.currBlock.switchPosition != null &&
                  this.state.maintenanceMode ? (
                    <Chip
                      onClick={this.setSwitch}
                      label={`Switch Position: ${this.state.currBlock.switchPosition}`}
                      color={
                        this.state.currBlock.switchPosition === 'null'
                          ? 'default'
                          : 'success'
                      }
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label={`Switch Position: ${this.state.currBlock.switchPosition}`}
                      color={
                        this.state.currBlock.switchPosition === 'null'
                          ? 'default'
                          : 'success'
                      }
                      variant="outlined"
                    />
                  )}
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
                  <Chip
                    label="Transit Light"
                    color={
                      this.state.currBlock.transitLight === 'green'
                        ? 'success'
                        : this.state.currBlock.transitLight === 'yellow'
                        ? 'warning'
                        : this.state.currBlock.transitLight === 'red'
                        ? 'error'
                        : 'default'
                    }
                    variant="filled"
                  />
                  {/* <Chip
                    label="Light Backward"
                    color={
                      this.state.currBlock.transitLight2 === 'green'
                        ? 'success'
                        : this.state.currBlock.transitLight2 === 'yellow'
                        ? 'warning'
                        : this.state.currBlock.transitLight2 === 'red'
                        ? 'error'
                        : 'default'
                    }
                    variant="filled"
                  /> */}
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
                        <TableCell component="th">Suggested Speed</TableCell>
                        <TableCell align="right">
                          {this.state.currBlock.suggSpeed}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Authority</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={String(this.state.currBlock.authority)}
                            color={
                              this.state.currBlock.authority === false
                                ? 'error'
                                : this.state.currBlock.authority === true
                                ? 'success'
                                : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
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
                        <TableCell align="right">
                          <Chip
                            label={
                              this.state.currBlock.crossing === false
                                ? 'Not active'
                                : this.state.currBlock.crossing === true
                                ? 'Active'
                                : 'default'
                            }
                            color={
                              this.state.currBlock.crossing === false
                                ? 'success'
                                : this.state.currBlock.crossing === true
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Crossing Lights</TableCell>
                        <TableCell align="right">
                          {' '}
                          <Chip
                            label={
                              this.state.currBlock.crossing === false
                                ? 'Not active'
                                : this.state.currBlock.crossing === true
                                ? 'Active'
                                : 'default'
                            }
                            color={
                              this.state.currBlock.crossing === false
                                ? 'success'
                                : this.state.currBlock.crossing === true
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell component="th">Track Occupancy</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={
                              this.state.currBlock.occupancy === false
                                ? 'Not occupied'
                                : this.state.currBlock.occupancy === true
                                ? 'Occupied'
                                : ''
                            }
                            color={
                              this.state.currBlock.occupancy === false
                                ? 'success'
                                : this.state.currBlock.occupancy === true
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                          />{' '}
                        </TableCell>
                      </TableRow>
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        {/* <TableCell component="th">Direction</TableCell>
                        <TableCell align="right">
                          {this.state.currSection.direction
                            ? 'forward'
                            : 'backward'}
                        </TableCell> */}
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
                    style={{ display: 'none' }}
                  />
                  {/* <button variant="contained" onClick={this.onBtnClick}>
                    Load plc
                  </button> */}
                  <FormControl fullWidth>
                    <InputLabel id="select-plc">Select PLC</InputLabel>
                    <Select
                      labelId="select-plc"
                      id="select-plc"
                      value={this.state.selectedPLC}
                      label="Sections"
                      onChange={this.handleChangePLC}
                    >
                      <MenuItem value="A">File A</MenuItem>
                      <MenuItem value="B">File B</MenuItem>
                      <MenuItem value="C">File C</MenuItem>
                    </Select>
                  </FormControl>
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
