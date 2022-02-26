import BaseApi from '../BaseApi';
import { method } from 'modules/utilsMethods';
import crypto from 'crypto';
import prismaCall from 'modules/prisma';
import colors from 'colors';
import config from 'settings/development.json';

@method("POST")
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
     * Размер идентификатора сессии
     * 
     * @getter
     * @public
     * @this {Init}
     * @returns {Number}
     */
    get sessionBytesLength() {
        return 16;
    }

    /**
     * 
     */
    static get defaultCookiesDaysLive() {
        return 14;
    }

    /**
     * Определение операционной системы пользователя
     * 
     * @public
     * @param {String} userAgent
     * @this {Init}
     * @returns {String}
     */
    getOs(userAgent) {
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
    async process({ session }, { browser, resolution, orientation, memory, offsetTimezone, protocol }) {
        const sessionId = crypto.randomBytes(this.sessionBytesLength).toString('base64');

        const logObject = {
            sessionId,
            browser, 
            resolution, 
            orientation,
            memory, 
            offsetTimezone, 
            protocol,
        }

        console.info(colors.green(`New session: ${JSON.stringify(logObject)}`));

        await prismaCall('session.create', {
            data: {
                id: sessionId,
                ip_address: this._ip,
                browser,
                os: this.getOs(browser),
                resolution_width: resolution.width,
                resolution_height: resolution.height,
                orientation,
                memory,
                offset_timezone: offsetTimezone,
            }
        });

        return {
            sessionId,
            liveDays: config?.cookies?.liveDays || Init.defaultCookiesDaysLive,
        };
    }

}
