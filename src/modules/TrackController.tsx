import * as React from 'react';
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
  // Typography,
  // List,
  // ListItem,
  // ListItemText
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
} from '@mui/material';

import './TrackController.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const TrackController = () => {
  return (
    // <div className="wrapper">
    <div>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={12}>
            <Grid item xs={3}>
              <div className="left">
                <FormControl fullWidth>
                  <InputLabel id="select-Block">Block</InputLabel>
                  <Select
                    labelId="select-Block"
                    id="select-Block"
                    // value=0
                    label="Blocks"
                    // onChange={handleChange}
                  >
                    <MenuItem value={10}>1</MenuItem>
                    <MenuItem value={20}>2</MenuItem>
                    <MenuItem value={30}>3 </MenuItem>
                  </Select>
                </FormControl>
              </div>
            </Grid>
            <Grid item xs={6}>
              <div className="text-centered">Track Controller</div>
            </Grid>
            <Grid item xs={3}>
              <div className="text-centered">Track Line:__</div>
            </Grid>
          </Grid>

          <Grid container spacing={12}>
            <Grid item xs={4}>
              <div className="left">
                <Chip
                  label="Switch Position 3"
                  color="success"
                  variant="outlined"
                />
              </div>
            </Grid>
            <Grid item xs="auto">
              <div className="centered">
                <Chip
                  label="Maintenence Mode Activated"
                  color="success"
                  variant="outlined"
                />
              </div>
            </Grid>
            <Grid item xs>
              <div className="right">
                <Chip label="Light" color="success" variant="outlined" />
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
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Suggested Velocity</TableCell>
                      <TableCell align="right">mph</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Authority</TableCell>
                      <TableCell align="right">miles</TableCell>
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
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Gates</TableCell>
                      <TableCell align="right">status</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Crossing Lights</TableCell>
                      <TableCell align="right">status</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell component="th">Track Occupency</TableCell>
                      <TableCell align="right">status</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell component="th">Direction</TableCell>
                      <TableCell align="right">bool</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs="auto">
              <TableContainer>
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
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Rail</TableCell>
                      <TableCell align="right">OK</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Light</TableCell>
                      <TableCell align="right">OK</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Engine</TableCell>
                      <TableCell align="right">OK</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Signal</TableCell>
                      <TableCell align="right">OK</TableCell>
                    </TableRow>
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th">Brake</TableCell>
                      <TableCell align="right">OK</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs>
              <div className="centered">
                <Button variant="contained">Load plc</Button>
              </div>
            </Grid>
          </Grid>
        </Box>
      </ThemeProvider>
    </div>
  );
};

export default TrackController;
