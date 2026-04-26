import { Router } from "express";
import { validateSchema } from "../../middlewares/validateSchema";
import {
	assignSectorUserSchema,
	createUserSchema,
	loginUserSchema,
	updateUserRoleSchema,
} from "../../schema/user";
import { isAuthenticated } from "../../middlewares/isAuthenticated";
import { UserController } from "../../controllers/user/UserController";
import { hasRole } from "../../middlewares/hasRole";

const userRoutes = Router();

userRoutes.post(
	"/users",
	validateSchema(createUserSchema),
	new UserController().create
);

userRoutes.post(
	"/sessions",
	validateSchema(loginUserSchema),
	new UserController().login
);

userRoutes.get("/me", isAuthenticated, new UserController().detail);

userRoutes.put(
	"/users/sector",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(assignSectorUserSchema),
	new UserController().assignSector
);

userRoutes.get(
	"/users",
	isAuthenticated,
	hasRole("ADMIN"),
	new UserController().list
);

userRoutes.patch(
	"/users/:user_id/role/:role",
	isAuthenticated,
	hasRole("ADMIN"),
	validateSchema(updateUserRoleSchema),
	new UserController().updateRole
);

export { userRoutes };
