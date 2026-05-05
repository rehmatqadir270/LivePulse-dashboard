"use server";

export async function voteTrend(formData: FormData): Promise<void> {
  const trendId = formData.get("trendId");

  if (!trendId || typeof trendId !== "string") {
    throw new Error("Invalid trend ID");
  }
}
