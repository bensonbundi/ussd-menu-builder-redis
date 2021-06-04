import { RedisClient } from "redis";
import { InputAttributes } from '../typings/global'

import startFunction from './controllers/start'

export default{
    start_state: {
        run: async (input: InputAttributes, redis: RedisClient) => await startFunction(input, redis),
    }
}