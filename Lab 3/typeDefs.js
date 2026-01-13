export const typeDefs = `#graphql
    type Query {
        instructors: [Instructor]
        students: [Student]
        courses: [Course]
        getInstructorById(_id: String!): Instructor
        getStudentById(_id: String!): Student
        getCourseById(_id: String!): Course
        getStudentsByCourseId(courseId: String!): [Student]
        getCoursesByInstructorId(instructorId: String!): [Course]
        getCoursesByDepartment(department: String!): [Course]
        getInstructorsByDepartment(department: String!): [Instructor]
        getInstructorsHiredBetween(start: String!, end: String!): [Instructor]
        getStudentsByMajor(major: String!): [Student]
        getCoursesByDateRange(start: String!, end: String!): [Course]
        searchStudentsByLastName(searchTerm: String!): [Student]
    }

    type Instructor {
        _id: String
        first_name: String
        last_name: String
        department: String
        email: String
        phone: String
        office: String
        date_hired: String
        courses: [Course]
        numOfClassesTaught: Int
    }

    type Student {
        _id: String
        first_name: String
        last_name: String
        email: String
        date_of_birth: String
        major: String
        gpa: Float
        enrolled_courses: [Course]
        numOfEnrolledCourses: Int
    }

    type Course {
        _id: String!
        course_name: String
        department: String
        credits: Int
        instructor: Instructor
        start_date: String
        end_date: String  
        students: [Student]
        numOfStudentsEnrolled: Int
    }

    type Mutation {
        addInstructor(
            first_name: String!
            last_name: String!
            department: String!
            email: String!
            phone: String!
            office: String!
            date_hired: String!
        ): Instructor
        editInstructor(
            _id: String!
            first_name: String
            last_name: String
            department: String
            email: String
            phone: String
            office: String
            date_hired: String
        ): Instructor
        removeInstructor(_id: String!): Instructor
        addStudent(
            first_name: String!
            last_name: String!
            email: String!
            date_of_birth: String!
            major: String!
            gpa: Float!
        ): Student
        editStudent(
            _id: String!
            first_name: String
            last_name: String
            email: String
            date_of_birth: String
            major: String
            gpa: Float
        ): Student
        removeStudent(_id: String!): Student
        addCourse(
            course_name: String!
            department: String!
            credits: Int!
            instructor: String!
            start_date: String!
            end_date: String!
        ): Course
        editCourse(
            _id: String!
            course_name: String
            department: String
            credits: Int
            instructor: String
            start_date: String
            end_date: String
        ): Course
        removeCourse(_id: String!): Course
        updateCourseInstructor(
            courseId: String!
            instructorId: String!
        ): Course
        enrollStudentInCourse(
            studentId: String!
            courseId: String!
        ): Student
        removeStudentFromCourse(
            studentId: String!
            courseId: String!
        ): Student
    }

`;