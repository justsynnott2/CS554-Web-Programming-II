const addTrainer = (name) => ({
    type: 'ADD_TRAINER',
    payload: {name: name}
});

const deleteTrainer = (id) => ({
    type: 'DELETE_TRAINER',
    payload: {id: id}
});

const selectTrainer = (id) => ({
    type: 'SELECT_TRAINER',
    payload: {id: id}
});

const catchPokemon = (id, name, art) => ({
    type: 'CATCH_POKEMON',
    payload: {
        id: id,
        name: name,
        art: art
    }
});

const releasePokemon = (id) => ({
    type: 'RELEASE_POKEMON',
    payload: {id: id}
});

export {addTrainer, deleteTrainer, selectTrainer, catchPokemon, releasePokemon};