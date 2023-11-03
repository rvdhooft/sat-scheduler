import { Box, Typography } from '@mui/material';
import { FileUploader } from 'react-drag-drop-files';
import { read, utils } from 'xlsx';
import { StudentFileModel } from '../models';
import { useAppStore } from '../store/useAppStore';
import { mapFromFileModels } from '../utils/studentMappingUtils';
import { memo } from 'react';

async function mapFileToStudents(file: File) {
  if (!file) return;

  const workbook = read(await file?.arrayBuffer(), { type: 'array' });
  const sheet1 = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheet1];
  const students = utils.sheet_to_json(worksheet) as StudentFileModel[];
  return mapFromFileModels(students);
}

const FileUpload = () => {
  const importStudents = useAppStore((state) => state.importStudents);

  const handleFileChange = async (file: any) => {
    const students = (await mapFileToStudents(file)) || [];
    importStudents(students);
  };

  return (
    <Box
      flex={1}
      mb={2}
      position="relative"
      sx={{
        '& label': {
          height: '100%',
          minHeight: '13rem',
          px: 4,
          pt: 4,
          minWidth: '23rem',
          alignItems: 'start',
        },
        '& label span': {
          mt: 1,
          ml: 0.5,
        },
      }}
    >
      <Typography
        align="center"
        fontSize="0.75rem"
        sx={{
          maxWidth: '508px',
          position: 'absolute',
          color: '#666666',
          bottom: 0,
          left: 0,
          right: 0,
          py: 2,
          px: 4,
          zIndex: 0,
        }}
      >
        Expected Columns:
        <br /> Student First Name, Student Last Name,
        <br /> SAT Level, Scheduling Requests,
        <br /> Siblings Testing on the Same Day
      </Typography>
      <FileUploader handleChange={handleFileChange} name="file" types={['xlsx', 'xls']} />
    </Box>
  );
};

export default memo(FileUpload);
