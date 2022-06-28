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
              <Button label = "label" labelStyle={{fontSize: 8}}>h</Button>
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

// Class for Track Model
class TrackModel
{
  constructor();

  //function to return UI
  trackModelUI()
  {
    return ();
  }

}

//Class for Block

export default TrackModel;
