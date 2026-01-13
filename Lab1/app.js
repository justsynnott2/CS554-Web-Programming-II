import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import blogData from './data/blogs.js';
import validation from './data/validation.js';

app.use(express.json());

app.use(
    session({
        name: 'Lab1',
        secret: "Uhh",
        saveUninitialized: false,
        resave: false,
        cookie: {maxAge: 60000}
    })
);

app.use((req, res, next) => {
    if(req.path.startsWith('/blog') && ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.path.endsWith('/login') && !req.path.endsWith('/signup')){
        if(!req.session.user) return res.status(401).json({error: 'Error: You Have To Be Logged In To Do That!'});
    }
    next();
});

app.use('/blog/:id/comments', (req, res, next) => {
    if (!req.session.user) return res.status(401).json({error: 'Error: You Have To Be Logged In To Do That!'});
    next();
});

app.use('/blog/:blogId/:commentId', async (req, res, next) => {
  if (!req.session.user) return res.status(401).json({error: 'Error: You Have To Be Logged In To Do That!'});

    try{
        req.params.blogId = validation.checkId(req.params.blogId);
        req.params.commentId = validation.checkId(req.params.commentId);
    } catch(e){
        return res.status(400).json({error: e});
    }
    try{
        const blog = await blogData.getPostById(req.params.blogId);
        let comment;
        for(let i = 0; i < blog.comments.length; i++){
            if(blog.comments[i]._id.toString() === req.params.commentId.toString()) comment = blog.comments[i];
        }
        if(!comment) return res.status(404).json({error: 'Error: Comment not found'});

        if(comment.postedBy._id.toString() !== req.session.user._id) return res.status(403).json({error: 'Error: Comments Can Only Be Deleted By The Ones Who Posted It!'});
        next();
    } catch(e){
        return res.status(500).json({error: e});
    }
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});