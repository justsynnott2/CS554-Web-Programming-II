import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';
import Modal from '../components/Modal';
import helpers from '../components/helpers';

function CourseList() {
    const [query, setQuery] = useState(queries.GET_COURSES);
    const [queryVariables, setQueryVariables] = useState({});

    const [showCourseAddModal, setCourseShowAddModal] = useState(false);
    const [showCourseEditModal, setShowCourseEditModal] = useState(false);
    const [editCourse, setEditCourse] = useState(false);

    const [showFilters, setShowFilters] = useState(false);
    const [searchDepartment, setSearchDepartment] = useState('');
    const [searchStartDate, setSearchStartDate] = useState('');
    const [searchEndDate, setSearchEndDate] = useState('');

    const {loading, error, data} = useQuery(query, {
        variables: queryVariables,
        fetchPolicy: 'cache-and-network'
    });

    const [removeCourse] = useMutation(queries.REMOVE_COURSE, {
        update(cache, {data: {removeCourse}}){
            const {courses} = cache.readQuery({
                query: queries.GET_COURSES
            });
            cache.writeQuery({
                query: queries.GET_COURSES,
                data: {courses: courses.filter((course) => course._id !== removeCourse._id)}
            });
        }
    });

    const handleAddCourseModal = () => {
        setCourseShowAddModal(!showCourseAddModal);
    };

    const handleEditCourseModal = (course) => {
        if(course) setEditCourse(course);
        setShowCourseEditModal(!showCourseEditModal);
    };

    const handleDeleteCourse = (course) => {
        removeCourse({
            variables: {
                id: course._id
            }
        });
        alert("Course Deleted");
    };

    const handleFilterByDepartment = (e) => {
        e.preventDefault();
        setSearchStartDate('');
        setSearchEndDate('');
        document.getElementById('searchStartDate').value = '';
        document.getElementById('searchEndDate').value = '';

        if(searchDepartment.trim().length === 0) return resetFilters();
        setQuery(queries.GET_COURSES_BY_DEPARTMENT);
        setQueryVariables({department: searchDepartment});
    };

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
        setQuery(queries.GET_COURSES_BY_DATE_RANGE);
        setQueryVariables({
            start: startDate,
            end: endDate
        });
        setSearchStartDate(startDate);
        setSearchEndDate(endDate);
    };

    const resetFilters = () => {
        setSearchDepartment('');
        document.getElementById('searchDepartment').value = '';
        setSearchStartDate('');
        setSearchEndDate('');
        document.getElementById('searchStartDate').value = '';
        document.getElementById('searchEndDate').value = '';
        setQuery(queries.GET_COURSES);
        setQueryVariables({});
    };

    if (loading) {
        return <div>Loading</div>;
    } else if (error) {
        return <div>{error.message}</div>;
    } else {
        let courses = [];
        if(data.courses) courses = data.courses;
        else if(data.getCoursesByDepartment) courses = data.getCoursesByDepartment;
        else if(data.getCoursesByDateRange) courses = data.getCoursesByDateRange;

        return (
            <div>
                {/* Modals for Add and Edit */}
                {showCourseAddModal && <Modal
                    type='Course'
                    method='Add'
                    showModal={showCourseAddModal}
                    closeFormState={handleAddCourseModal}
                />}
                {showCourseEditModal && <Modal
                    course={editCourse}
                    type='Course'
                    method="Edit"
                    showModal={showCourseEditModal}
                    closeFormState={handleEditCourseModal}
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
                        <label>Course Between: </label>
                        <input id="searchStartDate" defaultValue={searchStartDate} placeholder='Start Date' onChange={(e) => setSearchStartDate(e.target.value)}></input>
                        <input id="searchEndDate" defaultValue={searchEndDate} placeholder='End Date' onChange={(e) => setSearchEndDate(e.target.value)}></input>
                        <button>Filter</button>
                    </form>
                    <button onClick={resetFilters}>Reset Filters</button>
                </div>}
                <br/>
                <br/>
                {/* Add Button */}
                <button onClick={handleAddCourseModal}>Add Course</button>
                <br/>
                <br/>
                {/* List of Courses */}
                {courses.map((course) => {
                    return (
                        <div key={course._id}>
                            <Link to={`/courses/${course._id}`}>
                                <h3>{course.course_name}</h3>
                            </Link>
                            <h4>{helpers.CapitilizeString(course.department)} Department</h4>
                            <h4>{course.instructor ? (`Instructor: ${course.instructor.first_name} ${course.instructor.last_name}`) : (`No Instructor`)}</h4>
                            <h4>From: {course.start_date} | To: {course.end_date}</h4>
                            <button onClick={() => {handleEditCourseModal(course)}}>Edit</button>
                            <button onClick={() => {handleDeleteCourse(course)}}>Delete</button>
                            <br/>
                            <br/>
                        </div>
                    )
                })}
            </div>
        )
    };

};

export default CourseList;