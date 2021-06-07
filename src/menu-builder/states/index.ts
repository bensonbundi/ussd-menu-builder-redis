import { RedisClient } from "redis";
import { InputAttributes } from '../typings/global'
import goNext from './controllers/go_next'

import startFunction from './controllers/start'

export default{
    start_state: {
        run: async (input: InputAttributes, redis: RedisClient) => await startFunction(input, redis),
    },

    // BELOW IS A SELECT / COUNT CONFIG EXAMPLE
    // user_new: {
    //     run: async(input: InputAttributes, redis: RedisClient) => await goNext(input, redis),
    //     type: "count",
    //     menu_options: [
    //         {
    //             id: "1",
    //             active: true,
    //             action: "bvn"
    //         },
    //         {
    //             id: "2",
    //             active: true,
    //             action: "nin"
    //         }
    //     ]
    // }

    // BELOW IS AN ENTRY CONFIG EXAMPLE
    // user_exists: {
    //     type: "entry",
    //     run: async(input: InputAttributes, redis: RedisClient) => await userExists(input, redis),
    //     input_sensitivity: true,
    // },
}