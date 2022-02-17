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
