import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import blogData from './data/blogs.js';
import validation from './data/validation.js';

import {createClient} from 'redis';
const client = createClient();
client.connect().then(() => {});

app.use(express.json());

app.use(
    session({
        name: 'Lab2',
        secret: "Uhh",
        saveUninitialized: false,
        resave: false,
        cookie: {maxAge: 60000}
    })
);

app.use((req, res, next) => {
    if(req.path.startsWith('/blog') && ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.path.endsWith('/login') && !req.path.endsWith('/signup') && !req.path.endsWith('/logout')){
        if(!req.session.user) return res.status(401).json({error: 'Error: You Have To Be Logged In To Do That!'});
    }
    next();
});

app.use('/blog/:blogId/:commentId', async (req, res, next) => {
    if(req.method !== 'DELETE') return next();

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

//Checks cache for blogList
app.use('/blog', async (req, res, next) => {
    if(req.method !== 'GET' || req.path !== '/') return next();
    
    const doesBlogListExist = await client.exists('blogList');
    if(!doesBlogListExist) return next();
    
    let {skip, take} = req.query;
    if(!skip) skip = '0';
    if(!take) take = '25';

    skip = parseInt(skip);
    take = parseInt(take);

    if(!Number.isInteger(skip) || skip < 0) return res.status(400).json({error: 'Skip Must Be A Postive Integer!'});
    if(!Number.isInteger(take) || take < 1) return res.status(400).json({error: 'Take Must Be A Positive Integer!'});

    if(take > 100) take = 100;

    const blogList = await client.get('blogList');
    const blogListJSON = JSON.parse(blogList);
    return res.json(blogListJSON.slice(skip, skip+take));
});

//Check cache for individual blogs
app.use('/blog/:id', async (req, res, next) => {
    if(req.method !== 'GET' || req.path != '/') return next();
    const doesBlogExist = await client.exists(req.params.id);
    if(!doesBlogExist) return next();

    const blog = await client.get(req.params.id);
    const blogJSON = JSON.parse(blog);
    await client.zIncrBy('blogRequestCount', 1, blog);
    return res.json(blogJSON);
});


configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});