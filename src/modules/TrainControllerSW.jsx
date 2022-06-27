import{
  styled,
  Box,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Slider,
  Stack
} from "@mui/material";

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

const TrainControllerSW = () => {
  return (
<Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={4}>
        <Grid item xs={3} md={8}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Left Train Doors" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={3} md={4}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Right Train Doors" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={3} md={4}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Cabin Lights" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={3} md={8}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Train Lights" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={5} md={8}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Automatic/Manual Mode" />
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
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={0}
        >
          <Item>Engine Failure</Item>
          <Item>Brake Failure</Item>
          <Item>Signal Pickup Failure</Item>
      </Stack>
      </Grid>
    </Box>

  )
};

export default TrainControllerSW;
