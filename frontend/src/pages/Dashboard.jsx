import {
  Button, TextField, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Grid, Container, Typography,
  CardContent, Divider
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { React, useEffect, useState } from 'react'
import { apiFetch, getToken, toastError } from '../helpers';
import TaskList from '../components/TaskList';
import QuizList from '../components/QuizList';

const useStyles = makeStyles(() => ({
  page: {
    marginBottom: '96px',
    padding: '24px'
  },
}));

const getTaskID = (taskid) => {
  return new Promise((resolve) => {
    apiFetch('GET', `admin/task/${taskid}`)
      .then((response) => {
        console.log('get task descripion', response);
        resolve(response.tasks)
      })
  })
}

const getQuizQuestions = (quizid) => {
  return new Promise((resolve) => {
    apiFetch('GET', `admin/quiz/${quizid}`)
      .then((response) => {
        resolve(response.questions)
      })
  })
}

const getQuizDuration = (questions) => {
  let duration = 0;
  for (const question of questions) {
    if (question.timeLimit) {
      duration += parseInt(question.timeLimit)
    }
  }
  return duration
}

const Dashboard = () => {
  const classes = useStyles();
  // const [currentCity, setCurrentCity] = useState('Sydney');
  // const [currentTemperature, setCurrentTemperature] = useState('');
  // const [currentDescription, setCurrentDescription] = useState('');
  const [tasks, setTasks] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [open, setOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const refreshPage = () => {
    setRefresh(!refresh)
  }

  // function getCurrentCityWeather (event) {
  //   event.preventDefault();

  //   const city = event.target[0].value;
  //   console.log('input a city:', city);
  //   // validating it is not empty field
  //   if (!city) {
  //     return toastError('please input the city')
  //   }

  //   apiFetch('POST', `weather/${city}`)
  //     .then((response) => {
  //       console.log('current weather information: ', response);
  //       if (response) {
  //         setCurrentCity(response.city);
  //         setCurrentTemperature(response.temp);
  //         setCurrentDescription(response.description);
  //         refreshPage();
  //       }
  //     })
  //     .catch((error) => {
  //       toastError('We cannot find this city');
  //     })
  // }

  const handleAddTask = (event) => {
    event.preventDefault()
    const name = event.target[0].value
    if (name !== undefined && name.length >= 1) {
      apiFetch('POST', 'admin/task/new', { name })
        .then((response) => {
          if (response) {
            refreshPage()
            setOpen(false)
          }
        })
    } else {
      toastError('Please input a valid name')
    }
  }

  useEffect(() => {
    console.log(getToken())
    apiFetch('GET', 'admin/task')
      .then((response) => {
        const tasks = JSON.parse(JSON.stringify(response.tasks))
        Promise.all(
          tasks.map(async (task) => {
            const taskDetail = await getTaskID(task.id)
            const tempTask = { ...task }
            console.log("task detail:", taskDetail);
            console.log("task tmp:", tempTask);
            return tempTask
          })
        ).then((updatedTasks) => {
          setTasks(updatedTasks)
        });
      })
  }, [refresh])

  const handleAddQuiz = (event) => {
    event.preventDefault()
    const name = event.target[0].value
    if (name !== undefined && name.length >= 1) {
      apiFetch('POST', 'admin/quiz/new', { name })
        .then((response) => {
          if (response) {
            refreshPage()
            setOpen(false)
          }
        })
    } else {
      toastError('Please input a valid name')
    }
  }

  useEffect(() => {
    console.log(getToken())
    apiFetch('GET', 'admin/quiz')
      .then((response) => {
        const quizs = JSON.parse(JSON.stringify(response.quizzes))
        Promise.all(
          quizs.map(async (quiz) => {
            const questions = await getQuizQuestions(quiz.id)
            const tempQuiz = { ...quiz }
            tempQuiz.numQuestions = questions.length
            tempQuiz.totalTime = getQuizDuration(questions)
            return tempQuiz
          })
        ).then((updatedQuizzes) => {
          setQuizzes(updatedQuizzes)
        });
      })
  }, [refresh])

  return (
    <div className={classes.page}>
      <Divider
       flexItem
      >
      <Typography className={classes.text} component='h1' variant='h5'> Your personal task management </Typography>
      </Divider>
      <Button variant="contained" color="secondary" onClick={() => setOpen(true)}>
        Add a Task
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Give it a Name</DialogTitle>
        <form noValidate onSubmit={handleAddTask}>
          <DialogContent>
            <DialogContentText>
              This will be the title name of the Task
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="name"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => setOpen(false) }>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </DialogActions>
        </form>
      </Dialog>
      <TaskList tasks ={ tasks } refresh={ refreshPage }/>
      <Divider
        flexItem
      >
      <Typography className={classes.text} component='h1' variant='h5'> Create a quiz and make fun with your friends </Typography>
      </Divider>
      <Button variant="contained" color="secondary" onClick={() => setOpen(true)}>
        Add a Quiz
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Give it a Name</DialogTitle>
        <form noValidate onSubmit={handleAddQuiz}>
          <DialogContent>
            <DialogContentText>
              This will be the title name of the Quiz
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="name"
              fullWidth
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={ () => setOpen(false) }>Cancel</Button>
            <Button type="submit">Add Quiz</Button>
          </DialogActions>
        </form>
      </Dialog>
      <QuizList quizzes={ quizzes } refresh={ refreshPage }/>
    </div>
  );
};

export default Dashboard;
