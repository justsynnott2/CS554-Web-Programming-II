import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';
import Modal from '../components/Modal';
import helpers from '../components/helpers';

function Instructor() {
    const [showInstructorEditModal, setShowInstructorEditModal] = useState(false);
    const [deletedInstructor, setDeletedInstructor] = useState(false);
    const {id} = useParams();

    const {loading: instructorLoading, error: instructorError, data: instructorData} = useQuery(queries.GET_INSTRUCTOR_BY_ID, {
        variables: {id},
        fetchPolicy: 'cache-and-network'
    });

    const {loading: coursesLoading, error: coursesError, data: coursesData} = useQuery(queries.GET_COURSES_BY_INSTRUCTOR_ID, {
        variables: {instructorId: id},
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

    const handleEditInstructorModal = () => {
        setShowInstructorEditModal(!showInstructorEditModal);
    }

    const handleDeleteInstructor = (instructor) => {
        removeInstructor({
            variables: {
                id: instructor._id
            }
        });
        setDeletedInstructor(true);
        alert("Instructor Deleted");
    }

    if(deletedInstructor)
        return (
            <div>
                <br/>
                <h2>Instructor Deleted!</h2>
            </div>
        )
    else if (instructorLoading || coursesLoading) {
        return <div>Loading</div>;
    } else if (instructorError) {
        return <div>{instructorError.message}</div>;
    } else if (coursesError) {
        return <div>{coursesError.message}</div>;
    } else {
        let instructor = {};
        let courses = [];
        if(instructorData.getInstructorById) instructor = instructorData.getInstructorById;
        if(coursesData.getCoursesByInstructorId) courses = coursesData.getCoursesByInstructorId;
        
        return (
            <div>
                {showInstructorEditModal && <Modal
                    instructor={instructor}
                    type='Instructor'
                    method="Edit"
                    showModal={showInstructorEditModal}
                    closeFormState={handleEditInstructorModal}
                />}
                <br/>
                <br/>
                <button onClick={() => {handleEditInstructorModal(instructor)}}>Edit</button>
                <button onClick={() => {handleDeleteInstructor(instructor)}}>Delete</button>
                <h1>{instructor.first_name} {instructor.last_name}</h1>
                <h2>{helpers.CapitilizeString(instructor.department)} Department</h2>
                <h2>Hired on {instructor.date_hired}</h2>
                <h2>Office: {instructor.office}</h2>
                <h2>{instructor.email}</h2>
                <h2>{instructor.phone}</h2>
                <h2>Courses Taught ({instructor.numOfClassesTaught}):</h2>
                {courses.length === 0 && <h3>Instructor Doesn't Teach Any Courses</h3>}
                <ul>
                    {courses.map((course) => {
                        return (
                            <li key={course._id}>
                                <Link to={`/courses/${course._id}`}>
                                    <h3>{course.course_name}</h3>
                                </Link>
                                <h4>{helpers.CapitilizeString(course.department)} Department</h4>
                                <h4>From: {course.start_date} | To: {course.end_date}</h4>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
    

}

export default Instructor;