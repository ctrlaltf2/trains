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
  IconButton
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';

import './Timer.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const Input = styled('input')({
  display: 'none',
});

class Timer extends React.Component {
  constructor(props) {
    super(props);

    window.electronAPI.subscribeTimerMessage( (_event, payload) => {
      switch(payload.type) {
        case 'sync':
          this.timestamp = payload.value;
          this.setState({
            current_time: this.formatTime(this.timestamp),
          });
          break;
        case 'time passed':
          this.timestamp += payload.value;
          this.setState({
            current_time: this.formatTime(this.timestamp),
          });
          break;
        default:
          console.warn(`Unknown payload type of ${payload.type}`);
      }
    });

    // ms since midnight
    this.timestamp = 8 * 60 * 60 * 1000; // 08:00

    this.state = {
      current_time: this.formatTime(this.timestamp),
      isPaused: false,
      isFastForward: false,
    };
  }

  formatTime(n_ms_midnight) {
    // TODO
    return '08:00';
  }

  render() {
    const { isPaused, isFastForward, current_time } = this.state;

    return (
      <ThemeProvider theme={darkTheme}>
        <div id="main">
          <Typography variant="h4">Current Time:</Typography>
          <Typography variant="h3">{this.formatTime(current_time)}</Typography>
          <div id="timer-button-group">
            {
              isPaused ?
                <IconButton color="default" aria-label="pause" component="span" size="large"
                  onClick={() => { this.setState({isPaused: false}) }}
                >
                  <PlayArrowIcon/>
                </IconButton>
              :
                <IconButton color="default" aria-label="pause" component="span" size="large"
                  onClick={() => { this.setState({isPaused: true}) }}
                >
                  <PauseIcon/>
                </IconButton>
            }
            {
              isFastForward ?
                <IconButton color="default" aria-label="pause" component="span" color="primary" size="large"
                  onClick={() => { this.setState({isFastForward: false}) }}
                >
                  <FastForwardIcon/>
                </IconButton>
              :
                <IconButton color="default" aria-label="pause" component="span" size="large"
                  onClick={() => { this.setState({isFastForward: true}) }}
                >
                  <FastForwardIcon/>
                </IconButton>

            }
          </div>
        </div>
      </ThemeProvider>
    );
  }
};

export default Timer;
