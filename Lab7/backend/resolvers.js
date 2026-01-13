import {GraphQLError} from 'graphql';

import {
  instructors as instructorCollection,
  courses as courseCollection,
  students as studentCollection
} from './config/mongoCollections.js';

import { ObjectId } from 'mongodb';
import validation from './helpers/validation.js';

export const resolvers = {
    Query: {
      instructors: async () => {
        const instructors = await instructorCollection();
        const allInstructors = await instructors.find({}).toArray();
        if(!allInstructors) {
          throw new GraphQLError('Internal Server Error', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return allInstructors;
      },
      students: async () => {
        const students = await studentCollection();
        const allStudents = await students.find({}).toArray();
        if(!allStudents) {
          throw new GraphQLError('Internal Server Error', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return allStudents;
      },
      courses: async () => {
        const courses = await courseCollection();
        const allCourses = await courses.find({}).toArray();
        if(!allCourses) {
          throw new GraphQLError('Internal Server Error', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return allCourses;
      },
      getInstructorById: async (_, args) => {
        let {_id} = args;
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const instructors = await instructorCollection();
        const instructor = await instructors.findOne({_id: new ObjectId(_id)});
        if(!instructor){
          throw new GraphQLError('Instructor Not Found', {extensions: {code: 'NOT_FOUND'}});
        }
        return instructor;
      },
      getStudentById: async (_, args) => {
        let {_id} = args;
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const students = await studentCollection();
        const student = await students.findOne({_id: new ObjectId(_id)});
        if(!student){
          throw new GraphQLError('Student Not Found', {extensions: {code: 'NOT_FOUND'}});
        }
        return student;
      },
      getCourseById: async (_, args) => {
        let {_id} = args;
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const courses = await courseCollection();
        const course = await courses.findOne({_id: new ObjectId(_id)});
        if(!course){
          throw new GraphQLError('Course Not Found', {extensions: {code: 'NOT_FOUND'}});
        } 
        return course;
      },
      getStudentsByCourseId: async (_, args) => {
        let {courseId} = args;
        if(typeof courseId !== 'string' || courseId.trim().length === 0){
          throw new GraphQLError('Course ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        courseId = courseId.trim();
        if(!ObjectId.isValid(courseId)){
          throw new GraphQLError('Course ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const courses = await courseCollection();
        const course = await courses.findOne({_id: new ObjectId(courseId)});
        if(!course){
          throw new GraphQLError('Course Not Found', {extensions: {code: 'NOT_FOUND'}});
        }

        const students = await studentCollection();
        const enrolledStudents = await students.find({enrolled_courses: new ObjectId(courseId)}).toArray();
        return enrolledStudents;
      },
      getCoursesByInstructorId: async (_, args) => {
        let {instructorId} = args;
        if(typeof instructorId !== 'string' || instructorId.trim().length === 0){
          throw new GraphQLError('Instructor ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        instructorId = instructorId.trim();
        if(!ObjectId.isValid(instructorId)){
          throw new GraphQLError('Instructor ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const instructors = await instructorCollection();
        const instructor = await instructors.findOne({_id: new ObjectId(instructorId)});
        if(!instructor){
          throw new GraphQLError('Instructor Not Found', {extensions: {code: 'NOT_FOUND'}});
        }

        const courses = await courseCollection();
        const taughtCourses = await courses.find({instructor: new ObjectId(instructorId)}).toArray();
        return taughtCourses;
      },
      getCoursesByDepartment: async (_, args) => {
        let {department} = args;
        if(typeof department !== 'string' || department.trim().length === 0){
          throw new GraphQLError('Department must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        department = validation.validateString(department, 'Department').toLowerCase();

        const courses = await courseCollection();
        const courseList = await courses.find({department: department}).toArray();
        return courseList;
      },
      getInstructorsByDepartment: async (_, args) => {
        let {department} = args;
        if(typeof department !== 'string' || department.trim().length === 0){
          throw new GraphQLError('Department must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        department = validation.validateString(department, 'Department').toLowerCase();

        const instructors = await instructorCollection();
        const instructorList = await instructors.find({department: department}).toArray();
        return instructorList;
      },
      getInstructorsHiredBetween: async (_, args) => {
        let {start, end} = args;
        start = validation.validateDate(start);
        end = validation.validateDate(end);

        const startKey = validation.dateToKey(start);
        const endKey = validation.dateToKey(end);
        if(startKey > endKey){
          throw new GraphQLError('Start date cannot be after the end date!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const instructors = await instructorCollection();
        const instructorList = await instructors.find({}).toArray();
        const results = instructorList.filter((i) => {
          const hireKey = validation.dateToKey(i.date_hired);
          return startKey <= hireKey && hireKey <= endKey; 
        });
        return results;
      },
      getStudentsByMajor: async (_, args) => {
        let {major} = args;
        if(typeof major !== 'string' || major.trim().length === 0){
          throw new GraphQLError('Major must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        major = validation.validateString(major, 'Major').toLowerCase();

        const students = await studentCollection();
        const studentList = await students.find({major: major}).toArray();
        return studentList;
      },
      getCoursesByDateRange: async (_, args) => {
        let {start, end} = args;
        start = validation.validateDate(start);
        end = validation.validateDate(end);

        const startKey = validation.dateToKey(start);
        const endKey = validation.dateToKey(end);
        if(startKey > endKey){
          throw new GraphQLError('Start date cannot be after the end date!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const courses = await courseCollection();
        const courseList = await courses.find({}).toArray();
        const results = courseList.filter((c) => {
          const courseStartKey = validation.dateToKey(c.start_date);
          const courseEndKey = validation.dateToKey(c.end_date);
          return startKey <= courseStartKey && courseEndKey <= endKey; 
        });
        return results;
      },
      searchStudentsByLastName: async (_, args) => {
        let {searchTerm} = args;
        if(typeof searchTerm !== 'string' || searchTerm.trim().length === 0){
          throw new GraphQLError('Search term must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        searchTerm = validation.validateString(searchTerm, 'SearchTerm').toLowerCase();

        const students = await studentCollection();
        const studentList = await students.find({last_name: {$regex: searchTerm, $options: 'i'}}).toArray();
        return studentList;
      }
    },
    Instructor: {
      numOfClassesTaught: async (parentValue) => {
        const courses = await courseCollection();
        const courseCount = await courses.countDocuments({instructor: parentValue._id});
        return courseCount;
      },
      courses: async (parentValue) => {
        const courses = await courseCollection();
        const courseList = await courses.find({instructor: parentValue._id}).toArray();
        return courseList;
      }
    },
    Student: {
      numOfEnrolledCourses: async (parentValue) => {
        const courses = await courseCollection();
        const courseCount = await courses.countDocuments({_id: {$in: parentValue.enrolled_courses}});
        return courseCount;
      },
      enrolled_courses: async (parentValue) => {
        const courses = await courseCollection();
        const courseList = await courses.find({_id: {$in: parentValue.enrolled_courses}}).toArray();
        return courseList;
      }
    },
    Course: {
      numOfStudentsEnrolled: async (parentValue) => {
        const students = await studentCollection();
        const studentCount = await students.countDocuments({enrolled_courses: parentValue._id});
        return studentCount;
      },
      instructor: async (parentValue) => {
        const instructors = await instructorCollection();
        const instructor = await instructors.findOne({_id: parentValue.instructor});
        return instructor;
      },
      students: async (parentValue) => {
        const students = await studentCollection();
        const studentList = await students.find({enrolled_courses: parentValue._id}).toArray();
        return studentList;
      }
    },
    Mutation: {
      addInstructor: async (_, args) => {
        let {first_name, last_name, department, email, phone, office, date_hired} = args;
        if(!first_name || !last_name || !department || !email || !phone || !office || !date_hired){
          throw new GraphQLError('All fields must be supplied!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        first_name = validation.validateString(first_name, 'First Name');
        last_name = validation.validateString(last_name, 'Last Name');
        department = validation.validateString(department, 'Department').toLowerCase();
        email = validation.validateEmail(email);
        phone = validation.validatePhoneNumber(phone);
        office = validation.validateStringNum(office, "Office");
        date_hired = validation.validateDate(date_hired);

        const newInstructor = {
          first_name: first_name,
          last_name: last_name,
          department: department,
          email: email,
          phone: phone,
          office: office,
          date_hired: date_hired
        };

        const instructors = await instructorCollection();
        let insertedInstructor = await instructors.insertOne(newInstructor);
        if(!insertedInstructor.acknowledged || !insertedInstructor.insertedId) {
          throw new GraphQLError('Could not add instructor!', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }

        return await instructors.findOne({_id: insertedInstructor.insertedId});
      },
      editInstructor: async (_, args) => {
        let {_id, first_name, last_name, department, email, phone, office, date_hired} = args;
        if(!_id){
          throw new GraphQLError('Instructor id must be provided!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        if(!first_name && !last_name && !department && !email && !phone && !office && !date_hired){
          throw new GraphQLError('At least one field alongside the id must be provided!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const instructors = await instructorCollection();
        const instructor = await instructors.findOne({_id: new ObjectId(_id)});

        if(!instructor){
          throw new GraphQLError(`Could not find instructor with an id of ${_id}`, {extensions: {code: 'NOT_FOUND'}});
        }

        const edited = {}
        if(first_name){
          first_name = validation.validateString(first_name, 'First Name');
          edited.first_name = first_name;
        }
        if(last_name){
          last_name = validation.validateString(last_name, 'Last Name');
          edited.last_name = last_name;
        }
        if(department){
          department = validation.validateString(department, 'Department');
          edited.department = department.toLowerCase();
        }
        if(email){
          email = validation.validateEmail(email);
          edited.email = email;
        }
        if(phone){
          phone = validation.validatePhoneNumber(phone);
          edited.phone = phone;
        }
        if(office){
          office = validation.validateStringNum(office, "Office");
          edited.office = office;
        }
        if(date_hired){
          date_hired = validation.validateDate(date_hired);
          edited.date_hired = date_hired
        }

        await instructors.updateOne({_id: new ObjectId(_id)}, {$set: edited});
        return await instructors.findOne({_id: new ObjectId(_id)});
      },
      removeInstructor: async (_, args) => {
        let {_id} = args;
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const instructors = await instructorCollection();
        const courses = await courseCollection();

        const remInstructor = await instructors.findOne({_id: new ObjectId(_id)});
        if(!remInstructor){
          throw new GraphQLError(`Could not find instructor with an id of ${_id}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        await courses.updateMany({instructor: new ObjectId(_id)}, {$set: {instructor: null}});

        const deleteInstructor = await instructors.deleteOne({_id: new ObjectId(_id)});
        if(deleteInstructor.deletedCount !== 1){
          throw new GraphQLError('Failed to delete instructor!', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return remInstructor;
      },
      addStudent: async (_, args) => {
        let {first_name, last_name, email, date_of_birth, major, gpa} = args;
        if(!first_name || !last_name || !email || !date_of_birth || !major || !gpa){
          throw new GraphQLError('All fields must be supplied!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        first_name = validation.validateString(first_name, 'First Name');
        last_name = validation.validateString(last_name, 'Last Name');
        email = validation.validateEmail(email);
        date_of_birth = validation.validateDate(date_of_birth);
        validation.validateAge(date_of_birth);
        major = validation.validateString(major, 'Major').toLowerCase();
        gpa = validation.validateGPA(gpa);

        const newStudent = {
          first_name: first_name,
          last_name: last_name,
          email: email,
          date_of_birth: date_of_birth,
          major: major,
          gpa: gpa,
          enrolled_courses: []
        };

        const students = await studentCollection();
        let insertedStudent = await students.insertOne(newStudent);
        if(!insertedStudent.acknowledged || !insertedStudent.insertedId) {
          throw new GraphQLError('Could not add student!', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }

        return await students.findOne({_id: insertedStudent.insertedId});
      },
      editStudent: async (_, args) => {
        let {_id, first_name, last_name, email, date_of_birth, major, gpa} = args;
         if(!_id){
          throw new GraphQLError('Student id must be provided!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        
        if(!first_name && !last_name && !email && !date_of_birth && !major && !gpa){
          throw new GraphQLError('At least one field alongside the id must be provided!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const students = await studentCollection();
        const student = await students.findOne({_id: new ObjectId(_id)});

        if(!student){
          throw new GraphQLError(`Could not find student with an id of ${_id}`, {extensions: {code: 'NOT_FOUND'}});
        }

        const edited = {};
        if(first_name){
          first_name = validation.validateString(first_name, 'First Name');
          edited.first_name = first_name;
        }
        if(last_name){
          last_name = validation.validateString(last_name, 'Last Name');
          edited.last_name = last_name;
        }
        if(email){
          email = validation.validateEmail(email);
          edited.email = email;
        }
        if(date_of_birth){
          date_of_birth = validation.validateDate(date_of_birth);
          validation.validateAge(date_of_birth);
          edited.date_of_birth = date_of_birth;
        }
        if(major){
          major = validation.validateString(major, 'Major');
          edited.major = major.toLowerCase();
        }
        if(gpa){
          gpa = validation.validateGPA(gpa);
          edited.gpa = gpa;
        }

        await students.updateOne({_id: new ObjectId(_id)}, {$set: edited});
        return await students.findOne({_id: new ObjectId(_id)});
      },
      removeStudent: async (_, args) => {
        let {_id} = args;
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const students = await studentCollection();
        const remStudent = await students.findOne({_id: new ObjectId(_id)});
        if(!remStudent){
          throw new GraphQLError(`Could not find student with an id of ${_id}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        const deleteStudent = await students.deleteOne({_id: new ObjectId(_id)});
        if(deleteStudent.deletedCount !== 1){
          throw new GraphQLError('Failed to delete student!', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return remStudent;
      },
      addCourse: async (_, args) => {
        let {course_name, department, credits, instructor, start_date, end_date} = args;
        if(!course_name || !department || !credits || !instructor || !start_date || !end_date){
          throw new GraphQLError('All fields must be supplied!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        course_name = validation.validateStringNum(course_name, 'Course Name');
        department = validation.validateString(department, 'Department').toLowerCase();
        credits = validation.validateCredits(credits);
        start_date = validation.validateDate(start_date);
        end_date = validation.validateDate(end_date);

        const startKey = validation.dateToKey(start_date);
        const endKey   = validation.dateToKey(end_date);
        if(endKey <= startKey){
          throw new GraphQLError('end_date must be after start_date!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        if(typeof instructor !== 'string' || instructor.trim().length === 0){
          throw new GraphQLError('Instructor must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        instructor = instructor.trim();
        if(!ObjectId.isValid(instructor)){
          throw new GraphQLError('Instructor ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const instructors = await instructorCollection();
        const findInstructor = await instructors.findOne({_id: new ObjectId(instructor)});
        if(!findInstructor){
          throw new GraphQLError(`Could not find instructor with id of ${instructor}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        const newCourse = {
          course_name: course_name,
          department: department,
          credits: credits,
          instructor: new ObjectId(instructor),
          start_date: start_date,
          end_date: end_date
        };

        const courses = await courseCollection();
        let insertedCourse = await courses.insertOne(newCourse);
        if(!insertedCourse.acknowledged || !insertedCourse.insertedId) {
          throw new GraphQLError('Could not add course!', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return await courses.findOne({_id: insertedCourse.insertedId});
      },
      editCourse: async (_, args) => {
        let {_id, course_name, department, credits, instructor, start_date, end_date} = args;
         if(!_id){
          throw new GraphQLError('Course id must be provided!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        
        if(!course_name && !department && !credits && !instructor && !start_date && !end_date){
          throw new GraphQLError('At least one field alongside the id must be provided!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const courses = await courseCollection();
        const course = await courses.findOne({_id: new ObjectId(_id)});

        if(!course){
          throw new GraphQLError(`Could not find course with an id of ${_id}`, {extensions: {code: 'NOT_FOUND'}});
        }

        const edited = {};
        if(course_name){
          course_name = validation.validateStringNum(course_name, 'Course Name');
          edited.course_name = course_name;
        }
        if(department){
          department = validation.validateString(department, 'Department');
          edited.department = department.toLowerCase();
        }
        if(credits){
          credits = validation.validateCredits(credits)
          edited.credits = credits;
        }
        if(instructor){
          if(typeof instructor !== 'string' || instructor.trim().length === 0){
            throw new GraphQLError('Instructor must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
          }
          instructor = instructor.trim();
          if(!ObjectId.isValid(instructor)){
            throw new GraphQLError('Instructor ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
          }
          const instructors = await instructorCollection();
          const findInstructor = await instructors.findOne({_id: new ObjectId(instructor)});
          if(!findInstructor){
            throw new GraphQLError(`Could not find instructor with id of ${instructor}!`, {extensions: {code: 'NOT_FOUND'}});
          }
          edited.instructor = new ObjectId(instructor);
        }
        if(start_date && end_date){
          start_date = validation.validateDate(start_date);
          end_date = validation.validateDate(end_date);
          const startKey = validation.dateToKey(start_date);
          const endKey = validation.dateToKey(end_date);
          if(endKey <= startKey) {
            throw new GraphQLError('end_date must be after start_date!', { extensions: { code: 'BAD_USER_INPUT' } });
          }
          edited.start_date = start_date;
          edited.end_date = end_date;
        }
        else if(start_date){
          start_date = validation.validateDate(start_date);
          const startKey = validation.dateToKey(start_date);
          const endKey = validation.dateToKey(course.end_date);
          if(endKey <= startKey) {
            throw new GraphQLError('end_date must be after start_date!', { extensions: { code: 'BAD_USER_INPUT' } });
          }
          edited.start_date = start_date;
        }
        else if(end_date){
          end_date = validation.validateDate(end_date);
          const startKey = validation.dateToKey(course.start_date);
          const endKey = validation.dateToKey(end_date);
          if(endKey <= startKey) {
            throw new GraphQLError('end_date must be after start_date!', { extensions: { code: 'BAD_USER_INPUT' } });
          }
          edited.end_date = end_date;
        }

        await courses.updateOne({_id: new ObjectId(_id)}, {$set: edited});
        return await courses.findOne({_id: new ObjectId(_id)});
      },
      removeCourse: async (_, args) => {
        let {_id} = args;
        if(typeof _id !== 'string' || _id.trim().length === 0){
          throw new GraphQLError('ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        _id = _id.trim();
        if(!ObjectId.isValid(_id)){
          throw new GraphQLError('ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        const courses = await courseCollection();
        const students = await studentCollection();

        const remCourse = await courses.findOne({_id: new ObjectId(_id)});
        if(!remCourse){
          throw new GraphQLError(`Could not find course with an id of ${_id}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        await students.updateMany({enrolled_courses: new ObjectId(_id)}, {$pull: {enrolled_courses: new ObjectId(_id)}});

        const deleteCourse = await courses.deleteOne({_id: new ObjectId(_id)});
        if(deleteCourse.deletedCount !== 1){
          throw new GraphQLError('Failed to delete course!', {extensions: {code: 'INTERNAL_SERVER_ERROR'}});
        }
        return remCourse;
      },
      updateCourseInstructor: async (_, args) => {
        let {courseId, instructorId} = args;

        if(typeof courseId !== 'string' || courseId.trim().length === 0){
          throw new GraphQLError('Course ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        courseId = courseId.trim();
        if(!ObjectId.isValid(courseId)){
          throw new GraphQLError('Course ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const courses = await courseCollection();
        const course = await courses.findOne({_id: new ObjectId(courseId)});
        if(!course){
          throw new GraphQLError(`Could not find course with an id of ${courseId}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        if(typeof instructorId !== 'string' || instructorId.trim().length === 0){
          throw new GraphQLError('Instructor ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        instructorId = instructorId.trim();
        if(!ObjectId.isValid(instructorId)){
          throw new GraphQLError('Instructor ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const instructors = await instructorCollection();
        const instructor = await instructors.findOne({_id: new ObjectId(instructorId)});
        if(!instructor){
          throw new GraphQLError(`Could not find instructor with an id of ${instructorId}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        await courses.updateOne({_id: new ObjectId(courseId)}, {$set: {instructor: new ObjectId(instructorId)}});
        return await courses.findOne({_id: new ObjectId(courseId)});
      },
      enrollStudentInCourse: async (_, args) => {
        let {studentId, courseId} = args;

        if(typeof studentId !== 'string' || studentId.trim().length === 0){
          throw new GraphQLError('Student ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        studentId = studentId.trim();
        if(!ObjectId.isValid(studentId)){
          throw new GraphQLError('Student ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const students = await studentCollection();
        const student = await students.findOne({_id: new ObjectId(studentId)});
        if(!student){
          throw new GraphQLError(`Could not find student with an id of ${studentId}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        if(typeof courseId !== 'string' || courseId.trim().length === 0){
          throw new GraphQLError('Course ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        courseId = courseId.trim();
        if(!ObjectId.isValid(courseId)){
          throw new GraphQLError('Course ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const courses = await courseCollection();
        const course = await courses.findOne({_id: new ObjectId(courseId)});
        if(!course){
          throw new GraphQLError(`Could not find course with an id of ${courseId}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        const enrollStudent = await students.updateOne({_id: new ObjectId(studentId)}, {$addToSet: {enrolled_courses: new ObjectId(courseId)}});
        if(enrollStudent.modifiedCount === 0){
          throw new GraphQLError(`Student with id ${studentId} is already enrolled in course with id ${courseId}!`, {extensions: {code: 'BAD_USER_INPUT'}});
        }

        return await students.findOne({_id: new ObjectId(studentId)});
      },
      removeStudentFromCourse: async (_, args) => {
        let {studentId, courseId} = args;

        if(typeof studentId !== 'string' || studentId.trim().length === 0){
          throw new GraphQLError('Student ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        studentId = studentId.trim();
        if(!ObjectId.isValid(studentId)){
          throw new GraphQLError('Student ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const students = await studentCollection();
        const student = await students.findOne({_id: new ObjectId(studentId)});
        if(!student){
          throw new GraphQLError(`Could not find student with an id of ${studentId}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        if(typeof courseId !== 'string' || courseId.trim().length === 0){
          throw new GraphQLError('Course ID must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        courseId = courseId.trim();
        if(!ObjectId.isValid(courseId)){
          throw new GraphQLError('Course ID is invalid!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const courses = await courseCollection();
        const course = await courses.findOne({_id: new ObjectId(courseId)});
        if(!course){
          throw new GraphQLError(`Could not find course with an id of ${courseId}!`, {extensions: {code: 'NOT_FOUND'}});
        }

        const removeStudent = await students.updateOne({_id: new ObjectId(studentId)}, {$pull: {enrolled_courses: new ObjectId(courseId)}});
        if(removeStudent.modifiedCount === 0){
          throw new GraphQLError(`Student with id ${studentId} was never enrolled in course with id ${courseId}!`, {extensions: {code: 'BAD_USER_INPUT'}});
        }

        return await students.findOne({_id: new ObjectId(studentId)});
      }
    }
};