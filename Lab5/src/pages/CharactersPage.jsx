import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

import Pagination from '../components/pagination.jsx';

function CharactersPage() {
    const [loading, setLoading] = useState(true);
    const [charactersData, setCharactersData] = useState(undefined);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageNumberAPI, setPageNumberAPI] = useState(1);
    const [error, setError] = useState(null);
    const {page} = useParams();

    function ErrorPage() {
        return (
            <div>
                <h2>404 Not Found</h2>
                <h4>Page Not Found!</h4>
            </div>
        );
    }

    if(isNaN(Number(page)) || Number(page) < 1 || !Number.isInteger(Number(page))) return <ErrorPage />;

    useEffect(() => {
        const displayPage = Number(page);
        setPageNumber(displayPage);
        setPageNumberAPI(Math.ceil(displayPage / 2));
    }, [page]);

    useEffect(() => {
        async function fetchCharacters() {
            try{
                const {data} = await axios.get(`https://rickandmortyapi.com/api/character/?page=${pageNumberAPI}`);
                setCharactersData(data);
                setError(null);
            } catch (e) {
                console.log(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        fetchCharacters();
    }, [pageNumberAPI]);
    
    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(error?.response?.status === 404) return <ErrorPage />;

    let charactersDisplayData = null;
    const isFirstHalf = pageNumber % 2 === 1;
    const pageHalf = (pageNumber - 1) % 2;
    const characterCount = charactersData.info.count;
    const perPage = 10;

    const nextPage = () => {
        if(pageHalf === 1) setPageNumberAPI(pageNumberAPI + 1);
        setPageNumber(pageNumber + 1);
    };

    const previousPage = () => {
        if(pageHalf === 0) setPageNumberAPI(pageNumberAPI - 1);
        setPageNumber(pageNumber - 1);
    };

    const start = pageHalf * perPage;
    charactersDisplayData = charactersData.results.slice(start, start + perPage);

    return (
        <div>
            {charactersDisplayData.map((character) => {
            return (
                <div key={character.id}>
                    <img src={character.image} alt={character.name}/>
                    <Link to={`/characters/${character.id}`}>
                        <h3>{character.name}</h3>
                    </Link>
                    <h4>Status: {character.status}</h4>
                </div>
            )
            })}
            <Pagination
                pageNumber={pageNumber}
                count={characterCount}
                perPage={perPage}
                next={nextPage}
                previous={previousPage}
            />
      </div>
    );
};

export default CharactersPage;