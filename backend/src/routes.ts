import { Router } from "express";
import { userRoutes } from "./routes/user";
import { sectorRoutes } from "./routes/sector";
import { categoryRoutes } from "./routes/category";
import { ticketRoutes } from "./routes/ticket";

//Instancia geral
const router = Router();

// Configurar cada rota com suas respectivas funções
// Ex: router.use(userRoutes)

router.use(userRoutes);

router.use(sectorRoutes);

router.use(categoryRoutes);

router.use(ticketRoutes);

export { router };
