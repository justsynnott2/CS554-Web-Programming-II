import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';
import Modal from '../components/Modal';
import helpers from '../components/helpers';

function InstructorList() {
    const [query, setQuery] = useState(queries.GET_INSTRUCTORS);
    const [queryVariables, setQueryVariables] = useState({});

    const [showInstructorAddModal, setInstructorShowAddModal] = useState(false);
    const [showInstructorEditModal, setShowInstructorEditModal] = useState(false);
    const [editInstructor, setEditInstructor] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [searchDepartment, setSearchDepartment] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');

    const {loading, error, data} = useQuery(query, {
        variables: queryVariables,
        fetchPolicy: 'cache-and-network'
    });

    const [removeInstructor] = useMutation(queries.REMOVE_INSTRUCTOR, {
        update(cache, {data: {removeInstructor}}){
            const {instructors} = cache.readQuery({
                query: queries.GET_INSTRUCTORS
            });
            cache.writeQuery({
                query: queries.GET_INSTRUCTORS,
                data: {instructors: instructors.filter((instructor) => instructor._id !== removeInstructor._id)}
            });
        }
    });

    const handleAddInstructorModal = () => {
        setInstructorShowAddModal(!showInstructorAddModal);
    }

    const handleEditInstructorModal = (instructor) => {
        if(instructor) setEditInstructor(instructor);
        setShowInstructorEditModal(!showInstructorEditModal);
    }

    const handleDeleteInstructor = (instructor) => {
        removeInstructor({
            variables: {
                id: instructor._id
            }
        });
        alert("Instructor Deleted");
    }

    const handleFilterByDepartment = (e) => {
        e.preventDefault();
        setSearchStartDate('');
        setSearchEndDate('');
        document.getElementById('searchStartDate').value = '';
        document.getElementById('searchEndDate').value = '';

        if(searchDepartment.trim().length === 0) return resetFilters();
        setQuery(queries.GET_INSTRUCTOR_BY_DEPARTMENT);
        setQueryVariables({department: searchDepartment});
    }

    const pad = (n) => n.toString().padStart(2, '0');

    const handleFilterByHirePeriod = (e) => {
        e.preventDefault();
        setSearchDepartment('');
        document.getElementById('searchDepartment').value = '';

        let startDate = searchStartDate;
        let endDate = searchEndDate;
        if(startDate.trim().length === 0) startDate = '01/01/1900';
        if(endDate.trim().length === 0){
            const today = new Date();
            endDate =  `${pad(today.getMonth() + 1)}/${pad(today.getDate())}/${today.getFullYear()}`;
        }
        setQuery(queries.GET_INSTRUCTOR_HIRED_BETWEEN);
        setQueryVariables({
            start: startDate,
            end: endDate
        });
        setSearchStartDate(startDate);
        setSearchEndDate(endDate);
    }

    const resetFilters = () => {
        setSearchDepartment('');
        document.getElementById('searchDepartment').value = '';
        setSearchStartDate('');
        setSearchEndDate('');
        document.getElementById('searchStartDate').value = '';
        document.getElementById('searchEndDate').value = '';
        setQuery(queries.GET_INSTRUCTORS);
        setQueryVariables({});
    }

    if (loading) {
        return <div>Loading</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    }
    else{
        let instructors = [];
        if(data.instructors) instructors = data.instructors;
        else if(data.getInstructorsByDepartment) instructors = data.getInstructorsByDepartment;
        else if(data.getInstructorsHiredBetween) instructors = data.getInstructorsHiredBetween;
        return (
            <div>
                {/* Modals for Add and Edit */}
                {showInstructorAddModal && <Modal
                    type='Instructor'
                    method='Add'
                    showModal={showInstructorAddModal}
                    closeFormState={handleAddInstructorModal}
                />}
                {showInstructorEditModal && <Modal
                    instructor={editInstructor}
                    type='Instructor'
                    method="Edit"
                    showModal={showInstructorEditModal}
                    closeFormState={handleEditInstructorModal}
                />}
                <br/>
                {/* Both Filter Forums */}
                <button onClick={() => {setShowFilters(!showFilters)}}>{!showFilters ? 'Show Filters' : 'Hide Filters'}</button>
                {showFilters && <div>
                    <form id='departmentFilter' onSubmit={handleFilterByDepartment}>
                        <label>Department: </label>
                        <input id="searchDepartment" defaultValue={searchDepartment} placeholder='Department' onChange={(e) => setSearchDepartment(e.target.value)}></input>
                        <button>Filter</button>
                    </form>
                    <form id='hirePeriodFilter' onSubmit={handleFilterByHirePeriod}>
                        <label>Hired Between: </label>
                        <input id="searchStartDate" defaultValue={searchStartDate} placeholder='Start Date' onChange={(e) => setSearchStartDate(e.target.value)}></input>
                        <input id="searchEndDate" defaultValue={searchEndDate} placeholder='End Date' onChange={(e) => setSearchEndDate(e.target.value)}></input>
                        <button>Filter</button>
                    </form>
                    <button onClick={resetFilters}>Reset Filters</button>
                </div>}
                <br/>
                <br/>
                {/* Add Button */}
                <button onClick={handleAddInstructorModal}>Add Instructor</button>
                <br/>
                <br/>
                {/* List of Instructors */}
                {instructors.map((instructor) => {
                    return(
                        <div key={instructor._id}>
                            <Link to={`/instructors/${instructor._id}`}>
                                <h3>{instructor.first_name} {instructor.last_name}</h3>
                            </Link>
                            <h4>{helpers.CapitilizeString(instructor.department)} Department</h4>
                            <h4>Hired On: {instructor.date_hired}</h4>
                            <h4>{instructor.numOfClassesTaught} Classes</h4>
                            <button onClick={() => {handleEditInstructorModal(instructor)}}>Edit</button>
                            <button onClick={() => {handleDeleteInstructor(instructor)}}>Delete</button>
                            <br/>
                            <br/>
                        </div>
                    )
                })}
            </div>
        )
    }

}

export default InstructorList;