import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

function Character(props) {
    const [characterData, setCharacterData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let {id} = useParams();

    const [episodeData, setEpisodeData] = useState(null);
    const [episodesLoading, setEpisodesLoading] = useState(true);

    function ErrorPage() {
        return (
            <div>
                <h2>404 Not Found</h2>
                <h4>Page Not Found!</h4>
            </div>
        );
    }

    useEffect(() => {
        async function fetchCharacter() {
            try {
                const {data} = await axios.get(`https://rickandmortyapi.com/api/character/${id}`);
                setCharacterData(data);
            } catch (e) {
                console.log(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCharacter();
    }, [id]);

    useEffect(() => {
        async function fetchEpisodes(){
            if (!characterData) return;
            const characterEpisodes = characterData.episode;
            const episodeIds = characterEpisodes.map((episodeUrl) => {
                return episodeUrl.split('/').pop();
            })
            const combinedIds = episodeIds.join();
            try{
                const {data} = await axios.get(`https://rickandmortyapi.com/api/episode/${combinedIds}`);
                const convertArray = Array.isArray(data) ? data : [data];
                setEpisodeData(convertArray);
                setEpisodesLoading(false);
            } catch(e){
                console.log(e);
            }
        }
        fetchEpisodes();
    }, [characterData]);

    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(!characterData) return <ErrorPage />;

    function createDateString(date) {
        const grab = date.slice(0,10);
        const parts = grab.split('-');
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    const originURL = characterData.origin?.url || '';
    const locationURL = characterData.location?.url || '';
    const originId = originURL ? originURL.split('/').pop() : null;
    const locationId = locationURL ? locationURL.split('/').pop() : null;

    return (
        <div>
            <h1>{characterData.name}</h1>
            <img src={characterData.image} alt={characterData.name} />
            <p><strong>Status:</strong> {characterData.status}</p>
            <p><strong>Species:</strong> {characterData.species}</p>
            <p><strong>Gender:</strong> {characterData.gender}</p>
            {characterData.type !== "" ? <p><strong>Type:</strong> {characterData.type}</p> : <p><strong>Type:</strong> N/A</p>}
            <p><strong>Created:</strong> {createDateString(characterData.created)}</p>
            <br />

            {originId ? <Link to={`/locations/${originId}`}>
                <p><strong>Origin:</strong> {characterData.origin.name}</p>
            </Link> : <p><strong>Origin: Unknown</strong></p>}

            {locationId ? <Link to={`/locations/${locationId}`}>
                <p><strong>Current Location:</strong> {characterData.location.name}</p>
            </Link> : <p><strong>Current Location: Unknown</strong></p>}

            <br />
            <p><strong>Episodes:</strong></p>
            {episodesLoading && <p>Loading Episodes...</p>}
            {!episodesLoading && characterData && (
                <ul>
                    {episodeData.map((episode) => {
                        return (
                            <li key={episode.id}>
                                <Link to={`/episodes/${episode.id}`}>Episode {episode.id}: {episode.name}</Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default Character;