import { Box } from '@mui/material';

interface Props {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: Props) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      {...other}
      sx={{ borderLeft: 1, borderColor: 'divider' }}
    >
      <Box sx={{ px: 3, py: 1, visibility: value === index ? 'visible' : 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
};

export default TabPanel;
