import React from 'react';
import {Route, Link, Routes} from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Rick and Morty API Application</h1>
      <h3>Welcome to the Rick and Morty API Application! This app allows you to explore characters, episodes, and locations from the Rick and Morty universe. Use the navigation links to browse through different sections of the app.</h3>
    <br />
      <nav>
        <Link to={"/characters/page/1"}>Characters</Link> | {" "}
        <Link to={"/locations/page/1"}>Locations</Link> | {" "}
        <Link to={"/episodes/page/1"}>Episodes</Link>
      </nav>
    </div>
  );
}

export default Home;