"use client";

import React from "react";
import { Calendar } from "lucide-react";

interface TimeFilterProps {
  value: number;
  onChange: (days: number) => void;
}

const OPTIONS = [
  { label: "24h", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
];

export const TimeFilter: React.FC<TimeFilterProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              value === opt.value
                ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
