export interface LocationLog {
    id: number;
    latitude: number;
    longitude: number;
    timestampUTC: string;
    speed: number | null;
    heading: number | null;
    accuracy: number | null;
    altitude: number | null;
    batteryLevel: number | null;
    action: string | null;
    rawJson: string | null;
}