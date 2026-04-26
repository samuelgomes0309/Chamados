import { Request, Response } from "express";
import { CreateSectorService } from "../../services/sector/CreateSectorService";
import { DeleteSectorService } from "../../services/sector/DeleteSectorService";
import { UpdateSectorService } from "../../services/sector/UpdateSectorService";
import { DetailSectorService } from "../../services/sector/DetailSectorService";
import { ToggleStatusService } from "../../services/sector/ToggleStatusService";
import { ListSectorService } from "../../services/sector/ListSectorService";

class SectorController {
	// Listar os departamento/setor
	async list(req: Request, res: Response) {
		const { status } = req.query as { status: "ACTIVE" | "INACTIVE" };
		const listSectorService = new ListSectorService();
		const sectors = await listSectorService.execute({ status });
		return res.status(200).json(sectors);
	}
	// Criar um departamento/setor
	async create(req: Request, res: Response) {
		const { name, description } = req.body;
		const createSectorService = new CreateSectorService();
		const sector = await createSectorService.execute({ name, description });
		return res.status(201).json(sector);
	}
	// Deletar um departamento/setor
	async delete(req: Request, res: Response) {
		const { sector_id } = req.params as { sector_id: string };
		const deleteSectorService = new DeleteSectorService();
		const sector = await deleteSectorService.execute({ sector_id });
		return res.status(200).json(sector);
	}
	// Atualizar um departamento/setor
	async update(req: Request, res: Response) {
		const { sector_id } = req.params as { sector_id: string };
		const { name, description } = req.body;
		const updateSectorService = new UpdateSectorService();
		const sector = await updateSectorService.execute({
			sector_id,
			name,
			description,
		});
		return res.status(200).json(sector);
	}
	// Detalhes de um departamento/setor
	async detail(req: Request, res: Response) {
		const { sector_id } = req.params as { sector_id: string };
		const detailSectorService = new DetailSectorService();
		const sector = await detailSectorService.execute({ sector_id });
		return res.status(200).json(sector);
	}
	//  Mudar status de um departamento/setor
	async toggleStatus(req: Request, res: Response) {
		const { sector_id } = req.params as { sector_id: string };
		const { status } = req.params as { status: "ACTIVE" | "INACTIVE" };
		const toggleStatusService = new ToggleStatusService();
		const sector = await toggleStatusService.execute({ sector_id, status });
		return res.status(200).json(sector);
	}
}

export { SectorController };
