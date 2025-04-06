import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from the root .env file
dotenv.config({ path: "../../.env" });

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        url: process.env.NEXT_PUBLIC_DATABASE_URL!,
    },
});
