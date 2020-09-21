import React from 'react';
import { makeStyles, IconButton, Tooltip } from '@material-ui/core';
import { Room } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  pin: {  // Keeps the pin in place on the map when zooming. Don't ask me why/how.
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  }
}));

const Pin = ({ text, handleClick }) => {
  const classes = useStyles();

  return (
    <Tooltip title={text}>
      <IconButton
        color='secondary'
        onClick={handleClick}
        className={classes.pin}
        size='small'
      >
        <Room fontSize='large' />
      </IconButton>
    </Tooltip>
  );
};

export default Pin;