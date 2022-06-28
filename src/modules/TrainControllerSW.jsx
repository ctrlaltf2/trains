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
  Toolbar
} from '@mui/material';

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

    this.toggle = this.toggle.bind(this);
    this.emergencyBrake = this.emergencyBrake.bind(this);
    this.brakeFailure = this.brakeFailure.bind(this);
    this.engineFailure = this.engineFailure.bind(this);
    this.signalPickupFailure = this.signalPickupFailure.bind(this);
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
                Signal Pickup Status: Error
              </Button>
              ) : (
              <Button variant="contained" color="success" onClick={this.signalPickupFailure}>
                Signal Status: Strong
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
