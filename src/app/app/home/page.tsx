"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Calendar,
  BarChart3,
  FolderOpen,
  MoreHorizontal,
  Edit3,
  Trash2,
} from "lucide-react";
import { listProjects, Project } from "@/services/api";
import CreateProjectModal from "@/components/CreateProjectModal";
import CreateTaskModal from "@/components/CreateTaskModal";
import EditWorkspaceModal from "@/components/EditWorkspaceModal";
import DeleteWorkspaceModal from "@/components/DeleteWorkspaceModal";
import { getPriorityColor, getStatusColor, WORKSPACE_COLORS } from "@/constants";

export default function HomePage() {
  const [tasks] = useState([
    {
      id: 1,
      title: "Complete project setup",
      status: "completed",
      priority: "high",
      assignee: "John D",
      progress: 100,
      dueDate: "2024-12-10",
    },
    {
      id: 2,
      title: "Design review meeting",
      status: "completed",
      priority: "urgent",
      assignee: "Mike T",
      progress: 100,
      dueDate: "2024-12-15",
    },
    {
      id: 3,
      title: "Update API documentation",
      status: "todo",
      priority: "medium",
      assignee: "Alex K",
      progress: 0,
      dueDate: "2024-12-20",
    },
    {
      id: 4,
      title: "Database optimization",
      status: "in-progress",
      priority: "high",
      assignee: "John D",
      progress: 40,
      dueDate: "2024-12-17",
    },
    {
      id: 5,
      title: "User testing session",
      status: "todo",
      priority: "low",
      assignee: "Emma W",
      progress: 0,
      dueDate: "2024-12-22",
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      const response = await listProjects();
      // API returns { success, message, data: { items, pagination }, error }
      const items = response.data?.data?.items ?? [];
      setProjects(Array.isArray(items) ? items : []);
    } catch (err) {
      setProjectsError("Failed to load projects");
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Listen for project updates from other components
  useEffect(() => {
    const handleProjectsUpdated = () => {
      fetchProjects();
    };

    window.addEventListener('projectsUpdated', handleProjectsUpdated);
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleProjectCreated = () => {
    fetchProjects();
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('projectsUpdated'));
  };

  const handleProjectUpdated = () => {
    fetchProjects();
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('projectsUpdated'));
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    todo: tasks.filter((t) => t.status === "todo").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">แดชบอร์ด</h2>
          <p className="text-gray-600">
            ยินดีต้อนรับกลับมา! นี่คือสิ่งที่เกิดขึ้นกับโปรเจกต์ของคุณวันนี้
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                งานทั้งหมด
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% จากสัปดาห์ที่แล้ว
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                เสร็จสิ้น
              </CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.completed}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                อัตราความสำเร็จ {Math.round((stats.completed / stats.total) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                กำลังดำเนินการ
              </CardTitle>
              <Clock className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </div>
              <p className="text-xs text-gray-600 mt-1">งานที่กำลังทำอยู่</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                รอดำเนินการ
              </CardTitle>
              <AlertCircle className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.todo}
              </div>
              <p className="text-xs text-gray-600 mt-1">งานที่รอดำเนินการ</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workspaces (Projects) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workspaces</CardTitle>
                  <CardDescription>Workspace ที่สามารถใช้ได้</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowCreateProjectModal(true)} className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  สร้างใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-2 h-2 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : projectsError ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">{projectsError}</p>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${WORKSPACE_COLORS[index % WORKSPACE_COLORS.length]}`} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {project.name}
                          </h4>
                          {project.config?.nickname && (
                            <p className="text-xs text-gray-500 truncate">
                              {project.config.nickname}
                            </p>
                          )}
                        </div>
                        
                        {/* Project Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProject(project);
                              }}
                              className="cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              แก้ไข
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project);
                              }}
                              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              ลบ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>งานล่าสุด</CardTitle>
                  <CardDescription>
                    รายการงานล่าสุดและความคืบหน้า
                  </CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowCreateTaskModal(true)} className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  สร้างงานใหม่
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={getStatusColor(task.status)}
                          >
                            {task.status.replace("-", " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {task.dueDate}
                          </span>
                        </div>
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`}
                        />
                        <AvatarFallback>
                          {task.assignee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>ความคืบหน้า</span>
                        <span className="font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <CreateProjectModal
        open={showCreateProjectModal}
        onOpenChange={setShowCreateProjectModal}
        onSuccess={handleProjectCreated}
      />

      <CreateTaskModal
        open={showCreateTaskModal}
        onOpenChange={setShowCreateTaskModal}
        projects={projects}
        onSuccess={() => {
          // Refresh tasks if needed
        }}
      />

      <EditWorkspaceModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleProjectUpdated}
        project={editingProject}
      />

      <DeleteWorkspaceModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onSuccess={handleProjectUpdated}
        project={deletingProject}
      />
    </div>
  );
}
