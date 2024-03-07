import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import EditQuiz from './pages/EditQuiz';
import EditGameQuestion from './pages/EditGameQuestion';
import { Dashboard } from '@mui/icons-material';
import SignupPage from './pages/Register';
import QuizList from './components/QuizList'
import Game from './pages/Game';
import AdminGame from './pages/AdminGame';
import { toast } from 'react-toastify'

describe('LoginButton', () => {
  it('should render button', () => {
    const setAuth = jest.fn()
    render(
      <BrowserRouter>
        <Login setAuth/>
      </BrowserRouter>
    );
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  })
  it('should trigger the submit function when clicked', () => {
    const setAuth = jest.fn()
    render(
      <BrowserRouter>
        <Login setAuth/>
      </BrowserRouter>
    );
    const mockHandleSubmit = jest.fn();
    const button = screen.getByRole('button', { name: /login/i });
    userEvent.click(button);
    expect(button).toHaveAttribute('type', 'submit')
    expect(mockHandleSubmit).toHaveBeenCalled();
    expect(mockHandleSubmit.mock.calls.length).toBe(1);
  });
})

describe('GameCard', () => {
  it('should reder Game Card buttons when start session is clicked', () => {
    render(
      <BrowserRouter>
        <QuizList quizzes={[{ "questions": [{},{}], "name": "My first quiz", "thumbnail":
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="},]}
          refresh={() => {}} />
      </BrowserRouter>
    );
    const button = screen.getByRole('button', { name: /start session/i });
    userEvent.click(button);
    expect(screen.getByText(/quiz: my first quiz/i)).toBeInTheDocument();
    expect(screen.getByText(/number of questions: 2/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end session/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admin control/i })).toBeInTheDocument();
  })

describe('Dashboard', () => {
  it('should render a add quiz button and pop up once clicked', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    screen.logTestingPlaygroundURL();
    const button = screen.getByRole('button', { name: /add a quiz/i });
    userEvent.click(button);
    expect(screen.getByText('Give it a Name')).toBeInTheDocument();
  })
})

describe('Game', () => {
  it('should allow user to input session id and nick name', () => {
    render(
      <BrowserRouter>
        <Game />
      </BrowserRouter>
    )
    const inputSession = screen.getByRole('textbox', {name: /sessionid/i})
    expect(inputSession).toBeInTheDocument();
    userEvent.change(inputSession, { target: { value: '123456' } });
    const nextButton = screen.getByRole('button', {name: /next/i})
    expect(nextButton).toBeInTheDocument();
    userEvent.click(nextButton)
    const inputNickname = screen.getByRole('textbox', {name: /nickname/i})
    expect(inputNickname).toBeInTheDocument();
    userEvent.change(inputSession, { target: { value: 'patten' } });
    const joinButton = screen.getByRole('button', {name: /join/i})
    expect(joinButton).toBeInTheDocument();
  })
})
})