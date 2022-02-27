import BaseApi from '../../BaseApi';
import { method, log } from 'modules/utilsMethods';
import prismaCall from 'modules/prisma';

@method("GET")
@log
export default class EventsGetAll extends BaseApi {
    /**
     * Базовый конструктор класса
     *
     * @constructor
     * @this EventsGetAll
     */
    constructor() {
        super();
    }

    static get defaultLimit() {
        return 20;
    }

    /**
     * Метод для отдачи списка мероприятий
     *
     * @async
     * @public
     * @override
     * @this EventsGetAll
     * @returns {Promise<boolean>}
     */
    async process({ limit, skip }, { }) {
        return await prismaCall('event.findMany', {
            skip: skip || 0,
            take: limit || EventsGetAll.defaultLimit,
            select: {
                id: true,
                header_img: true,
                header: true,
                description: true,
                stamp_publish: true,
            },
            where: {
                stamp_publish: {
                    lte: Date.now(),
                }
            },
            orderBy: [
                {
                    stamp_publish: 'desc'
                }
            ],
        });
    }

}
