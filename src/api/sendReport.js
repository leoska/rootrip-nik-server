import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';

@method("POST")
export default class Ping extends BaseApi {
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
    async process({ }, { }) {
        return true;
    }

}
