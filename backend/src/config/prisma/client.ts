import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Conexão com o banco de dados PostgreSQL usando Prisma e PrismaPg
const connectionString = `${process.env.DATABASE_URL!}`;

// Criar o adaptador PrismaPg com a string de conexão
const adapter = new PrismaPg({ connectionString });

// Criar a instância do PrismaClient com o adaptador PrismaPg
const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
