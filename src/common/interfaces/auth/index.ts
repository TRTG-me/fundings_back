export interface IJwtPayLoad {
    user: IUserJWT;
    iat: number;
    exp: number;
}

export interface IUserJWT {
    email: string;

    name: string


}
export interface IUserJWT {
    email: string;

    name: string
}

export interface IDataCByCoins {
    symbolB: string
    symbolH: string
    count: number
    hours: number
}
export interface IBinData {
    symbol: string
    fundingTime: number
    fundingRate: string
    markPrice: string
}
export interface IHypeDAta {
    coin: string
    fundingRate: string
    premium: string
    time: number
}
export interface IAllBdResult {
    coin: string,
    hours: number[],
    days: number[],
    last1Day: number,
    last3Days: number,
    last7Days: number,
    last14Days: number,
    last30Days: number,
    last60Days: number
}


