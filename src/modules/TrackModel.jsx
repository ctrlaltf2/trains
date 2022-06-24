import { Module } from "module"
import './TrackModel.css';
import
{
  Button,
  Container,
  TextField
} from '@mui/material/';
import { blue, grey } from "@mui/material/colors";
import { Box } from "@mui/system";

const TrackModel = () => {
  return (
    <Container maxWidth="lg">

      <div className="Center">
      <p1>Track Controller UI</p1>
      </div>

      <Box className="TopBox"
      sx={{width: 1000, height: 150, backgroundColor:'rgb(225,225,225)', border: '5px dotted black', justifySelf: "center"}}
      >
      <Button className ="LoadTrack">Load Track</Button>
      <Button className = "RestoreDefaults">Restore to Default Settings</Button>
      </Box>

        </Container>
  )
};

export default TrackModel;
