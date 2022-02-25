import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';
import prismaCall from 'modules/prisma';
import colors from 'colors';
import ErrorApiMethod from 'modules/ErrorApiMethod';

const LENGTH_SESSION = 24;

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
    async process({ session }, { message, stack }) {
        console.warn(colors.yellow(`Client [${session}] logged error: [${message}]\n${stack}`));

        let session_id = JSON.stringify(session);

        if (typeof(session_id) !== 'string')
            throw new ErrorApiMethod(`Parameter session is [${typeof(session_id)}] but must be string!`, 'I’m a teapot', 418);

        if (session_id.length !== LENGTH_SESSION)
            throw new ErrorApiMethod(`Parameter session's length must be is 24 symbols.`, 'I’m a teapot', 418);

        await prismaCall('error.create', {
            data: {
                session_id: JSON.stringify(session),
                message: JSON.stringify(message),
                stack: JSON.stringify(stack),
            }
        });

        return true;
    }

}
