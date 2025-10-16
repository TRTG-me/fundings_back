import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ec, typedData as starkTypedData, TypedData, shortString } from 'starknet';
import { getUnixTime } from 'date-fns';
import * as dotenv from 'dotenv';

// --- [ИСПРАВЛЕНО] Возвращаем полные определения интерфейсов ---

type UnixTime = number;

interface AuthRequest extends Record<string, unknown> {
    method: string;
    path: string;
    body: string;
    timestamp: UnixTime;
    expiration: UnixTime;
}

// Константы для основной сети (Mainnet)
const PARADEX_API_URL = 'https://api.prod.paradex.trade/v1';
const STARKNET_CHAIN_ID = shortString.encodeShortString("PRIVATE_SN_PARACLEAR_MAINNET");

// Ваши данные аккаунта
const ACCOUNT = {
    address: process.env.ACCOUNT_ADDRESS,
    privateKey: process.env.ACCOUNT_PRIVATE_KEY
};

@Injectable()
export class GetInfoService {

    private readonly SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // --- МЕТОДЫ ДЛЯ АУТЕНТИФИКАЦИИ И ПОЛУЧЕНИЯ ДАННЫХ ---
    private generateTimestamps(): { timestamp: UnixTime; expiration: UnixTime; } {
        const dateNow = new Date();
        const dateExpiration = new Date(dateNow.getTime() + this.SEVEN_DAYS_MS);
        return {
            timestamp: getUnixTime(dateNow),
            expiration: getUnixTime(dateExpiration),
        };
    }

    private buildParadexDomain() {
        return {
            name: "Paradex",
            chainId: STARKNET_CHAIN_ID,
            version: "1",
        };
    }

    private buildAuthTypedData(request: AuthRequest): TypedData {
        const paradexDomain = this.buildParadexDomain();
        return {
            domain: paradexDomain,
            primaryType: "Request",
            types: {
                StarkNetDomain: [{ name: "name", type: "felt" }, { name: "chainId", type: "felt" }, { name: "version", type: "felt" }],
                Request: [{ name: "method", type: "felt" }, { name: "path", type: "felt" }, { name: "body", type: "felt" }, { name: "timestamp", type: "felt" }, { name: "expiration", type: "felt" }],
            },
            message: { method: request.method, path: request.path, body: request.body, timestamp: request.timestamp, expiration: request.expiration },
        };
    }

    private signatureFromTypedData(typedData: TypedData): string {
        const msgHash = starkTypedData.getMessageHash(typedData, ACCOUNT.address);
        const { r, s } = ec.starkCurve.sign(msgHash, ACCOUNT.privateKey);
        return JSON.stringify([r.toString(), s.toString()]);
    }

    private signAuthRequest(): { signature: string; timestamp: UnixTime; expiration: UnixTime; } {
        const { timestamp, expiration } = this.generateTimestamps();
        const request: AuthRequest = { method: "POST", path: "/v1/auth", body: "", timestamp, expiration };
        const typedData = this.buildAuthTypedData(request);
        const signature = this.signatureFromTypedData(typedData);
        return { signature, timestamp, expiration };
    }

    private async getJwtToken(): Promise<string> {
        const { signature, timestamp, expiration } = this.signAuthRequest();
        const headers = {
            'Accept': 'application/json',
            'PARADEX-STARKNET-ACCOUNT': ACCOUNT.address,
            'PARADEX-STARKNET-SIGNATURE': signature,
            'PARADEX-TIMESTAMP': timestamp.toString(),
            'PARADEX-SIGNATURE-EXPIRATION': expiration.toString(),
        };
        try {
            const response = await axios.post(`${PARADEX_API_URL}/auth`, {}, { headers });
            return response.data.jwt_token;
        } catch (error) {
            console.error('Ошибка при получении JWT токена:', error.response?.data || error.message);
            throw new Error('Не удалось получить JWT токен');
        }
    }

    public async getAccountData() {
        const jwtToken = await this.getJwtToken();
        const headers = { 'Accept': 'application/json', 'Authorization': `Bearer ${jwtToken}` };
        try {
            const response = await axios.get(`${PARADEX_API_URL}/account`, { headers });
            return response.data;
        } catch (error) {
            console.error('Ошибка при получении данных аккаунта:', error.response?.data || error.message);
            throw new Error('Не удалось получить данные об аккаунте');
        }
    }


}