import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import configRoutes from './routes/index.js';
import redis from 'redis';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const staticMiddleware = express.static(path.join(__dirname, 'public'));
const client = redis.createClient();
client.connect().then(() => {});

app.use('/public', staticMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/pokemon/page/:pagenum', async (req, res, next) => {
    const {pagenum} = req.params;
    if(!/^\d+$/.test(pagenum)) return res.status(400).json({error: 'Page Number must be provided as a non-negative integer!'});

    const exists = await client.exists(`page/${pagenum}`);
    if(exists){
        const pageData = await client.get(`page/${pagenum}`);
        return res.json(JSON.parse(pageData));
    }
    else next();
});

app.use('/api/pokemon/:id', async (req, res, next) => {
    if(!req.originalUrl === '/pokemon/page/:pagenum')
    {
        const {id} = req.params;
        if(!/^\d+$/.test(id)) return res.status(400).json({error: 'Id must be provided as a non-negative integer!'});
        const exists = await client.exists(`pokemon/${id}`);
        if(exists){
            const pageData = await client.get(`pokemon/${id}`);
            return res.json(JSON.parse(pageData));
        }
        else next();
    } else next();
});

configRoutes(app);
app.listen(3000, async () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});