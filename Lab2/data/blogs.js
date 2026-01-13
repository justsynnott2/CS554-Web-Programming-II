import {blogs, users} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import validation from './validation.js';

const exportedMethods = {
    async getPosts(skip = 0, take = 25) {
        const blogCollection = await blogs();
        if(take > 100) take = 100;
        const blogList = await blogCollection.find({}).skip(skip).limit(take).toArray();
        return blogList;
    },
    async getPostById(id) {
        id = validation.checkId(id);
        const blogCollection = await blogs();
        const blog = await blogCollection.findOne({_id: new ObjectId(id)});
        if(!blog) throw 'Error: Blog Not Found!';
        return blog;
    },
    async addPost(title, body, posterId) {
        title = validation.checkBlogAttribute(title, 'Title');
        body = validation.checkBlogAttribute(body, 'Body');
        posterId = validation.checkId(posterId);

        const userCollection = await users();
        const poster = await userCollection.findOne({_id: new ObjectId(posterId)});

        let newBlog = {
            title: title,
            body: body,
            postedBy: {
                _id: new ObjectId(posterId),
                username: poster.username
            },
            postedOn: validation.createDate(),
            comments: []
        };

        const blogCollection = await blogs();
        const newBlogInfo = await blogCollection.insertOne(newBlog);
        if(!newBlogInfo.insertedId) throw 'Error: Insert Failed!';

        return this.getPostById(newBlogInfo.insertedId.toString());
    },
    async updateEntirePost(id, title, body, posterId){
        id = validation.checkId(id);
        title = validation.checkBlogAttribute(title, 'Title');
        body = validation.checkBlogAttribute(body, 'Body');
        posterId = validation.checkId(posterId);

        const blog = await this.getPostById(id);
        if(!blog) throw 'Error: Blog Not Found!';
        if(blog.postedBy._id.toString() !== posterId) throw 'Error: Users Can Only Update Posts That They Have Published!';

        const blogCollection = await blogs();
        await blogCollection.findOneAndUpdate(
            {_id: new ObjectId(id)},
            {$set: {title: title, body: body, updatedOn: validation.createDate()}}
        );
        return await this.getPostById(id);
    },
    async updatePartPost(id, title, body, posterId){
        id = validation.checkId(id);
        posterId = validation.checkId(posterId);

        const blog = await this.getPostById(id);
        if(!blog) throw 'Error: Blog Not Found!';
        if(blog.postedBy._id.toString() !== posterId) throw 'Error: Users Can Only Update Posts That They Have Published!';

        let updateFields = {};
        if(title){
            title = validation.checkBlogAttribute(title, 'Title');
            updateFields.title = title;
        }
        if(body){
            body = validation.checkBlogAttribute(body, 'Body');
            updateFields.body = body;
        }

        if(Object.keys(updateFields).length === 0) throw 'Error: At Least One Field Needs To Be Updated!';

        updateFields.updatedOn = validation.createDate();

        const blogCollection = await blogs();
        const updateBlogInfo = await blogCollection.findOneAndUpdate(
            {_id: new ObjectId(id)},
            {$set: updateFields},
            {returnDocument: 'after'}
        );
        if(!updateBlogInfo) throw 'Error: Update Failed!';

        return updateBlogInfo;
    },
    async addComment(blogId, comment, userId){
        blogId = validation.checkId(blogId);
        comment = validation.checkBlogAttribute(comment, 'Comment');
        userId = validation.checkId(userId);

        const userCollection = await users();
        const user = await userCollection.findOne({_id: new ObjectId(userId)});
        if(!user) throw "Error: User Not Found!";

        const blog = await this.getPostById(blogId);
        if(!blog) throw 'Error: Blog Not Found!';

        let newComment = {
            _id: new ObjectId(),
            postedBy: {
                _id: new ObjectId(userId),
                username: user.username
            },
            postedOn: validation.createDate(),
            comment: comment
        };

        const blogCollection = await blogs();
        const addComentInfo = await blogCollection.updateOne(
            {_id: new ObjectId(blogId)},
            {$push: {comments: newComment}}
        );
        
        return this.getPostById(blogId);
    },
    async deleteComment(blogId, commentId, posterId){
        blogId = validation.checkId(blogId);
        commentId = validation.checkId(commentId);
        posterId = validation.checkId(posterId);

        const blogPost = await this.getPostById(blogId);
        if(!blogPost) throw 'Error: Blog Not Found!';

        let comment = {};
        for(let i = 0; i < blogPost.comments.length; i++){
            if(blogPost.comments[i]._id.toString() === commentId) comment = blogPost.comments[i];
        }
        if(Object.keys(comment).length === 0) throw 'Error: Comment Not Found!';

        if(comment.postedBy._id.toString() !== posterId) throw 'Error: Comments Can Only Be Deleted By The User Who Commented It!';

        const blogCollection = await blogs();
        await blogCollection.updateOne(
            {_id: new ObjectId(blogId)},
            {$pull: {comments: {_id: new ObjectId(commentId)}}}
        );

        return await this.getPostById(blogId);
    }
};

export default exportedMethods;