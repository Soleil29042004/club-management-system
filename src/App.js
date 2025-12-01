import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/dashboard" element={<div>Student Dashboard</div>} />
        <Route path="/club-leader/dashboard" element={<div>Club Leader Dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>Admin Dashboard</div>} />
      </Routes>
    </Router>
  );
}

export default App;
