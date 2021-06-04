import { RedisClient } from "redis"
import { InputAttributes } from "../../typings/global"
import { promisify } from "util"
import states from '../';

export default async function(input: InputAttributes, redis: RedisClient) {

    // CHECK EXISTANCE OF ACTIVE VARIABLES
    const hgetallAsync = promisify(redis.hgetall).bind(redis)
    const active_variables = await hgetallAsync(input.sid+":"+input.hash+":active_variables")

    // IF NOT NUMBER RETURN INVALID INPUT
    if(!Number(input.current_input)){
        return {
            next: false,
            invalid_input: true,
            variables: active_variables ? active_variables : {},
        }
        
    } else {
        const stateOp = states[input.active_state]
        const selections = stateOp.menu_options.filter((el) => el.active === true)

        // IF INPUT IS GRATER THAN THE OPTIONS AVAILABLE
        if(Number(input.current_input) > selections.length || Number(input.current_input) <= 0){
            return {
                next: false,
                invalid_input: true,
                variables: active_variables ? active_variables : {},
            }
        }
        
        const operation = selections[(Number(input.current_input) - 1)]
        console.log("Operation selected ", operation);

        return {
            next: true,
            next_screen: operation.action,
            variables: {},
            end: operation.end ? true : false
        }
    }

}