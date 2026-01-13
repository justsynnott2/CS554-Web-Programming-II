import React, {useState, useEffect} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {useSelector, useDispatch} from 'react-redux';
import * as actions from '../actions';

const Trainers = () => {
    const dispatch = useDispatch();
    const allTrainers = useSelector((state) => state.trainers.trainers);

    const [showAddForm, setShowAddForm] = useState(false);
    const [formName, setFormName] = useState('');

    const handleChange = (e) => {
        setFormName(e.target.value)
    };

    const handleAddTrainer = (e) => {
        e.preventDefault();
        if(formName.trim().length === 0){
            alert('Trainer name cannot be empty!');
            return;
        }
        dispatch(actions.addTrainer(formName.trim()));
        setFormName('');
        setShowAddForm(false);
    }

    const handleDeleteTrainer = (trainer) => {
        dispatch(actions.deleteTrainer(trainer.id));
    }

    const handleSelectTrainer = (trainer) => {
        dispatch(actions.selectTrainer(trainer.id));
    }

    const handleUnselectTrainer = (trainer) => {
        dispatch(actions.unselectTrainer(trainer.id));
    }

    return (
        <div className='allTrainers'>
            <button className='addTrainer' onClick={() => setShowAddForm(!showAddForm)}>{showAddForm ? ('Close') : ('Add Trainer')}</button>
            <br/><br/>
            {showAddForm && 
                <form onSubmit={handleAddTrainer}>
                    <label>
                        Trainer:&nbsp;
                        <input
                            onChange={(e) => handleChange(e)}
                            id="name"
                            name='name'
                            type='text'
                            placeholder='Trainer Name'
                        />
                    </label>
                    <br/><br/>
                    <button type='submit'>Add Trainer</button>
                </form>
            }
            <div className='trainerList'>
                {allTrainers.map((trainer) => {
                    return (
                        <section key={trainer.id}>
                            <div className='trainerManager'>
                                <h3>{trainer.name}</h3>
                                {trainer.selected ? (
                                    <button onClick={() => handleUnselectTrainer(trainer)}>Selected</button>
                                ) : (
                                    <>
                                        <button onClick={() => handleDeleteTrainer(trainer)}>Delete Trainer</button>
                                        <button onClick={() => handleSelectTrainer(trainer)}>Select Trainer</button>
                                    </>
                                )}
                            </div>
                            <div className='trainerTeam'>
                                {trainer.team.length > 0 &&
                                    trainer.team.map((pokemon) => {
                                        return (
                                            <div>
                                                <Link to={`/pokemon/${pokemon.id}`}>
                                                    <img src={pokemon.art}></img>
                                                </Link>
                                            </div>
                                        )
                                    })    
                                }
                            </div>
                        </section>)
                })}
            </div>
        </div>
    );
}

export default Trainers;