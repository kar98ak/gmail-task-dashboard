"use client";

import { Task, TaskStatus } from "@/types";
import { formatDistanceToNow, parseISO } from "date-fns";
import {
  BookOpen,
  Briefcase,
  Circle,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

const priorityColors = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-yellow-400 bg-yellow-50",
  low: "border-l-blue-400 bg-blue-50",
};

const priorityBadge = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

const categoryIcon = {
  school: <BookOpen className="w-4 h-4" />,
  job_application: <Briefcase className="w-4 h-4" />,
  general: <Circle className="w-4 h-4" />,
};

interface Props {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export default function TaskCard({ task, onStatusChange }: Props) {
  const isDone = task.status === "done";

  return (
    <div
      className={`border-l-4 rounded-lg p-4 shadow-sm transition-opacity ${priorityColors[task.priority]} ${isDone ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onStatusChange(task.id, isDone ? "pending" : "done")}
            className="shrink-0 text-gray-400 hover:text-green-600 transition-colors"
          >
            {isDone ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <span
            className={`font-medium text-gray-800 truncate ${isDone ? "line-through" : ""}`}
          >
            {task.title}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${priorityBadge[task.priority]}`}
        >
          {task.priority}
        </span>
      </div>

      <p className="text-sm text-gray-600 mt-1 ml-7 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center gap-3 mt-2 ml-7 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          {categoryIcon[task.category]}
          {task.category === "job_application" ? "Job App" : task.category.charAt(0).toUpperCase() + task.category.slice(1)}
        </span>
        {task.deadline && (
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            <Calendar className="w-3 h-3" />
            Due {formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })}
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(parseISO(task.created_at), { addSuffix: true })}
        </span>
      </div>

      <p className="text-xs text-gray-400 mt-1 ml-7 truncate">
        From: {task.email_from}
      </p>
    </div>
  );
}
