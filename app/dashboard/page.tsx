"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Task, TaskCategory, TaskStatus } from "@/types";
import TaskCard from "@/components/dashboard/TaskCard";
import FilterBar from "@/components/dashboard/FilterBar";
import { LogOut, Inbox } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [taskStatus, setTaskStatus] = useState<TaskStatus | "all">("pending");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (taskStatus !== "all") params.set("status", taskStatus);
    const res = await fetch(`/api/tasks?${params}`);
    const data = await res.json();
    setTasks(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [category, taskStatus]);

  useEffect(() => {
    if (status === "authenticated") fetchTasks();
  }, [status, fetchTasks]);

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/gmail/sync", { method: "POST" });
    await fetchTasks();
    setSyncing(false);
  }

  async function handleStatusChange(id: string, newStatus: TaskStatus) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
  }

  if (status === "loading" || status === "unauthenticated") return null;

  const counts = {
    high: tasks.filter((t) => t.priority === "high" && t.status !== "done").length,
    school: tasks.filter((t) => t.category === "school" && t.status !== "done").length,
    jobs: tasks.filter((t) => t.category === "job_application" && t.status !== "done").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard label="Urgent" value={counts.high} color="text-red-600" />
          <StatCard label="School" value={counts.school} color="text-indigo-600" />
          <StatCard label="Job Apps" value={counts.jobs} color="text-green-600" />
        </div>

        <FilterBar
          category={category}
          status={taskStatus}
          onCategoryChange={setCategory}
          onStatusChange={setTaskStatus}
          onSync={handleSync}
          syncing={syncing}
        />

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Inbox className="w-10 h-10 mx-auto mb-2" />
            <p>No tasks found. Try syncing your Gmail.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
