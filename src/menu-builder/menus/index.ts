import { RedisClient } from "redis"
import { InputAttributes } from "../typings/global"
import {promisify} from "util"
import states from "../states"
import languages from '../lang'
import terminator from "../core/terminator"
import middleware from "./middleware"
import menuBuilder from "./menu-builder"

export default async function(input: InputAttributes, redis: RedisClient){

    let prefix = 'CON ';
    let end = false;
    let response: string;
    const hmsetAsync = promisify(redis.hmset).bind(redis)

    // CHECK STATE EXISTS
    const state = states[input.active_state]

    if(!state){
        end = true;
        prefix = 'END ';
        response = languages[input.language].generic.fatal_error
    } else {

        // HIDE SENSITIVE INPUTS
        let inputvalue = input.current_input;
        if(state.input_sensitivity){
            inputvalue = 'SENSITIVE'
        }

        // RUN MIDDLEWARE
        let runState: any = await middleware(input, redis);
        if(runState.continue){
            runState = await state.run(input, redis);
        }

        if (runState.end){
            end = true;
            prefix = 'END ';
        }

        if(runState.next){
            // REDIS UPDATE STATE
            const updateActiveState = await hmsetAsync(input.sid, "active_state", runState.next_screen, "full_input", input.full_input, "last_input", input.current_input, "masked_input", input.masked_input+"*"+inputvalue);
            const nextState = states[runState.next_screen];
            const stateText = languages[input.language][runState.next_screen]

            response = menuBuilder(nextState, stateText, runState.variables)
    
        } else {
            const updateActiveState = await hmsetAsync(input.sid, "full_input", input.full_input, "last_input", input.current_input, "masked_input", input.masked_input+"*"+inputvalue);

            // HANDLE INVALID INPUT SCENARIO
            if(runState.invalid_input){

                const invalidInputText = languages[input.language].generic.bad_input
                const currState = states[input.active_state];
                const stateText = languages[input.language][input.active_state]

                response = menuBuilder(currState,stateText, runState.variables, invalidInputText)

            }
        }

        // UPDATE SESSION ENTRIES AND SCREENS
        const rpushAsync = promisify(redis.rpush).bind(redis)
        const insertEntry = await rpushAsync(input.sid+":"+input.hash+":entries", input.active_state+":"+inputvalue)
        const insertScreens = await rpushAsync(input.sid+":"+input.hash+":screens", response)

    }

     // IF END TERMINATE SESSION FORCEFULLY
     if(end){
        await terminator(input.sid, input.hash, redis)
    }

    return prefix + response
    
}