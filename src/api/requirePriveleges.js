import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';
import TelegramBot from 'modules/telegramBot';

@method("POST")
export default class RequirePriveleges extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this Ping
     */
    constructor() {
        super();
    }

    /**
     * Дебаговый API-метод для проверки работы сервера
     *
     * @override
     * @this Ping
     * @returns {Promise<boolean>}
     */
    async process({ session }, { }) {
        TelegramBot.sendTemporaryPassword();
        return true;
    }

}
