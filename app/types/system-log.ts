export type SystemLogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface SystemLogEntry {
    timestamp: Date;
    level: SystemLogLevel;
    message: string;
    fields?: Record<string, unknown>;
}

export interface SystemLogsSnapshot {
    entries: SystemLogEntry[];
    capacity: number;
    count: number;
}
