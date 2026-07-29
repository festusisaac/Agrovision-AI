// Lagos, Nigeria — used when the client doesn't share (or hasn't yet resolved) a location.
export const FALLBACK_LAT = 6.5244;
export const FALLBACK_LON = 3.3792;
export const FALLBACK_LOCATION = "Lagos, Nigeria";

export interface WeatherNow {
  temperature: number;
  humidity: number;
  windSpeed: number; // km/h
  description: string;
  hint: string;
  location: string;
}

export interface WeatherWithForecast extends WeatherNow {
  tomorrow: {
    precipitationChance: number;
    precipitationMm: number;
    tempMax: number;
    tempMin: number;
    description: string;
    /** e.g. "Tuesday" — the real calendar day the forecast above refers to. */
    dayLabel: string;
  };
}

export function describeWeather(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 95) return "Thunderstorm";
  return "Cloudy";
}

export function farmingHint(code: number, temperature: number, humidity: number): string {
  if (code >= 51 && code < 95) return "Rain expected — hold off on irrigation";
  if (code >= 95) return "Storm risk — secure equipment and check drainage";
  if (humidity >= 80) return "High humidity — watch for fungal disease";
  if (temperature >= 32) return "Hot and dry — irrigate early or late in the day";
  if (code <= 2) return "Good conditions for irrigation";
  return "Mild conditions — check soil moisture";
}

export function getBrowserLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 4000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const city = data.city || data.locality;
    const country = data.countryName;
    return [city, country].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}

/** Current conditions only — used by the homepage weather card. */
export async function getWeatherNow(lat: number, lon: number, hasClientLocation: boolean): Promise<WeatherNow> {
  const [weatherRes, location] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
    ),
    hasClientLocation ? reverseGeocode(lat, lon) : Promise.resolve(FALLBACK_LOCATION),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo request failed: ${weatherRes.status}`);
  }

  const data = await weatherRes.json();
  const temperature = Math.round(data.current.temperature_2m);
  const humidity = Math.round(data.current.relative_humidity_2m);
  const code = data.current.weather_code as number;

  return {
    temperature,
    humidity,
    windSpeed: Math.round(data.current.wind_speed_10m),
    description: describeWeather(code),
    hint: farmingHint(code, temperature, humidity),
    location: location || "Your area",
  };
}

/** Current + tomorrow's forecast — used by the daily farm report. */
export async function getWeatherWithForecast(
  lat: number,
  lon: number,
  hasClientLocation: boolean
): Promise<WeatherWithForecast> {
  const [weatherRes, location] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=precipitation_probability_max,precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code` +
        `&forecast_days=2&timezone=auto`
    ),
    hasClientLocation ? reverseGeocode(lat, lon) : Promise.resolve(FALLBACK_LOCATION),
  ]);

  if (!weatherRes.ok) {
    throw new Error(`Open-Meteo request failed: ${weatherRes.status}`);
  }

  const data = await weatherRes.json();
  const temperature = Math.round(data.current.temperature_2m);
  const humidity = Math.round(data.current.relative_humidity_2m);
  const code = data.current.weather_code as number;
  const tomorrowDate = data.daily?.time?.[1] ? new Date(data.daily.time[1]) : new Date(Date.now() + 86400000);

  return {
    temperature,
    humidity,
    windSpeed: Math.round(data.current.wind_speed_10m),
    description: describeWeather(code),
    hint: farmingHint(code, temperature, humidity),
    location: location || "Your area",
    tomorrow: {
      precipitationChance: Math.round(data.daily.precipitation_probability_max[1] ?? 0),
      precipitationMm: Math.round((data.daily.precipitation_sum?.[1] ?? 0) * 10) / 10,
      tempMax: Math.round(data.daily.temperature_2m_max[1]),
      tempMin: Math.round(data.daily.temperature_2m_min[1]),
      description: describeWeather(data.daily.weather_code[1]),
      dayLabel: tomorrowDate.toLocaleDateString("en-GB", { weekday: "long" }),
    },
  };
}
