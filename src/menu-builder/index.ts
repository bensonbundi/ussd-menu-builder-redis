import {RedisClient} from 'redis'
import { InputArgs } from './typings/global'
import languages from './lang'
import configs from './configs'
import {promisify} from 'util'
import terminator from './core/terminator'
import inputManager from './core/input_manager'
import menus from './menus'


export default function(args: InputArgs, redis: RedisClient){
    return new Promise(async(resolve, reject) => {

        try{

            // BUILD INPUT VARIABLE
            let buildInput = {
                current_input: args.text,
                full_input: args.text,
                masked_input: args.text,
                active_state: configs.start_state,
                sid: configs.session_prefix+args.sessionId,
                language: configs.default_lang,
                phone: args.phoneNumber,
                hash: ""
            }
            let start_state = false;

            // CHECK IF SESSION EXISTS ON REDIS
            const hgetallAsync = promisify(redis.hgetall).bind(redis)
            const session = await hgetallAsync(buildInput.sid)

            if (session){
                // SESSION EXISTS && MANAGE INPUT / VALUE PASSED
                // INPUT MANAGER RETURNS VALUE OF CURRENT INPUT
                const onlyInput = inputManager(session.full_input, args.text)

                if(onlyInput.end){
                    // END SESSION IF INPUT PASSED VIOLATES RULES
                    await terminator(buildInput.sid, session.hash, redis)
                    reject("END " + languages[session.language].generic.input_violation)
                    return
                }

                buildInput.current_input = (onlyInput.input.trim()).length === 0 ? "NiLL" : onlyInput.input
                buildInput.active_state = session.active_state
                buildInput.language = session.language
                buildInput.masked_input = session.masked_input
                buildInput.hash = session.hash

            } else {
                // NEW SESSION
                start_state = true

                if(!configs.sequential_requests && buildInput.current_input.length > 0){
                    // REJECT SEQUENTIAL REQUESTS
                    reject("END " + languages[configs.default_lang].generic.deny_sequential_requests)
                    return
                }

                // CREATE A NEW SESSION
                const sessionhash = (+new Date).toString(36)
                const hmsetAsync = promisify(redis.hmset).bind(redis)
                const createSession = await hmsetAsync(buildInput.sid, "hash", sessionhash, "language", configs.default_lang, "active_state", configs.start_state, "session_time", configs.session_time, "phone", args.phoneNumber, "full_input", args.text, "last_input", args.text, "masked_input", args.text, "start_time", new Date().toString());

                // UPDATE SESSION HASH
                buildInput.hash = sessionhash

                // SET SESSION EXPIRY
                setTimeout(terminator, configs.session_time*1000, buildInput.sid, sessionhash, redis)

            }

            if(start_state && configs.sequential_requests && buildInput.current_input.length > 0){
                // HANDLE SEQUENTIAL QUERRIES eg: *141*3*2*5*6#
                // LOOP THROUGH ALL VALUES
                const values = buildInput.current_input.split("*");
                let entry_input = values[0]
                let final_response = ""
                for ( const [i, v] of values.entries() ){
                    buildInput.current_input = v
                    if(i > 0){
                        entry_input = entry_input + "*" + v
                        buildInput.full_input = entry_input
                        
                        const fetchsession = await hgetallAsync(buildInput.sid)
                        buildInput.masked_input = fetchsession.masked_input
                        buildInput.active_state = fetchsession.active_state
                        buildInput.language = fetchsession.language
                    }

                    const response: any = await menus(buildInput, redis)
                    final_response = response

                    if(response.substr(0, 3) === 'END'){
                        break;
                    }
                }

                resolve(final_response);
                return


            } else {
                // HANDLE NON SEQUENTIAL QUERRIES
                const response = await menus(buildInput, redis)
                resolve(response);
                return

            }



        }catch(e) {
            // SOMETHING WENT REALLY WRONG
            reject("END " + languages[configs.default_lang].generic.fatal_error )
            return

        }

    })
}