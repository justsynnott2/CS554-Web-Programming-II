import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';
import Modal from '../components/Modal';
import helpers from '../components/helpers';

function Student() {
    const [showStudentEditModal, setShowStudentEditModal] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);
    const [showDropModal, setShowDropModal] = useState(false);
    const [deletedStudent, setDeletedStudent] = useState(false);
    const {id} = useParams();

    const {loading: studentLoading, error: studentError, data: studentData} = useQuery(queries.GET_STUDENT_BY_ID, {
        variables: {id},
        fetchPolicy: 'cache-and-network'
    });

    const {loading: coursesLoading, error: coursesError, data: coursesData} = useQuery(queries.GET_COURSES, {
        variables: {instructorId: id},
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

    const handleEditStudentModal = () => {
        setShowStudentEditModal(!showStudentEditModal);
    };

    const handleDeleteStudent = (student) => {
        removeStudent({
            variables: {
                id: student._id
            }
        });
        setDeletedStudent(true)
        alert("Student Deleted");
    };

    const handleEnrollModal = () => {
        setShowEnrollModal(!showEnrollModal);
    }

    const handleDropModal = () => {
        setShowDropModal(!showDropModal);
    }

    if(deletedStudent)
        return (
            <div>
                <br/>
                <h2>Student Deleted!</h2>
            </div>
        )
    else if (studentLoading || coursesLoading) {
        return <div>Loading</div>;
    } else if (studentError) {
        return <div>{studentError.message}</div>;
    } else if (coursesError) {
        return <div>{coursesError.message}</div>;
    } else {
        let student = {};
        let courses = [];
        if(studentData.getStudentById) student = studentData.getStudentById;
        if(coursesData.getCourses) courses = coursesData.getCourses;

        return (
            <div>
                {showStudentEditModal && <Modal
                    student={student}
                    type='Student'
                    method='Edit'
                    showModal={showStudentEditModal}
                    closeFormState={handleEditStudentModal}
                />}
                {showEnrollModal && <Modal
                    student={student}
                    type='Student'
                    method='Enroll'
                    showModal={showEnrollModal}
                    closeFormState={handleEnrollModal}
                />}
                {showDropModal && <Modal
                    student={student}
                    type='Student'
                    method='Drop'
                    showModal={showDropModal}
                    closeFormState={handleDropModal}
                />}
                <br/>
                <br/>
                <button onClick={() => {handleEditStudentModal()}}>Edit</button>
                <button onClick={() => {handleDeleteStudent(student)}}>Delete</button>
                <h1>{student.first_name} {student.last_name}</h1>
                <h2>{student.email}</h2>
                <h2>{helpers.CapitilizeString(student.major)} Major</h2>
                <h2>GPA: {student.gpa}</h2>
                <h2>Birthday: {student.date_of_birth}</h2>
                <h2>Enrolled Courses ({student.numOfEnrolledCourses}):</h2>
                <button onClick={() => {handleEnrollModal()}}>Enroll In Course</button>
                <button onClick={() => {handleDropModal()}}>Drop Course</button>
                {student.enrolled_courses.length === 0 && <h3>Student Isn't Enrolled In Any Courses</h3>}
                <ul>
                    {student.enrolled_courses.map((course) => {
                        return (
                            <li key={course._id}>
                                <Link to={`/courses/${course._id}`}>
                                    <h3>{course.course_name}</h3>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

}

export default Student;