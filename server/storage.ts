import { db } from "./db";
// Even though we use LocalStorage, we keep the server storage interface valid
// in case we want to sync data later.
export interface IStorage {
  // Minimal interface for now
}

export class DatabaseStorage implements IStorage {
  // Empty for this prototype
}

export const storage = new DatabaseStorage();
