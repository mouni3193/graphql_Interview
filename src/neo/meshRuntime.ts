export const callNeoFeed = async (startDate: string, endDate: string) => {
  const url = new URL("https://api.nasa.gov/neo/rest/v1/feed");
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("api_key", "DEMO_KEY");

  const res = await fetch(url.toString());
  if (!res.ok) 
    throw new Error(`NASA API error: ${res.status}`);
  return res.json();
};

export default { callNeoFeed };
