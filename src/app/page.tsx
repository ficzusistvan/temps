'use client'

import dynamic from 'next/dynamic';
import { useState } from 'react';

const WeatherChart = dynamic(() => import('../components/WeatherChart'), { ssr: false });

export default function Home() {
  const [checkboxStates, setCheckboxStates] = useState<{ [key: string]: boolean }>({
    temperature_2m_min: false,
    temperature_2m_mean: false,
    temperature_2m_max: false,
  });

  const [dateStates, setDateStates] = useState<{ [key: string]: string }>({
    firstStart: '',
    firstEnd: '',
    secondStart: '',
    secondEnd: ''
  });

  const [submittedStates, setSubmittedStates] = useState<{
    checkboxStates: { [key: string]: boolean };
    dateStates: { [key: string]: string };
  } | null>(null);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setCheckboxStates((prev) => {
      const updatedStates = Object.keys(prev).reduce(
        (acc, key) => ({ ...acc, [key]: false }),
        {}
      );

      return { ...updatedStates, [name]: checked };
    });
  };

  const handleDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const selectedDate = new Date(value);
    const currentDate = new Date();

    const minDate = new Date();
    minDate.setFullYear(1940);
    minDate.setMonth(0);
    minDate.setDate(1);

    // Check if the selected date is in the future
    if (selectedDate <= currentDate) {
      setDateStates((prev) => ({ ...prev, [name]: value }));
    } else {
      console.warn('Selected date is in the future and will not be set.');
    }

    // Check if the selected date is supported
    if (selectedDate > minDate) {
      setDateStates((prev) => ({ ...prev, [name]: value }));
    } else {
      console.warn('Selected date is not supported and will not be set.');
    }
  };

  const handleBtnClick = () => {
    setSubmittedStates({ checkboxStates, dateStates });
  }

  return (
    <div className="flex items-center justify-center p-8 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Weather Data Selection</h1>
        <div className="flex flex-col mb-4">
          <label className="mb-2">
            <input type="checkbox" name="temperature_2m_min" checked={checkboxStates.temperature_2m_min} onChange={handleCheckboxChange} /> temperature_2m_min
          </label>
          <label className="mb-2">
            <input type="checkbox" name="temperature_2m_mean" checked={checkboxStates.temperature_2m_mean} onChange={handleCheckboxChange} /> temperature_2m_mean
          </label>
          <label className="mb-2">
            <input type="checkbox" name="temperature_2m_max" checked={checkboxStates.temperature_2m_max} onChange={handleCheckboxChange} /> temperature_2m_max
          </label>
        </div>
        <div className="bg-gray-200 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">First Date Range</h2>
          <label className="mb-2">Start Date:
            <input type="date" name='firstStart' value={dateStates.firstStart} onChange={handleDateInputChange} className="border rounded p-2 w-full" />
          </label>
          <label className="mb-2">End Date:
            <input type="date" name='firstEnd' value={dateStates.firstEnd} onChange={handleDateInputChange} className="border rounded p-2 w-full" />
          </label>
        </div>
        <div className="bg-gray-200 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-semibold mb-2">Second Date Range</h2>
          <label className="mb-2">Start Date:
            <input type="date" name='secondStart' value={dateStates.secondStart} onChange={handleDateInputChange} className="border rounded p-2 w-full" />
          </label>
          <label className="mb-2">End Date:
            <input type="date" name='secondEnd' value={dateStates.secondEnd} onChange={handleDateInputChange} className="border rounded p-2 w-full" />
          </label>
        </div>
        <button onClick={handleBtnClick} className="bg-blue-500 text-white rounded p-2 hover:bg-blue-600 w-full">Submit</button>
      </div>
      <div className="flex-grow p-6 mb-6">
        <div className="flex flex-col">
          <main className="flex flex-col gap-8">
            {submittedStates && <WeatherChart checkboxStates={submittedStates.checkboxStates} dateStates={submittedStates.dateStates} />}
          </main>
          <footer className="flex gap-6 items-center justify-center">
            <p>Isti - openmeteo API playground</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
