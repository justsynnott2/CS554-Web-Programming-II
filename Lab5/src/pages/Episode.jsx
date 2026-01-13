import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

function Episode(props) {
    const [episodeData, setEpisodeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let {id} = useParams();

    const [characterData, setCharacterData] = useState(null);
    const [charactersLoading, setCharactersLoading] = useState(true);

    function ErrorPage() {
        return (
            <div>
                <h2>404 Not Found</h2>
                <h4>Page Not Found!</h4>
            </div>
        );
    }

    useEffect(() => {
        async function fetchEpisode() {
            try {
                const {data} = await axios.get(`https://rickandmortyapi.com/api/episode/${id}`);
                setEpisodeData(data);
            } catch (e) {
                console.log(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        fetchEpisode();
    }, [id]);

    useEffect(() => {
        async function fetchCharacters(){
            if (!episodeData) return;
            const episodeCharacters = episodeData.characters;
            const characterIds = episodeCharacters.map((characterUrl) => {
                return characterUrl.split('/').pop();
            })
            const combinedIds = characterIds.join();
            try{
                const {data} = await axios.get(`https://rickandmortyapi.com/api/character/${combinedIds}`);
                const convertArray = Array.isArray(data) ? data : [data];
                setCharacterData(convertArray);
                setCharactersLoading(false);
            } catch(e){
                console.log(e);
            }
        }
        fetchCharacters();
    }, [episodeData]);

    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(!episodeData) return <ErrorPage />;

    function createDateString(date) {
        const grab = date.slice(0,10);
        const parts = grab.split('-');
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    return (
        <div>
            <h1>{episodeData.name}</h1>
            <p><strong>Air Date:</strong> {episodeData.air_date}</p>
            <p><strong>Episode:</strong> {episodeData.episode}</p>
            <p><strong>Created:</strong> {createDateString(episodeData.created)}</p>
            <br />

            <p><strong>Characters:</strong></p>
            {charactersLoading && <p>Loading Characters...</p>}
            {!charactersLoading && characterData.length === 0 && <p>No Characters</p>}
            {!charactersLoading && episodeData && (
                <ul>
                    {characterData.map((character) => {
                        return (
                            <li key={character.id}>
                                <Link to={`/characters/${character.id}`}>{character.name}</Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default Episode;