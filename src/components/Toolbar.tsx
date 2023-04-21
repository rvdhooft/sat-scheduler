import { AppBar, Toolbar as MuiToolbar, Typography } from '@mui/material';

const Toolbar = () => {
  return (
    <AppBar position="static">
      <MuiToolbar>
        <Typography variant="h6" component="h1">
          SAT Scheduler
        </Typography>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;
