import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import './App.css';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Panel from './pages/Panel';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups'
import Expenses from './pages/Expenses';
import Settlements from './pages/Settlements';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Logout from './pages/Logout';
import RequireAuth from "./components/RequireAuth";
import GroupDetail from './pages/GroupDetail';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login/>} />
        <Route element={<RequireAuth />}>
        <Route path="/panel" element={<Panel />} >
          <Route index element={<Dashboard />} />
          <Route path='dashboard' element={<Dashboard/>} />
          <Route path='groups' element={<Groups/>} />
          <Route path='groups/:groupId' element={<GroupDetail />} />
          <Route path='expenses' element={<Expenses/>} />
          <Route path='settlements' element={<Settlements/>} />
          <Route path='notifications' element={<Notifications/>} />
          <Route path='profile' element={<Profile/>} />
          <Route path='logout' element={<Logout/>} />
        </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

