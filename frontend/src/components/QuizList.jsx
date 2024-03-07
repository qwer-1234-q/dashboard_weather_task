import {
  Card, CardHeader, CardContent, CardMedia, Button, IconButton,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Divider
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { HighlightOff, FileCopy } from '@mui/icons-material'
import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { Link } from 'react-router-dom';
import { apiFetch } from '../helpers';

const useStyles = makeStyles(() => ({
  card: {
    marginTop: '70px',
    borderRadius: 5,
    border: '3px solid #954bb4'
  },
  header: {
    margin: '0px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  media: {
    height: 300,
    maxWidth: 'True'
  },
  content: {
    width: 350,
  },
  grid: {
    padding: '10px',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-evenly',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px',
    borderRadius: 0
  }
}));
const getQuizDetail = (id) => {
  return new Promise((resolve) => {
    apiFetch('GET', `admin/quiz/${id}`)
      .then((response) => {
        resolve(response)
      })
  })
}

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds}`;
}

const QuizList = ({ quizzes, refresh }) => {
  const classes = useStyles()
  const navigate = useNavigate()

  const [sessionId, setSessionId] = useState(null)
  const [open, setOpen] = useState(false)
  const [openEnd, setOpenEnd] = useState(false)

  const handleEdit = (id) => {
    return navigate(`/editQuiz/${id}`)
  }

  const handleControl = (id) => {
    getQuizDetail(id)
      .then((response) => {
        return navigate(`/adminGame/${id}/${response.active}`)
      })
  }

  const handleDelete = (id) => {
    apiFetch('DELETE', `admin/quiz/${id}`, {})
    refresh()
  }

  const handleStart = (id) => {
    apiFetch('POST', `admin/quiz/${id}/start`, {})
      .then(
        apiFetch('GET', `admin/quiz/${id}`)
          .then((response) => {
            setSessionId(response.active)
            refresh()
            setOpen(true)
          })
      )
  }

  const handleEnd = (id) => {
    apiFetch('GET', `admin/quiz/${id}`)
      .then((response) => {
        setSessionId(response.active)
        apiFetch('POST', `admin/quiz/${id}/end`, {})
          .then(() => {
            refresh()
            setOpenEnd(true)
          })
      })
  }

  const handleResult = (id, sessionId) => {
    setOpenEnd(false)
    return navigate(`/adminGame/${id}/${sessionId}`);
  }

  return (
    <div className='QuizzesList'>
      {quizzes && (
        <div className={classes.container} spacing={10}>
          {quizzes.map((quiz) => (
            <div className='quizSummary' key={quiz.id}>
              <div className={classes.grid}>
                <Card variant='outlined' className={classes.card}>
                  <h2 className={classes.header}>
                    <CardHeader title={`game: ${quiz.id}`} disableTypography/>
                    <IconButton onClick={() => handleDelete(quiz.id) }>
                      <HighlightOff color="primary"/>
                    </IconButton>
                  </h2>
                  {quiz.thumbnail && <CardMedia
                    className={classes.media}
                    image={quiz.thumbnail}
                    title='thumbnail'
                    alt='quiz thumbnail'
                  />}
                  <CardContent className={classes.content}>
                    <p>Quiz: {quiz.name}</p>
                    <p>Number of Questions: {quiz.numQuestions}</p>
                    <p>Length of Quiz: {formatTime(quiz.totalTime)}</p>
                  </CardContent>
                  <Divider />
                  <div className={classes.buttonGroup}>
                    <Button variant="contained" className={classes.button} style={{ borderRadius: '0px' }} onClick={() => handleEdit(quiz.id)}>Edit Quiz</Button>
                    { quiz.active && (
                      <Button variant="contained" className={classes.button} style={{ backgroundColor: '#90caf9', borderRadius: '0px' }} onClick={() => handleControl(quiz.id)}>Admin Control</Button>
                    )}
                    { quiz.active && (
                      <Button variant="contained" className={classes.button} style={{ backgroundColor: '#e57373', borderRadius: '0px' }} onClick={() => handleEnd(quiz.id)}>End Session</Button>
                    )}
                    { !quiz.active && (
                      <Button variant="contained" className={classes.button} style={{ borderRadius: '0px' }} color="secondary" onClick={() => handleStart(quiz.id)}>Start Session</Button>
                    )}
                  </div>
                  <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Session has started</DialogTitle>
                    <DialogContent style={{ display: 'flex', alignItems: 'center' }}>
                      <DialogContentText style={{ margin: '0px' }}>
                        Copy url of this session: {sessionId}
                      </DialogContentText>
                      <IconButton onClick={() => { navigator.clipboard.writeText(`127.0.0.1:3000/game/${sessionId}`) }}>
                        <FileCopy />
                      </IconButton>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={ () => setOpen(false) }>Done</Button>
                    </DialogActions>
                  </Dialog>
                  <Dialog open={openEnd} onClose={() => setOpenEnd(false)}>
                    <DialogTitle>Would you like to view the results?</DialogTitle>
                    <DialogContent style={{ display: 'flex', alignItems: 'center' }}>
                      <DialogContentText style={{ margin: '0px' }}>
                        results for session: {sessionId}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={ () => setOpenEnd(false) }>No</Button>
                      <Button onClick={ () => handleResult(quiz.id, sessionId) }>Yes</Button>
                    </DialogActions>
                  </Dialog>
                </Card>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
