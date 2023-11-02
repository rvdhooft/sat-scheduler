import { Tab, Tabs } from '@mui/material';
import { memo } from 'react';

interface Props {
  tab: number;
  setTab: (tab: number) => void;
}

const VerticalTabs = ({ tab, setTab }: Props) => {
  return (
    <Tabs
      textColor="secondary"
      indicatorColor="secondary"
      orientation="vertical"
      variant="scrollable"
      value={tab}
      onChange={(_event, newValue) => setTab(newValue)}
      sx={{
        minWidth: '11rem',
        maxWidth: '9rem',
        position: 'sticky',
        top: '5rem',
      }}
    >
      <Tab label="Performance Rooms" />
      <Tab label="Students" />
      <Tab label="Performances" />
      <Tab label="Aural Tests" />
    </Tabs>
  );
};

export default memo(VerticalTabs);
