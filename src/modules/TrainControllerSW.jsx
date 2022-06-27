import{
  styled,
  Box,
  Paper,
  Grid,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Slider
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
        <Grid item xs={6} md={8}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Train Lights" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={6} md={4}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Left Train Doors" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={6} md={4}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Cabin Lights" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={6} md={8}>
          <Item>
            <FormGroup>
              <FormControlLabel control={<Switch defaultChecked />} label="Right Train Doors" />
            </FormGroup>
          </Item>
        </Grid>
        <Grid item xs={6} md={8}>
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
        <Grid item xs={6} md={8}>
          <Item>Power: _ Watts</Item>
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
      </Grid>
    </Box>

  )
};

export default TrainControllerSW;
