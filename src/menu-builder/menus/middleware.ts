
import { RedisClient } from "redis"
import { InputAttributes } from "../typings/global"
import { promisify } from "util"

export default async function(input: InputAttributes, redis: RedisClient) {

    // ALL OPERATIONS HERE ARE PERFORMED THE STATE CONTROLLER RUNS
    // TO END PROCESS BEFORE AL THIS LEVEL RETURN continue: false

    // HANDELE ALL NILL INPUT INSTANCES
    if(input.current_input === 'NiLL') {

        const hgetallAsync = promisify(redis.hgetall).bind(redis)
        const active_variables = await hgetallAsync(input.sid+":"+input.hash+":active_variables")
        
        return {
            continue: false,
            next: false,
            invalid_input: true,
            variables: active_variables ? active_variables : {},
            end: false
        }

    }

    // EXAMPLE TO HANDLE ALL INPUTS THAT ARE 0 or 00
    // if(input.current_input === '0' || input.current_input === '00') {
    //     // DO SOMETHING
    // }

    // HANDLE PAGINATION OPTIONS
    // if(input.current_input === '*' || input.current_input === '#') {
    //     // DO SOMETHING
    // }

    return {
        continue: true,
        end: false
    }

}