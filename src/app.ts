import express from 'express';
import redis from 'redis';
import ussdMenuBuilder from './menu-builder'

const app: express.Application = express();
app.disable('etag').disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// CONNECT TO REDIS SERVER
const redisClient = redis.createClient({
    host: "localhost",
    // password: configs.password,
    port: 6379
})

redisClient.on('connect', () => {
    console.log('Connected to redis server');
})

redisClient.on('error', (err) => {
    console.log('Redis connection error', err);
})


app.post('/ussd', async (req, res) => {

    let menu_res;
    try{
        menu_res = await ussdMenuBuilder(req.body, redisClient);
    } catch(e){
        console.log("MENU ERROR");
        return res.send(e)
        
    }
    res.send(menu_res);

});


const port = 4000;
app.listen(port, () => console.log(`Server listening at port ${port}`));