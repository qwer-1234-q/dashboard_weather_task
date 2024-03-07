import axios from 'axios';
import { toastError } from '../helpers';
import { makeStyles } from '@mui/styles';
import { React, useEffect, useState } from 'react';
import {
    Button, TextField, Grid, Container, Typography,
} from '@mui/material';

const useStyles = makeStyles(() => ({
  page: {
    marginBottom: '96px',
    padding: '24px'
  },
}));

// api key for weather
const api_key_weather = "66cf839c72a9a6826f72c624c510d53f";

// api key for ipinfo
const api_key_ipinfo = "bc48a998282274";

const Weather = () => {
  const classes = useStyles();
  const [weatherData, setWeatherData] = useState(null);
  const [city, setCity] = useState('Sydney');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canGetCurrentLocation, setCanGetCurrentLocation] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isSearchCity, setIsSearchCity] = useState(false);
//   const weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key_weather}&units=metric`;

  const refreshPage = () => {
    setRefresh(!refresh)
  }

  const fetchWeather = async (city) => {
    const weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key_weather}&units=metric`;
    setIsLoading(true);
    try {
      const response = await axios.get(weather_url);
      setWeatherData(response.data);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    //   toastError('Error: cannot fetch the weather');
    } finally {
       setIsLoading(false);
    }
  }

  const handleChangeCityWeather = (event) => {
    event.preventDefault();

    const tmpCity = event.target[0].value;
    console.log('input a city:', tmpCity);
    // validating it is not empty field
    if (!tmpCity) {
      return toastError('please input the city')
    }
    setCity(tmpCity);
    fetchWeather(tmpCity);
    setIsSearchCity(true);
    refreshPage();
  }

  const handleCurrentCityWeather = (event) => {
    event.preventDefault();
    fetchWeatherByIP();
  }

  // fetaching the IP in order to get the city data
  const fetchWeatherByIP = async () => {
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const ip = ipResponse.data.ip;
      console.log("current ip is", ip);
      const locResponse = await axios.get('http://ip-api.com/json/');
      const tmpCity = locResponse.data.city;
      console.log(locResponse);
      setCity(tmpCity);
      setCurrentLocation(tmpCity);
      fetchWeather(tmpCity);
      setCanGetCurrentLocation(true);
      refreshPage();
    } catch (error) {
      console.error("Error: cannot access the current location");
      setCanGetCurrentLocation(false);
      setCurrentLocation(null);
    //   toastError("Error: cannot get your current IP. You can enter a city name to search");
    }
  };
  
  useEffect(() => {
    // fetchWeather(city);
    if (isSearchCity) {
       fetchWeather(city);
    } else {
       fetchWeatherByIP();
    }
    refreshPage();
    // set a timing, update the weather every 1 minutes
    const intervalId = setInterval(fetchWeather, 60000); // 60000 millisecond == 1 minutes
    
    // clear the timing, avoid running after uninstalling.
    return () => clearInterval(intervalId);
   }, [city]);

return (
    <div className={classes.page}>
    <Container fixed maxWidth='md' className={classes.container}>
      <form noValidate onSubmit={handleChangeCityWeather}>
        {!(canGetCurrentLocation) || currentLocation !== null ?
          <Typography className={classes.text} component='h1' variant='h5'> Current City is {currentLocation} </Typography>
          : (
            <Typography className={classes.text} component='h1' variant='h5'> 
              We're so sorry because we cannot get your current location...
            </Typography>
          )
       }    
      <Grid container style={{ marginTop: '24px' }} alignItems='center' direction='column'>
        <Grid item className={classes.grid}>
          <TextField
            variant='outlined'
            id='city'
            label='Input a city if you want to search'
            name='city'
            type='text'
          />
        </Grid>
        </Grid>
        <Grid container alignContent='flex-end' direction='column'>
        <Grid item className={ classes.grid }>
        <Button type='submit' variant='contained' color='primary'>Change City</Button>
        </Grid>
        </Grid>
    </form>
    <form noValidate onSubmit={handleCurrentCityWeather}>
        {!isLoading ? (
          <div>
            <Typography className={classes.text} component='h1' variant='h5'> Weather in {weatherData.name} </Typography>
            <p>Temperature: {weatherData.main.temp}°C</p>
            <p>Weather: {weatherData.weather[0].main}</p>
            <p>Description: {weatherData.weather[0].description}</p>
            <p>Humidity: {weatherData.main.humidity}%</p>
            <p>Wind Speed: {weatherData.wind.speed}m/s</p>
          </div>
        
          ) : (
            <p>Loading weather data...</p>
          )}
        <Grid container alignContent='flex-end' direction='column'>
        <Grid item className={ classes.grid }>
        <Button type='submit' variant='contained' color='primary'>Change to Current City</Button>
        </Grid>
        </Grid>
    </form>
    </Container>
    </div>
  );
};

export default Weather;