import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

import Pagination from '../components/pagination.jsx';

function EpisodesPage() {
    const [loading, setLoading] = useState(true);
    const [episodesData, setEpisodesData] = useState(undefined);
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
        setPageNumberAPI(Math.ceil(displayPage / 4));
    }, [page]);

    useEffect(() => {
        async function fetchEpisodes() {
            try{
                const {data} = await axios.get(`https://rickandmortyapi.com/api/episode/?page=${pageNumberAPI}`);
                setEpisodesData(data);
                setError(null);
            } catch (e) {
                console.log(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        fetchEpisodes();
    }, [pageNumberAPI]);
    
    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(error?.response?.status === 404) return <ErrorPage />;

    const pageQuarter = (pageNumber - 1) % 4;
    const episodeCount = episodesData.info.count;
    const perPage = 5;

    const nextPage = () => {
        if(pageQuarter === 3) setPageNumberAPI(pageNumberAPI + 1);
        setPageNumber(pageNumber + 1);
    };

    const previousPage = () => {
        if(pageQuarter === 0) setPageNumberAPI(pageNumberAPI - 1);
        setPageNumber(pageNumber - 1);
    };

    const start = pageQuarter * perPage;
    const episodeDisplayData = episodesData.results.slice(start, start + perPage);

     function createDateString(date) {
        const grab = date.slice(0,10);
        const parts = grab.split('-');
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    return (
        <div>
            {episodeDisplayData.map((episode) => {
            return (
                <div key={episode.id}>
                    <Link to={`/episodes/${episode.id}`}>
                        <h3>{episode.name}</h3>
                    </Link>
                    <h4>{episode.episode}</h4>
                    <h4>{createDateString(episode.created)}</h4>
                    <br />
                </div>
            )
            })}
            <Pagination
                pageNumber={pageNumber}
                count={episodeCount}
                perPage={perPage}
                next={nextPage}
                previous={previousPage}
            />
      </div>
    );
};

export default EpisodesPage;