import { LocationLog } from "@/src/data/entities/LocationLog";

export interface LocationState {
    logs: LocationLog[];
    setLogs: (logs: LocationLog[]) => void;
    addLog: (log: LocationLog) => void;
    clearLogs: () => void;
    fetchLogs: () => Promise<void>;
}