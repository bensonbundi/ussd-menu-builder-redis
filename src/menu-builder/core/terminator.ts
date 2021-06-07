import { RedisClient } from "redis";
import {promisify} from 'util'

export default async function(sid: string, hash: string, redis: RedisClient){

    // FETCH SESSION VARIABLES
    const hgetallAsync = promisify(redis.hgetall).bind(redis)
    const session = await hgetallAsync(sid)

    if (session && session.hash === hash){
        const lrangeAsync = promisify(redis.lrange).bind(redis)
       // FETCH SESSION ENTRIES AND SCREENS
        const session_entries = await lrangeAsync(sid+":"+hash+":entries", 0, -1)
        const session_screens = await lrangeAsync(sid+":"+hash+":screens", 0, -1)

        // TODO : WE SUGGEST TO STORE SESSION VALUES IN A DATABASE 

        // CLEAR ALL SESSION VALUES ON REDIS
        const delAsync = promisify(redis.del).bind(redis)
        const delHset = await delAsync(sid);
        const delList = await delAsync(sid+":"+hash+":entries");
        const delScreens = await delAsync(sid+":"+hash+":screens");
        const delVariables = await delAsync(sid+":"+hash+":active_variables");

    } else {
        // SESSION DOES NOT EXIST OR HASH MISMATCH
        // LOG INSTANCES OF THIS
        
    }

}