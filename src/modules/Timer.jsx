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
} from '@mui/material';
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

    this.state = {};
  }

  render() {
    return (
      <div id="main">
        <p>00:00</p>
        <div id="timer-button-group">
          Buttons
        </div>
      </div>
    );
  }
};

export default Timer;
