import migrations from '@/drizzle/migrations';
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

// import { openDatabaseSync } from "expo-sqlite";
// const expoDb = openDatabaseSync("db.db");

import * as SQLite from 'expo-sqlite';
const expoDb = SQLite.openDatabaseSync('db.db');

export const db = drizzle(expoDb);


let resolveMigration: () => void;
export const migrationPromise = new Promise<void>((resolve) => {
    resolveMigration = resolve;
});

export const runMigrations = async () => {
    console.log('Starting migrations...');
    try {
        await migrate(db, migrations);
        console.log('Migrations completed successfully');
    } catch (error) {
        console.error('Migrations failed:', error);
    } finally {
        resolveMigration();
    }
};

