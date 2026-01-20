import EventBus from 'react-native-event-bus';

export const dbEventEmitter = {
    on: (event: string, callback: any) => {
        return EventBus.getInstance().addListener(event, callback);
    },
    off: (subscription: any) => {
        EventBus.getInstance().removeListener(subscription);
    },
    emit: (event: string, data?: any) => {
        EventBus.getInstance().fireEvent(event, data);
    }
};

export const DB_EVENTS = {
    LOGS_UPDATED: 'LOGS_UPDATED',
    NOTIFICATIONS_UPDATED: 'NOTIFICATIONS_UPDATED',
};

