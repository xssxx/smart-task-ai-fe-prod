"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useProjects } from "@/hooks/useProjects";
import type { Project } from "@/services/api";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Home,
  FolderKanban,
  ChevronRight,
  Calendar,
  MessageCircle,
  Menu,
  X,
  MoreHorizontal,
  Edit3,
  Trash2,
} from "lucide-react";
import { LinkWithLoading } from "@/components/LinkWithLoading";
import CreateProjectModal from "@/components/CreateProjectModal";
import EditWorkspaceModal from "@/components/EditWorkspaceModal";
import DeleteWorkspaceModal from "@/components/DeleteWorkspaceModal";
import { WORKSPACE_COLORS } from "@/constants";

interface WorkspaceItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
}

interface Workspace {
  id: string;
  name: string;
  color: string;
  items: WorkspaceItem[];
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar = ({ isOpen = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const t = useTranslations();
  const [activeItem, setActiveItem] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const { projects, loading, refetch } = useProjects();

  const updateActiveStateFromPath = (path: string, workspaceList: Workspace[]) => {
    let newActiveItem = "";
    let workspaceToExpand: string | null = null;

    if (path === "/app/home") {
      newActiveItem = "home";
    } else if (path === "/app/calendar") {
      newActiveItem = "my-calendar";
    } else {
      const projectMatch = path.match(/\/app\/([^/]+)\/(board|chat)/);
      if (projectMatch) {
        const projectId = projectMatch[1];
        const section = projectMatch[2];
        const workspace = workspaceList.find(w => w.id === projectId);
        if (workspace) {
          newActiveItem = `${section}-${projectId}`;
          workspaceToExpand = projectId;
        }
      }
    }

    setActiveItem(newActiveItem);
    if (workspaceToExpand) {
      setExpandedWorkspaces(prev => new Set([...prev, workspaceToExpand]));
    }
  };

  useEffect(() => {
    const mappedWorkspaces: Workspace[] = projects.map((project, index) => ({
      id: project.id,
      name: project.name,
      color: WORKSPACE_COLORS[index % WORKSPACE_COLORS.length],
      items: [
        {
          id: `board-${project.id}`,
          icon: FolderKanban,
          label: t('sidebar.board'),
          to: `/app/${project.id}/board`,
        },
        {
          id: `chat-${project.id}`,
          icon: MessageCircle,
          label: t('sidebar.aiChat'),
          to: `/app/${project.id}/chat`,
        },
      ],
    }));

    updateActiveStateFromPath(pathname, mappedWorkspaces);
    setWorkspaces(mappedWorkspaces);
  }, [projects, pathname, t]);

  const handleProjectCreated = () => {
    refetch();
  };

  const handleProjectUpdated = () => {
    refetch();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project as Project);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project as Project);
    setShowDeleteModal(true);
  };

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  const menuItems = [
    { id: "home", icon: Home, label: t('sidebar.home'), href: "/app/home" },
    { id: "my-calendar", icon: Calendar, label: t('sidebar.myCalendar'), href: "/app/calendar" },
  ];

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-7 left-4 z-50 p-1 bg-transparent flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-40
          w-72 bg-sidebar border-r border-sidebar-border h-screen overflow-y-auto shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-5 pt-16 lg:pt-5">
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <Image src="/logo.svg" alt="Smart Task AI" width={40} height={40} className="object-contain" />
            <h1 className="text-2xl font-momo text-sidebar-foreground">Smart Task</h1>
          </div>

          <nav className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id || (item.id === "home" && pathname === "/app/home") || (item.id === "my-calendar" && pathname === "/app/calendar");
              return (
                <LinkWithLoading
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </div>
                </LinkWithLoading>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border my-4"></div>

          <div>
            <div className="flex items-center justify-between mb-3 px-4">
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('sidebar.workspaces')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="space-y-2 px-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 py-2">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="w-3 h-3 rounded-full" />
                      <Skeleton className="h-5 flex-1" />
                    </div>
                  ))}
                </div>
              ) : workspaces.length === 0 ? (
                <p className="text-base text-muted-foreground px-4 py-2">{t('sidebar.noProjects')}</p>
              ) : (
                workspaces.map((workspace) => (
                  <div key={workspace.id} className="group">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleWorkspace(workspace.id)}
                        className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      >
                        <ChevronRight
                          className={`w-5 h-5 transition-transform ${expandedWorkspaces.has(workspace.id) ? "rotate-90" : ""
                            }`}
                        />
                        <div
                          className={`w-3 h-3 rounded-full ${workspace.color}`}
                        ></div>
                        <span className="flex-1 text-left truncate">
                          {workspace.name}
                        </span>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              const project = projects.find(p => p.id === workspace.id);
                              if (project) {
                                handleEditProject(project);
                              }
                            }}
                            className="cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {t('sidebar.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              const project = projects.find(p => p.id === workspace.id);
                              if (project) {
                                handleDeleteProject(project);
                              }
                            }}
                            className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('sidebar.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {expandedWorkspaces.has(workspace.id) && (
                      <div className="ml-8 space-y-1 mt-1 animate-in slide-in-from-top-2 fade-in-0 duration-200">
                        {workspace.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeItem === item.id;
                          return (
                            <LinkWithLoading
                              key={item.id}
                              href={item.to ?? "#"}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                : "text-muted-foreground hover:bg-sidebar-accent/50"
                                }`}
                            >
                              <Icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </LinkWithLoading>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-sidebar-border my-4"></div>
        </div>
      </aside>

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleProjectCreated}
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
    </>
  );
};

export default Sidebar;
