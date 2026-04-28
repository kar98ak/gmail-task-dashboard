"use client";

import { TaskCategory, TaskStatus } from "@/types";
import { BookOpen, Briefcase, LayoutGrid, RefreshCw } from "lucide-react";

interface Props {
  category: TaskCategory | "all";
  status: TaskStatus | "all";
  onCategoryChange: (c: TaskCategory | "all") => void;
  onStatusChange: (s: TaskStatus | "all") => void;
  onSync: () => void;
  syncing: boolean;
}

const categoryOptions: { value: TaskCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <LayoutGrid className="w-4 h-4" /> },
  { value: "school", label: "School", icon: <BookOpen className="w-4 h-4" /> },
  { value: "job_application", label: "Job Apps", icon: <Briefcase className="w-4 h-4" /> },
];

const statusOptions: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export default function FilterBar({
  category,
  status,
  onCategoryChange,
  onStatusChange,
  onSync,
  syncing,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {categoryOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onCategoryChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              category === opt.value
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              status === opt.value
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={onSync}
        disabled={syncing}
        className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Syncing…" : "Sync Gmail"}
      </button>
    </div>
  );
}
