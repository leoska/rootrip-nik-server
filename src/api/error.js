import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';
import prismaCall from 'modules/prisma';

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

        await prismaCall('error.create', {
            data: {
                
            }
        });
        return true;
    }

}
