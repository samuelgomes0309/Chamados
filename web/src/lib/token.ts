import { cookies } from "next/headers";

async function getToken() {
	const cookiesStore = await cookies();
	const token = cookiesStore.get("@tickets_token");
	return token?.value || null;
}

async function saveToken(token: string) {
	if (token.trim().length === 0) return;
	const cookiesStore = await cookies();
	cookiesStore.set("@tickets_token", token, {
		httpOnly: true, // não acessível via JS no browser
		maxAge: 60 * 60 * 24 * 30, // 30 dias
	});
}

async function destroyToken() {
	const cookiesStore = await cookies();
	cookiesStore.delete("@tickets_token");
}

export { getToken, saveToken, destroyToken };
