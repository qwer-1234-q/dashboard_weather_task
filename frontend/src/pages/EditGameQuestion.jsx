/* eslint-disable no-restricted-globals */
/* eslint-disable react/jsx-no-comment-textnodes */
import {
  Typography, Button, Grid, Radio, Container, TextField,
  FormControl, FormLabel, RadioGroup, FormControlLabel, MenuItem, Menu
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { apiFetch, fileToDataUrl, toastError } from '../helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { React, useEffect, useState } from 'react';
// styled-components

const useStyles = makeStyles(() => ({
  AppBar: {
    color: 'primary',
  },
  menuBook: {
    marginRight: '10px'
  },
  text: {
    marginTop: '100px'
  },
  grid: {
    padding: '10px',
    width: '100%'
  },
  container: {
    marginBottom: '96px',
    marginTop: '48px',
    width: '100%'
  },
  timeInput: {
    backgroundcolour: 'rgba(96, 108, 110, 0.15)',
    height: '40 px',
    width: '100%',
    padding: '10 px',
    color: '#606c6a'
  },
  singleSelect: {
    padding: '5%',
    borderRadius: '5%',
    color: 'white',
  },
  hide: {
    display: 'none'
  },
  show: { }
}));

const optionsNumber = [
  { value: '0' },
  { value: '1' },
  { value: '2' },
  { value: '3' },
  { value: '4' },
  { value: '5' },
  { value: '6' },
];

const EditGameQuestion = () => {
  const navigate = useNavigate();
  const { quizid, questionid } = useParams();
  const classes = useStyles();
  const [name, setName] = useState('');
  const [type, setType] = useState(optionsNumber[1].value);
  const [point, setPoint] = useState(0);
  const [timeLimit, setTimeLimit] = useState(10);
  const [url, setUrl] = useState('');
  const [videoURL, setVideoURL] = useState(optionsNumber[0].value);
  const [options, setOptions] = useState([]);
  const [optionsNum, setOptionsNum] = useState(optionsNumber[2].value);
  const [optionid1, setOptionid1] = useState(-1);
  const [optionid2, setOptionid2] = useState(-1);
  const [optionid3, setOptionid3] = useState(-1);
  const [optionid4, setOptionid4] = useState(-1);
  const [optionid5, setOptionid5] = useState(-1);
  const [optionid6, setOptionid6] = useState(-1);
  const [optionName1, setOptionName1] = useState('');
  const [optionName2, setOptionName2] = useState('');
  const [optionName3, setOptionName3] = useState('');
  const [optionName4, setOptionName4] = useState('');
  const [optionName5, setOptionName5] = useState('');
  const [optionName6, setOptionName6] = useState('');
  const [optionCorrect1, setOptionCorrect1] = useState('true');
  const [optionCorrect2, setOptionCorrect2] = useState('false');
  const [optionCorrect3, setOptionCorrect3] = useState('false');
  const [optionCorrect4, setOptionCorrect4] = useState('false');
  const [optionCorrect5, setOptionCorrect5] = useState('false');
  const [optionCorrect6, setOptionCorrect6] = useState('false');
  const [tmpQuestions, setTmpQuestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(-1);

  const generateOptionID = () => {
    const existingIDs = options.map((option) => option.optionid);
    let id;
    do {
      id = Math.floor(Math.random() * 100000);
    } while (existingIDs.includes(id));
    return id;
  };

  useEffect(() => {
    apiFetch('GET', `admin/quiz/${quizid}`)
      .then((response) => {
        console.log(response);
        console.log(response.questions);
        setTmpQuestions(response.questions);
        console.log('current questions:', response.questions);
        let tmpIndex = -1;
        for (let i = 0; i < response.questions.length; i++) {
          if (parseInt(questionid) === parseInt(response.questions[i].questionid)) {
            setIndex(i);
            console.log('got it, ', index, tmpIndex);
            tmpIndex = i;
            break;
          }
        }
        let optionsLength = 0;
        console.log('index of quesiton: ', index, tmpIndex);
        if (tmpIndex >= 0 && tmpIndex < response.questions.length) {
          setName(response.questions[tmpIndex].name);
          setType(response.questions[tmpIndex].type);
          setPoint(response.questions[tmpIndex].point);
          setTimeLimit(response.questions[tmpIndex].timeLimit);
          setUrl(response.questions[tmpIndex].url);
          setVideoURL(response.questions[tmpIndex].videoURL);
          setOptions(response.questions[tmpIndex].options);
          optionsLength = response.questions[tmpIndex].options.length;
          if (optionsLength >= 2 && optionsLength < 7) {
            setOptionsNum(optionsNumber[optionsLength].value);
            console.log('question options:', options, '\n', response.questions[tmpIndex].options);
          }
        }
        console.log('question name:', name);
        console.log('question type:', type);
        console.log('question point:', point);
        console.log('question timeLimit:', timeLimit);
        console.log('question url:', url);
        console.log('question video or url:', videoURL);
        console.log('question length: ', optionsNum, ', ', optionsLength);
        if (optionsLength > 1) {
          console.log('add options id 1');
          setOptionid1(response.questions[tmpIndex].options[0].optionid);
          console.log('add options id 2');
          setOptionid2(response.questions[tmpIndex].options[1].optionid);
          console.log('add options name 1', response.questions[tmpIndex].options[0].optionName);
          if (response.questions[tmpIndex].options[0].optionName) {
            setOptionName1(response.questions[tmpIndex].options[0].optionName);
          }
          console.log('add options name 2', response.questions[tmpIndex].options[1].optionName);
          if (response.questions[tmpIndex].options[1].optionName) {
            setOptionName2(response.questions[tmpIndex].options[1].optionName);
          }
          console.log('add options correct 1');
          setOptionCorrect1(response.questions[tmpIndex].options[0].optionCorrect);
          console.log('add options correct 2');
          setOptionCorrect2(response.questions[tmpIndex].options[1].optionCorrect);
          console.log('add options');
        }
        console.log('option 1 name: ', optionName1);
        console.log('option 2 name: ', optionName2);
        for (let i = 3; i <= response.questions[tmpIndex].options.length; i++) {
          if (i === 3) {
            setOptionid3(response.questions[tmpIndex].options[2].optionid);
            setOptionName3(response.questions[tmpIndex].options[2].optionName);
            setOptionCorrect3(response.questions[tmpIndex].options[2].optionCorrect);
          }
          if (i === 4) {
            setOptionid4(response.questions[tmpIndex].options[3].optionid);
            setOptionName4(response.questions[tmpIndex].options[3].optionName);
            setOptionCorrect4(response.questions[tmpIndex].options[3].optionCorrect);
          }
          if (i === 5) {
            setOptionid5(response.questions[tmpIndex].options[4].optionid);
            setOptionName5(response.questions[tmpIndex].options[4].optionName);
            setOptionCorrect5(response.questions[tmpIndex].options[4].optionCorrect);
          }
          if (i === 6) {
            setOptionid6(response.questions[tmpIndex].options[5].optionid);
            setOptionName6(response.questions[tmpIndex].options[5].optionName);
            setOptionCorrect6(response.questions[tmpIndex].options[5].optionCorrect);
          }
        }
      });
  }, []);

  const handleChangeUrl = (event) => {
    if (videoURL === '2') {
      setUrl(event.target.value);
    } else if (videoURL === '1') {
      console.log('file', event.target.files);
      fileToDataUrl(event.target.files[0]).then(url => {
        console.log('url file', url);
        setUrl(url);
      })
    }
  }

  const handleMenuClick = () => {
    setOpen(!open)
  }

  const handleClickOption = (optionNum) => {
    setOptionsNum(optionNum)
    setOpen(false)
  }

  function handleSubmit (event) {
    event.preventDefault();
    const payload = {};
    console.log('sumbit question id: ', questionid);
    payload.questionid = questionid;
    payload.name = name;
    payload.type = type;
    payload.timeLimit = timeLimit;
    payload.point = point;
    payload.url = url;
    payload.videoURL = videoURL;
    const tmpOptions = [];
    if (parseInt(videoURL) === 2) {
      if (!url.includes('youtube') && !url.includes('youtu.be')) {
        return toastError('please input a correct type of Youtube video');
      }
    }
    if (optionName1) {
      tmpOptions.push({
        optionid: optionid1 > -1 ? optionid1 : generateOptionID(),
        optionName: optionName1,
        optionCorrect: optionCorrect1
      })
    }
    if (optionName2) {
      tmpOptions.push({
        optionid: optionid2 > -1 ? optionid2 : generateOptionID(),
        optionName: optionName2,
        optionCorrect: optionCorrect2
      })
    }
    if (optionName3) {
      tmpOptions.push({
        optionid: optionid3 > -1 ? optionid3 : generateOptionID(),
        optionName: optionName3,
        optionCorrect: optionCorrect3
      })
    }
    if (optionid4) {
      tmpOptions.push({
        optionid: optionid4 > -1 ? optionid4 : generateOptionID(),
        optionName: optionName4,
        optionCorrect: optionCorrect4
      })
    }
    if (optionName5) {
      tmpOptions.push({
        optionid: optionid5 > -1 ? optionid5 : generateOptionID(),
        optionName: optionName5,
        optionCorrect: optionCorrect5
      })
    }
    if (optionid6) {
      tmpOptions.push({
        optionid: optionid6 > -1 ? optionid6 : generateOptionID(),
        optionName: optionName6,
        optionCorrect: optionCorrect6
      })
    }
    const addTmpQuestions = tmpQuestions;
    payload.options = tmpOptions;
    console.log('update payload=', payload);
    console.log('update add tmp questions', addTmpQuestions);
    console.log('final index:', index);
    if (index >= addTmpQuestions.length || index === -1) {
      addTmpQuestions.push(payload);
      console.log('update with push');
    } else {
      addTmpQuestions[index] = payload;
      console.log('update with index');
    }
    const finalQuestions = {};
    finalQuestions.questions = addTmpQuestions;
    console.log('update final Questions: ', finalQuestions);
    apiFetch('PUT', 'admin/quiz/' + quizid, finalQuestions)
      .then(() => {
        return navigate('/editQuiz/' + quizid);
      });
  }

  return (
    <div className='EditGameQuestion'>
      <Container fixed maxWidth='md' className={classes.container}>
        <Typography className={classes.text} component='h1' variant='h5'>Add/Edit question details</Typography>
        <Button component='h1' onClick={() => navigate('/editQuiz/' + quizid)}>Back to dashboard</Button>
        <form noValidate onSubmit={handleSubmit}>
          <Grid container alignItems='center' direction='column'>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='qusetion-name'
                label='Question'
                name='qusetion-name'
                type='text'
                value={name}
                // eslint-disable-next-line no-restricted-globals
                onChange={() => setName(event.target.value)}
              />
            </Grid>
            <Grid item className={classes.grid}>
              <FormControl component={'fieldset'}>
                // eslint-disable-next-line react/jsx-no-comment-textnodes
                <FormLabel component={'legend'}>Question type</FormLabel>
                // eslint-disable-next-line no-restricted-globals
                <RadioGroup aria-label='question type' name='questionType' value={type} onChange={() => setType(event.target.value)}>
                  <FormControlLabel value={optionsNumber[1].value} control={<Radio />} label='Single choice (only one correct)'/>
                  <FormControlLabel value={optionsNumber[2].value} control={<Radio />} label='Mutiple choice (more than two correct)'/>
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='question-point'
                label='Point'
                name='question-point'
                type='int'
                value={point}
                // eslint-disable-next-line no-restricted-globals
                onChange={() => setPoint(event.target.value)}
              />
            </Grid>
            <Grid item className={classes.grid}>
              <TextField
                id='question-timeLimit'
                label='Time Limit: second'
                name='question-timeLimit'
                value={timeLimit}
                min={0}
                max={10000}
                step={1}
                type='number'
                // eslint-disable-next-line no-restricted-globals
                onChange={() => setTimeLimit(event.target.value)}
                className={classes.timeInput}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item className={classes.grid}>
              <FormControl component={'fieldset'}>
                <FormLabel component={'legend'}>Upload an image or attach a Video URL (Youtube) </FormLabel>
                // eslint-disable-next-line no-restricted-globals, no-restricted-globals, no-restricted-globals
                <RadioGroup aria-label='video or URL' name='videoOrURL' value={videoURL} onChange={() => setVideoURL(event.target.value)}>
                  <FormControlLabel value={optionsNumber[0].value} control={<Radio />} label='Nothing'/>
                  <FormControlLabel value={optionsNumber[1].value} control={<Radio />} label='Upload an image (file, PNG or JPG)'/>
                  <FormControlLabel value={optionsNumber[2].value} control={<Radio />} label='Attach a Video (URL)'/>
                </RadioGroup>
                <TextField
                  variant='outlined'
                  id='video'
                  name='video'
                  type='file'
                  onChange={handleChangeUrl}
                  width='100%'
                  className={videoURL === '1' ? classes.show : classes.hide}
                />
                <TextField
                  variant='outlined'
                  id='url'
                  label='URL (youtube video)'
                  name='url'
                  type='text'
                  onChange={handleChangeUrl}
                  width='100%'
                  className={videoURL === '2' ? classes.show : classes.hide}
                />
              </FormControl>
            </Grid>
            <Grid item className={classes.grid}>
              <FormControl component={'fieldset'}>
                <FormLabel component={'legend'}> Add mutiple options of this question (at least 2 and cannot more than 6) </FormLabel>
                <Button
                  variant='outlined'
                  id='numberOfOptions'
                  name='numberOfOptions'
                  lable='Number of options'
                  value={optionsNum}
                  aria-expanded={open ? 'true' : undefined}
                  aria-controls={open ? 'selectNumberOptionsMenu' : undefined}
                  aria-haspopup='true'
                  onClick={handleMenuClick}
                >
                  Number of Options
                </Button>
                <Menu
                  id='selectNumberOptionsMenu'
                  aria-labelledby='numberOfOptions'
                  anchorEl={() => { return <></> }}
                  open={open}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={() => handleClickOption(optionsNumber[2].value)}> 2 </MenuItem>
                  <MenuItem onClick={() => handleClickOption(optionsNumber[3].value)}> 3 </MenuItem>
                  <MenuItem onClick={() => handleClickOption(optionsNumber[4].value)}> 4 </MenuItem>
                  <MenuItem onClick={() => handleClickOption(optionsNumber[5].value)}> 5 </MenuItem>
                  <MenuItem onClick={() => handleClickOption(optionsNumber[6].value)}> 6 </MenuItem>
                </Menu>
              </FormControl>
            </Grid>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='option1'
                label='Option 1'
                name='option1'
                type='text'
                value={optionName1}
                // eslint-disable-next-line no-restricted-globals
                onChange={() => setOptionName1(event.target.value)}
              />
              <FormControl component={'fieldset'}>
                <FormLabel component={'legend'}>Option correct/incorrect</FormLabel>
                // eslint-disable-next-line no-restricted-globals
                <RadioGroup aria-label='Option true/false 1' name='optionCorrect1' value={optionCorrect1} onChange={() => setOptionCorrect1(event.target.value)}>
                  <FormControlLabel value='true' control={<Radio />} label='True / Correct answer'/>
                  <FormControlLabel value='false' control={<Radio />} label='False / Incorrect answer'/>
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item className={classes.grid}>
              <TextField
                variant='outlined'
                id='option2'
                label='Option 2'
                name='option2'
                type='text'
                value={optionName2}
                onChange={() => setOptionName2(event.target.value)}
              />
              <FormControl component={'fieldset'}>
                <FormLabel component={'legend'}>Option 2 correct/incorrect</FormLabel>
                <RadioGroup aria-label='Option true/false 2' name='optionCorrect2' value={optionCorrect2} onChange={() => setOptionCorrect2(event.target.value)}>
                  <FormControlLabel value='true' control={<Radio />} label='True / Correct answer'/>
                  <FormControlLabel value='false' control={<Radio />} label='False / Incorrect answer'/>
                </RadioGroup>
              </FormControl>
            </Grid>
            {
              (optionsNum === '3' || optionsNum === '4' || optionsNum === '5' || optionsNum === '6') &&
              <Grid item className={classes.grid}>
                <TextField
                  variant='outlined'
                  id='option3'
                  label='Option 3'
                  name='option3'
                  type='text'
                  value={optionName3}
                  // eslint-disable-next-line no-restricted-globals
                  onChange={() => setOptionName3(event.target.value)}
                />
                <FormControl component={'fieldset'}>
                  <FormLabel component={'legend'}>Option 3 correct/incorrect</FormLabel>
                  // eslint-disable-next-line no-restricted-globals
                  <RadioGroup aria-label='Option true/false 3' name='optionCorrect3' value={optionCorrect3} onChange={() => setOptionCorrect3(event.target.value)}>
                    <FormControlLabel value='true' control={<Radio />} label='True / Correct answer'/>
                    <FormControlLabel value='false' control={<Radio />} label='False / Incorrect answer'/>
                  </RadioGroup>
                </FormControl>
              </Grid>
            }
            {
              (optionsNum === '4' || optionsNum === '5' || optionsNum === '6') &&
              <Grid item className={classes.grid}>
                <TextField
                  variant='outlined'
                  id='option4'
                  label='Option 4'
                  name='option4'
                  type='text'
                  value={optionName4}
                  onChange={() => setOptionName4(event.target.value)}
                />
                <FormControl component={'fieldset'}>
                  <FormLabel component={'legend'}>Option 4 correct/incorrect</FormLabel>
                  <RadioGroup aria-label='Option true/false 4' name='optionCorrect4' value={optionCorrect4} onChange={() => setOptionCorrect4(event.target.value)}>
                    <FormControlLabel value='true' control={<Radio />} label='True / Correct answer'/>
                    <FormControlLabel value='false' control={<Radio />} label='False / Incorrect answer'/>
                  </RadioGroup>
                </FormControl>
              </Grid>
            }
            {
              (optionsNum === '5' || optionsNum === '6') &&
              <Grid item className={classes.grid}>
                <TextField
                  variant='outlined'
                  id='option5'
                  label='Option 5'
                  name='option5'
                  type='text'
                  value={optionName5}
                  onChange={() => setOptionName5(event.target.value)}
                />
                <FormControl component={'fieldset'}>
                  <FormLabel component={'legend'}>Option 5 correct/incorrect</FormLabel>
                  <RadioGroup aria-label='Option true/false 5' name='optionCorrect5' value={optionCorrect5} onChange={() => setOptionCorrect5(event.target.value)}>
                    <FormControlLabel value='true' control={<Radio />} label='True / Correct answer'/>
                    <FormControlLabel value='false' control={<Radio />} label='False / Incorrect answer'/>
                  </RadioGroup>
                </FormControl>
              </Grid>
            }
            {
              (optionsNum === '6') &&
              <Grid item className={classes.grid}>
                <TextField
                  variant='outlined'
                  id='option6'
                  label='Option 6'
                  name='option6'
                  type='text'
                  value={optionName6}
                  onChange={() => setOptionName6(event.target.value)}
                />
                <FormControl component={'fieldset'}>
                  <FormLabel component={'legend'}>Option 6 correct/incorrect</FormLabel>
                  <RadioGroup aria-label='Option true/false 6' name='optionCorrect6' value={optionCorrect6} onChange={() => setOptionCorrect6(event.target.value)}>
                    <FormControlLabel value='true' control={<Radio />} label='True / Correct answer'/>
                    <FormControlLabel value='false' control={<Radio />} label='False / Incorrect answer'/>
                  </RadioGroup>
                </FormControl>
              </Grid>
            }
          </Grid>
          <Grid container alignContent='flex-end' direction='column'>
            <Grid item className={ classes.grid }>
              <Button type='submit' variant='contained' color='primary'>Submit</Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </div>
  )
}

export default EditGameQuestion;
