import {GraphQLError, validate} from 'graphql';

const exportedMethods = {
    validateDate(date){
        if(typeof date !== 'string' || date.trim().length === 0){
            throw new GraphQLError('Date must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        date = date.trim();
        const dateArr = date.split('/');
        if(dateArr.length !== 3){
            throw new GraphQLError('Date must be provided in MM/DD/YYYY format!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        //Checks that every character besides / is a number
        for(let i = 0; i < dateArr.length; i++){
            if(!/^\d+$/.test(dateArr[i])){
                throw new GraphQLError('Date\'s characters must only consist of numbers!', {extensions: {code: 'BAD_USER_INPUT'}});
            }
        }

        const month = dateArr[0];
        const day = dateArr[1];
        const year = dateArr[2];

        if(month.length !== 2 || day.length !== 2 || year.length !== 4){
            throw new GraphQLError('Date must be provided in MM/DD/YYYY format!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        //Month
        if(parseInt(month) < 1 || parseInt(month) > 12){
            throw new GraphQLError('Month must be in the range of 01 to 12', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        //Year
        if(parseInt(year) < 1900){
            throw new GraphQLError('Year must be greater than or equal to 1900!', {extensions: {code: 'BAD_USER_INPUT'}});
        }

        //Day
        if(month === '02'){
            if(parseInt(year) % 4 === 0 && (parseInt(year) % 100 !== 0 || parseInt(year) % 400 === 0)){
                if(parseInt(day) < 1 || parseInt(day) > 29){
                    throw new GraphQLError('Improper day selected for the month provided!', {extensions: {code: 'BAD_USER_INPUT'}});
                }
            }
            else{
                if(parseInt(day) < 1 || parseInt(day) > 28){
                    throw new GraphQLError('Improper day selected for the month provided!', {extensions: {code: 'BAD_USER_INPUT'}});
                }
            }
        }
        else if(month === '04' || month === '06' || month === '09' || month === '11'){
            if(parseInt(day) < 1 || parseInt(day) > 30){
                throw new GraphQLError('Improper day selected for the month provided!', {extensions: {code: 'BAD_USER_INPUT'}});
            }
        }
        else{
            if(parseInt(day) < 1 || parseInt(day) > 31){
                throw new GraphQLError('Improper day selected for the month provided!', {extensions: {code: 'BAD_USER_INPUT'}});
            }
        }

        return date;
    },
    dateToKey(date){
        const dateArr = date.split('/');
        let dateKey = dateArr[2] + dateArr[0] + dateArr[1];
        dateKey = parseInt(dateKey);
        return dateKey;
    },
    validateAge(date_of_birth){
        const [mm, dd, yyyy] = date_of_birth.split('/').map(Number);
        const dob = new Date(yyyy, mm - 1, dd);
        const current = new Date();
        let age = current.getFullYear() - dob.getFullYear();
        const month = current.getMonth() - dob.getMonth();
        if (month < 0 || (month === 0 && current.getDate() < dob.getDate())) age--;
        if (age < 16 || age > 100) {
            throw new GraphQLError('Student must be between the ages of 16 to 100 to attend college!', {extensions:{code:'BAD_USER_INPUT'}});
        }
    },
    validateString(str, strName){
        if(typeof str !== 'string' || str.trim().length === 0) throw new GraphQLError(`${strName} must be provided as a nonempty string!`, {extensions: {code: 'BAD_USER_INPUT'}});
        str = str.trim();
        if(!/^[A-Za-z '.\-]+$/.test(str)) throw new GraphQLError(`${strName} can only contain letters, spaces, apostrophes, periods, and hyphens!`, {extensions: {code: 'BAD_USER_INPUT'}});
        return str;
    },
    validateStringNum(str, strName){
        if(typeof str !== 'string' || str.trim().length === 0) throw new GraphQLError(`${strName} must be provided as a nonempty string!`, {extensions: {code: 'BAD_USER_INPUT'}});
        str = str.trim();
        if(!/^[A-Za-z0-9 '.\-]+$/.test(str)) throw new GraphQLError(`${strName} can only contain letters, numbers, spaces, apostrophes, periods, and hyphens!`, {extensions: {code: 'BAD_USER_INPUT'}});
        return str;
    },
    validateEmail(email){
        if(typeof email !== 'string' || email.trim().length === 0){
            throw new GraphQLError('Email must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        email = email.trim();
        const atIdx = email.indexOf('@');
        if(atIdx === -1 || atIdx !== email.lastIndexOf('@')){
            throw new GraphQLError('Email must contain one @ and only one!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const emailArr = email.split('@');
        if(emailArr[0].length < 1 || /\s/.test(emailArr[0])){
            throw new GraphQLError('Local-part must be at least one character and not contain any spaces!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        if(emailArr[1].length < 4 || emailArr[1].indexOf('.') === -1){
            throw new GraphQLError('Domain must be at least fours characters and contain a dot followed by at least two characters!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const dot = emailArr[1].slice(emailArr[1].lastIndexOf('.') + 1);
        if(dot.length < 2 || !/^[a-z]+$/.test(dot)){
            throw new GraphQLError('The part that follows the dot must be at least two characters long and only consist of lowercase letters!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        return email;
    },
    validatePhoneNumber(number){
        if(typeof number !== 'string' || number.trim().length === 0){
            throw new GraphQLError('Number must be provided as a nonempty string!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        number = number.trim();
        const numberArr = number.split('-');
        if(numberArr.length !== 3){
            throw new GraphQLError('Number must be provided in ###-###-#### format!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        if(!/^\d{3}$/.test(numberArr[0]) || !/^\d{3}$/.test(numberArr[1]) || !/^\d{4}$/.test(numberArr[2])){
            throw new GraphQLError('Number must be provided in ###-###-#### format!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        return number;
    },
    validateGPA(gpa){
        if(typeof gpa !== 'number' || !Number.isFinite(gpa)){
            throw new GraphQLError('GPA must provided as a number!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        if(gpa < 1 || gpa > 4){
            throw new GraphQLError('GPA must be between the range 1.00-4.00!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        const gpaString = String(gpa);
        const idx = gpaString.indexOf('.');
        if(idx !== -1 && gpaString.length - idx - 1 > 2){
            throw new GraphQLError('GPA can only have up to two decimal places!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        return gpa;
    },
    validateCredits(credits){
        if(typeof credits !== 'number' || !Number.isInteger(credits) || credits < 1 || credits > 6){
            throw new GraphQLError('Credits must be provided as an integer!', {extensions: {code: 'BAD_USER_INPUT'}});
        }
        return credits;
    }
}

export default exportedMethods;