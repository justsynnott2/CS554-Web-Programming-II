import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as actions from '../actions';
import axios from 'axios';

const Pokemon = () => {
    const dispatch = useDispatch();

    const allTrainers = useSelector((state) => state.trainers.trainers);
    const selectedTrainer = allTrainers.find((trainer) => trainer.selected) ?? null;
    const trainerTeam = selectedTrainer?.team ?? [];

    const {id} = useParams();

    const [loading, setLoading] = useState(false);
    const [pokemon, setPokemon]= useState(null);
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
        if (!/^\d+$/.test(id)) {
            setError("Page Not Found");
            return;
        }
    }, [id]);

    useEffect(() => {
        if (error) return;
        const fetchPokemon = async () => {
            setLoading(true);
            try{
                const {data} = await axios.get(`/api/pokemon/${id}`);
                setPokemon(data);
            } catch (e) {
                console.log(e);
                setError('404');
            } finally {
                setLoading(false);
            }
        }
        fetchPokemon();
    }, [id]);

    const getPokemonArt = (id) => {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }

    const handleCatch = (id) => {
        dispatch(actions.catchPokemon(id, pokemon.name, getPokemonArt(id)));
    }

    const handleRelease = (id) => {
        dispatch(actions.releasePokemon(id));
    }

    const inTeam = (id) => {
        return trainerTeam.some((partyMember) => partyMember.id === String(id));
    }

    if (loading) {
        return (
            <div>
                <h2>Loading....</h2>
            </div>
        );
    }

    if(error === '404') return <ErrorPage />;
    if (!pokemon) return null;

    return (
        <div className="pokemonDetail">
            <h1>{pokemon.name}</h1>
            {pokemon.types.map((type) => {
                return (
                    <div key={type.type.name}>
                        <h3>{type.type.name}</h3>
                    </div>
                )
            })}
            <img src={getPokemonArt(pokemon.id)} alt={pokemon.name}></img>
            {selectedTrainer && inTeam(pokemon.id) && <button onClick={() => handleRelease(String(pokemon.id))}>Release</button>}
            {selectedTrainer && !inTeam(pokemon.id) && <button onClick={() => handleCatch(String(pokemon.id))}>{trainerTeam.length < 6 ? ('Catch') : ('Party Full')}</button>}
        </div>
    )

}

export default Pokemon;