import { React, useState } from 'react';
import clsx from 'clsx';
import {
  Typography, AppBar, Button, Toolbar, IconButton, Drawer,
  Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { useTheme } from '@mui/material/styles'
import { makeStyles } from '@mui/styles';
import {
  Rowing, Menu, ChevronLeft, ChevronRight, SportsEsports, ExitToApp,
  Dashboard, AccountBox
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiFetch, getToken, removeToken } from '../helpers';

const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
  rowingIcon: {
    marginRight: '10px'
  },
  titleContent: {
    display: 'flex',
    alignItems: 'center'
  },
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  appBar: {
    color: 'primary',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const Navbar = (props) => {
  const token = getToken()
  const page = props.children
  const navigate = useNavigate()
  const [open, setOpen] = useState(false);
  const classes = useStyles();
  const theme = useTheme();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function handleLogout () {
    apiFetch('POST', 'admin/auth/logout', {})
      .then(() => {
        removeToken()
        return navigate('/login')
      })
  }

  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: open,
        })}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <Menu />
          </IconButton>
          <div className={classes.titleContent}>
            <Rowing className={classes.rowingIcon} />
            {token && <Typography variant='h6'>
              Happy Life
            </Typography>}
            {!token && <Typography variant='h6'>
              Welcome to Happy Life
            </Typography>}
          </div>
          {token && <Button style={{ color: 'white' }} onClick={() => handleLogout()}>Logout</Button>}
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="persistent"
        anchor="left"
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </div>
        <Divider />
        <List>
          <ListItem button onClick={() => navigate('/game/null')}>
            <ListItemIcon> <SportsEsports /></ListItemIcon>
            <ListItemText primary='Join a Quiz Session' />
          </ListItem>
          {!token && <ListItem button onClick={() => navigate('/login')}>
            <ListItemIcon> <ExitToApp /></ListItemIcon>
            <ListItemText primary='Login' />
          </ListItem>}
          {!token && <ListItem button onClick={() => navigate('/signup')}>
            <ListItemIcon> <AccountBox /></ListItemIcon>
            <ListItemText primary='Sign up' />
          </ListItem>}
          {token && <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemIcon> <Dashboard /></ListItemIcon>
            <ListItemText primary='Dashboard' />
          </ListItem>}
        </List>
      </Drawer>
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} />
        {page}
      </main>
    </div>
  )
};

export default Navbar;
