import React, { Fragment } from 'react';
import { Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Link } from '@material-ui/core';

const Menu = React.forwardRef(({ header, url, icon, children }, ref) => (
  <Paper ref={ref}>
    <List>
      <ListItem>
        <ListItemAvatar>
         <Avatar src={icon} />
        </ListItemAvatar>
        <Link href={url} color='inherit'>
          <ListItemText primary={header} />
        </Link>
      </ListItem>
      {children}
    </List>
  </Paper>
));

export const SimpleArrayMenu = React.forwardRef(({ header, url, icon, data }, ref) => (
  <Menu header={header} url={url} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.map((row, i) => (
          <ListItem key={i}>
            <ListItemText primary={row} />
          </ListItem>
        ))}
      </>
    } 
  </Menu>
));

export const ArrayMenu = React.forwardRef(({ header, url, icon, data }, ref) => (
  <Menu header={header} url={url} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.map((row, i) => (
          <ListItem key={i}>
            <ListItemText primary={row.description} secondary={row.title} />
          </ListItem>
        ))}
      </>
    } 
  </Menu>
));

export const ObjectMenu = React.forwardRef(({ header, url, icon, data }, ref) => (
  <Menu header={header} url={url} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {Object.keys(data).map(key => (
          <ListItem key={key}>
            <ListItemText primary={data[key]} secondary={key} />
          </ListItem>
        ))}
      </>
    } 
  </Menu>
));

export const SegmentedMenu = React.forwardRef(({ header, url, icon, data }, ref) => (
  <Menu header={header} url={url} icon={icon} ref={ref}>
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.map(segment => (
          <Fragment key={segment.header}>
            <Divider />
            <ListItem>
              <ListItemText primary={segment.header} />
            </ListItem>
            <Divider />
            {segment.contents.map(content => (
              <ListItem key={content.title}>
                <ListItemText primary={content.title} secondary={content.description} />
              </ListItem>
            ))}
          </Fragment>
        ))}
      </>
    } 
  </Menu>
));