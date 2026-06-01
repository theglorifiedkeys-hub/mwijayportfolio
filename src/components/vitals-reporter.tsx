'use client';

import { useReportWebVitals } from 'next/web-vitals';

/**
 * VitalsReporter - Real-time Performance Signal Monitoring.
 * Logs core web vitals to the console for early Lighthouse feedback.
 */
export function VitalsReporter() {
  useReportWebVitals((metric) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      const color = metric.value > 2500 ? 'color: #ef4444' : 'color: #10b981';
      console.log(
        `%c📊 [Lighthouse Signal] ${metric.name}: %c${metric.value.toFixed(2)}ms (%c${metric.label}%c)`,
        'font-weight: bold;',
        color,
        'color: #8b5cf6',
        ''
      );
    }
  });

  return null;
}
