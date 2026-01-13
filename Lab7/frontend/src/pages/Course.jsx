import React, {useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';
import Modal from '../components/Modal';
import helpers from '../components/helpers';

function Course(){
    const [showCourseEditModal, setShowCourseEditModal] = useState(false);
    const [showUpdateInstructorModal, setShowUpdateInstructorModal] = useState(false);
    const [deletedCourse, setDeletedCourse] = useState(false);
    const {id} = useParams();

    const {loading: courseLoading, error: courseError, data: courseData} = useQuery(queries.GET_COURSE_BY_ID, {
        variables: {id},
        fetchPolicy: 'cache-and-network'
    });

    const {loading: studentsLoading, error: studentsError, data: studentsData} = useQuery(queries.GET_STUDENTS_BY_COURSE_ID, {
        variables: {courseId: id},
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

    const handleEditCourseModal = () => {
        setShowCourseEditModal(!showCourseEditModal);
    };

    const handleUpdateInstructorModal = () => {
        setShowUpdateInstructorModal(!showUpdateInstructorModal);
    }

    const handleDeleteCourse = (course) => {
        removeCourse({
            variables: {
                id: course._id
            }
        });
        setDeletedCourse(true);
        alert("Course Deleted");
    };

    if(deletedCourse)
        return (
            <div>
                <br/>
                <h2>Course Deleted!</h2>
            </div>
        )
    else if (courseLoading || studentsLoading) {
        return <div>Loading</div>;
    } else if (courseError) {
        return <div>{courseError.message}</div>;
    } else if (studentsError) {
        return <div>{studentsError.message}</div>;
    } else {
        let course = {};
        let students = [];
        if(courseData.getCourseById) course = courseData.getCourseById;
        if(studentsData.getStudentsByCourseId) students = studentsData.getStudentsByCourseId;

        return (
            <div>
                {showCourseEditModal && <Modal
                    course={course}
                    type='Course'
                    method='Edit'
                    showModal={showCourseEditModal}
                    closeFormState={handleEditCourseModal}
                />}
                {showUpdateInstructorModal && <Modal
                    course={course}
                    type='Course'
                    method='Update Instructor'
                    showModal={showUpdateInstructorModal}
                    closeFormState={handleUpdateInstructorModal}
                />}
                <br/>
                <br/>
                <button onClick={() => {handleEditCourseModal()}}>Edit</button>
                <button onClick={() => {handleDeleteCourse(course)}}>Delete</button>
                <h1>{course.course_name}</h1>
                <h2>{helpers.CapitilizeString(course.department)} Department</h2>
                {course.instructor ? 
                    (<h2>Instructor: <Link to={`/instructors/${course.instructor._id}`}>{course.instructor.first_name} {course.instructor.last_name}</Link></h2>) :
                    <h2>No Instructor</h2>
                }
                <button onClick={() => {handleUpdateInstructorModal()}}>Update Instructor</button>
                <h2>Credits: {course.credits}</h2>
                <h2>From: {course.start_date} | To: {course.end_date}</h2>
                <h2>Students Enrolled ({course.numOfStudentsEnrolled}):</h2>
                {students.length === 0 && <h3>No Students Enrolled</h3>}
                <ul>
                    {students.map((student) => {
                        return (
                            <li key={student._id}>
                                <Link to={`/students/${student._id}`}>
                                    <h3>{student.first_name} {student.last_name}</h3>
                                </Link>
                                <h4>{helpers.CapitilizeString(student.major)} Major</h4>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }

}

export default Course;