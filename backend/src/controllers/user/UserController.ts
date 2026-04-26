import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";
import { AuthUserService } from "../../services/user/AuthUserService";
import { DetailUserService } from "../../services/user/DetailUserService";
import { AssignedSectorUserService } from "../../services/user/AssignedSectorUserService";
import { ListUserService } from "../../services/user/ListUserService";
import { UpdateUserRoleService } from "../../services/user/UpdateUserRoleService";

class UserController {
	// Criar um Usuario
	async create(req: Request, res: Response) {
		const { name, email, password } = req.body;
		const createUserService = new CreateUserService();
		const user = await createUserService.execute({ name, email, password });
		return res.status(201).json(user);
	}
	// Fazer login em um Usuario
	async login(req: Request, res: Response) {
		const { email, password } = req.body;
		const authUserService = new AuthUserService();
		const user = await authUserService.execute({ email, password });
		return res.status(200).json(user);
	}
	// Buscar detalhes de um usuario
	async detail(req: Request, res: Response) {
		const user_id = req.user_id;
		const detailUserService = new DetailUserService();
		const user = await detailUserService.execute(user_id);
		return res.status(200).json(user);
	}
	// Adicionar um setor a um usuário
	async assignSector(req: Request, res: Response) {
		const { sector_id, user_id } = req.body;
		const assignedSectorUserService = new AssignedSectorUserService();
		const user = await assignedSectorUserService.execute({
			user_id,
			sector_id,
		});
		return res.status(200).json(user);
	}
	// Listagem de usuários
	async list(_req: Request, res: Response) {
		const listUserService = new ListUserService();
		const users = await listUserService.execute();
		return res.status(200).json(users);
	}
	// Alterar role do usuario
	async updateRole(req: Request, res: Response) {
		const { user_id, role } = req.params as {
			user_id: string;
			role: "USER" | "ADMIN";
		};
		const updateUserRoleService = new UpdateUserRoleService();
		const user = await updateUserRoleService.execute({ user_id, role });
		return res.status(200).json(user);
	}
}

export { UserController };
