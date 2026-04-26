import { Router } from "express";
import { CategoryController } from "../../controllers/category/CategoryController";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { hasRole } from "../../middlewares/hasRole";
import { validateSchema } from "../../middlewares/validateSchema";
import {
	createCategorySchema,
	deleteCategorySchema,
	detailCategorySchema,
	listCategorySchema,
	toggleStatusSchema,
	updateCategorySchema,
} from "../../schema/category";

const categoryRoutes = Router();

categoryRoutes.post(
	"/categories",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(createCategorySchema),
	new CategoryController().create
);

categoryRoutes.put(
	"/categories/:category_id",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(updateCategorySchema),
	new CategoryController().update
);

categoryRoutes.delete(
	"/categories/:category_id",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(deleteCategorySchema),
	new CategoryController().delete
);

categoryRoutes.get(
	"/categories",
	isAuthenticated,
	validateSchema(listCategorySchema),
	new CategoryController().list
);

categoryRoutes.get(
	"/categories/:category_id",
	isAuthenticated,
	validateSchema(detailCategorySchema),
	new CategoryController().detail
);

categoryRoutes.patch(
	"/categories/:category_id/status/:status",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(toggleStatusSchema),
	new CategoryController().toggleStatus
);

export { categoryRoutes };
