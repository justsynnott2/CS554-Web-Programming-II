import {Router} from 'express';
const router = Router();
import {blogData, userData} from '../data/index.js';
import {blogs, users} from '../config/mongoCollections.js';
import validation from '../data/validation.js';

import {createClient} from 'redis';
const client = createClient();
client.connect().then(() => {});

router
    .route('/')
    .get(async (req, res) => {
        try{
            const topTen = await client.zRange('blogRequestCount', 0, 9, {REV: true});
            let mostPopular = [];
            for(let i = 0; i < topTen.length; i++){
                mostPopular.push(JSON.parse(topTen[i]));
            }
            return res.json(mostPopular);
        } catch (e) {
            return res.status(500).json({error: e});
        }
    });

export default router;