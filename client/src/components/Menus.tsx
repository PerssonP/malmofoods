import React, { Fragment } from 'react';
import { Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, Link } from '@mui/material';

type MenuProps = {
  header: string;
  url: string;
  icon: string;
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps & { children: JSX.Element }>(({ header, url, icon, children }, ref) => (
  <Paper ref={ref}>
    <List>
      <ListItem>
        <ListItemAvatar>
          <Avatar src={icon || ''} />
        </ListItemAvatar>
        <Link href={url} color='inherit'>
          <ListItemText primary={header} />
        </Link>
      </ListItem>
      {children}
    </List>
  </Paper>
));
Menu.displayName = 'Menu';

type SimpleArrayData = {
  info: string[];
  error: never;
} | {
  info: never;
  error: string;
} | null;

export const SimpleArrayMenu = React.forwardRef<HTMLDivElement, MenuProps & { data: SimpleArrayData }>(({ header, url, icon, data }, ref) => (
  <Menu
    header={header}
    url={url}
    icon={icon}
    ref={ref}
  >
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.info.map((row, i) => (
          <ListItem key={i}>
            <ListItemText primary={row} />
          </ListItem>
        ))}
      </>
    }
  </Menu>
));
SimpleArrayMenu.displayName = 'SimpleArrayMenu';

type ArrayData = {
  info: {
    title: string;
    description: string;
  }[];
  error: never;
} | {
  info: never;
  error: string;
} | null;

export const ArrayMenu = React.forwardRef<HTMLDivElement, MenuProps & { data: ArrayData }>(({ header, url, icon, data }, ref) => (
  <Menu
    header={header}
    url={url}
    icon={icon}
    ref={ref}
  >
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.info.map((row, i) => (
          <ListItem key={i}>
            <ListItemText primary={row.description} secondary={row.title} />
          </ListItem>
        ))}
      </>
    }
  </Menu>
));
ArrayMenu.displayName = 'ArrayMenu';

type ObjectData = {
  info: {
    [key: string]: string
  };
  error: never;
} | {
  info: never;
  error: string;
} | null;

export const ObjectMenu = React.forwardRef<HTMLDivElement, MenuProps & { data: ObjectData }>(({ header, url, icon, data }, ref) => (
  <Menu
    header={header}
    url={url}
    icon={icon}
    ref={ref}
  >
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {Object.keys(data.info).map(key => (
          <ListItem key={key}>
            <ListItemText primary={data.info[key]} secondary={key} />
          </ListItem>
        ))}
      </>
    }
  </Menu>
));
ObjectMenu.displayName = 'ObjectMenu';

type SegmentedData = {
  info: {
    header: string;
    contents: {
      title: string;
      description: string;
    }[]
  }[];
  error: never;
} | {
  info: never;
  error: string;
} | null;

export const SegmentedMenu = React.forwardRef<HTMLDivElement, MenuProps & { data: SegmentedData }>(({ header, url, icon, data }, ref) => (
  <Menu
    header={header}
    url={url}
    icon={icon}
    ref={ref}
  >
    {data == null || data.error !== undefined ?
      <ListItem>
        {data?.error ?? 'Loading...'}
      </ListItem>
      :
      <>
        {data.info.map(segment => (
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
SegmentedMenu.displayName = 'SegmentedMenu';

export const HyperlinkMenu = React.forwardRef<HTMLDivElement, MenuProps & { href: string }>(({ header, url, icon, href }, ref) => (
  <Menu
    header={header}
    url={url}
    icon={icon}
    ref={ref}
  >
    <ListItem>
      <Link href={href}>
        <ListItemText>
          Oförändrande lunchmeny
        </ListItemText>
      </Link>
    </ListItem>
  </Menu>
));
HyperlinkMenu.displayName = 'HyperlinkMenu';