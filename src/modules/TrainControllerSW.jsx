import React, { useState } from 'react';
import {
  styled,
  Box,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Slider,
  Stack,
  AppBar,
  Typography,
  Toolbar,
  TextField,
} from '@mui/material';
import { type } from 'os';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));
function preventHorizontalKeyboardNavigation(event) {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
  }
}
// max train speed: 70 km/h ~= 43 MPH
// service brake deceleration 1.2m/s^2
// emergency brake deceleration 2.73 m/s^2
class TrainControllerSW extends React.Component {
  constructor(props, name) {
    super(props);
    this.name = name;

    this.state = {
      testMode: false,
      emergencyButton: false,
      brakeFailureDisplay: false,
      engineFailureDisplay: false,
      signalPickupFailureDisplay: false,
    };

    // Initializing all needed variables to 0 or empty
    this.speed = 0;
    this.commandedSpeed = 0;
    this.authority = 0;
    this.power = 0;
    this.stationName = "";

    this.toggle = this.toggle.bind(this);
    this.emergencyBrake = this.emergencyBrake.bind(this);
    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.signalPickupFailure = this.signalPickupFailure.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);
    this.handleCommandedSpeedChange = this.handleCommandedSpeedChange.bind(this);
    this.handleAuthorityChange = this.handleAuthorityChange.bind(this);
    this.handleSpeedSubmit = this.handleSpeedSubmit.bind(this);
    this.handleCommandedSpeedSubmit = this.handleCommandedSpeedSubmit.bind(this);
    this.handleAuthoritySubmit = this.handleAuthoritySubmit.bind(this);
  };

  handleSpeedChange(event) {
    this.setState({speed: event.target.value});
  }

  handleCommandedSpeedChange(event) {
    this.setState({commandedSpeed: event.target.value});
  }

  handleAuthorityChange(event) {
    this.setState({authority: event.target.value});
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

  toggle() { // Toggles between regular UI and Test UI
    this.setState((prevState) => ({
      testMode: !prevState.testMode,
    }));
  }

  emergencyBrake(){ // Toggles the emergency brake in the Test UI
    this.setState((prevState) => ({
      emergencyButton: !prevState.emergencyButton,
    }));
  }

  brakeFailure(){ // Toggles the break failure display in the Test UI
    this.setState((prevState) => ({
      brakeFailureDisplay: !prevState.brakeFailureDisplay,
    }));
  }

  engineFailure(){ // Toggles the engine failure display in the Test UI
    this.setState((prevState) => ({
      engineFailureDisplay: !prevState.engineFailureDisplay,
    }));
  }

  signalPickupFailure(){ // Toggles the signal pickup failure display in the Test UI
    this.setState((prevState) => ({
      signalPickupFailureDisplay: !prevState.signalPickupFailureDisplay,
    }));
  }

  testUI() {

    return (

      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar variant="dense">
              <Typography variant="h6" color="white" component="div">
                Train Controller Test UI
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={3} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Left Train Doors"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={4}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Right Train Doors"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={4}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Cabin Lights"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Train Lights"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={5} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Automatic/Manual Mode"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={6} md={8}>
            <Item>
              {this.state.emergencyButton ? (
              <Button variant="contained" color="error" onClick={this.emergencyBrake}>
                Emergency Brake Activated
              </Button>
              ) : (
              <Button variant="outlined" color="error" onClick={this.emergencyBrake}>
                Emergency Brake Deactivated
              </Button>
              )}
            </Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Box
                component="form"
                sx={{
                  '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
              >
                <TextField id="outlined-basic" label="Power" type="number" variant="outlined" />
              </Box>
          </Grid>
          <Grid item xs={6} md={8}>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField id="outlined-basic" label="Cabin Temperature" type="number" variant="outlined" />
            </Box>
          </Grid>
          <Grid item xs={4} md={2}>
            <form onSubmit={this.handleSpeedSubmit}>
              <label>
                Speed:
                <input type="number" value={this.state.speed} onChange={this.handleSpeedChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={4} md={2}>
            <form onSubmit={this.handleCommandedSpeedSubmit}>
              <label>
                Commanded Speed:
                <input type="number" value={this.state.commandedSpeed} onChange={this.handleCommandedSpeedChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
              {/* <Box
                  component="form"
                  sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                  }}
                  noValidate
                  autoComplete="off"
                >
                  <TextField
                    id="outlined-basic"
                    label="Commanded Speed"
                    type="number"
                    variant="outlined"
                  />
              </Box> */}
          </Grid>
          <Grid item xs={4} md={2}>
            <form onSubmit={this.handleAuthoritySubmit}>
              <label>
                Authority:
                <input type="number" value={this.state.authority} onChange={this.handleAuthorityChange} />
              </label>
                <input type="submit" value="Submit" />
            </form>
          </Grid>
          <Grid item xs={5} md={2}>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField id="outlined-basic" label="Next Stop" variant="outlined" />
            </Box>
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
            {this.state.brakeFailureDisplay ? (
              <Button variant="contained" color="error" onClick={this.brakeFailure}>
                Brake Status: Failing
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.brakeFailure}>
                Brake Status: Working
              </Button>
              )}
            {this.state.engineFailureDisplay ? (
              <Button variant="contained" color="error" onClick={this.engineFailure}>
                Engine Status: Failing
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.engineFailure}>
                Engine Status: Working
              </Button>
              )}
            {this.state.signalPickupFailureDisplay ? (
              <Button variant="contained" color="error" onClick={this.signalPickupFailure}>
                Signal Pickup Status: Broken
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.signalPickupFailure}>
                Signal Pickup Status: Connected
              </Button>
              )}
          </Stack>
          <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={this.toggle}>
              Toggle Test UI
            </Button>
          </Stack>
        </Grid>
      </Box>
    );
  }

  render() {
    if (this.state.testMode) return this.testUI();

    return (
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar variant="dense">
              <Typography variant="h6" color="inherit" component="div">
                Train Controller UI
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={3} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Left Train Doors"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={4}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Right Train Doors"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={4}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Cabin Lights"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={3} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Train Lights"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={5} md={8}>
            <Item>
              <FormGroup>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Automatic/Manual Mode"
                />
              </FormGroup>
            </Item>
          </Grid>
          <Grid item xs={6} md={8}>
            <Item>
              <Button variant="outlined" color="error">
                Emergency Brake
              </Button>
            </Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Power: _ Watts</Item>
          </Grid>
          <Grid item xs={6} md={8}>
            <Item>Cabin Temperature</Item>
          </Grid>
          <Box sx={{ height: 300 }}>
            <Slider
              sx={{
                '& input[type="range"]': {
                  WebkitAppearance: 'slider-vertical',
                },
              }}
              orientation="vertical"
              defaultValue={30}
              aria-label="Temperature"
              valueLabelDisplay="auto"
              onKeyDown={preventHorizontalKeyboardNavigation}
            />
          </Box>
          <Box sx={{ height: 300 }}>
            <Slider
              sx={{
                '& input[type="range"]': {
                  WebkitAppearance: 'slider-vertical',
                },
              }}
              orientation="vertical"
              defaultValue={30}
              aria-label="Temperature"
              valueLabelDisplay="auto"
              onKeyDown={preventHorizontalKeyboardNavigation}
            />
          </Box>
          <Grid item xs={4} md={2}>
            <Item>SPEED: _ MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Commanded Speed: _ MPH</Item>
          </Grid>
          <Grid item xs={4} md={2}>
            <Item>Authority: _ Miles</Item>
          </Grid>
          <Grid item xs={5} md={2}>
            <Item>Next Stop: _</Item>
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.5}>
            <Item>Engine Failure</Item>
            <Item>Brake Failure</Item>
            <Item>Signal Pickup Failure</Item>
          </Stack>
          <Stack spacing={2} direction="row">
            <Button variant="contained" onClick={this.toggle}>
              Toggle Test UI
            </Button>
          </Stack>
        </Grid>
      </Box>
    );
  }
}

export default TrainControllerSW;
