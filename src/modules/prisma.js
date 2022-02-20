import { PrismaClient } from '@prisma/client';

class PrismaWrapper {
    _db = new PrismaClient();

    constructor() {

    }
}