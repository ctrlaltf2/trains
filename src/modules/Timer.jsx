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
    this.timestamp = 8 * 60 * 60 * 1000 + 1000; // 08:00

    this.state = {
      current_time: this.formatTime(this.timestamp),
      isPaused: true,
      isFastForward: false,
    };
  }

  formatTime(n_ms_midnight) {
    const d = new Date(2000, 0, 1, 0, 0, 0, n_ms_midnight)

    const HH = d.getHours().toString().padStart(2, '0');
    const MM = d.getMinutes().toString().padStart(2, '0');
    const SS = d.getSeconds().toString().padStart(2, '0');

    return `${HH}:${MM}:${SS}`;
  }

  handleFastForwardPress() {
    const { isFastForward } = this.state;
    const newFastForwardState = !isFastForward;

    this.setState({
      isFastForward: newFastForwardState,
    });

    window.electronAPI.sendTimeFastForward(newFastForwardState);
  }

  handlePausePlayPress() {
    const { isPaused } = this.state;
    const newPauseState = !isPaused;

    this.setState({
      isPaused: newPauseState,
    });

    window.electronAPI.sendTimePause(newPauseState);
  }

  render() {
    const { isPaused, isFastForward, current_time } = this.state;

    return (
      <ThemeProvider theme={darkTheme}>
        <div id="main">
          <Typography variant="h4">Current Time:</Typography>
          <Typography variant="h3">{current_time}</Typography>
          <div id="timer-button-group">
            <IconButton color="default" aria-label="pause" component="span" size="large"
              onClick={() => { this.handlePausePlayPress()}}
            >
              {
                isPaused ?
                  <PlayArrowIcon/>
                :
                  <PauseIcon/>
              }
            </IconButton>
            <IconButton
              color="default"
              aria-label="pause"
              component="span"
              color={isFastForward ? "primary" : "default"}
              size="large"
              onClick={() => { this.handleFastForwardPress() }}
            >
              <FastForwardIcon/>
            </IconButton>
          </div>
        </div>
      </ThemeProvider>
    );
  }
};

export default Timer;
