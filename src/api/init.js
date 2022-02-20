import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';

@method("GET")
export default class Init extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this Init
     */
    constructor() {
        super();
    }

    get os(userAgent) {
        if (userAgent.indexOf("Win") != -1)
            return "Windows OS";
        if (userAgent.indexOf("Mac") != -1) 
            return "Macintosh";
        if (userAgent.indexOf("Linux") != -1)
            return "Linux OS";
        if (userAgent.indexOf("Android") != -1)
            return "Android OS";
        if (userAgent.indexOf("like Mac") != -1)
            return "iOS";

        return "Unknown OS";
    }

    /**
     * Инициализация сессии и логирование её 
     *
     * @override
     * @this Init
     * @returns {Promise<boolean>}
     */
    async process({ }, { }) {

        return true;
    }

}
