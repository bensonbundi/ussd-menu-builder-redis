import { RedisClient } from "redis";
import { InputAttributes } from "../../typings/global";

export default async function(input: InputAttributes, redis: RedisClient) {

    // DO WHATEVER YOU WANT
    // EXAMPLE ON HOW TO RETURN:
    // NOTICE: WHENEVER YOU WANT TO PASS VARIABLES ITS RECOMMENDED TO STORE THEM AS activr_variables
    // const setActiveVariables = await hmsetAsync(input.sid+":"+input.hash+":active_variables", "s1", `${user.first_name} ${user.last_name}` );

    // return {
    //     next: true,
    //     next_screen: 'user_exists',
    //     variables: {
    //         "s1": `${user.first_name} ${user.last_name}`
    //     }
    // }

}