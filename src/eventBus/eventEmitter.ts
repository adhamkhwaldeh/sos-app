import { EventEmitter } from 'eventemitter3';

export const emitter = new EventEmitter();

export const DB_EVENTS = {
    LOGS_UPDATED: 'LOGS_UPDATED',
    NOTIFICATIONS_UPDATED: 'NOTIFICATIONS_UPDATED',
};

