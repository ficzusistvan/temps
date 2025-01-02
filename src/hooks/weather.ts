import { fetchWeatherApi } from "openmeteo";
import { useEffect, useState } from "react";

const url = "https://archive-api.open-meteo.com/v1/archive";

export const useWeather = (
  dailyList: string[],
  startDate: string,
  endDate: string
) => {
  const [chartData, setChartData] = useState<{ utcOffsetSeconds: () => number; hourly: () => any; daily: () => any }[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const params = {
        latitude: 46.5425,
        longitude: 24.5575,
        start_date: startDate,
        end_date: endDate,
        daily: dailyList,
      };
      try {
        const responses = await fetchWeatherApi(url, params);
        setChartData(responses);
      } catch (error) {
        console.error("Error fetching data from API:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate, dailyList]);

  return { data: chartData, isLoading, error };
};
