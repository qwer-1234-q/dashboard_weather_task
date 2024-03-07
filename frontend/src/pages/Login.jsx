import { Typography, Button, Grid, Container, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { apiFetch, removeToken, toastError } from '../helpers';
import { useNavigate, Link } from 'react-router-dom';
import { React, useEffect } from 'react';
import PropTypes from 'prop-types';

const useStyles = makeStyles(() => ({
  text: {
    marginTop: '100px'
  },
  grid: {
    padding: '10px'
  },
  container: {
    marginBottom: '96px',
    marginTop: '48px'
  }
}));

const Login = (props) => {
  const setAuth = props.setAuth;
  const navigate = useNavigate();

  useEffect(() => {
    removeToken()
  }, [])

  function handleSubmit (event) {
    event.preventDefault();

    const userEmail = event.target[0].value;
    const userPassword = event.target[2].value;

    // validating it is not empty field
    if (!userEmail || !userPassword) {
      return toastError('please input all the fields');
    }

    const payload = {
      email: userEmail,
      password: userPassword,
    };

    apiFetch('POST', 'admin/auth/login', payload)
      .then((data) => {
        setAuth(data.token);
        return navigate('/dashboard');
      })
      .catch((err) => {
        console.log('login error: ', err);
      });
  }

  const classes = useStyles();

  return (
    <div className='LoginPage'>
      <Container fixed maxWidth='md' className={classes.container}>
        <Typography className={classes.text} component='h1' variant='h5'>Login for Happy Life</Typography>
        <form noValidate onSubmit={handleSubmit}>
          <Grid container style={{ marginTop: '24px' }} alignItems='center' direction='column'>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='email'
                label='Email'
                name='email'
                type='text'
              />
            </Grid>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='password'
                label='Password'
                name='password'
                type='password'
              />
            </Grid>
            <Link to='/signup' style={{ color: '#689c35' }}>Do not have an account? Register</Link>
          </Grid>
          <Grid container alignContent='flex-end' direction='column'>
            <Grid item className={classes.grid}>
              <Button type='submit' variant='contained' color='primary'>Login</Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  )
}

Login.propTypes = {
  setAuth: PropTypes.func.isRequired,
};

export default Login;
