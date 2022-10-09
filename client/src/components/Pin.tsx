import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Room } from '@mui/icons-material';

const Pin = ({ text, handleClick }) => {


  return (
    <Tooltip title={text}>
      <IconButton
        color='secondary'
        onClick={handleClick}
        size='small'
        sx={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      >
        <Room fontSize='large' />
      </IconButton>
    </Tooltip>
  );
};

export default Pin;