import { useState } from 'react'
import {NavLink, Route, Routes} from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import InstructorList from './pages/InstructorList';
import Instructor from './pages/Instructor';
import CourseList from './pages/CourseList';
import Course from './pages/Course';
import StudentList from './pages/StudentList';
import Student from './pages/Student';

function App() {
  return (
    <div>
      <header>
      <h1>Student Information System</h1>
        <nav>
          <NavLink to='/'>Home</NavLink> {' | '}
          <NavLink to='/instructors'>Instructors</NavLink> {' | '}
          <NavLink to='/courses'>Courses</NavLink> {' | '}
          <NavLink to='/students'>Students</NavLink>
        </nav>
      </header>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/instructors' element={<InstructorList />} />
        <Route path='/instructors/:id' element={<Instructor />} />
        <Route path='/courses' element={<CourseList />} />
        <Route path='/courses/:id' element={<Course />} />
        <Route path='/students' element={<StudentList />} />
        <Route path='/students/:id' element={<Student />} />
      </Routes>
    </div>
  )
}

export default App;
