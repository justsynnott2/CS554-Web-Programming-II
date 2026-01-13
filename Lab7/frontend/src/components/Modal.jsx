import React, {useState, useEffect} from 'react';
import ReactModal from 'react-modal';
import {useQuery, useMutation} from '@apollo/client/react';
import queries from '../queries';

ReactModal.setAppElement('#root');
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    border: '1px solid #28547a',
    borderRadius: '4px',
    backgroundColor: '#000000'
  }
};

function Modal(props){
    const [query, setQuery] = useState(queries.GET_INSTRUCTORS);
    const {loading, error, data} = useQuery(query, {
        fetchPolicy: 'cache-and-network'
    });

    useEffect(() => {
        if(props.type === 'Course') setQuery(queries.GET_INSTRUCTORS);
        else if(props.type === 'Student') setQuery(queries.GET_COURSES);
    }, [props.type]);

    //START of Instructor Section
    const [addInstructor] = useMutation(queries.ADD_INSTRUCTOR, {
        onError(error) {
            console.error("ADD ERROR:", error.message);
            alert(error.message);
        },
        update(cache, {data: {addInstructor}}){
            const {instructors} = cache.readQuery({
                query: queries.GET_INSTRUCTORS
            });
            cache.writeQuery({
                query: queries.GET_INSTRUCTORS,
                data: {instructors: [...instructors, addInstructor]}
            });
        }
    });
    const [editInstructor] = useMutation(queries.EDIT_INSTRUCTOR, {
        onError(error) {
        console.error("ADD ERROR:", error.message);
        alert(error.message);
    }});

    const onAddInstructor = async (e) => {
        e.preventDefault();
        let firstName = document.getElementById('addFirstName');
        let lastName = document.getElementById('addLastName');
        let department = document.getElementById('addInstructorDepartment');
        let email = document.getElementById('addEmail');
        let phone = document.getElementById('addPhone');
        let office = document.getElementById('addOffice');
        let dateHired = document.getElementById('addDateHired');
        await addInstructor({
            variables: {
                first_name: firstName.value,
                last_name: lastName.value,
                department: department.value,
                email: email.value,
                phone: phone.value,
                office: office.value,
                date_hired: dateHired.value
            }
        });
        document.getElementById('addInstructor').reset();
        alert("Instructor Added");
        props.closeFormState();
    };

    const onEditInstructor = async (e) => {
        e.preventDefault();
        let firstName = document.getElementById('editFirstName');
        let lastName = document.getElementById('editLastName');
        let department = document.getElementById('editInstructorDepartment');
        let email = document.getElementById('editEmail');
        let phone = document.getElementById('editPhone');
        let office = document.getElementById('editOffice');
        let dateHired = document.getElementById('editDateHired');
        await editInstructor({
            variables: {
                id: props.instructor._id,
                first_name: firstName.value,
                last_name: lastName.value,
                department: department.value,
                email: email.value,
                phone: phone.value,
                office: office.value,
                date_hired: dateHired.value
            }
        });
        document.getElementById('editInstructor').reset();
        alert("Instructor Edited");
        props.closeFormState();
    };
    //END of Instructor Section

    //START of Course Section
    const [addCourse] = useMutation(queries.ADD_COURSE, {
        onError(error) {
            console.error("ADD ERROR:", error.message);
            alert(error.message);
        },
        update(cache, {data: {addCourse}}){
            const {courses} = cache.readQuery({
                query: queries.GET_COURSES
            });
            cache.writeQuery({
                query: queries.GET_COURSES,
                data: {courses: [...courses, addCourse]}
            });
        }
    });

    const [editCourse] = useMutation(queries.EDIT_COURSE, {
        onError(error) {
        console.error("EDIT ERROR:", error.message);
        alert(error.message);
    }});

    const [updateCourseInstructor] = useMutation(queries.UPDATE_COURSE_INSTRUCTOR, {
        onError(error) {
            console.error("EDIT ERROR:", error.message);
            alert(error.message);
        }
    });

    const onAddCourse = async (e) => {
        e.preventDefault();
        let courseName = document.getElementById('addCourseName');
        let department = document.getElementById('addCourseDepartment');
        let credits = document.getElementById('addCredits');
        let instructor = document.getElementById('addCourseInstructor');
        let startDate = document.getElementById('addStartDate');
        let endDate = document.getElementById('addEndDate');
        await addCourse({
            variables: {
                courseName: courseName.value,
                department: department.value,
                credits: parseInt(credits.value),
                instructor: instructor.value,
                startDate: startDate.value,
                endDate: endDate.value
            }
        });
        document.getElementById('addCourse').reset();
        alert("Course Added");
        props.closeFormState();
    };

    const onEditCourse = async (e) => {
        e.preventDefault();
        let courseName = document.getElementById('editCourseName');
        let department = document.getElementById('editCourseDepartment');
        let credits = document.getElementById('editCredits');
        let instructor = document.getElementById('editCourseInstructor');
        let startDate = document.getElementById('editStartDate');
        let endDate = document.getElementById('editEndDate');
        await editCourse({
            variables: {
                id: props.course._id,
                courseName: courseName.value,
                department: department.value,
                credits: parseInt(credits.value),
                instructor: instructor.value,
                startDate: startDate.value,
                endDate: endDate.value
            }
        });
        document.getElementById('editCourse').reset();
        alert("Course Edited");
        props.closeFormState();
    };

    const onUpdateCourseInstructor = async (e) => {
        e.preventDefault()
        let instructor = document.getElementById('updateInstructor');
        await updateCourseInstructor({
            variables: {
                courseId: props.course._id,
                instructorId: instructor.value
            }
        });
        document.getElementById('updateCourseInstructor').reset();
        alert("Course Instructor Updated");
        props.closeFormState();
    }
    //END of Course Section

    //START of Student Section
    const [addStudent] = useMutation(queries.ADD_STUDENT, {
        onError(error) {
            console.error("ADD ERROR:", error.message);
            alert(error.message);
        },
        update(cache, {data: {addStudent}}){
            const {students} = cache.readQuery({
                query: queries.GET_STUDENTS
            });
            cache.writeQuery({
                query: queries.GET_STUDENTS,
                data: {students: [...students, addStudent]}
            });
        }
    });

    const [editStudent] = useMutation(queries.EDIT_STUDENT, {
        onError(error) {
            console.error("EDIT ERROR:", error.message);
            alert(error.message);
        }
    });

    const [enrollStudentInCourse] = useMutation(queries.ENROLL_STUDENT_IN_COURSE, {
        onError(error) {
            console.error("ENROLL ERROR:", error.message);
            alert(error.message);
        },
        update(cache, {data: {enrollStudentInCourse}}){
            const {getStudentById} = cache.readQuery({
                query: queries.GET_STUDENT_BY_ID,
                variables: {id: props.student._id}
            });
            cache.writeQuery({
                query: queries.GET_STUDENT_BY_ID,
                variables: {id: props.student._id},
                data: {
                    getStudentById: {
                        ...getStudentById,
                        ...enrollStudentInCourse
                    }
                }
            });
        }
    });

    const [dropStudentFromCourse] = useMutation(queries.REMOVE_STUDENT_FROM_COURSE, {
        onError(error) {
            console.error("DROP ERROR:", error.message);
            alert(error.message);
        },
        update(cache, {data: {removeStudentFromCourse}}){
            const {getStudentById} = cache.readQuery({
                query: queries.GET_STUDENT_BY_ID,
                variables: {id: props.student._id}
            });
            cache.writeQuery({
                query: queries.GET_STUDENT_BY_ID,
                variables: {id: props.student._id},
                data: {
                    getStudentById: {
                        ...getStudentById,
                        ...removeStudentFromCourse
                    }
                }
            });
        }
    });

    const onAddStudent = async (e) => {
        e.preventDefault();
        let firstName = document.getElementById('addStudentFirstName');
        let lastName = document.getElementById('addStudentLastName');
        let email = document.getElementById('addStudentEmail');
        let dateOfBirth = document.getElementById('addStudentBirthday');
        let major = document.getElementById('addStudentMajor');
        let gpa = document.getElementById('addStudentGPA');
        await addStudent({
            variables: {
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                dateOfBirth: dateOfBirth.value,
                major: major.value,
                gpa: parseFloat(gpa.value)
            }
        });
        document.getElementById('addStudent').reset();
        alert("Student Added");
        props.closeFormState();
    };

    const onEditStudent = async (e) => {
        e.preventDefault();
        let firstName = document.getElementById('editStudentFirstName');
        let lastName = document.getElementById('editStudentLastName');
        let email = document.getElementById('editStudentEmail');
        let dateOfBirth = document.getElementById('editStudentBirthday');
        let major = document.getElementById('editStudentMajor');
        let gpa = document.getElementById('editStudentGPA');
        await editStudent({
            variables: {
                id: props.student._id,
                firstName: firstName.value,
                lastName: lastName.value,
                email: email.value,
                dateOfBirth: dateOfBirth.value,
                major: major.value,
                gpa: parseFloat(gpa.value)
            }
        });
        document.getElementById('editStudent').reset();
        alert("Student Edited");
        props.closeFormState();
    };

    const onEnrollStudent = async (e) => {
        e.preventDefault();
        let course = document.getElementById('enrollCourse');
        await enrollStudentInCourse({
            variables: {
                studentId: props.student._id,
                courseId: course.value
            }
        });
        document.getElementById('enrollStudent').reset();
        alert("Student Enrolled");
        props.closeFormState();
    }

    const onDropStudent = async (e) => {
        e.preventDefault();
        let course = document.getElementById('dropCourse');
        await dropStudentFromCourse({
            variables: {
                studentId: props.student._id,
                courseId: course.value
            }
        });
        document.getElementById('dropStudent').reset();
        alert("Student Dropped");
        props.closeFormState();
    }
    //END of Student Section

    if (loading) {
        return <div>loading...</div>;
    }
    else if (error) {
        return <div>{error.message}</div>;
    }
    else{
        let body = null;
        if(props.type === 'Instructor'){
            if(props.method === 'Add'){
                body = (
                    <div>
                        <ReactModal
                            name='addInstructorModal'
                            isOpen={props.showModal}
                            contentLabel='Add Instructor'
                            style={customStyles}
                        >
                            <form id='addInstructor' onSubmit={onAddInstructor}>
                                <div>
                                    <label>First Name:</label>
                                    <input id='addFirstName' placeholder='First Name' required></input>
                                </div>
                                <div>
                                    <label>Last Name:</label>
                                    <input id='addLastName' placeholder='Last Name' required></input>
                                </div>
                                <div>
                                    <label>Department:</label>
                                    <input id='addInstructorDepartment' placeholder='Department' required></input>
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input id='addEmail' placeholder='Email' required></input>
                                </div>
                                <div>
                                    <label>Phone Number:</label>
                                    <input id='addPhone' placeholder='###-###-####' required></input>
                                </div>
                                <div>
                                    <label>Office:</label>
                                    <input id='addOffice' placeholder='Office' required></input>
                                </div>
                                <div>
                                    <label>Date Hired:</label>
                                    <input id='addDateHired' placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <br/>
                                <button type='submit'>Add Instructor</button>
                                <button onClick={() => {
                                    document.getElementById('addInstructor').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                );
            } else if(props.method === 'Edit'){
                body = (
                    <div>
                        <ReactModal
                            name='editInstructorModal'
                            isOpen={props.showModal}
                            contentLabel='Edit Instructor'
                            style={customStyles}
                        >
                            <form id='editInstructor' onSubmit={onEditInstructor}>
                                <div>
                                    <label>First Name:</label>
                                    <input id='editFirstName' defaultValue={props.instructor.first_name} required></input>
                                </div>
                                <div>
                                    <label>Last Name:</label>
                                    <input id='editLastName' defaultValue={props.instructor.last_name} required></input>
                                </div>
                                <div>
                                    <label>Department:</label>
                                    <input id='editInstructorDepartment' defaultValue={props.instructor.department} required></input>
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input id='editEmail' defaultValue={props.instructor.email} required></input>
                                </div>
                                <div>
                                    <label>Phone Number:</label>
                                    <input id='editPhone' defaultValue={props.instructor.phone} required></input>
                                </div>
                                <div>
                                    <label>Office:</label>
                                    <input id='editOffice' defaultValue={props.instructor.office} required></input>
                                </div>
                                <div>
                                    <label>Date Hired:</label>
                                    <input id='editDateHired' defaultValue={props.instructor.date_hired} required></input>
                                </div>
                                <br/>
                                <button type='submit'>Edit Instructor</button>
                                <button onClick={() => {
                                    document.getElementById('editInstructor').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            }
        } else if(props.type === 'Course'){
            const {instructors} = data;
            if(props.method === 'Add'){
                body = (
                    <div>
                        <ReactModal
                            name='addCourseModal'
                            isOpen={props.showModal}
                            contentLabel='Add Course'
                            style={customStyles}
                        >
                            <form id='addCourse' onSubmit={onAddCourse}>
                                <div>
                                    <label>Course Name:</label>
                                    <input id='addCourseName' placeholder='Course Name' required></input>
                                </div>
                                <div>
                                    <label>Department:</label>
                                    <input id='addCourseDepartment' placeholder='Department' required></input>
                                </div>
                                <div>
                                    <label>Credits:</label>
                                    <input id='addCredits' placeholder='Credits' required></input>
                                </div>
                                <div>
                                    <label>Instructor:</label>
                                    <select id='addCourseInstructor'>
                                        {instructors && instructors.map((instructor) => {
                                            return (
                                                <option key={instructor._id} value={instructor._id}>
                                                    {instructor.first_name} {instructor.last_name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label>Start Date:</label>
                                    <input id='addStartDate' placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <div>
                                    <label>End Date:</label>
                                    <input id='addEndDate' placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <br/>
                                <button type='submit'>Add Course</button>
                                <button onClick={() => {
                                    document.getElementById('addCourse').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            } else if(props.method === 'Edit'){
                body = (
                    <div>
                        <ReactModal
                            name='editCourseModal'
                            isOpen={props.showModal}
                            contentLabel='Edit Course'
                            style={customStyles}
                        >
                            <form id='editCourse' onSubmit={onEditCourse}>
                                <div>
                                    <label>Course Name:</label>
                                    <input id='editCourseName' defaultValue={props.course.course_name} placeholder='Course Name' required></input>
                                </div>
                                <div>
                                    <label>Department:</label>
                                    <input id='editCourseDepartment' defaultValue={props.course.department} placeholder='Department' required></input>
                                </div>
                                <div>
                                    <label>Credits:</label>
                                    <input id='editCredits' defaultValue={props.course.credits} placeholder='Credits' required></input>
                                </div>
                                <div>
                                    <label>Instructor:</label>
                                    <select id='editCourseInstructor' defaultValue={props.course.instructor ? props.course.instructor._id : ''}>
                                        {instructors && instructors.map((instructor) => {
                                            return (
                                                <option key={instructor._id} value={instructor._id}>
                                                    {instructor.first_name} {instructor.last_name}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label>Start Date:</label>
                                    <input id='editStartDate' defaultValue={props.course.start_date} placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <div>
                                    <label>End Date:</label>
                                    <input id='editEndDate' defaultValue={props.course.end_date} placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <br/>
                                <button type='submit'>Edit Course</button>
                                <button onClick={() => {
                                    document.getElementById('editCourse').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            } else if(props.method === 'Update Instructor'){
                body = (
                    <div>
                        <ReactModal
                            name='updateCourseInstructorModal'
                            isOpen={props.showModal}
                            contentLabel='Update Course Instructor'
                            style={customStyles}
                        >
                            <form id='updateCourseInstructor' onSubmit={onUpdateCourseInstructor}>
                                <select id='updateInstructor' defaultValue={props.course.instructor ? props.course.instructor._id : ''}>
                                    {instructors && instructors.map((instructor) => {
                                        return (
                                            <option key={instructor._id} value={instructor._id}>
                                                {instructor.first_name} {instructor.last_name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button type='submit'>Update Course Instructor</button>
                                <button onClick={() => {
                                    document.getElementById('updateCourseInstructor').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            }
        } else if(props.type === 'Student'){
            const {courses} = data;
            if(props.method === 'Add'){
                body = (
                    <div>
                        <ReactModal
                            name='addStudentModal'
                            isOpen={props.showModal}
                            contentLabel='Add Student'
                            style={customStyles}
                        >
                            <form id='addStudent' onSubmit={onAddStudent}>
                                <div>
                                    <label>First Name:</label>
                                    <input id='addStudentFirstName' placeholder='First Name' required></input>
                                </div>
                                <div>
                                    <label>Last Name:</label>
                                    <input id='addStudentLastName' placeholder='Last Name' required></input>
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input id='addStudentEmail' placeholder='Email' required></input>
                                </div>
                                <div>
                                    <label>Birthday:</label>
                                    <input id='addStudentBirthday' placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <div>
                                    <label>Major:</label>
                                    <input id='addStudentMajor' placeholder='Major' required></input>
                                </div>
                                <div>
                                    <label>GPA:</label>
                                    <input id='addStudentGPA' placeholder='GPA' required></input>
                                </div>
                                <button type='submit'>Add Student</button>
                                <button onClick={() => {
                                    document.getElementById('addStudent').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            } else if(props.method === 'Edit'){
                body = (
                    <div>
                        <ReactModal
                            name='editStudentModal'
                            isOpen={props.showModal}
                            contentLabel='Edit Student'
                            style={customStyles}
                        >
                            <form id='editStudent' onSubmit={onEditStudent}>
                                <div>
                                    <label>First Name:</label>
                                    <input id='editStudentFirstName' defaultValue={props.student.first_name} placeholder='First Name' required></input>
                                </div>
                                <div>
                                    <label>Last Name:</label>
                                    <input id='editStudentLastName' defaultValue={props.student.last_name} placeholder='Last Name' required></input>
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <input id='editStudentEmail' defaultValue={props.student.email} placeholder='Email' required></input>
                                </div>
                                <div>
                                    <label>Birthday:</label>
                                    <input id='editStudentBirthday' defaultValue={props.student.date_of_birth} placeholder='MM/DD/YYYY' required></input>
                                </div>
                                <div>
                                    <label>Major:</label>
                                    <input id='editStudentMajor' defaultValue={props.student.major} placeholder='Major' required></input>
                                </div>
                                <div>
                                    <label>GPA:</label>
                                    <input id='editStudentGPA' defaultValue={props.student.gpa} placeholder='GPA' required></input>
                                </div>
                                <button type='submit'>Edit Student</button>
                                <button onClick={() => {
                                    document.getElementById('editStudent').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            } else if(props.method === 'Enroll'){
                body = (
                    <div>
                        <ReactModal
                            name='enrollStudentModal'
                            isOpen={props.showModal}
                            contentLabel='Enroll Student'
                            style={customStyles}
                        >
                            <form id='enrollStudent' onSubmit={onEnrollStudent}>
                                <select id='enrollCourse'>
                                    {courses && courses.map((course) => {
                                        return (
                                            <option key={course._id} value={course._id}>
                                                {course.course_name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button type='submit'>Enroll</button>
                                <button onClick={() => {
                                    document.getElementById('enrollStudent').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            } else if(props.method === 'Drop'){
                body = (
                    <div>
                        <ReactModal
                            name='dropStudentModal'
                            isOpen={props.showModal}
                            contentLabel='Drop Student'
                            style={customStyles}
                        >
                            <form id='dropStudent' onSubmit={onDropStudent}>
                                <select id='dropCourse'>
                                    {courses && courses.map((course) => {
                                        return (
                                            <option key={course._id} value={course._id}>
                                                {course.course_name}
                                            </option>
                                        );
                                    })}
                                </select>
                                <button type='submit'>Drop</button>
                                <button onClick={() => {
                                    document.getElementById('enrollStudent').reset();
                                    props.closeFormState();
                                }}>Cancel</button>
                            </form>
                        </ReactModal>
                    </div>
                )
            }
        }

        return <div>{body}</div>;
    }
}

export default Modal;
