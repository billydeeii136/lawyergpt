"use server";
import "server-only";
import { hasAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/user";
import { env } from "@/lib/env";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

type State = {
	status: string;
};

const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionUser = {
	id: string;
	email: string;
	name: string;
};

function setSessionCookies(user: SessionUser) {
	const cookieStore = cookies();
	const options = {
		httpOnly: true,
		secure: env.NODE_ENV === "production",
		maxAge: SESSION_MAX_AGE,
		path: "/",
	};

	cookieStore.set("userId", user.id, options);
	cookieStore.set("user", user.email, options);
	cookieStore.set("name", user.name, options);
}

const signUpSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
});

const logInSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export async function signUp(prevState: State, formData: FormData) {
	try {
		const validatedFields = signUpSchema.safeParse({
			name: formData.get("name"),
			email: formData.get("email"),
		});

		if (!validatedFields.success) {
			return { status: "error" };
		}

		const [createdUser] = await db
			.insert(users)
			.values({
				name: validatedFields.data.name,
				email: validatedFields.data.email,
			})
			.onConflictDoUpdate({
				target: users.email,
				set: { name: validatedFields.data.name },
			})
			.returning({
				id: users.id,
				name: users.name,
				email: users.email,
			});

		setSessionCookies(createdUser);

		return { status: "success" };
	} catch {
		return { status: "error" };
	}
}

export async function logIn(prevState: State, formData: FormData) {
	try {
		const validatedFields = logInSchema.safeParse({
			email: formData.get("email"),
		});

		if (!validatedFields.success) {
			return { status: "error" };
		}

		const existingUser = await db
			.select({ name: users.name, id: users.id })
			.from(users)
			.where(eq(users.email, validatedFields.data.email));

		if (!existingUser.length) {
			return { status: "error" };
		}
		const { name, id } = existingUser[0];

		setSessionCookies({ id, name, email: validatedFields.data.email });

		return { status: "success" };
	} catch {
		return { status: "error" };
	}
}
export async function logOut() {
	const isAllowed = hasAuthCookie();
	if (isAllowed) {
		cookies().delete("userId");
		cookies().delete("user");
		cookies().delete("name");
	}
	redirect("/auth");
}
