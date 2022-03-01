import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';

@method("GET")
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
    async process({ session }, { message, stack }) {
        return true;
    }

}
