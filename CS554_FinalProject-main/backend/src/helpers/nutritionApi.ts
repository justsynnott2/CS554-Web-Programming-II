import axios from 'axios';

type UpstreamError = Error & {
  status?: number;
  details?: unknown;
};

export async function getNutritionInfoEdamam(query: string, accountUser?: string) {

  if (!query || typeof query !== "string") {
    throw new Error("Invalid food query");
  }

  const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
  const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;

  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
    throw new Error("Missing Edamam API keys in environment variables");
  }

  const url = "https://api.edamam.com/api/recipes/v2";

  const params = {
    type: "public",
    q: query,
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    random: false
  };

  try {
    const headerAccountUser = accountUser || process.env.EDAMAM_ACCOUNT_USER || "anonymous";
    const response = await axios.get(url, {
      params,
      timeout: 10_000,
      headers: {
        "Edamam-Account-User": headerAccountUser,
      },
    });
    const hits = response.data.hits || [];

    return hits.map((hit: any) => {
      const r = hit.recipe;
      const yieldCount = r.yield || 1;

      const total = r.totalNutrients || {};
      return {
        name: r.label,
        image: r.image,
        source: r.source,
        url: r.url,
        calories: Math.round(r.calories || 0),
        protein: +(total.PROCNT?.quantity || 0),
        carbs: +(total.CHOCDF?.quantity || 0),
        fat: +(total.FAT?.quantity || 0),
        fiber: +(total.FIBTG?.quantity || 0),
        sugar: +(total.SUGAR?.quantity || 0),
        perServing: {
          calories: Math.round((r.calories || 0) / yieldCount),
          protein: +(((total.PROCNT?.quantity || 0) / yieldCount).toFixed(2)),
          carbs: +(((total.CHOCDF?.quantity || 0) / yieldCount).toFixed(2)),
          fat: +(((total.FAT?.quantity || 0) / yieldCount).toFixed(2)),
          fiber: +(((total.FIBTG?.quantity || 0) / yieldCount).toFixed(2)),
          sugar: +(((total.SUGAR?.quantity || 0) / yieldCount).toFixed(2))
        },
        servings: yieldCount,
        ingredients: r.ingredientLines || []
      };
    });
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 502;
      const details = err.response?.data;
      const msg =
        (typeof details === "object" && details && ("message" in details) && (details as any).message) ||
        (typeof details === "object" && details && ("error" in details) && (details as any).error) ||
        err.message ||
        "Edamam request failed";

      console.error("Edamam search error:", { status, details });
      const e: UpstreamError = new Error(`Edamam API error (${status}): ${msg}`);
      e.status = status;
      e.details = details;
      throw e;
    }

    console.error("Edamam search error:", err?.message || err);
    throw new Error(err?.message || "Failed to fetch data from Edamam");
  }
}