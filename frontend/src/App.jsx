import { React, useState } from 'react';
import './App.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
// import EditQuiz from './pages/EditQuiz';
// import EditGameQuestion from './pages/EditGameQuestion';
import SignupPage from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditTask from './pages/EditTask';
// import Game from './pages/Game';
// import AdminGame from './pages/AdminGame';
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider } from './AuthContext';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/Navbar';
import 'react-toastify/dist/ReactToastify.min.css';

function App () {
  const [authDetails, setAuthDetails] = useState({
    token: localStorage.getItem('token'),
  });

  function setAuth (token) {
    localStorage.setItem('token', token);
    setAuthDetails(token);
  }

  return (
    <AuthProvider value={authDetails}>
      <BrowserRouter>
        <Routes>
          <Route path='/'
            element={
              <Navbar>{ <Login setAuth={setAuth} /> }</Navbar>
            }
          />
          <Route path='/login'
            element={
              <Navbar>{ <Login setAuth={setAuth} /> }</Navbar>
            }
          />
          <Route path='/signup'
            element={
              <Navbar>{ <SignupPage setAuth={setAuth} /> }</Navbar>
            }/>
          {/* <Route path='/game/:sessionid'
            element={
              <Navbar>{ <Game /> }</Navbar>
            }/>
          <Route path='/adminGame/:quizid/:sessionid'
            element={
              <Navbar>{ <AdminGame /> }</Navbar>
            }/> */}
          <Route path='/dashboard'
            element={
              <Navbar>{ <ProtectedRoute Component={Dashboard}/> }</Navbar>
            }
          />
          <Route path='/editTask/:taskid'
            element={
              <Navbar><ProtectedRoute Component={EditTask}/></Navbar>
            }
          /> */
          {/* <Route path='/editQuiz/:quizid'
            element={
              <Navbar>{ <ProtectedRoute Component={EditQuiz}/> }</Navbar>
            }
          />
          <Route path='/editQuiz/:quizid/Question/:questionid'
            element={
              <Navbar><ProtectedRoute Component={EditGameQuestion}/></Navbar>
            }
          /> */}
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
