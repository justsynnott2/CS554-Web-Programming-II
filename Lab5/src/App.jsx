import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import {Route, Link, Routes} from 'react-router-dom';

import './App.css'
import Home from './pages/Home.jsx';
import CharactersPage from './pages/CharactersPage.jsx';
import Character from './pages/Character.jsx';
import LocationsPage from './pages/LocationsPage.jsx';
import Location from './pages/Location.jsx';
import EpisodesPage from './pages/EpisodesPage.jsx';
import Episode from './pages/Episode.jsx';

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/characters/page/:page' element={<CharactersPage />}></Route>
        <Route path='/characters/:id' element={<Character />}></Route>
        <Route path='/locations/page/:page' element={<LocationsPage />}></Route>
        <Route path='/locations/:id' element={<Location />}></Route>
        <Route path='/episodes/page/:page' element={<EpisodesPage />}></Route>
        <Route path='/episodes/:id' element={<Episode />}></Route>
      </Routes>
    </div>
  )
}

export default App
