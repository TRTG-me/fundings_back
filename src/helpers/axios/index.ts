import axios from "axios";

export const instanceHype = axios.create({
    baseURL: 'https://api.hyperliquid.xyz/info',
})