import { Category } from "../category/category";

interface Sector {
	id: string;
	name: string;
	description: string;
	status: "ACTIVE" | "INACTIVE";
	created_at: string;
	updated_at: string;
	categories: Category[];
}

export { Sector };
