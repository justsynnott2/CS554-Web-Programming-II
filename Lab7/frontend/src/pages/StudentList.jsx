import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';
import Modal from '../components/Modal';
import helpers from '../components/helpers';

function StudentList() {
    const [query, setQuery] = useState(queries.GET_STUDENTS);
    const [queryVariables, setQueryVariables] = useState({});

    const [showStudentAddModal, setStudentShowAddModal] = useState(false);
    const [showStudentEditModal, setShowStudentEditModal] = useState(false);
    const [editStudent, setEditStudent] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [searchMajor, setSearchMajor] = useState('');
    const [searchLastName, setSearchLastName] = useState('');

    const {loading, error, data} = useQuery(query, {
        variables: queryVariables,
        fetchPolicy: 'cache-and-network'
    });

    const [removeStudent] = useMutation(queries.REMOVE_STUDENT, {
        update(cache, {data: {removeStudent}}){
            const {students} = cache.readQuery({
                query: queries.GET_STUDENTS
            });
            cache.writeQuery({
                query: queries.GET_STUDENTS,
                data: {students: students.filter((student) => student._id !== removeStudent._id)}
            });
        }
    });

    const handleAddStudentModal = () => {
        setStudentShowAddModal(!showStudentAddModal);
    };

    const handleEditStudentModal = (student) => {
        if(student) setEditStudent(student);
        setShowStudentEditModal(!showStudentEditModal);
    };

    const handleDeleteStudent = (student) => {
        removeStudent({
            variables: {
                id: student._id
            }
        });
        alert("Student Deleted");
    };

    const handleFilterByMajor = (e) => {
        e.preventDefault();
        setSearchLastName('');
        document.getElementById('searchLastName').value = '';

        if(searchMajor.trim().length === 0) return resetFilters();
        setQuery(queries.GET_STUDENTS_BY_MAJOR);
        setQueryVariables({major: searchMajor});
    };

    const handleFilterByLastName = (e) => {
        e.preventDefault();
        setSearchMajor('');
        document.getElementById('searchMajor').value = '';

        if(searchLastName.trim().length === 0) return resetFilters();
        setQuery(queries.SEARCH_STUDENTS_BY_LAST_NAME);
        setQueryVariables({searchTerm: searchLastName});
    };

    const resetFilters = () => {
        setSearchMajor('');
        document.getElementById('searchMajor').value = '';
        setSearchLastName('');
        document.getElementById('searchLastName').value = '';
        setQuery(queries.GET_STUDENTS);
        setQueryVariables({});
    };

    if (loading) {
        return <div>Loading</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    } else {
        let students = [];
        if(data.students) students = data.students;
        else if(data.getStudentsByMajor) students = data.getStudentsByMajor;
        else if(data.searchStudentsByLastName) students = data.searchStudentsByLastName;

        return (
            <div>
                {/* Modals for Add and Edit */}
                {showStudentAddModal && <Modal
                    type='Student'
                    method='Add'
                    showModal={showStudentAddModal}
                    closeFormState={handleAddStudentModal}
                />}
                {showStudentEditModal && <Modal
                    student={editStudent}
                    type='Student'
                    method="Edit"
                    showModal={showStudentEditModal}
                    closeFormState={handleEditStudentModal}
                />}
                <br/>
                {/* Both Filter Forums */}
                <button onClick={() => {setShowFilters(!showFilters)}}>{!showFilters ? 'Show Filters' : 'Hide Filters'}</button>
                {showFilters && <div>
                    <form id='majorFilter' onSubmit={handleFilterByMajor}>
                        <label>Major: </label>
                        <input id="searchMajor" defaultValue={searchMajor} placeholder='Major' onChange={(e) => setSearchMajor(e.target.value)}></input>
                        <button>Filter</button>
                    </form>
                    <form id='lastNameFilter' onSubmit={handleFilterByLastName}>
                        <label>Last Name: </label>
                        <input id="searchLastName" defaultValue={searchLastName} placeholder='Last Name' onChange={(e) => setSearchLastName(e.target.value)}></input>
                        <button>Filter</button>
                    </form>
                    <button onClick={resetFilters}>Reset Filters</button>
                </div>}
                <br/>
                <br/>
                {/* Add Button */}
                <button onClick={handleAddStudentModal}>Add Student</button>
                <br/>
                <br/>
                {/* List of Courses */}
                {students.map((student) => {
                    return (
                        <div key={student._id}>
                            <Link to={`/students/${student._id}`}>
                                <h3>{student.first_name} {student.last_name}</h3>
                            </Link>
                            <h4>{helpers.CapitilizeString(student.major)} Major</h4>
                            <h4>Enrolled in {student.numOfEnrolledCourses} Courses</h4>
                            <button onClick={() => {handleEditStudentModal(student)}}>Edit</button>
                            <button onClick={() => {handleDeleteStudent(student)}}>Delete</button>
                            <br/>
                            <br/>
                        </div>
                    )
                })}
            </div>
        )
    }


}

export default StudentList;