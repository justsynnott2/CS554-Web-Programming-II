import { useState } from 'react';
import './App.css';
import {NavLink, Route, Routes} from 'react-router-dom';

import Home from './pages/Home';
import Trainers from './pages/Trainers';
import PokemonList from './pages/PokemonList';
import Pokemon from './pages/Pokemon';

function App() {

  return (
    <div>
      <header className='App-header'>
        <h1 className='App-title'>React-Redux Context API</h1>
        <nav className='center'>
          <NavLink className='navlink' to='/'>
            Home
          </NavLink>
          <NavLink className='navlink' to='/trainers'>
            Pokemon Trainers
          </NavLink>
          <NavLink className='navlink' to='/pokemon/page/0'>
            Pokemon
          </NavLink>
        </nav>
      </header>
      <br/><br/><br/><br/>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/trainers' element={<Trainers />} />
        <Route path='/pokemon/page/:pagenum' element={<PokemonList />} />
        <Route path='/pokemon/:id' element={<Pokemon />}/>
      </Routes>
    </div>
  )
}

export default App;
