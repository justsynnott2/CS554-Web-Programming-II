import {Router} from 'express';
const router = Router();
import {blogData, userData} from '../data/index.js';
import validation from '../data/validation.js';

router
    .route('/')
    .get(async (req, res) => {
        try{
            let {skip, take} = req.query;
            if(!skip) skip = '0';
            if(!take) take = '25';

            skip = parseInt(skip);
            take = parseInt(take);

            if(!Number.isInteger(skip) || skip < 0) return res.status(400).json({error: 'Skip Must Be A Postive Integer!'});
            if(!Number.isInteger(take) || take < 1) return res.status(400).json({error: 'Take Must Be A Positive Integer!'});

            if(take > 100) take = 100;

            const blogs = await blogData.getPosts(skip, take);
            res.json(blogs);
        } catch (e){
            return res.status(500).json({error: e});
        }
    })
    .post(async (req, res) => {
        if(!req.session.user) return res.status(401).json({error: 'Only Logged In Users Can Add Posts!'});

        const blogPostData = req.body;
        if(!blogPostData || Object.keys(blogPostData).length !== 2) return res.status(400).json({error: 'Request Field Must Supply Title And Body!'});

        try{
            blogPostData.title = validation.checkBlogAttribute(blogPostData.title, 'Title');
            blogPostData.body = validation.checkBlogAttribute(blogPostData.body, 'Body');
        } catch (e){
            return res.status(400).json({error: e});
        }

        try{
            const {title, body} = blogPostData;
            const newBlog = await blogData.addPost(title, body, req.session.user._id);
            return res.json(newBlog);
        } catch(e){
            return res.status(500).json({error: e});
        }
    });

router
    .route('/signup')
    .post(async (req, res) => {
        const body = req.body;
        if(!body || Object.keys(body).length !== 3) return res.status(400).json({error: 'Request Field Must Supply Name, Username, And Password!'});

        try{
            body.name = validation.checkName(body.name);
            body.username = validation.checkUsername(body.username);
            body.password = validation.checkPassword(body.password);
        } catch(e){
            return res.status(400).json({error: e});
        }
        try{
            const newUser = await userData.signup(body.name, body.username, body.password);
            return res.json(newUser);
        } catch(e){
            return res.status(400).json({error: e});
        }
    });

router
    .route('/login')
    .post(async (req, res) => {
        const body = req.body;
        if(!body || Object.keys(body).length !== 2) return res.status(400).json({error: 'Request Field Must Supply Username And Password!'});
        try{
            body.username = validation.checkUsername(body.username);
            body.password = validation.checkPassword(body.password);
        } catch(e){
            return res.status(400).json({error: e});
        }
        try{
            const user = await userData.login(body.username, body.password);
            req.session.user = {_id: user._id, username: user.username};
            res.json(user);
        } catch(e){
            return res.status(400).json({error: e});
        }
    });

router
    .route('/logout')
    .get(async (req, res) => {
        if(req.session.user){
            req.session = null;
            return res.json({message: "You Have Been Logged Out!"});
        }
        return res.json({message: "You Weren't Logged In!"});
    });

router
    .route('/:id')
    .get(async (req, res) => {
        try{
            req.params.id = validation.checkId(req.params.id);
        } catch (e) {
            return res.status(400).json({error: e});
        }
        try{
            const blog = await blogData.getPostById(req.params.id);
            return res.json(blog);
        } catch (e) {
            return res.status(404).json({error: e});
        }
    })
    .put(async (req, res) => {
        if(!req.session.user) return res.status(401).json({error: 'Only Logged In Users Can Update Posts!'});

        const updatedData = req.body;
        if(!updatedData || Object.keys(updatedData).length !== 2) return res.status(400).json({error: 'Request Field Must Supply Title And Body!'});

        try{
            req.params.id = validation.checkId(req.params.id);
            updatedData.title = validation.checkBlogAttribute(updatedData.title, 'Title');
            updatedData.body = validation.checkBlogAttribute(updatedData.body, 'Body');
        } catch (e){
            return res.status(400).json({error: e});
        }
        try{
            const updatedBlog = await blogData.updateEntirePost(req.params.id, updatedData.title, updatedData.body, req.session.user._id);
            return res.json(updatedBlog);
        } catch(e){
            return res.status(404).json({error: e});
        }
    })
    .patch(async (req, res) => {
        if(!req.session.user) return res.status(401).json({error: 'Only Logged In Users Can Update Posts!'});

        const updatedData = req.body;
        if(!updatedData || Object.keys(updatedData).length === 0) return res.status(400).json({error: 'Request Field Must Either Supply Title, Body, Or Both!'});

        try{
            req.params.id = validation.checkId(req.params.id);
            if(updatedData.title) updatedData.title = validation.checkBlogAttribute(updatedData.title, 'Title');
            if(updatedData.body) updatedData.body = validation.checkBlogAttribute(updatedData.body, 'Body');
        } catch(e) {
            return res.status(400).json({error: e});
        }
        try{
            const updatedBlog = await blogData.updatePartPost(req.params.id, updatedData.title, updatedData.body, req.session.user._id);
            return res.json(updatedBlog);
        } catch(e){
            return res.status(400).json({error: e});
        }
    });

router
    .route('/:id/comments')
    .post(async (req, res) => {
        if(!req.session.user) return res.status(401).json({error: 'Only Logged In Users Can Comment On Posts!'});

        const commentData = req.body;
        if(!commentData || Object.keys(commentData).length !== 1) return res.status(400).json({error: 'Request Field Only Needs To Supply The Comment!'});

        try{
            req.params.id = validation.checkId(req.params.id);
            commentData.comment = validation.checkBlogAttribute(commentData.comment, 'Comment');
        } catch(e){
            return res.status(400).json({error: e});
        }
        try{
            const newComment = await blogData.addComment(req.params.id, commentData.comment, req.session.user._id);
            return res.json(newComment);
        } catch(e){
            return res.status(400).json({error: e});
        }
    });

router
    .route('/:blogId/:commentId')
    .delete(async (req, res) => {
        if(!req.session.user) return res.status(401).json({error: 'Only Logged In Users Can Delete Comments!'});

        try{
            req.params.blogId = validation.checkId(req.params.blogId);
            req.params.commentId = validation.checkId(req.params.commentId);
        } catch(e){
            return res.status(400).json({error: e});
        }
        try{
            let deletedComment = await blogData.deleteComment(req.params.blogId, req.params.commentId, req.session.user._id);
            return res.json(deletedComment);
        } catch(e){
            return res.status(400).json({error: e});
        }
    });

export default router;