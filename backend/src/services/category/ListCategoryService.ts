import { ListCategoryRequest } from "../../@types/category/category";
import prismaClient from "../../config/prisma/client";

class ListCategoryService {
	async execute({ status, sector_id }: ListCategoryRequest) {
		const categories = await prismaClient.category.findMany({
			where: {
				status: status,
				...(sector_id && { sector_id }),
			},
			include: {
				Sector: {
					select: {
						id: true,
						name: true,
						description: true,
						status: true,
					},
				},
			},
		});
		return categories;
	}
}

export { ListCategoryService };
