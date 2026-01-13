import express from 'express';
import redis from 'redis';
import axios from 'axios';
const router = express.Router();
const client = redis.createClient();
client.connect().then(() => {});

router.get('/:pagenum', async (req, res) => {
    let {pagenum} = req.params;
    if(!/^\d+$/.test(pagenum)) return res.status(400).json({error: 'Page Number must be provided as a non-negative integer!'});

    pagenum = parseInt(pagenum);
    const limit = 60;
    const offset = pagenum * limit;
    

    try{
        let {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon/?limit=${limit}&offset=${offset}`);
        if(!data || data.results.length === 0) return res.status(404).json({error: 'No Pokemon found on given page!'});

        await client.set(`page/${pagenum}`, JSON.stringify(data));
        return res.json(data);
    } catch (e){
        return res.status(502).json({error: 'Failed to fetch from PokeAPI'});
    }
});

export default router;