/**
 * Simple Progress Chart Component
 * 
 * Line chart showing user progress over time.
 */

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

/**
 * ProgressChart props
 */
interface ProgressChartProps {
  /**
   * Data points (date, value)
   */
  data: Array<{ date: Date; value: number }>;

  /**
   * Chart title
   */
  title?: string;
}

/**
 * ProgressChart Component
 */
export function ProgressChart({ data, title = 'Progression' }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  // Simple line chart
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 80; // 80% height, 10% padding top/bottom
    return { x, y, value: point.value, date: point.date };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <TrendingUp className="w-5 h-5 text-primary" />
      </div>

      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-gray-200 dark:text-gray-700"
            />
          ))}

          {/* Line path */}
          <motion.path
            d={`M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />

          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="currentColor"
              className="text-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{maxValue}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{minValue}</span>
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {data.map((point, index) => (
            <span key={index} className="transform -rotate-45 origin-left">
              {point.date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

