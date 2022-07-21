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
import { Wayside } from './Wayside.ts';

import greenLine from './TrackComponents/TrackJSON/VF2/green.json';
import redLine from './TrackComponents/TrackJSON/VF2/red.json';

// plc for testing until upload works
import SW13 from './PLC/Green/SW13.json';
import SW29 from './PLC/Green/SW29.json';
import SW57 from './PLC/Green/SW57.json';
import SW63 from './PLC/Green/SW63.json';
import SW76 from './PLC/Green/SW76.json';
import SW85 from './PLC/Green/SW85.json';

import './TrackController.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

class TrackController extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    // For loading plc file via file explorer
    window.electronAPI.subscribeFileMessage((_event, payload) => {
      try {
        this.controllers[this.state.currController].setPLC(
          JSON.parse(payload.payload)
        );
      } catch (e) {
        console.log(`Error loading plc: ${e}`);
      }
    });

    // Receiving Messages from CTC and Track Model
    window.electronAPI.subscribeTrackControllerMessage((_event, payload) => {
      console.log('IPC:TrackController: ', payload);

      switch (payload.type) {
        case 'trackModelStatus':
          // TODO
          // window.electronAPI.sendCTCMessage({
          //   type: 'occupancy',
          //   line: this.state.blocks[].line,
          //   block_id: ,
          //   value: ,
          // });
          // window.electronAPI.sendCTCMessage({
          //   type: 'throughput',
          //   line: this.state.blocks[].line,
          //   value: ,
          // });
          break;
        case 'authority':
          // TODO Add other line
          this.state.blocks[payload.block].authority = payload.authority;
          break;
        case 'dispatch':
          // TODO
          break;
        case 'closure':
          // MMode ?
        default:
          console.warn('Unknown payload type received: ', payload.type);
      }
    });

    this.currTrack = null;
    this.controllers = [];
    this.tracks = [];

    // Testing sub classes
    this.trackGreen = new Track('green', 1);
    this.trackGreen.loadTrack(greenLine);
    this.trackGreen.setInfrastructure();
    this.tracks.push(this.trackGreen);

    this.trackRed = new Track('red', 2);
    this.trackRed.loadTrack(redLine);
    this.trackRed.setInfrastructure();
    this.tracks.push(this.trackRed);

    // console.log(this.trackRed.sections);
    this.currTrack = this.tracks[0];

    this.state = {
      testMode: false,
      track: this.trackGreen,
      blocks: this.currTrack.blocks,
      currBlock: this.currTrack.blocks[0],
      maintenanceMode: false,
      currController: 0,
      appState: false,
      selectedPLC: '',
      schedule: parseInt(0),
      // inputFile: useRef(null),
    };

    // Wayside controllers for switches on green line
    this.controllers.push(new Wayside(1, this.state.blocks.slice(0, 13), 13));
    let temp = this.state.blocks.slice(11, 28);
    temp.push(this.state.blocks[150]);
    this.controllers.push(new Wayside(2, temp, 29));
    this.controllers.push(new Wayside(3, this.state.blocks.slice(56, 57), 57));
    this.controllers.push(new Wayside(4, this.state.blocks.slice(61, 62), 63));
    temp = this.state.blocks.slice(100, 149);
    temp.push(this.state.blocks[76]);
    this.controllers.push(new Wayside(5, temp, 77));
    temp = this.state.blocks.slice(76, 85);
    temp.push(this.state.blocks[99]);
    this.controllers.push(new Wayside(6, temp, 85));

    // Set default controller
    // this.setState((prevState) => ({
    //   currController: this.controllers[0],
    // }));

    // Load PLC for testing purposes
    this.controllers[0].setPLC(SW13);
    this.controllers[1].setPLC(SW29);
    this.controllers[2].setPLC(SW57);
    this.controllers[3].setPLC(SW63);
    this.controllers[4].setPLC(SW76);
    this.controllers[5].setPLC(SW85);

    // Functions for testing
    this.toggle = this.toggle.bind(this);
    this.mmMode = this.mmMode.bind(this);
    this.occupancy = this.occupancy.bind(this);
    this.suggSpeed = this.suggSpeed.bind(this);
    this.schedule = this.schedule.bind(this);
    this.setSwitch = this.setSwitch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleLineChange = this.handleLineChange.bind(this);

    this.handleChangeController = this.handleChangeController.bind(this);

    // this.plc = this.plc.bind(this);
    this.handleChangePLC = this.handleChangePLC.bind(this);

    this.reset = this.reset.bind(this);
  }

  loadNewPLC = (event) => {
    var PLC = window.electronAPI.openFileDialog('PLC');
  };

  handleLineChange(event) {
    this.currTrack = this.tracks[event.target.value - 1];
    this.state.blocks = this.currTrack.blocks;
    this.setState((prevState) => ({
      appSate: !prevState.appState,
    }));
  }

  handleChangePLC(event) {
    this.setState({
      selectedPLC: event.target.value,
    });
  }

  // Always keep status of blocks ----- executes PLC logic
  componentDidMount() {
    const interval = setInterval(() => {
      // /*
      //  * Send CTC:
      //  *
      //  * Authority Changes
      //  * Failures
      //  * Block states (switches, crossing, transit lights)
      //  */
      // window.electronAPI.sendCTCMessage({
      //   type: 'blocks',
      //   blocks: this.state.blocks,
      // });

      /*
       * Send to track model:
       *
       * Authority
       * Train/Suggested Speed
       * Block states (switches, crossing, transit lights)
       */
      window.electronAPI.sendTrackModelMessage({
        type: 'blocks',
        blocks: this.state.blocks,
      });

      // Logic
      this.controllers.forEach((controller) => {
        var status = [];

        for (let j = 0; j < controller.plc.switchLogic.length; j++) {
          // Run 3x for vitality
          status = [true, true, true];
          for (let vitality = 0; vitality < 3; vitality++) {
            for (
              let k = 0;
              k < controller.plc.switchLogic[j].logicTrue.length;
              k++
            ) {
              // AND
              if (controller.plc.switchLogic[j].logicTrue[k] === '&&') {
              }
              // NOT
              else if (
                controller.plc.switchLogic[j].logicTrue[k].includes('!')
              ) {
                if (
                  this.state.blocks[
                    parseInt(
                      controller.plc.switchLogic[j].logicTrue[k].substring(1)
                    ) - 1
                  ].occupancy
                ) {
                  status[vitality] = false;
                }
              }
              // Authority part will be in format '<blockNum>A<authNumber>'
              else if (
                controller.plc.switchLogic[j].logicTrue[k].includes('A')
              ) {
                // If authority of train on block is less than - return false
                if (
                  this.state.blocks[
                    parseInt(
                      controller.plc.switchLogic[j].logicTrue[k].split('A')[0]
                    ) - 1
                  ].authority <
                  controller.plc.switchLogic[j].logicTrue[k].split('A')[1]
                ) {
                  status[vitality] = false;
                }
              }
              // Regular
              else {
                if (
                  !this.state.blocks[
                    parseInt(controller.plc.switchLogic[j].logicTrue[k]) - 1
                  ].occupancy
                ) {
                  status[vitality] = false;
                }
              }
            }
          }
          // Vitality check before setting switch position
          // Also send to CTC/Track Model
          if (status.every((val) => val === true)) {
            if (
              this.state.blocks[
                parseInt(controller.plc.switchLogic[j].switchNumber) - 1
              ].switch.position
            ) {
              window.electronAPI.sendCTCMessage({
                type: 'switch',
                line: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].line,
                root: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.swBlock,
                pointing_to: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.position,
              });
              window.electronAPI.sendTrackModelMessage({
                type: 'switch',
                line: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].line,
                root: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.swBlock,
                pointing_to: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.position,
              });
            }
            this.state.blocks[
              parseInt(controller.plc.switchLogic[j].switchNumber) - 1
            ].switch.position = true;
          } else {
            if (
              !this.state.blocks[
                parseInt(controller.plc.switchLogic[j].switchNumber) - 1
              ].switch.position
            ) {
              window.electronAPI.sendCTCMessage({
                type: 'switch',
                line: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].line,
                root: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.swBlock,
                pointing_to: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.position,
              });
              window.electronAPI.sendTrackModelMessage({
                type: 'switch',
                line: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].line,
                root: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.swBlock,
                pointing_to: this.state.blocks[parseInt(controller.plc.switchLogic[j].switchNumber) - 1].switch.position,
              });
            }
            this.state.blocks[
              parseInt(controller.plc.switchLogic[j].switchNumber) - 1
            ].switch.position = false;
          }
        }

        // Transit light logic
        for (let j = 0; j < controller.plc.lightLogic.length; j++) {
          // Run 3x for vitality
          status = [true, true, true];
          for (let vitality = 0; vitality < 3; vitality++) {
            for (
              let k = 0;
              k < controller.plc.lightLogic[j].green.length;
              k++
            ) {
              // AND
              if (controller.plc.lightLogic[j].green[k] === '&&') {
              }
              // NOT
              else if (controller.plc.lightLogic[j].green[k].includes('!')) {
                if (
                  this.state.blocks[
                    parseInt(
                      controller.plc.lightLogic[j].green[k].substring(1)
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
                    parseInt(controller.plc.lightLogic[j].green[k]) - 1
                  ].occupancy
                ) {
                  status[vitality] = false;
                }
              }
            }
          }
          // console.log(status);
          // Vitality check before setting light position
          if (status.every((val) => val === true)) {
            window.electronAPI.sendCTCMessage({
              type: 'lights',
              line: this.state.blocks[parseInt(controller.plc.lightLogic[j].block) - 1].line,
              id: parseInt(controller.plc.lightLogic[j].block) - 1,
              value: this.state.blocks[parseInt(controller.plc.lightLogic[j].block) - 1].transitLight,
            });
            this.state.blocks[
              parseInt(controller.plc.lightLogic[j].block) - 1
            ].transitLight = 'green';
          } else {
            this.state.blocks[
              parseInt(controller.plc.lightLogic[j].block) - 1
            ].transitLight = 'red';
          }
        }
      });

      this.setState((prevState) => ({
        appSate: !prevState.appState,
      }));
      // console.log('Blocks up to date');
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

  handleChangeController(event) {
    this.setState({
      currController: event.target.value - 1,
      // currBlock: this.state.blocks
      // .filter(
      //   (block) => block.section === event.target.value.charCodeAt(0) - 65
      // )[0],
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
                <div className="centered"></div>
              </Grid>
              <Grid item xs={3}>
                <div className="centered">
                  <FormControl fullWidth>
                    <InputLabel id="select-Block">Line</InputLabel>
                    <Select
                      labelId="select-Line"
                      id="select-Line"
                      value={this.currTrack.id}
                      label="Line"
                      onChange={this.handleLineChange}
                    >
                      {this.tracks[0].id != undefined ? (
                        this.tracks.map((line) => (
                          <MenuItem key={line.id} value={line.id}>
                            {String(line.line)}
                          </MenuItem>
                        ))
                      ) : (
                        <div></div>
                      )}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs={4}>
                <div className="left">
                  {this.state.blocks[
                    this.controllers[this.state.currController].swBlock
                  ] != undefined && this.state.maintenanceMode ? (
                    <Chip
                      onClick={this.setSwitch}
                      label={`Switch Position: ${this.state.currBlock.switch.position}`}
                      color={'success'}
                      variant="outlined"
                    />
                  ) : this.state.currBlock.switch != undefined ? (
                    <Chip
                      label={`Switch Position: ${this.state.currBlock.switch.position}`}
                      color={'success'}
                      variant="outlined"
                    />
                  ) : (
                    <div></div>
                  )}
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
                  {/* <Table
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
                  </Table> */}
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
                      ></TableRow>
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
                    <Button
                      className="button"
                      variant="contained"
                      onClick={this.reset}
                    >
                      reset
                    </Button>
                  </div>
                  <Button
                    className="button"
                    variant="contained"
                    onClick={this.toggle}
                  >
                    toggle test ui
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Box>
        </ThemeProvider>
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
                      {this.controllers[this.state.currController] !=
                      undefined ? (
                        this.controllers[this.state.currController].blocks.map(
                          (block) => (
                            <MenuItem key={block.id} value={block.id}>
                              {String(block.id)}
                            </MenuItem>
                          )
                        )
                      ) : (
                        <div></div>
                      )}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={6}>
                <div className="centered">
                  <FormControl fullWidth>
                    <InputLabel id="select-controller">
                      Track Controller
                    </InputLabel>
                    <Select
                      labelId="select-controller"
                      id="select-controller"
                      value={this.state.currController + 1}
                      label="Controller"
                      onChange={this.handleChangeController}
                    >
                      {this.controllers.map((controller) => (
                        <MenuItem key={+controller.id} value={+controller.id}>
                          {String(controller.id)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className="centered">
                  <FormControl fullWidth>
                    <InputLabel id="select-Block">Line</InputLabel>
                    <Select
                      labelId="select-Line"
                      id="select-Line"
                      value={this.currTrack.id}
                      label="Line"
                      onChange={this.handleLineChange}
                    >
                      {this.tracks[0].id != undefined ? (
                        this.tracks.map((line) => (
                          <MenuItem key={line.id} value={line.id}>
                            {String(line.line)}
                          </MenuItem>
                        ))
                      ) : (
                        <div></div>
                      )}
                    </Select>
                  </FormControl>
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={12}>
              <Grid item xs={4}>
                <div className="left">
                  {this.state.blocks[
                    this.controllers[this.state.currController].swBlock - 1
                  ].switch == undefined ? (
                    <div></div>
                  ) : this.state.maintenanceMode ? (
                    <Chip
                      onClick={this.setSwitch}
                      label={`Switch Position: ${
                        this.state.blocks[
                          this.controllers[this.state.currController].swBlock -
                            1
                        ].switch.position
                      }`}
                      color={
                        this.state.currBlock.switchPosition === 'null'
                          ? 'default'
                          : 'success'
                      }
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      label={`Switch Position: ${
                        this.state.blocks[
                          this.controllers[this.state.currController].swBlock -
                            1
                        ].switch.position
                      }`}
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
                  {/* <Table
                    sx={{ minWidth: 'auto' }}
                    size="small"
                    aria-label="table"
                  > */}
                  {/* <TableHead>
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
                  </Table> */}
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
                      ></TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs>
                <div className="right">
                  <div className="button">
                    <input
                      type="file"
                      ref={this.inputFileRef}
                      onChange={this.onFileChange}
                      style={{ display: 'none' }}
                    />
                    {/* <button variant="contained" onClick={this.onBtnClick}>
                    Load plc
                  </button> */}
                    <Button
                      variant="contained"
                      sx={{ fontSize: 14 }}
                      className="LoadTrack"
                      onClick={this.loadNewPLC}
                    >
                      Load PLC
                    </Button>
                  </div>
                  <Button
                    className="button"
                    variant="contained"
                    onClick={this.toggle}
                  >
                    toggle test ui
                  </Button>
                </div>
              </Grid>
            </Grid>
          </Box>
        </ThemeProvider>
      </div>
    );
  }
}

export default TrackController;
