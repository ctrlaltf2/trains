import { type } from 'os';
import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import {ButtonGroup,
        Button,
        Label,
        FormLabel,
        Typography,
        FormGroup,
        FormControlLabel,
        Switch,
        Stack,
        AppBar,
        Toolbar,
        TextField,
        } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.secondary,
}));


const BoxLabel = styled(FormLabel)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.subtitle1,
  padding: theme.spacing(1),
  textAlign: 'left',
  color: theme.palette.text.primary,
}));


class TrainModel extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      breakTrainEngine: false,
      resetTrainEngine: false,
      breakBrake: false,
      resetBrake: false,
      breakSignalPickup: false,
      resetSignalPickup: false,
      resetAll: false,
      testSystem: false,
      /* trainSpeed: 0,
      enginePower: 0,
      trainAcceleration: 0, */
      // emergencyBrake: false,

      /* beacon: true,
      accelerationLimit: 0,
      decelerationLimit: 0,
      speedLimit: 0,
      internalTemp: 70,
      crewCount: 0,
      passengerCount: 0,
      exteriorTrainLights: false,
      interiorTrainLights: true,
      rightDoors: false,
      leftDoors: false,
      length: 0,
      height: 0,
      width: 0,
      mass: 0, */

    };


    // Toggling buttons
    this.toggle = this.toggle.bind(this);
    this.toggleBreakBrake = this.toggleBreakBrake.bind(this);
    this.toggleBreakSignalPickup = this.toggleBreakSignalPickup.bind(this);
    this.toggleBreakTrainEngine = this.toggleBreakTrainEngine.bind(this);
    this.toggleResetAll = this.toggleResetAll.bind(this);
    this.toggleResetBrake = this.toggleResetBrake.bind(this);
    this.toggleResetSignalPickup = this.toggleResetSignalPickup.bind(this);
    this.toggleResetTrainEngine = this.toggleResetTrainEngine.bind(this);


    // Handling Changes
    // this.handleSpeedChange = this.handleSpeedChange.bind(this);
    /* this.handleCommandedSpeedChange = this.handleCommandedSpeedChange.bind(this);
    this.handleAuthorityChange = this.handleAuthorityChange.bind(this);
    this.handleTemperatureChange = this.handleTemperatureChange.bind(this);
    this.handlePowerChange = this.handlePowerChange.bind(this);

    // Hanlding Submits
    this.handleSpeedSubmit = this.handleSpeedSubmit.bind(this);
    this.handleCommandedSpeedSubmit = this.handleCommandedSpeedSubmit.bind(this);
    this.handleAuthoritySubmit = this.handleAuthoritySubmit.bind(this);
    this.handleTemperatureSubmit = this.handleTemperatureSubmit.bind(this);
    this.handlePowerSubmit = this.handlePowerSubmit.bind(this); */
  };

  /*
  handleSpeedChange(event) {
    this.setState({trainSpeed: event.target.value});
  }

  handleAuthorityChange(event) {
    this.setState({authority: event.target.value});
  }

  handleTemperatureChange(event) {
    this.setState({cabinTemperature: event.target.value});
  }

  handlePowerChange(event) {
    this.setState({power: event.target.value});
  }

  handleSpeedSubmit(event) {
    alert('Speed is set: ' + this.state.speed + ' MPH');
    event.preventDefault();
  }

  handleCommandedSpeedSubmit(event) {
    alert('Commanded Speed is set: ' + this.state.commandedSpeed + ' MPH');
    event.preventDefault();
  }

  handleAuthoritySubmit(event) {
    alert('Authority is set: ' + this.state.authority + ' Miles');
    event.preventDefault();
  }

  handleTemperatureSubmit(event) {
    alert('Temperature is set: ' + this.state.cabinTemperature + ' degrees F');
    event.preventDefault();
  }

  handlePowerSubmit(event) {
    alert('Power is set: ' + this.state.power + ' Watts');
    event.preventDefault();
  } */

  toggleBreakTrainEngine(){
    this.setState((prevState) => ({
      breakTrainEngine: !prevState.breakTrainEngine,
    }));
  }

  toggleResetTrainEngine(){
    this.setState((prevState) => ({
      resetTrainEngine: !prevState.resetTrainEngine,
    }));
  }

  toggleBreakBrake(){
    this.setState((prevState) => ({
      breakBrake: !prevState.breakBrake,
    }));
  }

  toggleResetBrake(){
    this.setState((prevState) => ({
      resetBrake: !prevState.resetBrake,
    }));
  }

  toggleBreakSignalPickup(){
    this.setState((prevState) => ({
      breakSignalPickup: !prevState.breakSignalPickup,
    }));
  }

  toggleResetSignalPickup(){
    this.setState((prevState) => ({
      resetSignalPickup: !prevState.resetSignalPickup,
    }));
  }

  toggleResetAll(){
    this.setState((prevState) => ({
      resetAll: !prevState.resetAll,
    }));
  }

  toggle() {
    this.setState((prevState) => ({
      testSystem: !prevState.testSystem,
    }));
  }


  testUI() { return (

    <Grid container spacing={ 2 }>

        <Grid item xs={3}>
          <TextField id="standard-basic" label="Set Acceleration" variant="standard" size="small"/>
        </Grid>
        <Grid item xs={3}sx={{mt:6}}>
          <Item sx={{ mx: 1, mt: 3  }}>mi/hr/hr</Item>
        </Grid>


        <Grid item xs={3}>
          <TextField id="standard-basic" label="Set Mass" variant="standard" size="small"/>
        </Grid>
        <Grid item xs={3}sx={{mt:6}}>
          <Item sx={{ mx: 1, mt: 3  }}>tons</Item>
        </Grid>


        <Grid item xs={3}>
          <TextField id="standard-basic" label="Set Velocity" variant="standard" size="small"/>
        </Grid>
        <Grid item xs={3}sx={{mt:6}}>
          <Item sx={{ mx: 1, mt: 3 }}>mph</Item>
        </Grid>


        <Grid item xs={3}>
          <TextField id="standard-basic" label="Set Maximum Power" variant="standard" size="small"/>
        </Grid>
        <Grid item xs={3}sx={{mt:6}}>
          <Item sx={{ mx: 1, mt: 3  }}>W</Item>
        </Grid>


        <Grid item xs={3}>
          <TextField id="standard-basic" label="Set Sample Period" variant="standard" size="small"/>
        </Grid>
        <Grid item xs={3}sx={{mt:6}}>
          <Item sx={{ mx: 1, mt: 3  }}>s</Item>
        </Grid>

        <Grid button xs={6} sx={{mt:6}}>
          <Button variant="contained" onClick={this.toggle}>
            Train Model
          </Button>
        </Grid>
      </Grid>
  );
}


  render() {

    if(this.state.testSystem) return this.testUI();

    return (

    <Grid container spacing={ 2 }>

      <Grid item2 xs={12}>
        <BoxLabel sx={{ mx: 2, my: 0 }}>Train Information</BoxLabel>
      </Grid>

      <Grid item xs={12} container sx={{border: 1, mx: 3, p: 2}}>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Train Speed = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Engine Power = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Train Acceleration = </Item>
        </Grid>

        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Emergency Brake = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Emergency Brake Failure = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Engine Failure = </Item>
        </Grid>

        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Service Brake Failure = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Signal Pickup Failure = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Beacon = </Item>
        </Grid>

        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Acceleration Limit = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Deceleration Limit = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Speed Limit = </Item>
        </Grid>
      </Grid>


      <Grid item2 xs={12}>
        <BoxLabel sx={{ mx: 2, my: 0 }}>Other Information</BoxLabel>
      </Grid>

      <Grid item xs={12} container sx={{border: 1, mx: 3, p: 2}}>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Internal Temperature = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Crew Count = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Passenger Count = </Item>
        </Grid>

        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Exterior Train Lights = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Interior Train Lights = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Right Train Doors = </Item>
        </Grid>

        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Right Train Doors = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Train Length = </Item>
        </Grid>
        <Grid item xs={4}>
          <Item sx={{ m: 2 }}>Train Height = </Item>
        </Grid>

        <Grid item xs={6}>
          <Item sx={{ m: 2 }}>Train Width = </Item>
        </Grid>
        <Grid item xs={6}>
          <Item sx={{ m: 2 }}>Train Mass = </Item>
        </Grid>
      </Grid>


      <Grid item2 xs={12}>
        <BoxLabel sx={{ mx: 2, my: 0 }}>System Status</BoxLabel>
      </Grid>

      <Grid item xs={12} container sx={{border: 1, mx: 3, p: 2}}>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="error" onClick={this.toggleBreakTrainEngine}>
              Break Train Engine
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="inherit" onClick={this.toggleResetTrainEngine}>
              Reset Train Engine
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="error" onClick={this.toggleBreakBrake}>
              Break Brake
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="inherit" onClick={this.toggleResetBrake}>
              Reset Brake
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="error" onClick={this.toggleBreakSignalPickup}>
              Break Signal Pickup
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="inherit" onClick={this.toggleResetSignalPickup}>
              Reset Signal Pickup
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold' }} variant="contained" color="success" onClick={this.toggleResetAll}>
              Reset All
            </Button>
          </Item>
        </Grid>
        <Grid item xs={3}>
          <Item sx={{ margin: 1}}>
            <Button sx={{ fontSize: 14, fontWeight: 'bold', margin: 0 }} variant="contained" color="primary" onClick={this.toggle}>
              Test System
            </Button>
          </Item>
        </Grid>
      </Grid>


    </Grid>


    )
  };
}

export default TrainModel;
