import {gql} from '@apollo/client';

const GET_INSTRUCTORS = gql`
    query GetInstructors {
        instructors {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const GET_INSTRUCTOR_BY_ID = gql`
    query GetInstructorById($id: String!) {
        getInstructorById(_id: $id) {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const GET_INSTRUCTOR_BY_DEPARTMENT = gql`
    query GetInstructorByDepartment($department: String!) {
        getInstructorsByDepartment(department: $department) {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const GET_INSTRUCTOR_HIRED_BETWEEN = gql`
    query GetInstructorHiredBetween($start: String!, $end: String!) {
        getInstructorsHiredBetween(start: $start, end: $end) {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const ADD_INSTRUCTOR = gql`
    mutation AddInstructor(
        $first_name: String!
        $last_name: String!
        $department: String!
        $email: String!
        $phone: String!
        $office: String!
        $date_hired: String!
    ) {
        addInstructor(
            first_name: $first_name
            last_name: $last_name
            department: $department
            email: $email
            phone: $phone
            office: $office
            date_hired: $date_hired
        ) {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const EDIT_INSTRUCTOR = gql`
    mutation EditInstructor(
        $id: String!
        $first_name: String
        $last_name: String
        $department: String
        $email: String
        $phone: String
        $office: String
        $date_hired: String
    ) {
        editInstructor(
            _id: $id
            first_name: $first_name
            last_name: $last_name
            department: $department
            email: $email
            phone: $phone
            office: $office
            date_hired: $date_hired
        ) {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const REMOVE_INSTRUCTOR = gql`
    mutation RemoveInstructor($id: String!) {
        removeInstructor(_id: $id) {
            _id
            first_name
            last_name
            department
            email
            phone
            office
            date_hired
            numOfClassesTaught
        }
    }
`;

const GET_COURSES = gql`
    query GetCourses {
        courses {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date
        }
    }
`;

const GET_COURSE_BY_ID = gql`
    query GetCourseById($id: String!) {
        getCourseById(_id: $id) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date
        }
    }
`;

const GET_COURSES_BY_DEPARTMENT = gql`
    query GetCoursesByDepartment($department: String!) {
        getCoursesByDepartment(department: $department) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date
        }
    }
`;

const GET_COURSES_BY_DATE_RANGE = gql`
    query GetCoursesByDate($start: String!, $end: String!) {
        getCoursesByDateRange(start: $start, end: $end) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date
        }
    }
`;

const GET_COURSES_BY_INSTRUCTOR_ID = gql`
    query GetCoursesByInstructorId($instructorId: String!) {
        getCoursesByInstructorId(instructorId: $instructorId) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date
        }
    }
`;

const ADD_COURSE = gql`
    mutation AddCourse(
        $courseName: String!
        $department: String!
        $credits: Int!
        $instructor: String!
        $startDate: String!
        $endDate: String!
    ) {
        addCourse(
            course_name: $courseName
            department: $department
            credits: $credits
            instructor: $instructor
            start_date: $startDate
            end_date: $endDate
        ) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date 
        }
    }
`;

const EDIT_COURSE = gql`
    mutation EditCourse(
        $id: String!
        $courseName: String
        $department: String
        $credits: Int
        $instructor: String
        $startDate: String
        $endDate: String
    ) {
        editCourse(
            _id: $id
            course_name: $courseName
            department: $department
            credits: $credits
            instructor: $instructor
            start_date: $startDate
            end_date: $endDate
        ) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date     
        }
    }
`;

const REMOVE_COURSE = gql`
    mutation RemoveCourse($id: String!) {
        removeCourse(_id: $id) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date 
        }
    }
`;

const UPDATE_COURSE_INSTRUCTOR = gql`
    mutation UpdateCourseInstructor(
        $courseId: String!
        $instructorId: String!
    ) {
        updateCourseInstructor(
            courseId: $courseId
            instructorId: $instructorId
        ) {
            _id
            course_name
            credits
            department
            end_date
            instructor {
                _id
                first_name
                last_name
            }
            numOfStudentsEnrolled
            start_date
        }
    }
`;

const GET_STUDENTS = gql`
    query GetStudents {
        students {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const GET_STUDENT_BY_ID = gql`
    query GetStudentById($id: String!) {
        getStudentById(_id: $id){
            _id
            date_of_birth
            email
            enrolled_courses {
                _id
                course_name
            }
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const GET_STUDENTS_BY_COURSE_ID = gql`
    query GetStudentsByCourseId($courseId: String!) {
        getStudentsByCourseId(courseId: $courseId) {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const GET_STUDENTS_BY_MAJOR = gql`
    query GetStudentsByMajor($major: String!) {
        getStudentsByMajor(major: $major) {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const SEARCH_STUDENTS_BY_LAST_NAME = gql`
    query SearchStudentsByLastName($searchTerm: String!) {
        searchStudentsByLastName(searchTerm: $searchTerm) {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const ADD_STUDENT = gql`
    mutation AddStudent(
        $firstName: String!
        $lastName: String!
        $email: String!
        $dateOfBirth: String!
        $major: String!
        $gpa: Float!
    ) {
        addStudent(
            first_name: $firstName
            last_name: $lastName
            email: $email
            date_of_birth: $dateOfBirth
            major: $major
            gpa: $gpa
        ) {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const EDIT_STUDENT = gql`
    mutation EditStudent(
        $id: String!
        $firstName: String
        $lastName: String
        $email: String
        $dateOfBirth: String
        $major: String
        $gpa: Float
    ) {
        editStudent(
            _id: $id
            first_name: $firstName
            last_name: $lastName
            email: $email
            date_of_birth: $dateOfBirth
            major: $major
            gpa: $gpa
        ) {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const REMOVE_STUDENT = gql`
    mutation RemoveStudent($id: String!) {
        removeStudent(_id: $id) {
            _id
            date_of_birth
            email
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses
        }
    }
`;

const ENROLL_STUDENT_IN_COURSE = gql`
    mutation EnrollStudentInCourse(
        $studentId: String!
        $courseId: String!
    ) {
        enrollStudentInCourse(
            studentId: $studentId
            courseId: $courseId
        ) {
            _id
            date_of_birth
            email
            enrolled_courses {
                _id
                course_name
            }
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses    
        }
    }
`;

const REMOVE_STUDENT_FROM_COURSE = gql`
    mutation RemoveStudentFromCourse(
        $studentId: String!
        $courseId: String!
    ) {
        removeStudentFromCourse(
            studentId: $studentId
            courseId: $courseId
        ) {
            _id
            date_of_birth
            email
            enrolled_courses {
                _id
                course_name
            }
            first_name
            gpa
            last_name
            major
            numOfEnrolledCourses    
        }
    }
`;

let exported = {
    GET_INSTRUCTORS,
    GET_INSTRUCTOR_BY_ID,
    GET_INSTRUCTOR_BY_DEPARTMENT,
    GET_INSTRUCTOR_HIRED_BETWEEN,
    ADD_INSTRUCTOR,
    EDIT_INSTRUCTOR,
    REMOVE_INSTRUCTOR,
    GET_COURSES,
    GET_COURSE_BY_ID,
    GET_COURSES_BY_DEPARTMENT,
    GET_COURSES_BY_DATE_RANGE,
    GET_COURSES_BY_INSTRUCTOR_ID,
    ADD_COURSE,
    EDIT_COURSE,
    REMOVE_COURSE,
    UPDATE_COURSE_INSTRUCTOR,
    GET_STUDENTS,
    GET_STUDENT_BY_ID,
    GET_STUDENTS_BY_COURSE_ID,
    GET_STUDENTS_BY_MAJOR,
    SEARCH_STUDENTS_BY_LAST_NAME,
    ADD_STUDENT,
    EDIT_STUDENT,
    REMOVE_STUDENT,
    ENROLL_STUDENT_IN_COURSE,
    REMOVE_STUDENT_FROM_COURSE
};

export default exported;