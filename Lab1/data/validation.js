import {ObjectId} from 'mongodb';

const exportedMethods = {
    checkId(id){
        if(!id) throw 'Error: Id Must Be Supplied!';
        if(typeof id !== 'string') throw 'Error: Id Must Be Provided As A String!';
        id = id.trim();
        if(id.length === 0) throw 'Error: Id Cannot Be An Empty String Or Just Spaces!';
        if(!ObjectId.isValid(id)) throw 'Error: Invalid Object Id!';
        return id;
    },
    checkBlogAttribute(value, blogVar){
        if(!value) throw `Error: ${blogVar} Must Be Supplied!`;
        if(typeof value !== 'string') throw `Error: ${blogVar} Must Be Provided As A String!`;
        value = value.trim();
        if(value.length === 0) throw `Error: ${blogVar} Cannot Be An Empty String Or Just Spaces!`;
        if(blogVar === 'Title'){
            if(value.length < 10 || value.length > 255) throw 'Error: Title Must Be Between 10 And 255 Characters!';
        }
        else if(blogVar === 'Body'){
            if(value.length < 25) throw 'Error: Body Must Be Greater Than 25 Characters!';
        }
        else{
            if(value.length < 10 || value.length > 500) throw 'Error: Comments Must Be Between 10 And 500 Characters!';
        }
        return value;
    },
    createDate(){
        const date = new Date();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        let formatDate = "";
        if(month < 10) formatDate += "0" + month.toString();
        else formatDate += month.toString();
        formatDate += "/";
        if(day < 10) formatDate += "0" + day.toString();
        else formatDate += day.toString();
        formatDate += "/" + year.toString();
        return formatDate;
    },
    checkName(name){
        if(!name) throw 'Error: Name Must Be Supplied!';
        if(typeof name !== 'string') throw 'Error: Name Must Be Provided As A String!';
        name = name.trim();
        if(name.length < 5 || name.length > 25) throw 'Error: Name Must Be Between 5-25 Characters!';
        if(!/^[A-Za-z '.\-]+$/.test(name)) throw 'Error: Name Can Only Contain Letters, Spaces, Apostrophes, Periods, And Hyphens!';
        return name;
    },
    checkUsername(username){
        if(!username) throw 'Error: Username Must Be Supplied!';
        if(typeof username !== 'string') throw 'Error: Username Must Be Provided As A String!';
        username = username.trim();
        username = username.toLowerCase();
        if(username.length < 5) throw 'Error: Username Must Be Have At Least 5 Characters!';
        if(!isNaN(username)) throw 'Error: Username Cannot Contain Only Numbers, You Need At Least One Letter!';
        if(!/^[a-z0-9]+$/.test(username)) throw 'Error: Username Can Only Contain Letters and Numbers!';
        return username;
    },
    checkPassword(password){
        if(!password) throw 'Error: Password Must Be Supplied!';
        if(typeof password !== 'string') throw 'Error: Password Must Be Provided As A String!';
        if(password.length < 8) throw 'Error: Password Must Be At Least 8 Characters Long!';
        if(/[ ]/.test(password)) throw 'Error: Password Cannot Contain Any Spaces!';
        if(!/[a-z]/.test(password)) throw 'Error: Password Must Contain At Least One Lowercase Character!';
        if(!/[A-Z]/.test(password)) throw 'Error: Password Must Contain At Least One Uppercase Character!';
        if(!/[0-9]/.test(password)) throw 'Error: Password Must Contain At Least One Number!';
        if(!/[^A-Za-z0-9]/.test(password)) throw 'Error: Password Must Contain At Least One Special Character!';
        return password;
    }
};

export default exportedMethods;