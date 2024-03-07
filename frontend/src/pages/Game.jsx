import { React, useEffect, useState } from 'react';
import {
  Card, CardActionArea, TextField, Button, Typography, Container,
  TableContainer, TableCell, Table, TableHead, Paper, TableRow, TableBody,
  CardContent, CardMedia
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { WatchLater } from '@mui/icons-material'
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch, sleep, toastError } from '../helpers';
import background from '../photos/classroom.webp';

const useStyles = makeStyles((theme) => ({
  card: {
    borderRadius: 5,
    border: '3px solid #954bb4'
  },
  fullWidth: {
    width: '100%',
    minWidth: '10%',
  },
  input: {
    display: 'inline-block',
    margin: '5px'
  },
  button: {
    marginTop: '5px',
    float: 'right'
  },
  page: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '81vh',
  },
  questionCard: {
    marginTop: '3vh',
    marginBottom: '24px',
    borderRadius: 5,
    border: '3px solid #954bb4',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    position: 'relative',
    margin: '0 auto',
    minWidth: 300,
  },
  questionText: {
    fontSize: '1.5rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },
  optionContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    textAlign: 'center',
    flexGrow: 1,
    flex: 1
  },
  optionCard: {
    border: '3px solid #954bb4',
    borderRadius: 5,
    marginBottom: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    padding: '20px'
  },
  clickedCard: {
    border: '5px solid #76ff03',
    borderRadius: 5,
    marginBottom: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
}))

function setPlayerId (playerId) {
  localStorage.setItem('playerId', playerId)
}

function getPlayerId () {
  return localStorage.getItem('playerId')
}

function removePlayerId () {
  localStorage.removeItem('playerId')
}

const Game = () => {
  const classes = useStyles()
  const navigate = useNavigate()
  const { sessionid } = useParams()
  // input session id stage -2, input nickname stage -1, waiting 0, question 1, result 1000
  const [stage, setStage] = useState()
  const [remainingTime, setRemainingTime] = useState(1000)
  const [currentQ, setCurrentQ] = useState({})
  const [clickedOptions, setClickedOptions] = useState([])
  const [correctOptions, setCorrectOptions] = useState([])
  const [tmpclickedOptions, setTmpclickedOptions] = useState([])
  const [cumulativeScore, setCumulativeScore] = useState(0)
  const [timeAtAnswer, setTimeAtAnswer] = useState()
  const [collectPlayerResults, setCollectPlayerResults] = useState([]);
  const colors = ['#9575cd', '#4fc3f7', '#e57373', '#dce775', '#ffb74d', '#81c784']

  const Timer = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        const diff = Math.round((new Date() - new Date(currentQ.isoTimeLastQuestionStarted)) / 1000);
        setRemainingTime(Math.max(0, currentQ.timeLimit - diff));
      }, 500);
      return () => clearInterval(interval)
    }, [currentQ]);
    return <Typography variant='h5'>{remainingTime.toString()}</Typography>
  }

  const isClicked = (optionid) => {
    return (clickedOptions.includes(optionid))
  }

  const setClick = (optionid) => {
    if (remainingTime === 0) {
      return
    }
    // if it is single choice question
    if (parseInt(currentQ.type) === 1) {
      // if not already the selected option
      if (!clickedOptions.includes(optionid)) {
        setClickedOptions([]);
        setClickedOptions(prevArray => [...prevArray, optionid]);
      } else {
        return
      }
      // if it is multiple choice question
    } else {
      // if it is already in the list, unselect it
      if (clickedOptions.includes(optionid)) {
        setClickedOptions(clickedOptions.filter((item) => item !== optionid))
      } else {
        setClickedOptions([...clickedOptions, optionid])
      }
    }
    setTmpclickedOptions([...clickedOptions, optionid])
  }

  // for immediately display after each game
  const calculateCumulativeScore = () => {
    // seconds left when answering the question is remainingTimeAtAnswer
    // seconds left / question time limit = factor
    // for example a 60 second question answered when 33 seconds left
    // (33/60) = 0.55
    // if the question worth 30 points, the score is 0.55 * 30 = 16.5
    const timeTakenToAnswer = Math.round((timeAtAnswer - new Date(currentQ.isoTimeLastQuestionStarted)) / 1000)
    const score = (1 - (timeTakenToAnswer / currentQ.timeLimit)) * currentQ.point
    setCumulativeScore(cumulativeScore + score)
    return score
  }

  // for calculating final result scores
  const calculateScore = (answeredAt, questionStartedAt, points, timeLimits, index) => {
    const timeTakenToAnswer = Math.round((new Date(answeredAt) - new Date(questionStartedAt)) / 1000)
    const point = (points.length >= index + 1) ? points[index] : 0
    const timeLimit = (timeLimits.length >= index + 1) ? timeLimits[index] : 0
    const score = (1 - (timeTakenToAnswer / timeLimit)) * point
    return Math.round(score)
  }

  function getPlayerResult (points, timeLimits) {
    apiFetch('GET', 'play/' + getPlayerId() + '/results')
      .then((data) => {
        const tmpCollect = [];
        for (let i = 1; i <= data.length; i++) {
          const stringCorrect = data[i - 1].correct ? 'Correct' : 'Wrong';
          const stringScore = (stringCorrect === 'Correct') ? calculateScore(data[i - 1].answeredAt, data[i - 1].questionStartedAt, points, timeLimits, i - 1).toString() : '0'
          tmpCollect.push({
            index: i,
            correct: stringCorrect,
            score: stringScore
          });
        }
        setCollectPlayerResults(tmpCollect);
        console.log('current collect all question result', tmpCollect);
        removePlayerId();
      })
  }

  useEffect(() => {
    if (clickedOptions.length !== 0) {
      apiFetch('PUT', `play/${getPlayerId()}/answer`, { answerIds: clickedOptions })
        .then(() => {
          setTimeAtAnswer(new Date())
        })
    }
  }, [tmpclickedOptions])

  useEffect(() => {
    // if playerid exists
    if (getPlayerId()) {
      setStage(0)
      return
    }
    // if the sessionid in the url is not an integer
    if (!sessionid || isNaN(sessionid) !== false) {
      setStage(-2)
    // goes to input name page
    } else {
      setStage(-1)
    }
  }, [sessionid])

  // polling for getting started
  useEffect(() => {
    let interval = null
    if (getPlayerId() && stage === 0) {
      interval = setInterval(() => {
        apiFetch('GET', `play/${getPlayerId()}/status`)
          .then((response) => {
            if (response.started || sessionid === null) {
              setStage(1)
              clearInterval(interval)
            }
          })
          // if the session is inactive, then it must be in result state
          .catch((err) => {
            console.log(err)
            getPlayerResult()
            setStage(1000)
            clearInterval(interval)
          })
      }, 3000)
    }
    return () => clearInterval(interval);
  }, [stage])

  // polling for getting game question
  useEffect(() => {
    let interval = null
    let points = []
    let timeLimits = []
    // if it is in game stage
    if (getPlayerId() && stage > 0 && stage < 1000) {
      let tmpQ = null
      interval = setInterval(() => {
        apiFetch('GET', `play/${getPlayerId()}/question`)
          .then((response) => {
            try {
              console.log('at question api' + points)
              // if a new question has introduced
              if (!tmpQ || (response.question.questionid !== tmpQ.questionid)) {
                points = [...points, response.question.point]
                timeLimits = [...timeLimits, response.question.timeLimit]
                tmpQ = response.question
                setCurrentQ(response.question)
              }
            } catch (error) {
              console.log(error)
              getPlayerResult(points, timeLimits)
              setStage(1000)
              clearInterval(interval)
            }
          })
      }, 3000)
    }
    return () => clearInterval(interval);
  }, [stage])

  // when timer reaches 0
  useEffect(() => {
    async function fetchAnswer () {
      if (remainingTime === 0 && (stage > 0 && stage < 1000)) {
        await sleep(500)
        setClickedOptions([])
        apiFetch('GET', `play/${getPlayerId()}/answer`)
          .then((response) => {
            setCorrectOptions(response.answerIds)
            if (JSON.stringify(clickedOptions) === JSON.stringify(response.answerIds)) {
              calculateCumulativeScore()
            }
          })
      }
    }
    fetchAnswer()
  }, [remainingTime])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (stage === -2) {
      const id = event.target[0].value
      if (!id || isNaN(id) !== false) {
        return toastError('session id must be integer')
      }
      return navigate(`/game/${id}`)
    } else if (stage === -1) {
      const nickname = event.target[0].value
      if (!nickname) {
        return toastError('please input a valid name')
      }
      apiFetch('POST', `play/join/${sessionid}`, { name: nickname })
        .then((data) => {
          setPlayerId(data.playerId)
          setStage(0)
        })
        .catch(() => {
          toastError('Please enter a valid session')
          setStage(-2)
        })
    }
  }

  return (
    <div className={classes.page} style=
      {{
        backgroundImage: `url(${background})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minWidth: '100%',
        minHeight: '100%',
      }}>
    {(stage < 0) &&
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Card className={ classes.card } style={{ minWidth: '40%', padding: '10px' }}>
          {(stage === -2)
            ? (<h2>Join a Session</h2>)
            : (<h2>Input your nickname</h2>)}
          <form onSubmit={handleSubmit}>
            <div style={{ margin: '30px' }}>
              {(stage === -2)
                ? (<TextField key={stage} className={ classes.input } fullWidth label="Session ID" id="sessionid" />)
                : (<TextField key={stage} className={ classes.input } fullWidth label="Nickname" id="nickname" />)
              }
            </div>
            <Button className={ classes.button } variant="contained" color="secondary" type="submit" >{ (stage === -2) ? 'Next' : 'Join' }</Button>
          </form>
        </Card>
      </div>}
    {(stage === 0) &&
      <div className={classes.container}>
        <Card className={classes.card} style={{ padding: '10px' }}>
          <Typography variant='h5' >Waiting for Admin to Start Game...</Typography>
       </Card>
      </div>
    }
    {(stage > 0 && stage < 1000) &&
      <div className={classes.container}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
            <WatchLater style={{ fontSize: 40 }}/>
            <Timer />
          </div>
        </div>
        <Card className={classes.questionCard}>
          <CardContent>
            <Typography className={classes.questionText} >{ (remainingTime > 0) ? currentQ.name : 'Your score so far: ' + Math.round(cumulativeScore) }</Typography>
            <Typography style={{ fontWeight: 'bold', fontStyle: 'italic' }} >{ (parseInt(currentQ.type) === 1) ? 'Select Single Answer' : 'Select Multiple Answers'}</Typography>
          </CardContent>
          { (parseInt(currentQ.videoURL) === 1 && currentQ.url !== '') &&
            <CardMedia image={currentQ.url} title="question image" alt="question image" style={{ height: 200, width: 300 }}/>
          }
          { (parseInt(currentQ.videoURL) === 2 && currentQ.url !== '') &&
            // <Youtube videoId={getvideoId(currentQ.url)} title="question image" alt="question image" style={{ height: 200, width: 300 }} />
            <>{currentQ.url}</>
          }
        </Card>
        <div className={classes.optionContainer}>
          {currentQ.options && <>{currentQ.options.map((option, index) => (
            <CardActionArea
              key={`${option.optionid}`}
              className={(isClicked(option.optionid)) ? classes.clickedCard : classes.optionCard}
              style={{
                backgroundColor: (remainingTime > 0
                  ? colors[index]
                  : (correctOptions.includes(option.optionid)) ? '#81c784' : '#e57373'),
                width: '30%',
                border: (isClicked(option.optionid)) ? '5px solid #76ff03' : '3px solid #954bb4',
                borderRadius: 5,
                marginBottom: '8px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setClick(option.optionid, remainingTime)}>
              <Typography variant='h5' >{ option.optionName }</Typography>
            </CardActionArea>))}</>}
        </div>
      </div>
    }
    {(stage === 1000) && <>
      <Container fixed maxWidth='md' className={classes.container} style={{ marginTop: '10vh' }}>
        <Typography className={classes.text} component='h1' variant='h5'>Your Results:</Typography>
        <Typography style={{ fontWeight: 'bold', fontStyle: 'italic', margin: '10px' }}>
            Scores of each question are calculated by multiplying the question&apos;s point worth by time taken to answer divided by the time limit of the question
        </Typography>
        <Card className={ classes.card }>
          <TableContainer comonent={Paper}>
            <Table sx={{ minWidth: 650 }} aria-labelledby='PlayerResults'>
              <TableHead>
                <TableRow>
                  <TableCell>Question number</TableCell>
                  <TableCell aligen='right'>Results</TableCell>
                  <TableCell aligen='right'>Scores</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {collectPlayerResults && <> {collectPlayerResults.map((row) => (
                  <TableRow
                    key={`${row.index}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component={'th'} scope='row'>{row.index}</TableCell>
                    <TableCell aligen='right'>{row.correct}</TableCell>
                    <TableCell aligen='right'>{row.score}</TableCell>
                  </TableRow>
                ))}</>}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        <Button variant="contained" className={classes.button} color="secondary" onClick={() => { navigate('/dashboard') }}>Leave</Button>
      </Container></>}
    </div>
  )
}
export default Game;
