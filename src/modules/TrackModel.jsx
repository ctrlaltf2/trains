import { Module } from "module"
import './TrackModel.css';
import
{
  Button,
  Container,
  Grid,
  TextField
} from '@mui/material/';
import { blue, grey } from "@mui/material/colors";
import { Box } from "@mui/system";

const TrackModel = () => {
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
      <Grid container spacing={1} direction="row">
        <Grid item xs={4}>
          <Button className="LoadTrack">Load new Track Model</Button>
        </Grid>
        <Grid item xs={4}>
          <></>
        </Grid>
        <Grid item xs={4}>
          <Button className="RestoreDefaults">Reset to Default Settings</Button>
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
          <Grid
            container
            spacing={12}>
          <></>
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
            <Button>Fail Track Power</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Reset Power</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Break Rail</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Reset Rail</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Stop Sending Track Circuit</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Reset Sending Track Circuit</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Stop Recieveing Track Cicuit</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Reset Recieveing Track Cicuit</Button>
          </Grid>


          <Grid item xs={6}>
            <Button>Change Elevation</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Reset Elevation</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Stop Beacon</Button>
          </Grid>

          <Grid item xs={6}>
            <Button>Reset Beacon</Button>
          </Grid>
          </Grid>
        </Grid>
      </Grid>
        {/* Resets for all the buttons */}

        {/*


        <Button>Reset Elevation</Button>
        <Button>Reset Switch Position</Button>
        <Button>Reset Beacon</Button> */}


    </Container>
  )
};

export default TrackModel;
