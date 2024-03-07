import { Button, Grid, Container, TextField, IconButton, Card, CardMedia, 
    ToggleButtonGroup, ToggleButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { React, useEffect, useState } from 'react'
import { AddAPhoto } from '@mui/icons-material';
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

const EditTask = () => {
  const { taskid } = useParams();
  const classes = useStyles();
  const navigate = useNavigate();
  const [taskDescription, setTaskDescription] = useState([]);
  const [name, setName] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [status, setStatus] = useState('3');

  const handleEdit = (event) => {
    event.preventDefault();
    if (name !== undefined && name.length >= 1) {
      console.log(taskid);
      apiFetch('PUT', `admin/quiz/${taskid}`, {
        taskDescription,
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
  
  const handleChangeStatus = (event) => {
    setStatus(event.target.value);
  }

  const handleThumbnailUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      fileToDataUrl(file).then((url) => {
        setThumbnail(url);
      })
    }
  }
  
  const handleChangeDescription = (event) => {
    setTaskDescription(event.target.valuen);
  }

  useEffect(() => {
    apiFetch('GET', `admin/task/${taskid}`)
      .then((response) => {
        console.log(response);
        setTaskDescription(response.taskDescription);
        setName(response.name);
        setThumbnail(response.thumbnail);
        setStatus(response.setStatus);
      });
  }, []);

  return (
    <div className="EditTaskPage">
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
                <CardMedia className={classes.media} image={thumbnail} title="thumbnail" alt="task thumbnail"/>
              </label>
            </>}
          </Card>
          <div className={classes.grid}>
            <TextField
              variant='outlined'
              id='name'
              label='Task Name'
              name='name'
              type='text'
              fullWidth
              onChange={handleChangeName}
              value={name}
            />
          </div>
          <div className={classes.grid}>
            <TextField
              variant='outlined'
              id='description'
              label='Task Description'
              name='Description'
              type='text'
              fullWidth
              onChange={handleChangeDescription}
              value={taskDescription}
            />
          </div>
          <div className={classes.grid}>
            <ToggleButtonGroup
              orientation="vertical"
              value={status}
              exclusive 
              onChange={handleChangeStatus}
              label='task status'
              name='status'
              id='status'
            >
                <ToggleButton value='1'>
                    Completed
                </ToggleButton>
                <ToggleButton value='2'>
                    Processing
                </ToggleButton>
                <ToggleButton value='3'>
                    Haven't status
                </ToggleButton>
            </ToggleButtonGroup>
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

export default EditTask;
