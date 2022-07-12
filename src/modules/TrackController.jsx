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

import { JoinLeft } from '@mui/icons-material';
import { isNullOrUndefined } from 'util';
import { Track } from './TrackComponents/Track';
import { PLCReader } from './PLCReader';
import blueJSON from './TrackComponents/TrackJSON/blue.json';

import blueLine from './TrackComponents/TrackJSON/blue.json';
import blueA from './PLC/blueA.json';
import blueB from './PLC/blueB.json';
import blueC from './PLC/blueC.json';
import ba from './PLC/bA.json';

import './TrackController.css';

console.log(blueA);

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

    // Testing sub classes
    this.track = new Track('blue');
    this.track.loadTrack(blueJSON);
    this.track.setInfrastructure();
    const res = this.track.blocks;
    console.log(res);

    this.PLCReader = new PLCReader(ba, 'green');
    this.PLCReader.parse();

    // const sections = [];


    //   });


    this.state = {
      testMode: false,
      blocks: this.track.blocks,
      maintenanceMode: false,
      currBlock: this.track.blocks[0],
      appState: false,
      direction: true,
      trackLine: 'blue',
      currSection: this.track.blocks[0].section,
      sections: ['A', 'B', 'C'],
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

    this.plc = this.plc.bind(this);
    this.handleChangePLC = this.handleChangePLC.bind(this);

    this.reset = this.reset.bind(this);

    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.railFailure = this.railFailure.bind(this);
    this.lightFailure = this.lightFailure.bind(this);
    this.signalFailure = this.signalFailure.bind(this);

    // this.initializeBlocks = this.initializeBlocks.bind(this);
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

  plc(file) {
    for (const key in file) {
      if (file[key].command === 'switch') {
        let block = null;
        let block2 = null;
        let arg1 = null;
        let arg2 = null;
        let logical = null;
        let dest = null;

        // set when switch is true (does to low number)
        let temp = file[key].true.split(',');

        // for blue line, simple 2 way switch
        block = temp[0].split(' ')[0];
        arg1 =
          temp[0].split(' ')[1] === 'o'
            ? 'occupancy'
            : temp[0].split(' ')[1] === 's'
            ? 'schedule'
            : '';
        logical = temp[1];
        block2 = temp[2].split(' ')[0];
        arg2 =
          temp[2].split(' ')[1] === 'o'
            ? 'occupancy'
            : temp[0].split(' ')[1] === 's'
            ? 'schedule'
            : '';
        dest = temp[3];

        console.log(
          `Block ${block} ${arg1} ${logical} block ${block2} ${arg2}`
        );

        this.state.blocks[file[key].block - 1].SWTrue = {
          block,
          arg1,
          logical,
          block2,
          arg2,
          dest,
        };

        // set when switch is true (does to low number)
        temp = file[key].false.split(',');

        // for blue line, simple 2 way switch
        block = temp[0].split(' ')[0];
        arg1 =
          temp[0].split(' ')[1] === 'o'
            ? 'occupancy'
            : temp[0].split(' ')[1] === 's'
            ? 'schedule'
            : '';
        logical = temp[1];
        block2 = temp[2].split(' ')[0];
        arg2 =
          temp[2].split(' ')[1] === 'o'
            ? 'occupancy'
            : temp[0].split(' ')[1] === 's'
            ? 'schedule'
            : '';

        dest = temp[3];

        console.log(
          `Block ${block} ${arg1} ${logical} block ${block2} ${arg2}`
        );
        this.state.blocks[file[key].block - 1].SWFalse = {
          block,
          arg1,
          logical,
          block2,
          arg2,
          dest,
        };

        console.log(this.state.blocks[file[key].block]);
      }
      if (file[key].command === 'light') {
        // TODO improve implementation
      }
    }
  }

  // Always keep status of blocks ----- prob not correct implementation
  componentDidMount() {
    const interval = setInterval(() => {
      // console.log(this.state.blocks.length);
      for (let i = 0; i < this.state.blocks.length; i++) {
        // If it is a switch block
        if (
          this.state.blocks[i].switchPosition != 'null' &&
          (this.state.blocks[i].section === 'A'
            ? this.state.sections[0].plc
            : this.state.blocks[i].section === 'B'
            ? this.state.sections[1].plc
            : this.state.blocks[i].section === 'C'
            ? this.state.sections[2].plc
            : false)
        ) {
          // Condition to swt switch to true (low num)
          console.log(this.state.blocks[i].switchPosition);
          const curr = this.state.blocks[i];
          if (
            this.state.blocks[curr.SWTrue.block][curr.SWTrue.arg1] &&
            !this.state.blocks[curr.SWTrue.block2][curr.SWTrue.arg2]
          ) {
            this.state.blocks[i].switchPosition = curr.SWTrue.dest;
            // this.state.blocks[curr.SWFalse.dest].switchPosition = false;
            // this.state.blocks[curr.SWTrue.dest].switchPosition = true;
            console.log(curr.SWTrue.dest);
          } else if (
            this.state.blocks[curr.SWFalse.block][curr.SWFalse.arg1] &&
            !this.state.blocks[curr.SWFalse.block2][curr.SWFalse.arg2]
          ) {
            console.log(curr.SWFalse.dest);
            this.state.blocks[i].switchPosition = curr.SWFalse.dest;
            // this.state.blocks[curr.SWFalse.dest].switchPosition = true;
            // this.state.blocks[curr.SWTrue.dest].switchPosition = false;
          }

          // Set light for switch too
          const sw = this.state.blocks[i].switchPosition;
          if (this.state.blocks[sw - 1].occupancy === true) {
            this.state.blocks[i].transitLight = 'red';
          } else if (this.state.blocks[sw].occupancy === true) {
            this.state.blocks[i].transitLight = 'yellow';
          } else {
            this.state.blocks[i].transitLight = 'green';
          }
        } else if (i < this.state.blocks.length - 2) {
          // light 1
          if (this.state.blocks[i + 1].occupancy === true) {
            this.state.blocks[i].transitLight = 'red';
          } else if (this.state.blocks[i + 2].occupancy === true) {
            this.state.blocks[i].transitLight = 'yellow';
          } else {
            this.state.blocks[i].transitLight = 'green';
          }

          if (i > 2) {
            if (this.state.blocks[i - 1].occupancy === true) {
              this.state.blocks[i].transitLight2 = 'red';
            } else if (this.state.blocks[i - 2].occupancy === true) {
              this.state.blocks[i].transitLight2 = 'yellow';
            } else {
              this.state.blocks[i].transitLight2 = 'green';
            }
          }
        } else if (i < this.state.blocks.length - 1) {
          if (this.state.blocks[i + 1].occupancy === true) {
            this.state.blocks[i].transitLight = 'red';
          }

          if (this.state.blocks[i - 1].occupancy === true) {
            this.state.blocks[i].transitLight2 = 'red';
          }
        } else {
          //   if (this.state.blocks[this.state.blocks.length-1].occupancy === true) {
          //     this.state.blocks[this.state.blocks.length].transitLight = 'red';
          //   } else {
          //     this.state.blocks[this.state.blocks.length].transitLight = 'green';
          //   }

          if (this.state.blocks[0].occupancy === true) {
            this.state.blocks[1].transitLight2 = 'red';
          } else {
            this.state.blocks[1].transitLight2 = 'green';
          }
        }
      }

      /*
       *
       * Set auth
       *
       */
      for (let i = 0; i < this.state.blocks.length; i++) {
        if (
          this.state.blocks[i].schedule &&
          (this.state.blocks[i].transitLight === 'green' ||
            this.state.blocks[i].transitLight === 'yellow')
        ) {
          this.state.blocks[i].authority = true;
        }
      }

      this.setState((prevState) => ({
        appSate: !prevState.appState,
      }));
      console.log('Blocks up to date');
    }, 5000);
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
      if (e.target.value <= 15) {
        this.setState({
          schedule: e.target.value,
        });

        // reset state for all
        for (let i = 0; i < this.state.blocks.length; i++) {
          this.state.blocks[i].schedule = false;
          this.state.blocks[i].authority = false;
        }

        // Blue line only have switches manually set TO CHANGE
        if (e.target.value < 11) {
          for (let i = 0; i < e.target.value; i++) {
            this.state.blocks[i].schedule = true;
          }
        } else if (e.target.value > 10) {
          for (let j = 0; j < e.target.value; j++) {
            if (j < 5 || j > 9) {
              this.state.blocks[j].schedule = true;
            }
          }
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

  setSwitch() {
    if (this.state.currBlock.switchPosition != 'null') {
      if (this.state.currBlock.switchPosition === '11') {
        this.state.currBlock.switchPosition = '6';
      } else {
        this.state.currBlock.switchPosition = '11';
      }
    }

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
                      {this.state.blocks
                        .filter(
                          (block) => block.section === this.state.currSection.id
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
                      value={this.state.currSection.id}
                      label="Sections"
                      onChange={this.handleChangeSection}
                    >
                      {this.state.sections.map((section) => (
                        <MenuItem key={section.id} value={section.id}>
                          {String(section.id)}
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
                            label={String(this.state.currBlock.crossing)}
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
                            label={String(this.state.currBlock.crossing)}
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
                            label={String(this.state.currBlock.occupancy)}
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
              <Grid item xs="auto">
                {/* <TableContainer>
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
                </TableContainer> */}
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
                          (block) => block.section === this.state.currSection.id
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
                      value={this.state.currSection.id}
                      label="Sections"
                      onChange={this.handleChangeSection}
                    >
                      {this.state.sections.map((section) => (
                        <MenuItem key={section.id} value={section.id}>
                          {String(section.id)}
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
                            label={String(this.state.currBlock.crossing)}
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
                            label={String(this.state.currBlock.crossing)}
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
                        <TableCell component="th">Track Occupency</TableCell>
                        <TableCell align="right">
                          <Chip
                            label={String(this.state.currBlock.occupancy)}
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
              <Grid item xs="auto">
                {/* <TableContainer>
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
                </TableContainer> */}
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
