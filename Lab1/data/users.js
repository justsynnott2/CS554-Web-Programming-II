import {users} from '../config/mongoCollections.js';
import bcrypt from 'bcrypt';
const saltRounds = 16;
import validation from './validation.js';

const exportedMethods = {
    async signup(name, username, password){
        name = validation.checkName(name);
        username = validation.checkUsername(username);
        password = validation.checkPassword(password);
        const hashword = await bcrypt.hash(password, saltRounds);

        let newUser = {
            name: name,
            username: username,
            password: hashword
        };

        const userCollection = await users();
        const existingUsername = await userCollection.findOne({username: username});
        if(existingUsername) throw 'Error: Username Is Already Taken!';

        const newUserInfo = await userCollection.insertOne(newUser);
        if(!newUserInfo.insertedId) throw 'Error: Sign Up Failed!';

        return {_id: newUserInfo.insertedId, name: name, username: username};
    },
    async login(username, password){
        const userCollection = await users();
        const loginUser = await userCollection.findOne({username: username});
        if(!loginUser) throw 'Error: User Does Not Exist!';

        try{
            let comparePasswords = await bcrypt.compare(password, loginUser.password);
            if(!comparePasswords) throw 'Error: Wrong Password For Account!';
        } catch (e){
            throw 'Error With Comparing Passwords!';
        }

        return {_id: loginUser._id, name: loginUser.name, username: loginUser.username};
    }
};

export default exportedMethods;