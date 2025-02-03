import axios from "axios";

export const instanceHype = axios.create({
    baseURL: 'http://api.hyperliquid.xyz/info',
})

export const instanceHypeProxy = axios.create({
    baseURL: 'https://api.hyperliquid.xyz/info',
    proxy: {
        host: 'your-proxy-host', // Например, '123.45.67.89'
        port: 8080,               // Порт прокси
    }
})
export const proxyConfig = {
    host: 'rg-19656.sp2.ovh',
    port: 11001,
    protocol: 'http',
    auth: {
        username: '6gXXwo_0',
        password: 'YWjX1xEZJP17'
    }
};


export const proxyConfigBin = {
    host: 'rg-19656.sp2.ovh',
    port: 11001,
    protocol: 'http',
    auth: {
        username: '6gXXwo_0',
        password: 'YWjX1xEZJP17'
    }
};
export const generateProxyConfig = (port: number) => {
    // Получаем последнюю цифру порта
    const lastDigit = port % 10;

    // Создаем новый логин, уменьшая последнюю цифру на 1
    const newLogin = `6gXXwo_${lastDigit === 0 ? 9 : lastDigit - 1}`;

    return {
        host: 'rg-19656.sp2.ovh',
        port: port,
        protocol: 'http',
        auth: {
            username: newLogin, // Новый логин
            password: 'YWjX1xEZJP17' // Оставляем пароль без изменений
        }
    };
};
