import { Router } from "express";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { hasRole } from "../../middlewares/hasRole";
import { SectorController } from "../../controllers/sector/SectorController";
import { validateSchema } from "../../middlewares/validateSchema";
import {
	createSectorSchema,
	deleteSectorSchema,
	detailSectorSchema,
	listSectorSchema,
	toggleStatusSchema,
	updateSectorSchema,
} from "../../schema/sector";

const sectorRoutes = Router();

sectorRoutes.get(
	"/sectors",
	isAuthenticated,
	validateSchema(listSectorSchema),
	new SectorController().list
);

sectorRoutes.post(
	"/sectors",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(createSectorSchema),
	new SectorController().create
);

sectorRoutes.delete(
	"/sectors/:sector_id",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(deleteSectorSchema),
	new SectorController().delete
);

sectorRoutes.put(
	"/sectors/:sector_id",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(updateSectorSchema),
	new SectorController().update
);

sectorRoutes.get(
	"/sectors/:sector_id",
	isAuthenticated,
	validateSchema(detailSectorSchema),
	new SectorController().detail
);

sectorRoutes.patch(
	"/sectors/:sector_id/status/:status",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(toggleStatusSchema),
	new SectorController().toggleStatus
);

export { sectorRoutes };
