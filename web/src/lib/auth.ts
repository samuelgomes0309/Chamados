import { cookies } from "next/headers";
import { User } from "../@types/user/user";
import api from "./api";
import { getToken } from "./token";

async function isAuthenticated() {
	try {
		const token = await getToken();
		if (!token) {
			return null;
		}
		const user = await api.get<User>("/me");
		return user.data;
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.log("An error occurred", error.message);
		} else {
			console.log("An unknown error occurred");
		}
		return null;
	}
}

async function saveUserLocal(userData: User) {
	if (!userData) return;
	const cookiesStore = await cookies();
	cookiesStore.set("@tickets_user", JSON.stringify(userData), {
		httpOnly: false, // acessível via JS no browser
		maxAge: 60 * 60 * 24 * 30, // 30 dias
	});
}

async function getUserLocal() {
	const cookiesStore = await cookies();
	const user = cookiesStore.get("@tickets_user");
	return user ? (JSON.parse(user.value) as User) : null;
}

async function destroyUserLocal() {
	const cookiesStore = await cookies();
	cookiesStore.delete("@tickets_user");
}

export { isAuthenticated, saveUserLocal, getUserLocal, destroyUserLocal };
