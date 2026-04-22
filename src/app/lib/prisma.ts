import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../../generated/client/client";
import { envVars } from "../config/env";
import pg from 'pg';

const connectionString = `${envVars.DATABASE_URL}`

const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export { prisma }