'use client'

import { CommonCartesianChart } from '@/components/CommonCartesianChart'
import { useWeather } from '@/hooks/weather'
import { useMemo } from 'react';

const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

interface WeatherChartProps {
  checkboxStates: { [key: string]: boolean };
  dateStates: { [key: string]: string };
}

function transformData(data: { utcOffsetSeconds: () => number; hourly: () => any; daily: () => any }[]) {
  const response = data[0]

  const utcOffsetSeconds = response.utcOffsetSeconds();

  const hourly = response.hourly()!;
  const daily = response.daily()!;

  const weatherData = {
    daily: {
      time: range(Number(daily.time()), Number(daily.timeEnd()), daily.interval()).map(
        (t) => new Date((t + utcOffsetSeconds) * 1000)
      ),
      temp: daily.variables(0)!.valuesArray()!,
    },
  };

  const result = []

  for (let i = 0; i < weatherData.daily.time.length; i++) {
    result.push({
      time: weatherData.daily.time[i].toISOString(),
      temp: weatherData.daily.temp[i],
    });
  }

  return result
}

function WeatherChart({ checkboxStates, dateStates }: WeatherChartProps) {

  const activeCheckboxes = useMemo(() => Object.keys(checkboxStates).filter(
    (key) => checkboxStates[key]
  ), [checkboxStates]);

  const { data: dataFirst, isLoading: isLoadingFirst, error: errorFirst } = useWeather(activeCheckboxes, dateStates.firstStart, dateStates.firstEnd);
  const { data: dataSecond, isLoading: isLoadingSecond, error: errorSecond } = useWeather(activeCheckboxes, dateStates.secondStart, dateStates.secondEnd);

  if (isLoadingFirst || isLoadingSecond) {
    return <div>Loading...</div>
  }

  if (errorFirst || errorSecond) {
    return <div>Error: {errorFirst || errorSecond}</div>
  }

  if (!dataFirst) {
    return <div>No data</div>
  }

  if (!dataSecond) {
    return <div>No data</div>
  }

  const transformedDataFirst = transformData(dataFirst)
  const transformedDataSecond = transformData(dataSecond)

  const traces = [
    {
      mode: 'lines+makers',
      x: transformedDataFirst.map((f) => f.time),
      y: transformedDataFirst.map((f) => f.temp),
      name: 'First set',
      line: {
        shape: 'spline', // Use 'spline' for smoothing
        //smoothing: 1.3,  // Adjust the smoothing level (1-2 recommended)
        //width: 2
      },
    },
    {
      mode: 'lines+makers',
      x: transformedDataSecond.map((f) => f.time),
      y: transformedDataSecond.map((f) => f.temp),
      name: 'Second set',
      xaxis: 'x2',
      line: {
        //shape: 'spline', // Use 'spline' for smoothing
        //smoothing: 1.3,  // Adjust the smoothing level (1-2 recommended)
        width: 2
      },
    },
  ]

  const layout = {
    xaxis: {
      title: 'First set dates',
    },
    xaxis2: {
      title: 'Second set dates',
      overlaying: 'x',
      side: 'top',
    },
    yaxis: {
      title: 'Temperature in Celsius',  
    }
  }

  return <CommonCartesianChart chartId="data-drift-features-bar-chart" traces={traces} layout={layout} />
}

export default WeatherChart
