import { Request, Response } from "express";
import { CreateCategoryService } from "../../services/category/CreateCategoryService";
import { UpdateCategoryService } from "../../services/category/UpdateCategoryService";
import { DeleteCategoryService } from "../../services/category/DeleteCategoryService";
import { ListCategoryService } from "../../services/category/ListCategoryService";
import { DetailCategoryService } from "../../services/category/DetailCategoryService";
import { ToggleStatusService } from "../../services/category/ToggleStatusService";

class CategoryController {
	// Criar um problema/categoria
	async create(req: Request, res: Response) {
		const { name, priority, sector_id } = req.body;
		const createCategoryService = new CreateCategoryService();
		const category = await createCategoryService.execute({
			name,
			priority,
			sector_id,
		});
		return res.status(201).json(category);
	}
	// Atualizar um problema/categoria
	async update(req: Request, res: Response) {
		const { category_id } = req.params as { category_id: string };
		const { name, priority, sector_id } = req.body;
		const updateCategoryService = new UpdateCategoryService();
		const category = await updateCategoryService.execute({
			category_id,
			name,
			priority,
			sector_id,
		});
		return res.status(200).json(category);
	}
	// Excluir um problema/categoria
	async delete(req: Request, res: Response) {
		const { category_id } = req.params as { category_id: string };
		const deleteCategoryService = new DeleteCategoryService();
		const category = await deleteCategoryService.execute({ category_id });
		return res.status(200).json(category);
	}
	// Listar um problema/categoria // Pode ser por setor ou geral
	async list(req: Request, res: Response) {
		const { status, sector_id } = req.query as {
			status: "ACTIVE" | "INACTIVE";
			sector_id?: string;
		};
		const listCategoryService = new ListCategoryService();
		const categories = await listCategoryService.execute({ status, sector_id });
		return res.status(200).json(categories);
	}
	// Detalhar um problema/categoria
	async detail(req: Request, res: Response) {
		const { category_id } = req.params as { category_id: string };
		const detailCategoryService = new DetailCategoryService();
		const category = await detailCategoryService.execute({ category_id });
		return res.status(200).json(category);
	}
	// Mudar o status de um problema/categoria
	async toggleStatus(req: Request, res: Response) {
		const { category_id } = req.params as { category_id: string };
		const { status } = req.params as { status: "ACTIVE" | "INACTIVE" };
		const categoryToggleStatusService = new ToggleStatusService();
		const category = await categoryToggleStatusService.execute({
			category_id,
			status,
		});
		return res.status(200).json(category);
	}
}

export { CategoryController };
