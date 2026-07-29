import { NextRequest, NextResponse } from "next/server";
import { FALLBACK_LAT, FALLBACK_LON, getWeatherNow } from "@/lib/weatherService";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  const hasClientLocation = latParam !== null && lonParam !== null;
  const lat = hasClientLocation ? Number(latParam) : FALLBACK_LAT;
  const lon = hasClientLocation ? Number(lonParam) : FALLBACK_LON;

  if (hasClientLocation && (Number.isNaN(lat) || Number.isNaN(lon))) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const weather = await getWeatherNow(lat, lon, hasClientLocation);
    return NextResponse.json(weather);
  } catch (err) {
    console.error("[/api/weather]", err);
    return NextResponse.json({ error: "Weather lookup failed" }, { status: 502 });
  }
}
