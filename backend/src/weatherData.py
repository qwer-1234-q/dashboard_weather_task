import requests
from flask import Flask, jsonify, request

# api key from OpenWeatherMap 
api_key_weather = "66cf839c72a9a6826f72c624c510d53f"

# api key from ipinfo.io
api_key_ipinfo = "bc48a998282274"

# create an app
app = Flask(__name__)

def get_public_ip():
    try:
        # collect current ip address from current public ip address
        response_ip = requests.get('https://httpbin.org/ip')
        ip_address = response_ip.json()['origin']
        if ip_address is None or len(ip_address) == 0:
            print(f"Error: cannot get ip address")
            return None
        print(f"current ip address is {ip_address}")

        return ip_address

    except requests.RequestException as re: 
        print(f"Error fetching public IP address: {re}")
        return None

def get_city_by_ip():
    try:
        # get ip address 
        ip_address = get_public_ip()

        # ipinfo.io to get current address from ip address
        url_ip = f"https://ipinfo.io/{ip_address}/json?token={api_key_ipinfo}"
        
        response_address = requests.get(url_ip)
        data = response_address.json()
        return data.get('city')
    except requests.RequestException as re: 
        print(f"Error fetching current user city: {re}")
        return None

@app.route('/weather', methods=['POST'])
def get_current_city_weather():
    # get the data from user input
    city = request.json
    print(f"input city: {city}") 

    # if user didn't input the city, try to get the user current city
    if len(city) == 0 or city is None:
        city = get_city_by_ip()

        # if we cannot get the city, the draft city is 'Sydney'
        if city is None or len(city) == 0:
            city = "Sydney"

    # OpenWeatherMap's URL
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key_weather}&units=metric"

    # create a 'GET' request
    response = requests.get(url)

    # set draft data 
    result = {
        "city": city,
        "temperature": "",
        "description": "",
        "status": 404
    }
    
    # check the request
    if response.status_code == 200:
        # return JSON data
        weather_data = response.json()

        # check the temperature in the current city
        temperature = weather_data['main']['temp']
        print(f"The current temperature in {city} is {temperature}°C.")
        
        # collect data 
        result = {
            "city": city,
            "temperature": temperature,
            "description": weather_data['weather'][0]['description'],
            "status": 200
        }
    return jsonify(result)
    