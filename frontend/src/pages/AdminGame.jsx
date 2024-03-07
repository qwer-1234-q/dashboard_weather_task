import { React, useEffect, useState } from 'react';
import {
  Card, Typography, Button, CardContent, CardMedia,
  TableContainer, TableCell, Table, TableHead, Paper, TableRow, TableBody
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Person, WatchLater } from '@mui/icons-material'
import ReactECharts from 'echarts-for-react';
import { useParams, useNavigate } from 'react-router-dom';
import background from '../photos/classroom.webp'
import { apiFetch, toastError } from '../helpers';

const useStyles = makeStyles((theme) => ({
  card: {
    marginTop: '10vh',
    marginBottom: '24px',
    width: 350,
    height: 50,
    borderRadius: 5,
    border: '3px solid #954bb4',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '10px',
    position: 'relative',
    margin: '0 auto'
  },
  resultCard: {
    marginTop: '10vh',
    border: '3px solid #954bb4',
  },
  imageCard: {
    height: 300,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: '24px'
  },
  questionCard: {
    marginTop: '5vh',
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
  nameCard: {
    border: '3px solid #954bb4',
    padding: '10px',
    margin: '10px',
    maxWidth: 300,
    display: 'flex',
  },
  optionCard: {
    border: '3px solid #954bb4',
    marginBottom: '10px',
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
  nameContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
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
  page: {
    display: 'flex',
    width: '100%',
    height: '81vh',
  },
  button: {
    padding: '3px 8px',
    width: '20px'
  }
}))

const AdminGame = () => {
  const classes = useStyles()
  const navigate = useNavigate()
  const { quizid, sessionid } = useParams()
  const [players, setPlayers] = useState([])
  const [position, setPosition] = useState(-1)
  const [update, setUpdate] = useState(false)
  const [lastQStarted, setLastQStarted] = useState(null)
  const [remainingTime, setRemainingTime] = useState();
  const [currentQ, setCurrentQ] = useState({});
  const [currentTopFiveScore, setCurrentTopFiveScore] = useState([]);
  const colors = ['#9575cd', '#4fc3f7', '#e57373', '#dce775', '#ffb74d', '#81c784']

  // bar chart
  const [options, setOptions] = useState()

  const fetchQuestions = () => {
    return new Promise((resolve) => {
      apiFetch('GET', `admin/session/${sessionid}/status`)
        .then((response) => {
          resolve(response.results.questions)
        })
    })
  }

  const handleStart = () => {
    if (players.length < -1) {
      toastError('need at least one player to start the game')
    } else {
      handleAdvance()
    }
  }

  const handleAdvance = () => {
    apiFetch('POST', `admin/quiz/${quizid}/advance`, {})
      .then((response) => {
        console.log(`response is ${JSON.stringify(response)}`)
        setPosition(response.stage)
        console.log('set position')
        setUpdate(!update)
      })
  }

  const handleEnd = () => {
    apiFetch('POST', `admin/quiz/${quizid}/end`, {})
      .then(() => {
        setPosition(-2)
        setUpdate(!update)
      })
  }

  const Timer = () => {
    useEffect(() => {
      const interval = setInterval(() => {
        const diff = Math.round((new Date() - new Date(lastQStarted)) / 1000);
        setRemainingTime(Math.max(0, currentQ.timeLimit - diff));
      }, 1000);
      return () => clearInterval(interval)
    }, [lastQStarted]);
    return <Typography variant='h5'>{remainingTime}</Typography>
  }

  // for calculating final result scores
  const calculateScore = (answeredAt, questionStartedAt, point, timeLimit) => {
    const timeTakenToAnswer = Math.round((new Date(answeredAt) - new Date(questionStartedAt)) / 1000)
    const score = (1 - (timeTakenToAnswer / timeLimit)) * point
    return Math.round(score)
  }

  async function getCurrentResults () {
    const questions = await fetchQuestions()
    let currentScore = []
    apiFetch('GET', `admin/session/${sessionid}/results`)
      .then((response) => {
        const playerResults = response.results
        let tmpPlayers = [];
        let tmpNumCorrectPlayers = [];
        // loop through each player
        for (let i = 0; i < playerResults.length; i++) {
          let tmpScore = 0;
          let tmpNumOfCorrect = 0;
          tmpNumCorrectPlayers = [...tmpNumCorrectPlayers, { question: `question ${i + 1}`, number: 0 }]
          // loop through each answers and add correct count to number
          console.log('answer length: ' + playerResults[i].answers.length)
          for (let j = 0; j < playerResults[i].answers.length; j++) {
            if (playerResults[i].answers[j].correct === true) {
              tmpScore += calculateScore(
                playerResults[i].answers[j].answeredAt,
                playerResults[i].answers[j].questionStartedAt,
                questions[j].point,
                questions[j].timeLimit
              )
              tmpNumOfCorrect += 1;
              if (j === i) {
                tmpNumCorrectPlayers[i].number += 1;
              }
            }
          }
          tmpPlayers = [...tmpPlayers, {
            name: playerResults[i].name,
            score: tmpScore,
            numOfCorrect: tmpNumOfCorrect
          }]
        }
        console.log('the number of correct', tmpNumCorrectPlayers);
        tmpPlayers.sort((a, b) => (a.score > b.score) ? -1 : 1);
        console.log('order of players', tmpPlayers);
        currentScore = tmpPlayers;
        const tmpTopFive = [];
        for (let i = 0; i < tmpPlayers.length && i < 5; i++) {
          tmpTopFive.push({
            order: i + 1,
            name: tmpPlayers[i].name,
            score: tmpPlayers[i].score,
            numOfCorrect: tmpPlayers[i].numOfCorrect
          });
        }
        console.log('current score,', currentScore);
        console.log('current top five score,', tmpTopFive);
        setCurrentTopFiveScore(tmpTopFive);

        const correctRate = [];
        for (let i = 0; i < tmpNumCorrectPlayers.length; i++) {
          correctRate.push({
            argument: tmpNumCorrectPlayers[i].question,
            value: tmpNumCorrectPlayers[i].question / playerResults.length
          })
        }
        console.log('correct rate', correctRate);
        setOptions({
          grid: { top: 8, right: 8, bottom: 24, left: 36 },
          xAxis: {
            type: 'category',
            data: correctRate.argument,
          },
          yAxis: {
            type: 'value',
          },
          series: [
            {
              data: correctRate.value,
              type: 'bar',
            },
          ],
          tooltip: {
            trigger: 'axis',
          },
        })
      });
  }

  // the useEffect will trigger after advance or end or initialize
  // the player record are also included just for immediate effect upon screen load
  // rather than wait for polling
  useEffect(() => {
    apiFetch('GET', `admin/session/${sessionid}/status`)
      .then((response) => {
        // if the session is active
        if (response.results.active) {
          // if it is in quiz, record the last question starting time and get the quesitons
          if (response.results.isoTimeLastQuestionStarted) {
            setPosition(response.results.position)
            setLastQStarted(response.results.isoTimeLastQuestionStarted)
            setCurrentQ(response.results.questions[response.results.position])
          // if it is in waiting room, record the players
          } else {
            setPosition(-1)
            setPlayers(response.results.players)
          }
        // if the session is not active, move to position -2 (result)
        } else {
          setPosition(-2)
          getCurrentResults()
        }
      })
  }, [update])

  // polling for user joining display
  useEffect(() => {
    let interval = null
    interval = setInterval(() => {
      apiFetch('GET', `admin/session/${sessionid}/status`)
        .then((response) => {
          // if the session is active
          if (response.results.active) {
            // if it is in waiting room, record the players
            if (!response.results.isoTimeLastQuestionStarted) {
              setPosition(-1)
              setPlayers(response.results.players)
            } else {
              clearInterval(interval)
            }
          } else {
            clearInterval(interval)
          }
        })
    }, 3000)
    return () => clearInterval(interval);
  }, [])

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
      {(position === -1) &&
        <div className={classes.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" className={classes.button} style={{ backgroundColor: '#e57373' }} onClick={() => handleEnd()}>End Game</Button>
            <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
              <Person style={{ fontSize: 40 }}/>
              <Typography variant='h5'>{players.length}</Typography>
            </div>
            <Button variant="contained" className={classes.button} color="secondary" onClick={() => handleStart()}>Start Game</Button>
          </div>
          <Card className={classes.card}>
            <Typography variant='h5' >Join Session: { sessionid }</Typography>
          </Card>
          <div className={classes.nameContainer}>
            {players.map((player) => (
              <Card className={classes.nameCard} key={`${player}${Math.random()}`}>
                <Typography variant='h5' >{ player }</Typography>
              </Card>))}
          </div>
        </div>
      }
      {(position > -1) &&
        <div className={classes.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="contained" className={classes.button} style={{ backgroundColor: '#e57373' }} onClick={() => handleEnd()}>End Game</Button>
            <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
              <WatchLater style={{ fontSize: 40 }}/>
              <Timer />
            </div>
            <Button variant="contained" className={classes.button} color="secondary" onClick={() => handleAdvance()}>{ (remainingTime !== 0) ? 'Skip Question' : 'Next Question' }</Button>
          </div>
          {(remainingTime > 0) &&
            <>
              <Card className={classes.questionCard}>
                <CardContent>
                  <Typography className={classes.questionText} >{ currentQ.name }</Typography>
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
                { currentQ.options && <>{currentQ.options.map((option, index) => (
                  <Card className={classes.optionCard} key={`${option.optionid}`} style={{ backgroundColor: colors[index], width: '30%' }}>
                    <Typography variant='h5' >{ option.optionName }</Typography>
                  </Card>))}</>}
              </div>
            </>
          }
          {(remainingTime === 0) &&
            <Card className={classes.questionCard}>
              <Typography className={classes.questionText} >Time&apos;s Up!</Typography>
            </Card>
          }
        </div>
      }
      {(position === -2) &&
        <div className={classes.container}>
          <Typography variant='h5'>Current Result</Typography>
            <Card className={classes.resultCard}>
              <Typography style={{ fontWeight: 'bold', fontStyle: 'italic', margin: '10px' }}>
              Scores of each question are calculated by multiplying the question&apos;s point worth by time taken to answer divided by the time limit of the question
              </Typography>
              <TableContainer component={Paper}>
                <Table sx={{ minwIDTH: 650 }} aria-labelledby='TopFivePlayersResults'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Player order</TableCell>
                      <TableCell aligen='right'>Player name</TableCell>
                      <TableCell aligen='right'>Scores</TableCell>
                      <TableCell aligen='right'># Correct questions </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentTopFiveScore && <> {currentTopFiveScore.map((row) => (
                      <TableRow
                        key={`${row.order}`}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component={'th'} scope='row'>{row.order}</TableCell>
                        <TableCell aligen='right'>{row.name}</TableCell>
                        <TableCell aligen='right'>{row.score}</TableCell>
                        <TableCell aligen='right'>{row.numOfCorrect}</TableCell>
                      </TableRow>
                    ))}</>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
            {options && <ReactECharts option={options} />}
            <Button variant="contained" className={classes.button} color="secondary" onClick={() => { navigate('/dashboard') }}>Leave</Button>
        </div>
      }
    </div>
  )
}

export default AdminGame;
