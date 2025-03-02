import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from the root .env file
dotenv.config({ path : "../../.env"}) ;

const sql = neon(process.env.DATABASE_URL ?? "");
export const db = drizzle({ client: sql });

