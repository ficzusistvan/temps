const range = (start: number, stop: number, step: number) =>
  Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

interface WeatherDataInputType {
  utcOffsetSeconds: () => number;
  hourly: () => any;
  daily: () => any;
}

type TransformedDataType = {
  time: string;
} & Omit<Record<string, number>, "time">;

export function transformData(
  data: WeatherDataInputType[],
  dailyList: string[]
): TransformedDataType[] {
  const response = data[0];

  const utcOffsetSeconds = response.utcOffsetSeconds();

  const hourly = response.hourly()!;
  const daily = response.daily()!;

  const weatherData = dailyList.reduce(
    (acc, cur, idx) => {
      acc.daily[cur] = daily.variables(idx)!.valuesArray()!;
      return acc;
    },
    {
      daily: {
        time: range(
          Number(daily.time()),
          Number(daily.timeEnd()),
          daily.interval()
        ).map((t) => new Date((t + utcOffsetSeconds) * 1000)),
      },
    } as {
      daily: {
        [key: string]: number[] | Date[];
      };
    }
  );

  const result = [];

  for (let i = 0; i < weatherData.daily.time.length; i++) {
    const obj: any = {
      time: (weatherData.daily.time[i] as Date).toISOString(),
    };

    dailyList.forEach((key) => {
      obj[key] = weatherData.daily[key][i];
    });

    result.push(obj);
  }

  return result;
}

export function buildTraces(
  dailyList: string[],
  dataFirst: TransformedDataType[],
  dataSecond: TransformedDataType[]
) {
  const traces = [];

  for (const [idx, key] of dailyList.entries()) {
    traces.push({
      mode: "lines+makers",
      x: dataFirst.map((f) => f.time),
      y: dataFirst.map((f) => f[key]),
      name: "First: " + key,
      xaxis: `x${2 * idx + 1}`,
      yaxis: `y${2 * idx + 1}`,
      line: {
        //shape: 'spline', // Use 'spline' for smoothing
        //smoothing: 1.3,  // Adjust the smoothing level (1-2 recommended)
        width: 2,
      },
    });
    traces.push({
      mode: "lines+makers",
      x: dataSecond.map((f) => f.time),
      y: dataSecond.map((f) => f[key]),
      name: "Second: " + key,
      xaxis: `x${2 * idx + 2}`,
      yaxis: `y${2 * idx + 2}`,
      line: {
        //shape: 'spline', // Use 'spline' for smoothing
        //smoothing: 1.3,  // Adjust the smoothing level (1-2 recommended)
        width: 2,
      },
    });
  }

  return traces;
}

interface Layout {
  title: string;
  legend: {
    x: number;
    y: number;
    orientation: "h" | "v";
  };
  [key: string]: any;
}

export function buildLayout(
  dailyList: string[],
  dataFirst: TransformedDataType[],
  dataSecond: TransformedDataType[]
) {
  const ranges = dailyList.map((a) => {
    const firstMin = Math.min(...dataFirst.map((f) => f[a]));
    const firstMax = Math.max(...dataFirst.map((f) => f[a]));
    const secondMin = Math.min(...dataSecond.map((f) => f[a]));
    const secondMax = Math.max(...dataSecond.map((f) => f[a]));

    const min = Math.min(firstMin, secondMin);
    const max = Math.max(firstMax, secondMax);

    return [min, max];
  });

  const layout: Layout = {
    title: "Weather data",
    legend: {
      x: 1.1, // Move legend to the right (beyond the chart)
      y: 1,
      orientation: "v", // Vertical legend
    },
  };

  const domainWidth = (1 / dailyList.length) * 2;

  dailyList.forEach((item, idx) => {
    const xAxisKeyFirst = `xaxis${2 * idx + 1}`;
    const xAxisKeySecond = `xaxis${2 * idx + 2}`;
    const yAxisKeyFirst = `yaxis${2 * idx + 1}`;
    const yAxisKeySecond = `yaxis${2 * idx + 2}`;

    layout[xAxisKeyFirst] = {
      overlaying: idx === 0 ? undefined : "x",
      domain: [idx * domainWidth, (idx + 1) * domainWidth],
      side: idx > 0 ? "top" : "bottom",
      tickangle: -45, // Rotate labels to be vertical
      automargin: true, // Ensure labels fit within the chart
      showticklabels: idx > 0 ? false : true,
    };
    layout[xAxisKeySecond] = {
      overlaying: "x",
      domain: [idx * domainWidth, (idx + 1) * domainWidth],
      side: idx > 0 ? "bottom" : "top",
      tickangle: -45, // Rotate labels to be vertical
      automargin: true, // Ensure labels fit within the chart
      showticklabels: idx > 0 ? false : true,
    };
    layout[yAxisKeyFirst] = {
      title: item,
      overlaying: idx === 0 ? undefined : "y",
      range: ranges[idx],
      side: idx % 2 ? "left" : "right",
      automargin: true,
    };
    layout[yAxisKeySecond] = {
      title: item,
      overlaying: "y",
      range: ranges[idx],
      side: idx % 2 ? "left" : "right",
      automargin: true,
    };
  });

  return layout;
}
