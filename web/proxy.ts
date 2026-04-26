import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_ROUTES = ["/login"];
const ADMIN_ROUTES = ["/dashboard/sectors/new"];
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
	// No proxy usar cookies direto da requisição, não do next/headers
	const token = request.cookies.get("@tickets_token")?.value;
	const backToLogin = new URL("/login", request.url);
	const backToDashboard = new URL("/dashboard", request.url);
	const pathName = request.nextUrl.pathname;
	const isPublicRoute = PUBLIC_ROUTES.some((route) =>
		pathName.startsWith(route)
	);
	// Pagina inicial
	if (pathName === "/") {
		return NextResponse.redirect(token ? backToDashboard : backToLogin);
	}
	if (isPublicRoute) {
		// Já logado? Direto pro Dashboard
		if (token) {
			return NextResponse.redirect(backToDashboard);
		}
		return NextResponse.next();
	}
	// Sem token? Direto pro login
	if (!token) {
		return NextResponse.redirect(backToLogin);
	}
	try {
		const { payload } = await jwtVerify(token, secret);
		const isAdminRoute = ADMIN_ROUTES.some((route) =>
			request.nextUrl.pathname.startsWith(route)
		);
		if (isAdminRoute && payload.role !== "ADMIN") {
			return NextResponse.redirect(backToDashboard);
		}
		return NextResponse.next();
	} catch {
		// Token invalido
		const response = NextResponse.redirect(backToLogin);
		response.cookies.delete("@tickets_token");
		return response;
	}
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)",
	],
};
