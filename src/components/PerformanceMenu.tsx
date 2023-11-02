import { IconButton, Menu, MenuItem } from '@mui/material';
import { memo, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Props {
  alternateRooms: string[];
  moveRooms: (roomId: string) => void;
}

const PerformanceMenu = ({ alternateRooms, moveRooms }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMove = (room: string) => {
    handleClose();
    moveRooms(room);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
        {alternateRooms.map((room) => (
          <MenuItem key={room} onClick={() => handleMove(room)}>
            Move to Room {room}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default memo(PerformanceMenu);
