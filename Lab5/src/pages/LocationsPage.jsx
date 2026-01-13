import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

import Pagination from '../components/pagination.jsx';

function LocationsPage() {
    const [loading, setLoading] = useState(true);
    const [locationsData, setLocationsData] = useState(undefined);
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
        async function fetchLocations() {
            try{
                const {data} = await axios.get(`https://rickandmortyapi.com/api/location/?page=${pageNumberAPI}`);
                setLocationsData(data);
                setError(null);
            } catch (e) {
                console.log(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        fetchLocations();
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
    const locationCount = locationsData.info.count;
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
    const locationDisplayData = locationsData.results.slice(start, start + perPage);

    return (
        <div>
            {locationDisplayData.map((location) => {
            return (
                <div key={location.id}>
                    <Link to={`/locations/${location.id}`}>
                        <h3>{location.name}</h3>
                    </Link>
                </div>
            )
            })}
            <Pagination
                pageNumber={pageNumber}
                count={locationCount}
                perPage={perPage}
                next={nextPage}
                previous={previousPage}
            />
      </div>
    );
};

export default LocationsPage;