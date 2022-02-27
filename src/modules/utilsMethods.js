import ErrorApiMethod from './ErrorApiMethod';
import prismaCall from './prisma';
import colors from 'colors';

/**
 * Функция обработкик таймаута для API-методов
 * 
 * @param {Number} ms
 * @param {Boolean} [safe]
 * @returns {Promise<Error>}
 */
export function timeout(ms, safe = false) {
    return new Promise((resolve, reject) => {
        setTimeout(() => safe ? resolve() : reject(new Error('Timeout reached')), ms);
    });
}

/**
 * Декоратор для определения правильного API метода
 * 
 * @param {String} name
 * @returns {(function(*, *, *): void)|*}
 */
export function method(name) {
    return function(target) {
        return class Api extends target {
            constructor(method) {
                // Обработка Method Not Allowed (405)
                if (method !== name)
                    throw new ErrorApiMethod(`Incorrect HTTP-method! Api-method [${target.name}] has a [${name}] method. Try to call another [${method}] method.`, "Method Not Allowed", 405);
                super();
            }

            // Переопределяем имя класса
            static get name() {
                return super.name;
            }
        }
    }
}

/**
 * Декоратор для логирования запросов
 * 
 * @param {*} target 
 */
export function log(target) {
    const func = target.prototype.callProcess;
    target.prototype.callProcess = async function (...args) {
        const stamp_start = new Date();
        let result;

        try {
            result = await func.apply(this, ...args);
        } catch(e) {
            result = e;
        } finally {
            const stamp_finish = new Date();

            prismaCall('apiRequest.create', {
                data: {
                    session_id: this._params?.session,
                    api: target.name,
                    ip_address: this._ip,
                    stamp_start,
                    stamp_finish,
                    duration: stamp_finish.getTime() - stamp_start.getTime(),
                    status: result && result instanceof Error ? 'error' : 'completed',
                }
            }).catch((e) => console.error(colors.red(`[Decorator -> log] Try logged API ${target.name}. Uncaught exception: ${e.stack}`)));

            if (result instanceof Error)
                throw result;
            else
                return result;
        }
    }

    return target;
}