import {
    Card, CardHeader, CardContent, CardMedia, Button, IconButton,
    Divider
  } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { HighlightOff } from '@mui/icons-material'
import { React } from 'react';
import { useNavigate } from 'react-router-dom';
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

const TaskList = ({ tasks, refresh }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleEdit = (id) => {
    return navigate(`/editTask/${id}`)
  }

  const handleDelete = (id) => {
    apiFetch('DELETE', `admin/task/${id}`, {})
    refresh()
  }

return (
  <div className='TasksList'>
    {tasks && (
      <div className={classes.container} spacing={10}>
        {tasks.map((task) => (
          <div className='taskSummary' key={task.id}>
            <div className={classes.grid}>
                <Card variant='outlined' className={classes.card}>
                <h2 className={classes.header}>
                    <CardHeader title={`task: ${task.id}`} disableTypography/>
                    <IconButton onClick={() => handleDelete(task.id) }>
                    <HighlightOff color="primary"/>
                    </IconButton>
                </h2>
                {task.thumbnail && <CardMedia
                    className={classes.media}
                    image={task.thumbnail}
                    title='thumbnail'
                    alt='task thumbnail'
                />}
                <CardContent className={classes.content}>
                  <p>task: {task.name}</p>
                  <p>Description of task: {task.taskDescription}</p> 
                  {task.status === '1' && <p>Completion status: "Completed"</p>}
                  {task.status === '2' && <p>Completion status: "Processing"</p>}
                  {task.status === '3' && <p>Completion status: "Haven't started"</p>}
                </CardContent>
                <Divider />
                <div className={classes.buttonGroup}>
                    <Button variant="contained" className={classes.button} style={{ borderRadius: '0px' }} onClick={() => handleEdit(task.id)}>Edit task</Button>
                </div>
                </Card>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
};

export default TaskList;
