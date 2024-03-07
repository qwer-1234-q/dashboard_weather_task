import { Button, Grid, Container, TextField, IconButton, Card, CardMedia } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { React, useEffect, useState } from 'react'
import { AddAPhoto, AccessAlarm, Edit, Cancel, AddBox } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch, fileToDataUrl, toastError } from '../helpers';
import Navbar from '../components/Navbar';

const useStyles = makeStyles(() => ({
  AppBar: {
    color: 'primary',
  },
  grid: {
    marginBottom: '24px'
  },
  container: {
    marginBottom: '96px',
    marginTop: '10px'
  },
  card: {
    height: 300,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: '24px'
  },
  questionCard: {
    width: 'calc(100%-20)',
    borderRadius: 10,
    padding: 10
  },
  media: {
    height: '100%',
    width: '100%',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  iconButtons: {
    display: 'flex',
    float: 'right',
    alignItems: 'center'
  },
  iconButton: {
    justifyContent: 'flex-start',
    padding: '0px',
  },
}));

const EditQuiz = () => {
  const { quizid } = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  // const [tmpQ, setTmpQ] = useState();
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const handleEdit = (event) => {
    event.preventDefault();
    if (name !== undefined && name.length >= 1) {
      console.log(quizid);
      apiFetch('PUT', `admin/quiz/${quizid}`, {
        questions,
        name,
        thumbnail,
      });
    } else {
      toastError('Please input a valid name');
    }
    navigate('/dashboard');
  }

  const handleChangeName = (event) => {
    setName(event.target.value);
  }

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      fileToDataUrl(file).then((url) => {
        setThumbnail(url);
      })
    }
  }

  const handleDeleteQuestion = (id) => {
    const updatedQuestions = questions.filter(question => question.questionid !== id);
    setQuestions(updatedQuestions);
  }

  const generateQuestionID = () => {
    const existingIDs = questions.map((question) => question.questionid);
    let id;
    do {
      id = Math.floor(Math.random() * 100000);
    } while (existingIDs.includes(id));
    return id;
  }

  const handleAddQuestion = () => {
    // const dummyQuestion = {
    //   name: '',
    //   options: [],
    //   point: 0,
    //   type: '1',
    //   url: null,
    //   videoURL: '0',
    //   timeLimit: 0,
    //   questionid: generateQuestionID(),
    // };
    // questions.push(dummyQuestion);
    // console.log('add a question: ', questions);
    // console.log('dummy question: ', dummyQuestion);
    // const payload = {};
    // payload.questions = questions
    const questionid = generateQuestionID();
    console.log('add a question id is:', questionid);
    return navigate(`/editQuiz/${quizid}/question/${questionid}`);
    // apiFetch('PUT', `admin/quiz/${quizid}`, payload).then(() => {
    //   console.log('add question id: ', dummyQuestion.questionid);
    // });
  };

  // useEffect(() => {
  //   console.log('add a question: ', questions);
  //   apiFetch('PUT', `admin/quiz/${quizid}`, {
  //     questions,
  //   }).then(() => {
  //     return navigate(`/editQuiz/${quizid}/question/${questions[questions.length - 1].questionid}`);
  //   });
  // }, [tmpQ])

  useEffect(() => {
    apiFetch('GET', `admin/quiz/${quizid}`)
      .then((response) => {
        console.log(response);
        setQuestions(response.questions);
        setName(response.name);
        setThumbnail(response.thumbnail);
      });
  }, []);

  return (
    <div className="EditGamePage">
      <Navbar />
      <Container fixed maxWidth='md' className={classes.container}>
        <Grid container direction='column'>
          <Card className={classes.card}>
            <input accept="image/*" id="icon-button-file" type="file" hidden onChange={handleThumbnailUpload}/>
            { !thumbnail && <>
              <label htmlFor="icon-button-file">
                <IconButton className={classes.iconButton} aria-label="AddAPhoto" component="span" >
                  <AddAPhoto style={{ fontSize: 280 }}/>
                </IconButton>
              </label>
            </>}
            { thumbnail && <>
              <label htmlFor="icon-button-file">
                <CardMedia className={classes.media} image={thumbnail} title="thumbnail" alt="quiz thumbnail"/>
              </label>
            </>}
          </Card>
          <div className={classes.grid}>
            <TextField
              variant='outlined'
              id='name'
              label='Quiz Name'
              name='name'
              type='text'
              fullWidth
              onChange={handleChangeName}
              value={name}
            />
          </div>
          {questions && <>{questions.map((question) => (
            <div className='question' key={question.questionid}>
              <Card className={classes.questionCard}>
                <p className={classes.cardContent}>Question: {question.name}</p>
                <span style={{ display: 'flex', alignItems: 'center' }}><p>Type: {(parseInt(question.type) === 1) ? 'single answer' : 'multiple answers'} | Points: {question.point} |</p><AccessAlarm style={{ marginLeft: '5px' }}/> <p>: {question.timeLimit}</p></span>
              </Card>
              <div className={classes.iconButtons}>
                <IconButton onClick={() => navigate(`/editQuiz/${quizid}/question/${question.questionid}`)}>
                  <Edit/>
                </IconButton>
                <IconButton onClick={() => handleDeleteQuestion(question.questionid) }>
                  <Cancel />
                </IconButton>
              </div>
            </div>
          ))}</>}
          <div style={{ display: 'flex', marginBottom: '24px', alignItems: 'center' }}>
            <IconButton className={classes.iconButton} onClick={ handleAddQuestion }>
              <AddBox/>
            </IconButton>
            <p style={{ margin: '0px 0px 0px 5px' }}>Add a Question </p>
          </div>
          <div className={classes.buttonGroup}>
            <Button variant='contained' style={{ backgroundColor: '#888' }} onClick={() => navigate('/dashboard')}>Cancel Changes</Button>
            <Button variant='contained' color='primary' onClick={ handleEdit }>Save Changes</Button>
          </div>
        </Grid>
      </Container>
    </div>
  );
};

export default EditQuiz;
