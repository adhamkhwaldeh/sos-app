declare module 'react-native-event-bus' {
    export default class EventBus {
        static getInstance(): EventBus;
        addListener(event: string, callback: (data?: any) => void): any;
        removeListener(subscription: any): void;
        fireEvent(event: string, data?: any): void;
    }
}
