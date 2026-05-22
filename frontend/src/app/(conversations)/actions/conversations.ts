"use server";
import "server-only";
import { google } from "@/lib/ai/google";
import { TITLE_MODEL } from "@/lib/ai/models";
import { generateTextInstruction, generateTextSystemPrompt } from "@/lib/ai/prompts";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema/conversations";
import { generateText } from "ai";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
const model = google(TITLE_MODEL, {
	safetySettings: [
		{
			category: "HARM_CATEGORY_DANGEROUS_CONTENT",
			threshold: "BLOCK_ONLY_HIGH",
		},
	],
});

export async function generateTitle(conversationId: string, content: string) {
	try {
		const { text } = await generateText({
			model,
			system: generateTextSystemPrompt,
			prompt: generateTextInstruction(content),
		});
		await db
			.update(conversations)
			.set({
				title: text,
			})
			.where(eq(conversations.id, conversationId));
		revalidatePath(`/conversations/${conversationId}`);
	} catch {
		return "Failed to generate title. Please try again later";
	}
}
