import { Box, Button, Container, CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import AuralTests from './components/AuralTests';
import FileUpload from './components/FileUpload';
import OptionFormFields from './components/OptionFormFields';
import PerformanceRoomForm from './components/PerformanceRoomForm';
import Performances from './components/Performances';
import Students from './components/Students';
import TabBar from './components/TabBar';
import TabContainer from './components/TabContainer';
import TabPanel from './components/TabPanel';
import Toolbar from './components/Toolbar';
import VerticalTabs from './components/VerticalTabs';
import { useAppStore } from './store/useAppStore';
import { theme } from './theme';

function App() {
  const [tab, setTab] = useState(0);
  const generateTestStudents = useAppStore((state) => state.generateTestStudents);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DndProvider backend={HTML5Backend}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <main>
            <Toolbar />
            <Container maxWidth={false} sx={{ px: 10, py: 5 }}>
              <Box display="flex">
                <OptionFormFields />
                <Box display="flex" flexDirection="column">
                  <FileUpload />
                  <Button color="secondary" onClick={generateTestStudents}>
                    Generate Random Students
                  </Button>
                </Box>
              </Box>
              <TabContainer>
                <TabBar />
              </TabContainer>
              <Box display="flex" alignItems="flex-start">
                <VerticalTabs tab={tab} setTab={setTab} />
                <TabPanel value={tab} index={0}>
                  <PerformanceRoomForm />
                </TabPanel>
                <TabPanel value={tab} index={1}>
                  <Students />
                </TabPanel>
                <TabPanel value={tab} index={2}>
                  <Performances />
                </TabPanel>
                <TabPanel value={tab} index={3}>
                  <AuralTests />
                </TabPanel>
              </Box>
            </Container>
          </main>
        </LocalizationProvider>
      </DndProvider>
    </ThemeProvider>
  );
}

export default App;
