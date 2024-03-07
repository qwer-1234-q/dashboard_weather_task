import { Typography, Button, Grid, Container, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { apiFetch, toastError, removeToken } from '../helpers';
import { useNavigate, Link } from 'react-router-dom';
import { checkEmailType, checkPasswordConfirm, checkName } from '../userInfo';
import React from 'react';
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

const SignupPage = (props) => {
  const setAuth = props.setAuth;
  const navigate = useNavigate();
  function handleSubmit (event) {
    event.preventDefault();

    removeToken()

    const username = event.target[0].value;
    const userEmail = event.target[2].value;
    const userPassword = event.target[4].value;
    const passwordConfirm = event.target[6].value;

    // validating it is not empty field
    if (!userEmail || !userPassword || !username || !passwordConfirm) {
      return toastError('please input all the fields')
    }

    if (checkEmailType(userEmail)) {
      if (checkName(username)) {
        if (!checkPasswordConfirm(userPassword, passwordConfirm)) {
          return toastError('please input correct password')
        }
      } else {
        return toastError('please input correct name')
      }
    } else {
    // errorMessage('This email does not correct type!');
      return toastError('please input correct email type')
    }

    const payload = {
      email: userEmail,
      name: username,
      password: userPassword
    };

    apiFetch('POST', 'admin/auth/register', payload)
      .then((data) => {
        setAuth(data.token);
        return navigate('/dashboard');
      })
      .then((response) => {
        console.log('register response.status: ', response.status);
        if (response.status === 200) {
          response.json().then((data) => {
            setAuth(data.token);
            return navigate('/login');
          });
        } else if (response.status === 400 || response.status === 403) {
          // errorMessage("This email already registered. Please input another one.");
          console.log('This email already registered. Please input another one.');
        } else {
          console.log('register page: nothing');
        }
      })
      .catch((err) => {
        console.log('register error: ', err);
      });
  }

  const classes = useStyles();

  return (
    <div className='SignupPage'>
      <Container fixed maxWidth='md' className={classes.container}>
        <Typography className={classes.text} component='h1' variant='h5'>Signup for Happy Life</Typography>
        <form noValidate onSubmit={handleSubmit}>
          <Grid container style={{ marginTop: '24px' }} alignItems='center' direction='column'>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='username'
                label='username'
                name='username'
                type='text'
              />
            </Grid>
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
                autoComplete="current-password"
              />
            </Grid>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='passwordConfirm'
                label='PasswordConfirm'
                name='passwordConfirm'
                type='password'
                autoComplete="current-password"
              />
            </Grid>
            <Link to='/login' style={{ color: '#689c35' }}>Already have an account? Login</Link>
          </Grid>
          <Grid container alignContent='flex-end' direction='column'>
            <Grid item className={ classes.grid }>
              <Button type='submit' variant='contained' color='primary'>Sign up</Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  )
}

SignupPage.propTypes = {
  setAuth: PropTypes.func.isRequired,
};

export default SignupPage;
