import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const locations = sqliteTable("locations", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    timestampUTC: text("timestampUTC").notNull(),
    speed: real("speed"),
    heading: real("heading"),
    accuracy: real("accuracy"),
    altitude: real("altitude"),
    batteryLevel: real("battery_level"),
    action: text("action"), // e.g., 'background', 'foreground', 'headless'
    rawJson: text("raw_json"), // Store full JSON just in case
});

export const notifications = sqliteTable("notifications", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title"),
    content: text("content"),
    timestamp: text("timestamp").notNull(),
});
