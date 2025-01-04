'use client'

import { CommonCartesianChart } from '@/components/CommonCartesianChart'
import { buildLayout, buildTraces, transformData } from '@/helpers';
import { useWeather } from '@/hooks/weather'
import { useEffect, useMemo, useState } from 'react';

interface WeatherChartProps {
  checkboxStates: { [key: string]: boolean };
  dateStates: { [key: string]: string };
}

function WeatherChart({ checkboxStates, dateStates }: WeatherChartProps) {

  const activeCheckboxes = useMemo(() => Object.keys(checkboxStates).filter(
    (key) => checkboxStates[key]
  ), [checkboxStates]);

  const { data: dataFirst, isLoading: isLoadingFirst, error: errorFirst } = useWeather(activeCheckboxes, dateStates.firstStart, dateStates.firstEnd);
  const { data: dataSecond, isLoading: isLoadingSecond, error: errorSecond } = useWeather(activeCheckboxes, dateStates.secondStart, dateStates.secondEnd);

  const [processedData, setProcessedData] = useState<{
    traces: any;
    layout: any;
  } | null>(null);

  useEffect(() => {
    if (!isLoadingFirst && !isLoadingSecond && dataFirst && dataSecond) {
      const transformedDataFirst = transformData(dataFirst, activeCheckboxes)
      const transformedDataSecond = transformData(dataSecond, activeCheckboxes)

      const traces = buildTraces(activeCheckboxes, transformedDataFirst, transformedDataSecond)
      const layout = buildLayout(activeCheckboxes, transformedDataFirst, transformedDataSecond)

      // Update the processed data state
      setProcessedData({ traces, layout });
    }
  }, [dataFirst, dataSecond]);

  if (isLoadingFirst || isLoadingSecond) {
    return <div>Loading...</div>
  }

  if (errorFirst || errorSecond) {
    return <div>Error: {errorFirst || errorSecond}</div>
  }

  if (!dataFirst || !dataSecond) {
    return <div>No data</div>
  }

  //  console.log(JSON.stringify(layout, null, 2))
  //  console.log(JSON.stringify(traces, null, 2))

  return (
    <div>{processedData ? (
      <>
        <CommonCartesianChart chartId="data-drift-features-bar-chart" traces={processedData.traces} layout={processedData.layout} />
      </>
    ) : (
      <div>Loading processed data...</div>
    )}
    </div>
  )
}

export default WeatherChart
