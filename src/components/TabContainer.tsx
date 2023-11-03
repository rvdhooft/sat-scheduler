import { Box, styled } from '@mui/material';

const TabContainer = styled(Box)({
  position: 'sticky',
  top: 0,
  backgroundColor: 'white',
  borderBottom: `1px solid #e1e1e1`,
  marginTop: 4,
  marginBottom: 4,
  marginLeft: -24,
  marginRight: -24,
  paddingTop: 4,
  paddingLeft: 24,
  paddingRight: 24,
  zIndex: 1,
});

export default TabContainer;
