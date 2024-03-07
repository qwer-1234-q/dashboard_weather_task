# 1 Overview

This is a Personal Dashboard application including weather, news, and a simple task manager.

# 2 Core Features

## 2.1 Weather Widget

Display current weather information for the user's location or a specified location. Integrate a public weather API like OpenWeatherMap to fetch weather data.


## 2.2 News Feed

Implement a news feed widget that pulls in top headlines from a public news API like the NewsAPI. Allow users to filter news by category (e.g., Technology, Business, Sports).


## 2.3 Task Manager

Develop a simple task manager where users can add, delete, and mark tasks as completed. Store tasks locally in the browser's localStorage or use a backend service if you're comfortable setting one up.

# 3 Set up and run the project

## 3.1 The Frontend

Navigate to the `frontend` folder and run `npm install` to install all of the dependencies necessary to run the ReactJS app. Then run `npm start` to start the ReactJS app.



## 3.2 The Backend

The backend server exists in your individual repository. After you clone this repo, you must run `npm install` in `backend` directory once.

To run the backend server, simply run `npm start` in the `backend` directory. This will start the backend.

To view the API interface for the backend you can navigate to the base URL of the backend (e.g. `http://localhost:5005`). This will list all of the HTTP routes that you can interact with.

Your backend is persistent in terms of data storage. That means the data will remain even after your express server process stops running. If you want to reset the data in the backend to the original starting state, you can run `npm run reset` in the backend directory. If you want to make a copy of the backend data (e.g. for a backup) then simply copy `database.json`. If you want to start with an empty database, you can run `npm run clear` in the backend directory.

Once the backend has started, you can view the API documentation by navigating to `http://localhost:[port]` in a web browser.

The port that the backend runs on (and that the frontend can use) is specified in `frontend/src/config.js`. You can change the port in this file. This file exists so that your frontend knows what port to use when talking to the backend.
