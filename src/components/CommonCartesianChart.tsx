'use client'

import Plotly from 'plotly.js-cartesian-dist-min'
import { useEffect, useRef } from 'react';

interface LineChartProps {
    chartId: string
    traces: unknown[]
    layout?: unknown
}

export const CommonCartesianChart = ({ chartId, traces, layout }: LineChartProps) => {
    const chartElRef = useRef(null)

    useEffect(() => {
        chartElRef.current &&
            Plotly.newPlot(chartId, {
                data: traces,
                layout: layout ?? { barmode: 'group' },
                config: { displayModeBar: false, responsive: true },
            })
    }, [chartId, traces, layout])

    return <div className="self-stretch" id={chartId} ref={chartElRef} />
}
