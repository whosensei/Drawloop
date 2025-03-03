import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from "dotenv";
import * as schema from "./schema";
neonConfig.fetchConnectionCache = true 


// Load environment variables from the root .env file
dotenv.config({ path : "../../.env"}) ;

const sql = neon(process.env.DATABASE_URL ?? "");
export const db = drizzle(sql, {schema});
// export const db = drizzle(sql);

