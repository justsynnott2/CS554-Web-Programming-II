import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useParams} from 'react-router-dom';

function Location(props) {
    const [locationData, setLocationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let {id} = useParams();

    const [residentData, setResidentData] = useState(null);
    const [residentsLoading, setResidentsLoading] = useState(true);

    function ErrorPage() {
        return (
            <div>
                <h2>404 Not Found</h2>
                <h4>Page Not Found!</h4>
            </div>
        );
    }

    useEffect(() => {
        async function fetchLocation() {
            try {
                const {data} = await axios.get(`https://rickandmortyapi.com/api/location/${id}`);
                setLocationData(data);
            } catch (e) {
                console.log(e);
                setError(e);
            } finally {
                setLoading(false);
            }
        }
        fetchLocation();
    }, [id]);

    useEffect(() => {
        async function fetchResidents(){
            if (!locationData) return;
            const locationResidents = locationData.residents;
            const residentIds = locationResidents.map((residentUrl) => {
                return residentUrl.split('/').pop();
            })
            const combinedIds = residentIds.join();
            try{
                const {data} = await axios.get(`https://rickandmortyapi.com/api/character/${combinedIds}`);
                const convertArray = Array.isArray(data) ? data : [data];
                setResidentData(convertArray);
                setResidentsLoading(false);
            } catch(e){
                console.log(e);
            }
        }
        fetchResidents();
    }, [locationData]);

    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(!locationData) return <ErrorPage />;

    function createDateString(date) {
        const grab = date.slice(0,10);
        const parts = grab.split('-');
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }

    return (
        <div>
            <h1>{locationData.name}</h1>
            <p><strong>Type:</strong> {locationData.type}</p>
            <p><strong>Dimension:</strong> {locationData.dimension}</p>
            <p><strong>Created:</strong> {createDateString(locationData.created)}</p>
            <br />

            <p><strong>Residents:</strong></p>
            {residentsLoading && <p>Loading Residents...</p>}
            {!residentsLoading && residentData.length === 0 && <p>No Residents</p>}
            {!residentsLoading && locationData && (
                <ul>
                    {residentData.map((resident) => {
                        return (
                            <li key={resident.id}>
                                <Link to={`/characters/${resident.id}`}>{resident.name}</Link>
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}

export default Location;