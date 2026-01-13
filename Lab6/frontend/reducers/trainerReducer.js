import {v4 as uuid} from 'uuid';

const initialState = {
    trainers: [
        {id: uuid(), name: "Red", team: [], selected: false}
    ]
};

const trainerReducer = (state = initialState, action) => {
    const {type, payload} = action;

    switch (type) {
        case 'ADD_TRAINER':
            const newTrainer = {
                id: uuid(),
                name: payload.name,
                team: [],
                selected: false
            }
            return {
                ...state,
                trainers: [...state.trainers, newTrainer]
            };
        case 'DELETE_TRAINER':
            return {
                ...state,
                trainers: state.trainers.filter((trainer) => trainer.id !== payload.id)
            };
        case 'SELECT_TRAINER':
            return {
                ...state, 
                trainers: state.trainers.map((trainer) => {
                    return {
                        ...trainer,
                        selected: trainer.id === payload.id
                    }
                })
            };
        case 'CATCH_POKEMON':
            return {
                ...state,
                trainers: state.trainers.map((trainer) => {
                    if(!trainer.selected) return trainer;
                    if(trainer.team.length >= 6) return trainer;
                    return {
                        ...trainer,
                        team: [...trainer.team, action.payload]
                    };
                })
            };
        case 'RELEASE_POKEMON':
            return {
                ...state,
                trainers: state.trainers.map((trainer) => {
                    if(!trainer.selected) return trainer;
                    const newTeam = [...trainer.team];
                    const index = newTeam.findIndex((p) => p.id === action.payload.id);
                    if(index != -1) newTeam.splice(index, 1);
                    return {
                        ...trainer,
                        team: newTeam
                    };
                })
            };
        default:
            return state;
    }
}

export default trainerReducer;