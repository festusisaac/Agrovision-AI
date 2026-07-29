/** Best-effort weather summary for injecting environmental context into the diagnosis prompt. */
export async function getWeatherContext(): Promise<string | undefined> {
  try {
    const coords = await new Promise<{ lat: number; lon: number } | null>((resolve) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 3000, maximumAge: 10 * 60 * 1000 }
      );
    });

    const url = coords ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}` : "/api/weather";
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const data = await res.json();
    if (data.error) return undefined;

    return `${data.temperature}°C, ${data.humidity}% humidity, ${data.description}, in ${data.location}`;
  } catch {
    return undefined;
  }
}
