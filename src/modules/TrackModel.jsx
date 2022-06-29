import { Module } from "module"
import './TrackModel.css';
import
{
  Button,
  Container,
  FormControl,
  createTheme,
  Grid,
  InputLabel,
  OutlinedInput,
  TextField,
  Select,
  MenuItem,
  TextareaAutosize
} from '@mui/material/';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { blue, grey, red, lightGreen } from "@mui/material/colors";
import { Box, sizing } from "@mui/system";
import React from "react";

const colorGreen = lightGreen[500];

// variables
const switchPos = 0;
function handleChange () { return 0; }




class TrackModel extends React.Component  {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      //  system variable defaults will go here -- booleans
      testMode: false,
      trackPower: true,
      railStatus: true,
      recievingTrackCircuit: true,
      sendingTrackCircuit: true,
      // beaconStatus: true,
    };

    //  intialize variables for functions
    // this.speedLimit = 0;  //  units mph
    // this.switchPos = 0; //  units integer 1, 2, 3
    // this.blockLength = 0;   //  units miles
    // this.directionOfTravel = "forwards";  //  forwards or backwards
    // this.trainOccupancy = 0;  //  units people integer
    // this.enviornmentTemp = 70;  //  units degree F
    // this.personsAtStation = 1;  //  units people
    // this.distanceFromRailwayCrossing = 1; //  units miles
    this.elevation = 1; //  units feet

    //  function prototypes
    this.toggle = this.toggle.bind(this);
    this.failTrackPower = this.failTrackPower.bind(this);
    this.breakRail = this.breakRail.bind(this);
    this.changeSendingTrackCircuit = this.changeSendingTrackCircuit.bind(this);
    this.changeRecievingTrackCircuit = this.changeRecievingTrackCircuit.bind(this);
    this.changeElevation = this.changeElevation.bind(this);
    this.changeSwitchPosition = this.changeSwitchPosition.bind(this);
    this.changeBeacon = this.changeBeacon.bind(this);

    // this.resetPower = this.resetPower.bind(this);
    // this.resetRail = this.resetRail.bind(this);
    // this.resetSendingTrackCircuit = this.resetSendingTrackCircuit.bind(this);
    // this.resetRecievingTrackCircuit = this.resetRecievingTrackCircuit.bind(this);
    // this.resetElevation = this.resetElevation.bind(this);
    // this.resetSwitchPosition = this.resetSwitchPosition.bind(this);
    // this.resetBeacon = this.resetBeacon.bind(this);

    // this.resetAllSettings = this.resetAllSettings.bind(this);
    // this.loadNewTM = this.loadNewTM.bind(this);

  }


  //  Create function definitions here
  /*
    Fail Track Power
    Break Rail
    Stop Sending Track Circuit
    Stop Recieveing Track Circuit
    Change Elevation
    Change Switch Position
    Stop Beacon

    Reset Power
    Reset Rail
    Reset Sending Track Circuit
    Reset Recieving Track Circuit
    Reset Elevation
    Reset Switch Postion
    Reset Beacon

    Reset all setting to default
    Load new Track Model
    Toggle Function
  */

  failTrackPower() {
    this.setState((prevState) => ({
      trackPower: !prevState.trackPower,
    }));
  }

  breakRail()
  {
    this.setState((prevState) => ({
      railStatus: !prevState.railStatus
    }));
  }

  changeSendingTrackCircuit()
  {
    this.setState((prevState) => ({
      sendingTrackCircuit: !prevState.sendingTrackCircuit
    }));
  }

  changeRecievingTrackCircuit()
  {
    this.setState((prevState) => ({
      recievingTrackCircuit: !prevState.recievingTrackCircuit
    }));
  }

  changeElevation()
  {
    this.setState()
  }

  //  should reset elevation to the elevation of the block stat
  resetElevation()
  {
    this.elevation = 0;
  }

  changeBeacon()
  {
    this.setState((prevState) => ({
      beaconStatus: !prevState.beaconStatus
    }))
  }

  // resetAllSettings()
  // {

  //   //  go through each setting and change it back to the original block
  // }

  changeSwitchPosition() {
    //  run some code
  }

  toggle() {
    this.setState((prevState) => ({
      testMode: !prevState.testMode,
    }));
  }


  //  Test UI Function
  testUI()
  {
    return  (
      <Container maxWidth="lg">
        <Grid
          container
          spacing={12}
          direction="row"
          justifyContent="center">
          <Grid item xs={3} justifyContent="center">
            <div className="HeaderText"  > Test UI</div>
          </Grid>
        </Grid>
        <Grid container spacing={1} direction="row">
          <Grid item xs={4}>
            <Button className="LoadTrack">Load new Track Model</Button>
          </Grid>
          <Grid item xs={4}>
            <></>
          </Grid>
          <Grid item xs={4} spacing={1}>
            <Button variant="contained" sx={{ fontSize: 14 }} color="grey" className="RestoreDefaults">Reset to Default Settings</Button>
          </Grid>
        </Grid>

        {/* Need three columns, and in the far right column a grid with two columns */}
        <Grid
          container
          spacing={12}
          direction="row"
          justifyContent="center">

          {/* Column 1 */}
          <Grid item xs={4}>
            {/* within grid want two more columns for label and data flowing in */}
            <Grid
              container
              column spacing={1}>
              <Grid item xs={6}>
                <div className="label">Rail Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 1</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Power</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 2</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Recieved</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 3</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Sent</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 4</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Switch Position</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 5</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Speed Limit</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 6</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Length</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 7</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Direction of Travel</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 8</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Train Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 9</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 10</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Heater Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 11</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Enviornment Temp</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 12</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Persons at Station</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 13</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Beacon Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 14</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Railway Crossing</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 15</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Elevation</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 16</div>
              </Grid>

            </Grid>
          </Grid>

          {/* Column 2 */}
          <Grid item xs={4}>
            <Grid
              container
              spacing={12} >
              <Grid item>
                <Button variant="contained" onClick={this.toggle}> Toggle testUI</Button>
              </Grid>

            </Grid>
          </Grid>

          {/* Column 3 */}
          <Grid item xs={4}>
            <Grid
              container
              spacing={1}
              direction="row"
              justifyContent="center">

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 12 }}>Fail Track Power</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Power</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Break Rail</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Rail</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Stop Sending Track Circuit</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Sending Track Circuit</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Stop Recieving Track Circuit</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Recieving Track Cicuit</Button>
              </Grid>


              <Grid item xs={6} >
                <TextField id="outlined-basic" size="small" color="error" label="Change Elevation" type="number" variant="outlined" sx={{ height: '50%', width: '15ch' }} />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Elevation</Button>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth="true" size="small">
                  <InputLabel id="switch-position-select-label">Switch Position</InputLabel>
                  <Select
                    sx={{ fontSize: 8 }}
                    variant="filled"
                    id="switch-position-select-label"
                    value={switchPos}
                    label="Switch Position"
                    onChange={handleChange}>
                    <MenuItem value={1}>One</MenuItem>
                    <MenuItem value={2}>Two</MenuItem>
                    <MenuItem value={3}>Three</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Switch</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Stop Beacon</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Beacon</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  }

  render() {
    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.testMode) return this.testUI();
    return (
      <Container maxWidth="lg">
        <Grid
          container
          spacing={12}
          direction="row"
          justifyContent="center">
          <Grid item xs={3} justifyContent="center">
            <div className="HeaderText"  >Track Model</div>
          </Grid>
        </Grid>
        <Grid container spacing={1} className="topThreeButtons" direction="row">
          <Grid item xs={4}>
            <Button variant="contained" sx={{ fontSize: 14 }} color="grey" className="LoadTrack">Load new Track Model</Button>
          </Grid>
          <Grid item xs={4}>
          <Grid item>
                <Button variant="contained" sx={{ fontSize: 14 }} color="grey" onClick={this.toggle}> Toggle testUI</Button>
              </Grid>
          </Grid>
          <Grid item xs={4} spacing={1}>
            <Button variant="contained" sx={{ fontSize: 14 }} color="grey" className="RestoreDefaults">Reset to Default Settings</Button>
          </Grid>
        </Grid>

        {/* Need three columns, and in the far right column a grid with two columns */}
        <Grid
          container
          spacing={12}
          direction="row"
          justifyContent="center">

          {/* Column 1 */}
          <Grid item xs={4}>
            {/* within grid want two more columns for label and data flowing in */}
            <Grid
              container
              column spacing={1}>
              <Grid item xs={6}>
                <div className="label">Rail Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 1</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Power</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 2</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Recieved</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 3</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Circuit Sent</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 4</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Switch Position</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 5</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Speed Limit</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 6</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Length</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 7</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Direction of Travel</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 8</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Train Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 9</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Block Occupancy</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 10</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Track Heater Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 11</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Enviornment Temp</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 12</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Persons at Station</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 13</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Beacon Status</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 14</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Railway Crossing</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 15</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label">Elevation</div>
              </Grid>
              <Grid item xs={6}>
                <div className="label"> Data 16</div>
              </Grid>

            </Grid>
          </Grid>

          {/* Column 2 */}
          <Grid item xs={4}>
            <Grid
              container
              spacing={12} >
              <></>

            </Grid>
          </Grid>

          {/* Column 3 */}
          <Grid item xs={4}>
            <Grid
              container
              spacing={1}
              direction="row"
              justifyContent="center">

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 12 }}>Fail Track Power</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Power</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Break Rail</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Rail</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Stop Sending Track Circuit</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Sending Track Circuit</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Stop Recieving Track Circuit</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Recieving Track Cicuit</Button>
              </Grid>


              <Grid item xs={6} className="dumbButton" >
                <TextField
                  id="filled-basic"
                  type="number"
                  multiline
                  fullWidth
                  label="Elevation"
                  variant="filled"
                  size="normal"
                    // defaultValue="Elevation"
                  />
              </Grid>

              {/* <Grid item xs={6} >
                <TextField id="outlined-basic" size="small" color="error" label="Change Elevation" type="number" variant="outlined" sx={{ height: '50%', width: '15ch' }} />
              </Grid> */}

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Elevation</Button>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth="true" size="small">
                  <InputLabel id="switch-position-select-label">Switch Position</InputLabel>
                  <Select
                    sx={{ fontSize: 8 }}
                    variant="filled"
                    id="switch-position-select-label"
                    value={switchPos}
                    label="Switch Position"
                    onChange={handleChange}>
                    <MenuItem value={1}>One</MenuItem>
                    <MenuItem value={2}>Two</MenuItem>
                    <MenuItem value={3}>Three</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Switch</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" color="error" sx={{ fontSize: 14 }}>Stop Beacon</Button>
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" sx={{ fontSize: 14 }}>Reset Beacon</Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    )
  }

};

export default TrackModel;
