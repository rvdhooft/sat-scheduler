import { Box } from '@mui/material';
import { Dispatch } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { read, utils } from 'xlsx';
import { Student } from '../models';

async function mapFileToStudents(file: File) {
  if (!file) return;

  const workbook = read(await file?.arrayBuffer(), { type: 'array' });
  const sheet1 = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheet1];
  return utils.sheet_to_json(worksheet) as Student[];
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
    <Box sx={{ '& label': { height: '100%', px: 4 } }}>
      <FileUploader handleChange={handleFileChange} name="file" types={['xlsx', 'xls']} />
    </Box>
  );
};

export default FileUpload;
