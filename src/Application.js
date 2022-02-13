import HttpServer from "./HttpServer";
import { EventEmitter } from "events";

const DEFAULT_CONFIG_ENV = 'develop';
const ARGV_CONFIG_ENV = process.argv[2] || '';

/**
 * Сингл-тон класс всего сервера
 */
class Application {
    _httpServer = null;
    _terminating = false;
    _players = [];
    _gameRooms = [];
    _bus = new EventEmitter();

    /**
     * Статический геттер на единственный экземпляр данного класса (сингл-тон)
     * 
     * @static
     * @getter
     * @returns {Application}
     */
    static get Instance() {
        return this._instance || (this._instance = new this());
    }

    /**
     * Геттер на шину глобальных ивентов в приложении
     * 
     * @getter
     * @this Application
     * @returns {EventEmitter}
     */
    get bus() {
        return this._bus;
    }

    /**
     * Геттер на переменную остановки сервера
     * 
     * @public
     * @getter
     * @this Application
     * @returns {Boolean}
     */
    get terminating() {
        return this._terminating;
    }

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this Application
     * @returns {Application}
     */
    constructor() {
        this._httpServer         = new HttpServer();
        this._terminating        = false;
    }

    /**
     * Инициализация приложения
     * 
     * @async
     * @public
     * @this Application
     * @returns {Promise<void>}
     */
    async init() {
        // Initialize Http-Server
        await this._httpServer.init();
    }

    /**
     * Остановка приложения
     * 
     * @async
     * @public
     * @this Application
     * @returns {Promise<void>}
     */
    async stop() {
        this._terminating = true;

        this._bus.emit('application.stop');

        await Promise.all([
            this._httpServer.stop(),
        ]);
    }
}

const app = Application.Instance;

export default app;