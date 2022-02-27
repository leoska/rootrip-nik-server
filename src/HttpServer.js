import express               from 'express';
import fsExtra               from 'fs-extra';
import fs                    from 'fs';
import path                  from 'path';
import http                  from 'http';
import ErrorApiMethod        from 'modules/ErrorApiMethod';
import colors                from 'colors';
import Application           from './Application';
import cors                  from 'cors';
import crypto                from 'crypto';
import moment                from 'moment';
import fileUpload            from 'express-fileupload';
import prismaCall            from 'modules/prisma';

const DEFAULT_HTTP_HOST = "0.0.0.0";
const DEFAULT_HTTP_PORT = 25565;

// Размер генерируемого имени файла
const FILE_LENBYTES_CRYPTO = 16;
const FILE_MAX_SIZE = 10 * 1024 * 1024;

const _initApi = Symbol('_initApi');
const _initExpress = Symbol('_initExpress');
const _responseHandler = Symbol('_responseHandler');
const _fileUploadHandler = Symbol('_fileUploadHandler');

const MIME_MATCH = {
    // Images
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/gif':  'gif',

    // PDF
    'application/pdf': 'pdf',

    // ZIP
    'application/zip': 'zip',
};

// Базовый класс Http сервера, который поднимается в Application
export default class HttpServer {
    _server = null;
    _app = null;

    // В объект api кладутся поддерживаемые АПИ-методы
    // _api = {
    //     'GET': {},
    //     'POST': {},
    // };
    _api = {};

    /**
     * Базовый конструктор класса
     * 
     * @constructor
     * @this HttpServer
     */
    constructor() {
        this._app = express();
    }

    /**
     * Инициализация Http-Server'а
     * 
     * @async
     * @public
     * @this HttpServer
     * @returns {Promise<void>}
     */
    async init() {
        // Initialize API
        await this[_initApi]();

        // Initialize Express Routes
        this[_initExpress]();

        // Initialize http-server
        this.server = http.createServer(this._app);

        const options = {
            host: DEFAULT_HTTP_HOST,
            port: DEFAULT_HTTP_PORT,
        };

        // Listen http-server
        this.server.listen(options, () => {
            console.info(colors.blue("[HTTP-Server] Successfully initialized and started API http-server."));
        });
    }

    /**
     * Остановка сервера
     * 
     * @async
     * @public
     * @this HttpServer
     * @returns {Promise<void>}
     */
    async stop() {
        this.server.close(() => {
            console.info(colors.blue("[HTTP-Server] Successfully stoped."));
        });
    }

    /**
     * Функция инициализации API-методов
     * 
     * @async
     * @private
     * @this Application
     * @returns {Promise<void>}
     */
    async [_initApi]() {
        /**
         * Функция для возврата свойств файла/папки
         * 
         * @param {String} pathFile
         * @this _initApi
         * @return {Promise<(Error|null|Stats)>}
         */
        const getFileStats = (pathFile) => {
            return new Promise((resolve, reject) => {
                fsExtra.pathExists(pathFile, (err, exists) => {
                    if (err)
                        reject(err);

                    if (!exists)
                        reject(new Error(`ENOENT: no such file or directory: [${pathFile}]`));

                    fsExtra.stat(pathFile, (err, stats) => {
                        if (err)
                            reject(err);

                        resolve(stats);
                    });
                });
            });
        }

        /**
         * Функция сканирования папки
         *
         * @param {String} pathDir
         * @this _initApi
         * @returns {Promise<(Error|void)>}
         */
        const readDir = (pathDir) => {
            return new Promise((resolve, reject) => {
                const pathToRead = path.join(__dirname, 'api', pathDir);

                fsExtra.readdir(pathToRead, async (err, files) => {
                    if (err)
                        reject(err);

                    for (const file of files) {
                        const filePath = path.join(pathToRead, file);

                        const stats = await getFileStats(filePath);
                        if (stats.isDirectory()) {
                            await readDir(path.join(pathDir, file));
                        } else {
                            if (!(/^[^_].*\.js$/.test(file)))
                                continue;
                            
                            const subDirs = pathDir.split('/');
                            const apiName = (pathDir.length ? subDirs.join('.') + '.' : '') + file.substr(0, file.length - 3);
                            
                            const apiModule = require(filePath).default;
                            
                            if (apiModule.isApi && apiModule.isApi()) {
                                if (this._api[apiName])
                                    throw new Error(`[HTTP-Server] API ${apiName} is already initialized!`);

                                console.log(colors.green(`[HTTP-Server] API ${apiModule.name} successfully initialized.`));
                                this._api[apiName] = apiModule;
                            }
                        }
                    }
                    
                    resolve();
                })
            });
        }
        
        await readDir('');
    }

    /**
     * Инициализация роутов для API-методов
     * 
     * @private
     * @this Application
     * @returns {void}
     */
    [_initExpress]() {
        // enable files upload
        this._app.use(fileUpload({
            createParentPath: true,
            limits: { fileSize: FILE_MAX_SIZE },
        }));

        // Инициализируем MiddleWare для обработки запроса 
        this._app.use(cors());
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));

        // Заливка файла
        this._app.post("/api/uploadFile.json", this[_fileUploadHandler].bind(this));

        // Роутинг POST-методов
        this._app.post("/api/:apiName.json", (req, res) => this[_responseHandler](req, res, 'POST'));

        // Роутинг GET-методов
        this._app.get("/api/:apiName.json", (req, res) => this[_responseHandler](req, res, 'GET'));
    }

    /**
     * Обработка POST/GET запросов классами API
     * 
     * @async
     * @private
     * @param {*} req 
     * @param {*} res 
     * @param {String} method 
     * @returns {Promise<void>}
     */
    async [_responseHandler](req, res, method) {
        // req.headers["x-forwarded-for"] <-- этот заголовок обычно вкладывается NGINX'ом
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const apiName = req.params.apiName;
        const reqParams = Object.assign({}, req.query);
        const reqBody = Object.assign({}, req.body);
        const reqHeaders = Object.assign({}, req.headers);

        try {
            // Обработка SERVER_TERMINATING (503)
            if (Application.terminating) {
                throw new ErrorApiMethod(`Failed to call API [${apiName}]. code: SERVER_TERMINATING`, "SERVER_TERMINATING", 503);
            }
            
            // Обработка Not Implemented (501)
            const api = this._api[apiName];

            if (!api) {
                throw new ErrorApiMethod(`API [${apiName}] NOT FOUND!`, "API_NOT_FOUND", 501);
            }
            
            const apiInstance = new api(method);
            apiInstance.ip = ip;
            apiInstance.params = reqParams;
            apiInstance.body = reqBody;
            apiInstance.headers = reqHeaders;

            // 200 - OK
            res.json(await apiInstance.callProcess());
        } catch(e) {
            let response;

            if (e instanceof ErrorApiMethod) {
                console.error(colors.red(`[HTTP-Server] ${e.stack || e.message}`));

                res.status(e.status);
                response = JSON.stringify({
                    error: e.code,
                    message: e.message,
                    stack: e.stack,
                });
            } else {
                // Обработка INTERNAL_SERVER_ERROR (500)
                console.error(colors.red(`[HTTP-Server] Request API [${apiName}] failed.\n${e.stack}`));

                res.status(500);
                response = JSON.stringify({
                    error: "INTERNAL_SERVER_ERROR",
                    message: e.message,
                });
            }

            // Добавляем заголовок, что тип ответа - json и размер ответа
            res.header("Content-Type", "application/json; charset=utf-8");
            res.header("Content-Length", Buffer.byteLength(response, "utf-8"));

            // Отправляем ответ
            res.end(response);
        }
    }

    /**
     * Заливка файла на сервер
     * TODO: нужно рефакторить
     * 
     * @async
     * @private
     * @param {*} req 
     * @param {*} res 
     */
    async [_fileUploadHandler](req, res) {
        // req.headers["x-forwarded-for"] <-- этот заголовок обычно вкладывается NGINX'ом
        const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const files = req.files;
        const session = req?.query?.session;

        try {
            if (!files || !files.file) 
                throw new Error(`No file uploaded`);

            const file = files.file;
            const newFileName = crypto.randomBytes(FILE_LENBYTES_CRYPTO).toString('base64').replace(/[+=/-]/g, '').substr(0, 12);
            const extname = path.extname(file.name);

            if (!MIME_MATCH[file.mimetype])
                throw new Error(`Invalid file format [${file.mimetype}]`);

            const date = moment();
            const folderName = date.format(`YYYY-MM-DD`);
            const startPath = process.cwd();

            // Проверяем существует ли необходимая директория (партинация)
            fs.access(`${startPath}/ufiles/${folderName}`, async (error) => {
                try {
                    if (error) {
                        console.error(colors.red(error.stack));
                        await fs.promises.mkdir(`${startPath}/ufiles/${folderName}`);
                        console.info(colors.green(`[HttpServer -> _fileUploadHandler (fs.access)] folder ${folderName} successfully was a created.`));
                    }

                    // Перемещаем файл в пользовательскую папку с именем файлов
                    file.mv(`${startPath}/ufiles/${folderName}/${newFileName}${extname}`);

                    // Логируем заливку файла в бд
                    await prismaCall('file.create', {
                        data: {
                            session_id: session,
                            ip_address: ip,
                            mime_type: file.mimetype,
                            file_path: `${folderName}/${newFileName}${extname}`,
                        }
                    });

                    // Отправляем успешный результат заливки файла 
                    res.status(200).json({
                        response: {
                            path: `${folderName}/${newFileName}${extname}`,
                            name: `${newFileName}${extname}`,
                            size: file.size,
                            mimetype: file.mimetype,
                            stamp: date.valueOf(),
                        }
                    });
                } catch(e) {
                    console.error(colors.red(`[HTTP-Server -> _fileUploadHandler (fs.access)] ${e.stack || e.message}`));

                    res.status(500).end(JSON.stringify({
                        error: "INTERNAL_SERVER_ERROR",
                        message: e.message,
                    }));
                }
            });
        } catch(e) {
            console.error(colors.red(`[HTTP-Server -> _fileUploadHandler] ${e.stack || e.message}`));

            res.status(500).end(JSON.stringify({
                error: "INTERNAL_SERVER_ERROR",
                message: e.message,
            }));
        }
    }
}