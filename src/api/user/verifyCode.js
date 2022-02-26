import BaseApi from '../../BaseApi';
import { method } from 'modules/utilsMethods';
import TelegramBot from 'modules/telegramBot';

@method("POST")
export default class UserAuthorize extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this UserAuthorize
     */
    constructor() {
        super();
    }

    /**
     * Метод для верификации кода, который был сгенерирован телеграм-ботом юзеру
     *
     * @override
     * @this UserAuthorize
     * @returns {Promise<boolean>}
     */
    async process({ session }, { buffer }) {
        const decodeBuffer = Buffer.from(buffer, 'base64').toString();
        const data = JSON.parse(decodeBuffer);

        

        const res = await TelegramBot.sendTemporaryPassword();
        return res;
    }

}
