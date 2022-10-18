import { Box } from '@mui/material';
import { Dispatch } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { read, utils } from 'xlsx';
import { Student, StudentFileModel } from '../models';
import { mapFromFileModels } from '../utils/studentMappingUtils';

async function mapFileToStudents(file: File) {
  if (!file) return;

  const workbook = read(await file?.arrayBuffer(), { type: 'array' });
  const sheet1 = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheet1];
  const students = utils.sheet_to_json(worksheet) as StudentFileModel[];
  return mapFromFileModels(students);
}

interface Props {
  setStudents: Dispatch<Student[]>;
}

const FileUpload = ({ setStudents }: Props) => {
  const handleFileChange = async (file: any) => {
    const students = (await mapFileToStudents(file)) || [];
    setStudents(students);
  };

  return (
    <Box flex={1} mb={2} sx={{ '& label': { height: '100%', px: 4, minWidth: '23rem' } }}>
      <FileUploader handleChange={handleFileChange} name="file" types={['xlsx', 'xls']} />
    </Box>
  );
};

export default FileUpload;
