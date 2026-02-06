"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  CircleMinus,
  BookCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  listProjects,
  Project,
  deleteTask,
  TaskStatistics,
  TaskWithProject,
  getTaskStatistics,
  getUnscheduledTasks,
  getTodayTasks,
} from "@/services/api";
import CreateTaskModal from "@/components/CreateTaskModal";
import { TaskStatusChart } from "@/components/TaskStatusChart";
import UnscheduledTasksSection from "@/components/UnscheduledTasksSection";
import TodayTasksSection from "@/components/TodayTasksSection";
import TaskDetailModal from "@/components/TaskDetailModal";
import { toast } from "sonner";

export default function HomePage() {
  // New state for dashboard data
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [unscheduledTasks, setUnscheduledTasks] = useState<TaskWithProject[]>([]);
  const [todayTasks, setTodayTasks] = useState<TaskWithProject[]>([]);

  // Loading states
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [unscheduledLoading, setUnscheduledLoading] = useState(true);
  const [todayLoading, setTodayLoading] = useState(true);

  // Error states
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [unscheduledError, setUnscheduledError] = useState<string | null>(null);
  const [todayError, setTodayError] = useState<string | null>(null);

  // Keep projects state for CreateTaskModal
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);

  // Task detail modal state
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const response = await listProjects();
      const items = response.data?.data?.items ?? [];
      setProjects(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
      toast.error("ไม่สามารถโหลดข้อมูลโปรเจกต์ได้");
    }
  };

  const fetchTaskStatistics = async () => {
    try {
      setStatisticsLoading(true);
      setStatisticsError(null);
      const response = await getTaskStatistics();
      setStatistics(response.data?.data ?? null);
    } catch (err) {
      console.error("Failed to load task statistics:", err);
      const errorMessage = "ไม่สามารถโหลดข้อมูลสถิติได้";
      setStatisticsError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setStatisticsLoading(false);
    }
  };

  const fetchUnscheduledTasks = async () => {
    try {
      setUnscheduledLoading(true);
      setUnscheduledError(null);
      const response = await getUnscheduledTasks();
      const items = response.data?.data?.items ?? [];
      setUnscheduledTasks(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load unscheduled tasks:", err);
      const errorMessage = "ไม่สามารถโหลดงานที่ยังไม่ได้กำหนดวันที่ได้";
      setUnscheduledError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUnscheduledLoading(false);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      setTodayLoading(true);
      setTodayError(null);
      const response = await getTodayTasks();
      const items = response.data?.data?.items ?? [];
      setTodayTasks(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load today's tasks:", err);
      const errorMessage = "ไม่สามารถโหลดงานวันนี้ได้";
      setTodayError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setTodayLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTaskStatistics();
    fetchUnscheduledTasks();
    fetchTodayTasks();
  }, []);

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success("ลบงานสำเร็จ");

      // Refresh all data after successful deletion
      fetchTaskStatistics();
      fetchUnscheduledTasks();
      fetchTodayTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("ไม่สามารถลบงานได้");
      throw err; // Re-throw to let the component handle it
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
  };

  const handleStatusChange = () => {
    // Refresh all data after status change
    fetchTaskStatistics();
    fetchUnscheduledTasks();
    fetchTodayTasks();
  };

  const handleTaskDetailSuccess = () => {
    // Refresh all data after task update
    fetchTaskStatistics();
    fetchUnscheduledTasks();
    fetchTodayTasks();
  };

  // Calculate stats from statistics data
  const stats = statistics ? {
    total: statistics.todo + statistics.in_progress + statistics.in_review + statistics.done,
    completed: statistics.done,
    inProgress: statistics.in_progress,
    inReview: statistics.in_review,
    todo: statistics.todo,
  } : {
    total: 0,
    completed: 0,
    inProgress: 0,
    inReview: 0,
    todo: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-base">
      {/* Main Content */}
      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-semibold text-gray-900 mb-2 lg:hidden">
          แดชบอร์ด
        </h1>
        
        {/* Page Subtitle */}
        <div className="mb-6">
          <p className="text-lg text-gray-600">
            ยินดีต้อนรับกลับมา! นี่คือสิ่งที่เกิดขึ้นกับโปรเจกต์ของคุณวันนี้
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-gray-600">
                งานทั้งหมด
              </CardTitle>
              <BookCheck className="w-5 h-5" style={{ color: 'zinc-800' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.total}
              </div>
              {stats.total > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  งานทั้งหมดในระบบ
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-gray-600">
                รอดำเนินการ
              </CardTitle>
              <CircleMinus className="w-5 h-5" style={{ color: 'zinc-500' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.todo}
              </div>
              <p className="text-sm text-gray-600 mt-1">งานที่รอดำเนินการ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-gray-600">
                กำลังดำเนินการ
              </CardTitle>
              <Clock className="w-5 h-5" style={{ color: '#00a6f4' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.inProgress}
              </div>
              <p className="text-sm text-gray-600 mt-1">งานที่กำลังทำอยู่</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-gray-600">
                รอตรวจสอบ
              </CardTitle>
              <AlertCircle className="w-5 h-5" style={{ color: '#f0b100' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.inReview}
              </div>
              <p className="text-sm text-gray-600 mt-1">งานที่รอตรวจสอบ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium text-gray-600">
                เสร็จสิ้น
              </CardTitle>
              <CheckCircle2 className="w-5 h-5" style={{ color: '#7ccf00' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats.completed}
              </div>
              {stats.total > 0 && (
                <p className="text-sm text-gray-600 mt-1">งานที่ดำเนินการเสร็จสิ้น</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Task Status Chart */}
          {statisticsLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ) : statisticsError ? (
            <Card>
              <CardHeader>
                <CardTitle>สถิติงานตาม Status</CardTitle>
                <CardDescription>แสดงจำนวนงานทั้งหมดแยกตามสถานะ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                  <p className="text-sm text-gray-600 mb-3">{statisticsError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchTaskStatistics}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    ลองอีกครั้ง
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : statistics ? (
            <TaskStatusChart statistics={statistics} />
          ) : null}

          {/* Unscheduled Tasks Section */}
          {unscheduledLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : unscheduledError ? (
            <Card>
              <CardHeader>
                <CardTitle>งานที่ยังไม่ได้กำหนดวันที่</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="py-8 flex flex-col items-center justify-center text-center">
                  <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                  <p className="text-sm text-gray-600 mb-3">{unscheduledError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUnscheduledTasks}
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    ลองอีกครั้ง
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <UnscheduledTasksSection
              tasks={unscheduledTasks}
              onDelete={handleDeleteTask}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>

        {/* Today's Tasks Section */}
        {todayLoading ? (
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : todayError ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>งานที่ต้องทำในวันนี้</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <p className="text-sm text-gray-600 mb-3">{todayError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTodayTasks}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  ลองอีกครั้ง
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="mb-6">
            <TodayTasksSection
              tasks={todayTasks}
              onDelete={handleDeleteTask}
              onTaskClick={handleTaskClick}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={setShowCreateTaskModal}
        projects={projects}
        onSuccess={() => {
          // Refresh tasks if needed
        }}
      />

      <TaskDetailModal
        open={showTaskDetailModal}
        onOpenChange={setShowTaskDetailModal}
        onSuccess={handleTaskDetailSuccess}
        taskId={selectedTaskId}
      />
    </div>
  );
}
