import fs from 'fs';
import jwt from 'jsonwebtoken';
import AsyncLock from 'async-lock';
import { InputError, AccessError, } from './error';

import {
  quizQuestionPublicReturn,
  quizQuestionGetCorrectAnswers,
  quizQuestionGetDuration,
} from './custom';
import { resolve } from 'path';

const lock = new AsyncLock();

const JWT_SECRET = 'llamallamaduck';
const DATABASE_FILE = './database.json';

/***************************************************************
                       State Management
***************************************************************/

let admins = {};
let quizzes = {};
let sessions = {};
let weathers = {};
let tasks = {};

const sessionTimeouts = {};

const update = (admins, quizzes, sessions, weathers, tasks) =>
  new Promise((resolve, reject) => {
    lock.acquire('saveData', () => {
      try {
        fs.writeFileSync(DATABASE_FILE, JSON.stringify({
          admins,
          quizzes,
          sessions,
          weathers,
          tasks,
        }, null, 2));
        resolve();
      } catch {
        reject(new Error('Writing to database failed'));
      }
    });
  });

export const save = () => update(admins, quizzes, sessions, weathers, tasks);
export const reset = () => {
  update({}, {}, {}, {});
  admins = {};
  quizzes = {};
  sessions = {};
  weathers = {};
  tasks = {};
};

try {
  const data = JSON.parse(fs.readFileSync(DATABASE_FILE));
  admins = data.admins;
  quizzes = data.quizzes;
  sessions = data.sessions;
  weathers = data.weathers;
  tasks = data.tasks;
} catch {
  console.log('WARNING: No database found, create a new one');
  save();
}

/***************************************************************
                       Helper Functions
***************************************************************/

const newSessionId = _ => generateId(Object.keys(sessions), 999999);
const newQuizId = _ => generateId(Object.keys(quizzes));
const newTaskId = _ => generateId(Object.keys(tasks));
const newPlayerId = _ => generateId(Object.keys(sessions).map(s => Object.keys(sessions[s].players)));

export const userLock = callback => new Promise((resolve, reject) => {
  lock.acquire('userAuthLock', callback(resolve, reject));
});

export const quizLock = callback => new Promise((resolve, reject) => {
  lock.acquire('quizMutateLock', callback(resolve, reject));
});

export const taskLock = callback => new Promise((resolve, reject) => {
  lock.acquire('taskMutateLock', callback(resolve, reject));
});

export const sessionLock = callback => new Promise((resolve, reject) => {
  lock.acquire('sessionMutateLock', callback(resolve, reject));
});

export const weatherLock = callback => new Promise((resolve, reject) => {
  lock.acquire('weatherMutateLock', callback(resolve, reject));
});

const copy = x => JSON.parse(JSON.stringify(x));
const randNum = max => Math.round(Math.random() * (max - Math.floor(max / 10)) + Math.floor(max / 10));
const generateId = (currentList, max = 999999999) => {
  let R = randNum(max);
  while (currentList.includes(R)) {
    R = randNum(max);
  }
  return R.toString();
};

/***************************************************************
                       Auth Functions
***************************************************************/

export const getEmailFromAuthorization = authorization => {
  try {
    const token = authorization.replace('Bearer ', '');
    const { email, } = jwt.verify(token, JWT_SECRET);
    if (!(email in admins)) {
      throw new AccessError('Invalid Token');
    }
    return email;
  } catch {
    throw new AccessError('Invalid token');
  }
};

export const login = (email, password) => userLock((resolve, reject) => {
  if (email in admins) {
    if (admins[email].password === password) {
      admins[email].sessionActive = true;
      resolve(jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', }));
    }
  }
  reject(new InputError('Invalid username or password'));
});

export const logout = (email) => userLock((resolve, reject) => {
  admins[email].sessionActive = false;
  resolve();
});

export const register = (email, password, name) => userLock((resolve, reject) => {
  if (email in admins) {
    return reject(new InputError('Email address already registered'));
  }
  admins[email] = {
    name,
    password,
    sessionActive: true,
  };
  const token = jwt.sign({ email, }, JWT_SECRET, { algorithm: 'HS256', });
  resolve(token);
});

/***************************************************************
                       Task Functions
***************************************************************/

const newTaskPayload = (name, owner) => ({
  name,
  owner,
  taskDescription: null,
  thumbnail: null,
  status: '3',
  active: null,
  createdAt: new Date().toISOString(),
});

export const assertOwnsTask = (email, taskId) => taskLock((resolve, reject) => {
  if (!(taskId in tasks)) {
    return reject(new InputError('Invalid Task ID'));
  } else if (tasks[taskId].owner !== email) {
    return reject(new InputError('Admin does not own this Task'));
  } else {
    resolve();
  }
});

export const getTasksFromAdmin = email => taskLock((resolve, reject) => {
  resolve(Object.keys(tasks).filter(key => tasks[key].owner === email).map(key => ({
    id: parseInt(key, 10),
    createdAt: tasks[key].createdAt,
    name: tasks[key].name,
    thumbnail: tasks[key].thumbnail,
    status: tasks[key].status,
    owner: tasks[key].owner,
  })));
});

export const addTask = (name, email) => taskLock((resolve, reject) => {
  if (name === undefined) {
    return reject(new InputError('Must provide a name for new task'));
  } else {
    const newId = newTaskId();
    tasks[newId] = newTaskPayload(name, email);
    resolve(newId);
  }
});

export const getTask = taskId => taskLock((resolve, reject) => {
  resolve({
    ...tasks[taskId],
  });
});

export const updateTask = (taskId, taskDescription, name, thumbnail, status) => taskLock((resolve, reject) => {
  if (taskDescription) { taskzes[taskId].taskDescription = taskDescription; }
  if (name) { tasks[taskId].name = name; }
  if (thumbnail) { taskzes[taskId].thumbnail = thumbnail; }
  if (status) { taskzes[taskId].status = status; }
  resolve();
});

export const removeTask = taskId => taskLock((resolve, reject) => {
  delete tasks[taskId];
  resolve();
});

/***************************************************************
                       Quiz Functions
***************************************************************/

const newQuizPayload = (name, owner) => ({
  name,
  owner,
  questions: [],
  thumbnail: null,
  active: null,
  createdAt: new Date().toISOString(),
});

export const assertOwnsQuiz = (email, quizId) => quizLock((resolve, reject) => {
  if (!(quizId in quizzes)) {
    return reject(new InputError('Invalid quiz ID'));
  } else if (quizzes[quizId].owner !== email) {
    return reject(new InputError('Admin does not own this Quiz'));
  } else {
    resolve();
  }
});

export const getQuizzesFromAdmin = email => quizLock((resolve, reject) => {
  resolve(Object.keys(quizzes).filter(key => quizzes[key].owner === email).map(key => ({
    id: parseInt(key, 10),
    createdAt: quizzes[key].createdAt,
    name: quizzes[key].name,
    thumbnail: quizzes[key].thumbnail,
    owner: quizzes[key].owner,
    active: getActiveSessionIdFromQuizId(key),
    oldSessions: getInactiveSessionsIdFromQuizId(key),
  })));
});

export const addQuiz = (name, email) => quizLock((resolve, reject) => {
  if (name === undefined) {
    return reject(new InputError('Must provide a name for new quiz'));
  } else {
    const newId = newQuizId();
    quizzes[newId] = newQuizPayload(name, email);
    resolve(newId);
  }
});

export const getQuiz = quizId => quizLock((resolve, reject) => {
  resolve({
    ...quizzes[quizId],
    active: getActiveSessionIdFromQuizId(quizId),
    oldSessions: getInactiveSessionsIdFromQuizId(quizId),
  });
});

export const updateQuiz = (quizId, questions, name, thumbnail) => quizLock((resolve, reject) => {
  if (questions) { quizzes[quizId].questions = questions; }
  if (name) { quizzes[quizId].name = name; }
  if (thumbnail) { quizzes[quizId].thumbnail = thumbnail; }
  resolve();
});

export const removeQuiz = quizId => quizLock((resolve, reject) => {
  delete quizzes[quizId];
  resolve();
});

export const startQuiz = quizId => quizLock((resolve, reject) => {
  if (quizHasActiveSession(quizId)) {
    return reject(new InputError('Quiz already has active session'));
  } else {
    const id = newSessionId();
    sessions[id] = newSessionPayload(quizId);
    resolve(id);
  }
});

export const advanceQuiz = quizId => quizLock((resolve, reject) => {
  const session = getActiveSessionFromQuizIdThrow(quizId);
  if (!session.active) {
    return reject(new InputError('Cannot advance a quiz that is not active'));
  } else {
    const totalQuestions = session.questions.length;
    session.position += 1;
    session.answerAvailable = false;
    session.isoTimeLastQuestionStarted = new Date().toISOString();
    if (session.position >= totalQuestions) {
      endQuiz(quizId);
    } else {
      const questionDuration = quizQuestionGetDuration(session.questions[session.position]);
      if (sessionTimeouts[session.id]) {
        clearTimeout(sessionTimeouts[session.id]);
      }
      sessionTimeouts[session.id] = setTimeout(() => {
        session.answerAvailable = true;
      }, questionDuration * 1000);
    }
    resolve(session.position);
  }
});

export const endQuiz = quizId => quizLock((resolve, reject) => {
  const session = getActiveSessionFromQuizIdThrow(quizId);
  session.active = false;
  resolve();
});

/***************************************************************
                       Session Functions
***************************************************************/

const quizHasActiveSession = quizId => Object.keys(sessions).filter(s => sessions[s].quizId === quizId && sessions[s].active).length > 0;

const getActiveSessionFromQuizIdThrow = quizId => {
  if (!quizHasActiveSession(quizId)) {
    throw new InputError('Quiz has no active session');
  }
  const sessionId = getActiveSessionIdFromQuizId(quizId);
  if (sessionId !== null) {
    return sessions[sessionId];
  }
  return null;
};

const getActiveSessionIdFromQuizId = quizId => {
  const activeSessions = Object.keys(sessions).filter(s => sessions[s].quizId === quizId && sessions[s].active);
  if (activeSessions.length === 1) {
    return parseInt(activeSessions[0], 10);
  }
  return null;
};

const getInactiveSessionsIdFromQuizId = quizId =>
  Object.keys(sessions).filter(sid => sessions[sid].quizId === quizId && !sessions[sid].active).map(s => parseInt(s, 10));

const getActiveSessionFromSessionId = sessionId => {
  if (sessionId in sessions) {
    if (sessions[sessionId].active) {
      return sessions[sessionId];
    }
  }
  throw new InputError('Session ID is not an active session');
};

const sessionIdFromPlayerId = playerId => {
  for (const sessionId of Object.keys(sessions)) {
    if (Object.keys(sessions[sessionId].players).filter(p => p === playerId).length > 0) {
      return sessionId;
    }
  }
  throw new InputError('Player ID does not refer to valid player id');
};

const newSessionPayload = quizId => ({
  quizId,
  position: -1,
  isoTimeLastQuestionStarted: null,
  players: {},
  questions: copy(quizzes[quizId].questions),
  active: true,
  answerAvailable: false,
});

const newPlayerPayload = (name, numQuestions) => ({
  name: name,
  answers: Array(numQuestions).fill({
    questionStartedAt: null,
    answeredAt: null,
    answerIds: [],
    correct: false,
  }),
});

export const sessionStatus = sessionId => {
  const session = sessions[sessionId];
  return {
    active: session.active,
    answerAvailable: session.answerAvailable,
    isoTimeLastQuestionStarted: session.isoTimeLastQuestionStarted,
    position: session.position,
    questions: session.questions,
    players: Object.keys(session.players).map(player => session.players[player].name),
  };
};

export const assertOwnsSession = async (email, sessionId) => {
  await assertOwnsQuiz(email, sessions[sessionId].quizId);
};

export const sessionResults = sessionId => sessionLock((resolve, reject) => {
  const session = sessions[sessionId];
  if (session.active) {
    return reject(new InputError('Cannot get results for active session'));
  } else {
    resolve(Object.keys(session.players).map(pid => session.players[pid]));
  }
});

export const playerJoin = (name, sessionId) => sessionLock((resolve, reject) => {
  if (name === undefined) {
    return reject(new InputError('Name must be supplied'));
  } else {
    const session = getActiveSessionFromSessionId(sessionId);
    if (session.position > 0) {
      return reject(new InputError('Session has already begun'));
    } else {
      const id = newPlayerId();
      session.players[id] = newPlayerPayload(name, session.questions.length);
      resolve(parseInt(id, 10));
    }
  }
});

export const hasStarted = playerId => sessionLock((resolve, reject) => {
  const session = getActiveSessionFromSessionId(sessionIdFromPlayerId(playerId));
  if (session.isoTimeLastQuestionStarted !== null) {
    resolve(true);
  } else {
    resolve(false);
  }
});

export const getQuestion = playerId => sessionLock((resolve, reject) => {
  const session = getActiveSessionFromSessionId(sessionIdFromPlayerId(playerId));
  if (session.position === -1) {
    return reject(new InputError('Session has not started yet'));
  } else {
    resolve({
      ...quizQuestionPublicReturn(session.questions[session.position]),
      isoTimeLastQuestionStarted: session.isoTimeLastQuestionStarted,
    });
  }
});

export const getAnswers = playerId => sessionLock((resolve, reject) => {
  const session = getActiveSessionFromSessionId(sessionIdFromPlayerId(playerId));
  if (session.position === -1) {
    return reject(new InputError('Session has not started yet'));
  } else if (!session.answerAvailable) {
    return reject(new InputError('Question time has not been completed'));
  } else {
    resolve(quizQuestionGetCorrectAnswers(session.questions[session.position]));
  }
});

export const submitAnswers = (playerId, answerList) => sessionLock((resolve, reject) => {
  if (answerList === undefined || answerList.length === 0) {
    return reject(new InputError('Answers must be provided'));
  } else {
    const session = getActiveSessionFromSessionId(sessionIdFromPlayerId(playerId));
    if (session.position === -1) {
      return reject(new InputError('Session has not started yet'));
    } else if (session.answerAvailable) {
      return reject(new InputError('Can\'t answer question once answer is available'));
    } else {
      session.players[playerId].answers[session.position] = {
        questionStartedAt: session.isoTimeLastQuestionStarted,
        answeredAt: new Date().toISOString(),
        answerIds: answerList,
        correct: JSON.stringify(quizQuestionGetCorrectAnswers(session.questions[session.position]).sort()) === JSON.stringify(answerList.sort()),
      };
      resolve();
    }
  }
});

export const getResults = playerId => sessionLock((resolve, reject) => {
  const session = sessions[sessionIdFromPlayerId(playerId)];
  if (session.active) {
    return reject(new InputError('Session is ongoing, cannot get results yet'));
  } else if (session.position === -1) {
    return reject(new InputError('Session has not started yet'));
  } else {
    resolve(session.players[playerId].answers);
  }
});

/***************************************************************
                       Weather Functions
***************************************************************/

// const axios = require('axios');
import axios from 'axios';

// async function getPublicIP() {
//   try {
//      // Get the public IP from ipify
//     const response = await axios.get('https://api.ipify.org?format=json');
//     return response.data.ip;
//   } catch (error) {
//     console.error('Error fetching public IP:', error);
//     return null;
//   }
// }

export const getPublicIP = authorization => {
  try {
     // Get the public IP from ipify
    const response = axios.get('https://api.ipify.org?format=json')
      .then(response => {
        console.log(response.data);
        return response.data.ip;
      })
      .catch(error => {
        console.error(error);
        throw new AccessError('Error fetching public IP:', error);
      });
    
  } catch (error) {
    // console.error('Error fetching public IP:', error);
    throw new AccessError('Error fetching public IP:', error);
  }
};

// async function getCityByIP(ip) {
//   try {
//     // Get the address from ipapi.co
//     const api_key_ipinfo = "bc48a998282274";
//     const url = `https://ipapi.co/${ip}/json/?key=${api_key_ipinfo}`;
//     const response = await axios.get(url);
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching location info:', error);
//     return null;
//   }
// }

export const getCityByIP = ip => {
  try {
    // Get the address from ipapi.co
    const api_key_ipinfo = "bc48a998282274";
    const url = `https://ipapi.co/${ip}/json/?key=${api_key_ipinfo}`;
    const response = axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching location info:', error);
    return null;
  }
};

// export const fetchLocationInfo = async () => {
//   const ip = await getPublicIP();
//   const result = {
//     "city": "",
//     "region": "",
//     "country_name": ""
//   };
//   if (!ip) {
//     console.log('Unable to get public IP address.');
//     return result;
//   }
//   console.log(`Public IP address: ${ip}`);

//   const locationInfo = await getCityByIP(ip);
//   if (locationInfo) {
//     console.log(`Location: ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country_name}`);
//     return {
//       "city": locationInfo.city,
//       "region": locationInfo.region,
//       "country_name": locationInfo.country_name
//     };
//   } else {
//     console.log('Unable to get location information.');
//   }
//   return result;
// };

export const fetchLocationInfo = () => {
  const ip = getPublicIP();
  const result = {
    "city": "",
    "region": "",
    "country_name": ""
  };
  if (!ip) {
    console.log('Unable to get public IP address.');
    return result;
  }
  console.log(`Public IP address: ${ip}`);

  const locationInfo = getCityByIP(ip);
  if (locationInfo) {
    console.log(`Location: ${locationInfo.city}, ${locationInfo.region}, ${locationInfo.country_name}`);
    return {
      "city": locationInfo.city,
      "region": locationInfo.region,
      "country_name": locationInfo.country_name
    };
  } else {
    console.log('Unable to get location information.');
  }
  return result;
};

export const searchWeather = (city) => weatherLock((resolve, reject) => {
  try {
    const api_key_weather = "66cf839c72a9a6826f72c624c510d53f";
    const weather_url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key_weather}&units=metric`;
    const result = {
      "city": city,
      "temp": '',
      "description": '',
      "wind_speed": '',
    }
    const response = axios.get(weather_url)
      .then(response => {
        // console.log(response.data);
        console.log(`${city}'s current weather:`);
        console.log(`temperature: ${response.data.main.temp}°C`);
        console.log(`description: ${response.data.weather[0].description}`);
        console.log(`wind speed: ${response.data.wind.speed}m/s`);
        // const result = {
        //   "city": city,
        //   "temp": response.data.main.temp,
        //   "description": response.data.weather[0].description,
        //   "wind_speed": response.data.wind.speed,
        // }
        result['temp'] = response.data.main.temp;
        result['description'] = response.data.weather[0].description;
        result['wind_speed'] = response.data.wind.speed;
        if (city in weathers) {
          weathers[city].temp = response.data.main.temp;
          weathers[city].description = response.data.weather[0].description;
          weathers[city].wind_speed = response.data.wind.speed;
          // resolve(city);
          // resolve(result);
          // resolve(weathers);
        } else {
          weathers[city] = result;
          // resolve(city);
          // resolve(result);
          // resolve(weathers);
        }
        // return result;
        resolve(result);
        console.log("\n1 update weathers");
        console.log(weathers);
        resolve();
      })
      .catch(error => {
        console.error(error);
        reject(new AccessError('Error: error fetching weather data'));
      });;
      console.log("\n2 update weathers");
      console.log(weathers);
      console.log("result:", result)
      // console.log(response);
      resolve();  
  } catch (error) {
    // console.error('error: get the weather error: ', error);
    reject(new InputError('Error: cannot get the weather'));
  }
  // return null;
});


export const getWeather = (city) => {
  if (city in weathers) {
    console.log("to find the data in the database", city);
    return weathers[city];
  }
  // throw new AccessError("Cannot find this city");
  return null;
}