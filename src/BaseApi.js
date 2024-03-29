import { timeout } from 'modules/utilsMethods';
import colors from 'colors';

const API_TIMEOUT = 20000;

export default class BaseApi {
    _params = null;
    _body = null;
    _headers = null;
    _ip = '';

    /**
     * Статическая функция на то, что класс является API-методом
     * 
     * @return {Boolean}
     */
    static isApi() {
        return true;
    }

    /**
     * Сеттер для параметров
     * 
     * @setter
     * @public
     * @param {Object} params
     * @this {BaseApi}
     */
    set params(params) {
        this._params = params;
    }

    /**
     * Сеттер для тело запроса (POST)
     * 
     * @setter
     * @public
     * @param {Object} body
     * @this {BaseApi}
     */
    set body(body) {
        this._body = body;
    }

    /**
     * Сеттер для заголовков
     * 
     * @setter
     * @public
     * @param {Object} headers
     * @this {BaseApi}
     */
    set headers(headers) {
        this._headers = headers;
    }

    /**
     * Сеттер для ip-адреса
     * 
     * @setter
     * @public
     * @param {String} ip
     * @this {BaseApi}
     */
    set ip(ip) {
        this._ip = ip;
    }

    /**
     * Базовый конструктор класса
     * 
     * @public
     * @constructor
     * @this BaseApi
     */
    constructor() {
        this._params = null;
        this._body = null;
        this._headers = null;
        this._ip = '';
    }
    
    /**
     * Виртуальное тело метода
     * 
     * @public
     * @virtual
     * @param {Object} [params] - Параметры запроса
     * @param {Object} [body] - Тело запроса
     * @this {BaseApi}
     * @returns {any}
     */
    async process(data, body) {
        throw new Error(`Try to call virtual method.`);
    }
    
    /**
     * Метод вызова обработки API-метода
     * 
     * @async
     * @public
     * @this {BaseApi}
     * @returns {Promise<Object>}
     */
    async callProcess() {
        return {
            response: await Promise.race([timeout(API_TIMEOUT), this.process(this._params || {}, this._body || {})]),
        };
    }
}