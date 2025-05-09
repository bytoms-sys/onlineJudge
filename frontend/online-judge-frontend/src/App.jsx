import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import Navbar from './Components/Navbar.jsx';
import Footer from './Components/Footer.jsx';
import Login from './Components/Login.jsx';
import Register from './Components/Register.jsx';
import Home from './Components/Home.jsx'; // Assuming you have a Home component
import './index.css'; // Assuming you have a CSS file for styling

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;