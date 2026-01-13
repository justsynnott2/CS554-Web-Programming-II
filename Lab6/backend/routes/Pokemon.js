import express from 'express';
import redis from 'redis';
import axios from 'axios';
const router = express.Router();
const client = redis.createClient();
client.connect().then(() => {});

router.get('/:id', async (req, res) => {
    let {id} = req.params;
    if(!/^\d+$/.test(id)) return res.status(400).json({error: 'Id must be provided as a non-negative integer!'});

    try{
        let {data} = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if(!data) return res.status(404).json({error: 'No Pokemon found with given id!'});

        await client.set(`pokemon/${id}`, JSON.stringify(data));
        return res.json(data);
    } catch (e) {
        if (e.response && e.response.status === 404) return res.status(404).json({error: 'No Pokemon found with given id!'});
        else return res.status(502).json({error: 'Failed to fetch from PokeAPI'});
    }
})

export default router;