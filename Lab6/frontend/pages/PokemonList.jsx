import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as actions from '../actions';
import axios from 'axios';

const PokemonList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const allTrainers = useSelector((state) => state.trainers.trainers);
    const selectedTrainer = allTrainers.find((trainer) => trainer.selected) ?? null;
    const trainerTeam = selectedTrainer?.team ?? [];

    const {pagenum} = useParams();
    const pageNumInt = parseInt(pagenum);

    const [loading, setLoading] = useState(false);
    const [pageData, setPageData]= useState(null);
    const [error, setError] = useState(null);

    function ErrorPage() {
        return (
            <div>
                <h2>404 Not Found</h2>
                <h4>Page Not Found!</h4>
            </div>
        );
    }

    useEffect(() => {
        if (!/^\d+$/.test(pagenum)) {
            setError('404');
            return;
        }
        setError(null);
    }, [pagenum]);

    useEffect(() => {
        if (error) return;
        const fetchPage = async () => {
            setLoading(true);
            try{
                const {data} = await axios.get(`/api/pokemon/page/${pagenum}`);
                setPageData(data);
            } catch (e) {
                console.log(e);
                setError('404');
            } finally {
                setLoading(false);
            }
        }
        fetchPage();
    }, [pagenum, error]);

    const getPokemonId = (url) => {
        const id =  url.split('/');
        return id[id.length-2];
    }

    const getPokemonArt = (id) => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }

    const handleCatch = (pokemon) => {
        const id = getPokemonId(pokemon.url)
        dispatch(actions.catchPokemon(id, pokemon.name, getPokemonArt(id)));
    }

    const handleRelease = (pokemon) => {
        const id = getPokemonId(pokemon.url)
        dispatch(actions.releasePokemon(id));
    }

    const inTeam = (pokemon) => {
        const id = getPokemonId(pokemon.url)
        return trainerTeam.some((partyMember) => partyMember.id === id);
    }

    const nextPage = () => {
        navigate(`/pokemon/page/${pageNumInt + 1}`);
    };

    const previousPage = () => {
        navigate(`/pokemon/page/${pageNumInt - 1}`);
    };

    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(error === '404') return <ErrorPage />;

    const results = pageData?.results ?? [];

    return (
        <div>
            <br/><br/><br/><br/>
            {pageNumInt > 0 && <button onClick={previousPage}>Previous</button>}
            {pageData && pageData.results.length === 60 && <button onClick={nextPage}>Next</button>}

            {results.map((pokemon) => {
                const id = getPokemonId(pokemon.url);
                return (
                    <div key={id}>
                        <Link to={`/pokemon/${id}`}>
                            <img src={getPokemonArt(id)}></img>
                        </Link>
                        <h4>{pokemon.name}</h4>
                        {selectedTrainer && inTeam(pokemon) && <button onClick={() => handleRelease(pokemon)}>Release</button>}
                        {selectedTrainer && !inTeam(pokemon) && <button onClick={() => handleCatch(pokemon)}>{trainerTeam.length < 6 ? ("Catch") : ("Party Full")}</button>}
                    </div>
                )
            })}
        </div>
    )

}

export default PokemonList;