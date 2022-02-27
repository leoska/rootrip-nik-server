import BaseApi from '../../BaseApi';
import { method, log } from 'modules/utilsMethods';
import TelegramBot from 'src/services/telegramBot';

@method("GET")
export default class UserRequireCode extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this UserRequireCode
     */
    constructor() {
        super();
    }

    /**
     * Запрос кода для верификации на втором шаге авторизации
     *
     * @override
     * @this UserRequireCode
     * @returns {Promise<boolean>}
     */
    async process({ session }, { }) {
        const res = await TelegramBot.sendTemporaryPassword();
        return res;
    }

}
