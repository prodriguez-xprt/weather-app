import { useState, useEffect } from 'react';
import './App.css';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
const us_states = require('./us_states.json');
const air_qi = require('./air_qi.json');

function App() {

  const [tempData, setTempData] = useState(null);
  const [pollutionData, setPollutionData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [lat, setLat] = useState("33.448457");
  const [lon, setLon] = useState("-112.073844");
  const [unit, setUnit] = useState("imperial");
  const [currentCapital, setCurrentCapital] = useState("Phoenix");

  const [maxTempNextDay, setMaxTempNextDay] = useState(null);
  const [minTempNextDay, setMinTempNextDay] = useState(null);

  const returnDegree = () => {
    if (unit === "imperial")
      return "°F"
    if (unit === "metric")
      return "°C"
  }

  useEffect(() => {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${process.env.REACT_APP_WEATHER_APP_ID}`)
      .then(response => response.json())
      .then(json => setTempData(json))
      .catch(error => console.error(error));

    fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&units=${unit}&appid=${process.env.REACT_APP_WEATHER_APP_ID}`)
      .then(response => response.json())
      .then(json => setPollutionData(json))
      .catch(error => console.error(error));

    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${process.env.REACT_APP_WEATHER_APP_ID}`)
      .then(response => response.json())
      .then(json => {setForecastData(json)})
      .catch(error => console.error(error));
  }, [lat, lon, unit]);

  useEffect(() => {
    if (forecastData) {
      let max_temp = -1000;
      let min_temp = 1000;
      let counter= 0;

      while (counter < 7) {
        if (forecastData.list[counter].main.temp_max > max_temp) {
          max_temp = forecastData.list[counter].main.temp_max
        }
        if (forecastData.list[counter].main.temp_min < min_temp) {
          min_temp = forecastData.list[counter].main.temp_min
        }
        counter++;
      }
      setMaxTempNextDay(max_temp)
      setMinTempNextDay(min_temp)
    }
  }, [forecastData]);

  useEffect(() => {
    var city_details = us_states.states.filter(function(item) { return item.capital === currentCapital; });
    if (city_details.length > 0) {
      if (lon !== city_details[0].long && lat !== city_details[0].lat) {
        setLat(city_details[0].lat)
        setLon(city_details[0].long)
      }
    }
  }, [currentCapital]);

  console.log(air_qi)

  return (
    <div className="App">
      <Box>
        <Typography variant="h2" gutterBottom>Weather App</Typography>
        <div className='filtersContainers'>
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={us_states.states.map((option) => option.capital)}
            sx={{ width: 300 }}
            onChange={(event, newValue) => {
              setCurrentCapital(newValue);
            }}
            defaultValue={"Phoenix"}
            renderInput={(params) => <TextField {...params} label="Select US Capital" />}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={["imperial", "metric"]}
            sx={{ width: 300 }}
            onChange={(event, newValue) => {
              setUnit(newValue);
            }}
            defaultValue={"imperial"}
            renderInput={(params) => <TextField {...params} label="Units of measurement" />}
          />
        </div>
        {tempData && 
          
            <Card className='tempContainer'>
              <CardContent>
                <Typography variant="h3" gutterBottom>{currentCapital}</Typography>
                <Typography variant="h4">Current Temperature: {tempData.main.temp} {returnDegree()}</Typography>
                <div id="icon">
                  <img id="wicon" src={`http://openweathermap.org/img/w/${tempData.weather[0].icon}.png`} alt="Weather icon" />
                </div>
                <div className='temp_detailed_data'>
                  {pollutionData && 
                    <Card className='cardContainer'>
                      <CardContent>
                        <Typography variant="h4">Air Quality</Typography>
                        <Typography variant="p">{air_qi[pollutionData.list[0].main.aqi].category}</Typography>
                        <div className='air_quality_divider' style={{backgroundColor: air_qi[pollutionData.list[0].main.aqi].hex_color}}></div>
                        <Typography variant="h5">Ozone: {pollutionData.list[0].components.o3}</Typography>
                        <Typography variant="h5">Fine Particular Matter: {pollutionData.list[0].components.pm2_5}</Typography>
                        <Typography variant="h5">Particular Matter: {pollutionData.list[0].components.pm10}</Typography>
                        <Typography variant="h5">Exposure to Sulfur Dioxide: {pollutionData.list[0].components.so2}</Typography>
                      </CardContent>
                    </Card>
                  }
                  {forecastData && minTempNextDay !== null && maxTempNextDay !== null && 
                    <Card className='cardContainer'>
                      <CardContent>
                        <Typography variant="h3" gutterBottom>Tomorrow Forecast</Typography>
                        <Typography variant="h5">Max Temp: {maxTempNextDay} {returnDegree()}</Typography>
                        <Typography variant="h5">Min Temp: {minTempNextDay} {returnDegree()}</Typography>
                      </CardContent>
                    </Card>
                  }
                </div>
              </CardContent>
            </Card>
        }
      </Box>
    </div>
  );
}

export default App;
