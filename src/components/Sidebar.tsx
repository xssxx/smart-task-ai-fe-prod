"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LayoutDashboard,
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
import { listProjects, Project } from "@/services/api";
import CreateProjectModal from "@/components/CreateProjectModal";
import EditWorkspaceModal from "@/components/EditWorkspaceModal";
import DeleteWorkspaceModal from "@/components/DeleteWorkspaceModal";

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

const WORKSPACE_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
];

const Sidebar = ({ isOpen = false, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState("");
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Function to determine active item and expanded workspace based on pathname
  const updateActiveStateFromPath = (path: string, workspaceList: Workspace[]) => {
    // Reset active state
    let newActiveItem = "";
    let workspaceToExpand: string | null = null;

    // Check main menu items first
    if (path === "/app/home") {
      newActiveItem = "home";
    } else {
      // Match /app/{projectId}/board or /app/{projectId}/chat
      const projectMatch = path.match(/\/app\/([^/]+)\/(board|chat)/);
      if (projectMatch) {
        const projectId = projectMatch[1];
        const section = projectMatch[2]; // "board" or "chat"
        const workspace = workspaceList.find(w => w.id === projectId);
        if (workspace) {
          newActiveItem = `${section}-${projectId}`;
          workspaceToExpand = projectId;
        }
      }
    }

    setActiveItem(newActiveItem);
    
    // Add workspace to expanded set if needed
    if (workspaceToExpand) {
      setExpandedWorkspaces(prev => new Set([...prev, workspaceToExpand]));
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await listProjects();
      const items = response.data?.data?.items ?? [];
      const projectList: Project[] = Array.isArray(items) ? items : [];
      
      setProjects(projectList);
      
      const mappedWorkspaces: Workspace[] = projectList.map((project, index) => ({
        id: project.id,
        name: project.name,
        color: WORKSPACE_COLORS[index % WORKSPACE_COLORS.length],
        items: [
          {
            id: `board-${project.id}`,
            icon: FolderKanban,
            label: "Board",
            to: `/app/${project.id}/board`,
          },
          {
            id: `chat-${project.id}`,
            icon: MessageCircle,
            label: "Chat AI",
            to: `/app/${project.id}/chat`,
          },
        ],
      }));
      
      setWorkspaces(mappedWorkspaces);
      
      // Update active state based on current pathname
      updateActiveStateFromPath(pathname, mappedWorkspaces);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Update active state when pathname changes
  useEffect(() => {
    if (workspaces.length > 0) {
      updateActiveStateFromPath(pathname, workspaces);
    }
  }, [pathname, workspaces]);

  const handleProjectCreated = () => {
    fetchProjects();
  };

  const handleProjectUpdated = () => {
    fetchProjects();
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
    setOpenDropdown(null);
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
    { id: "home", icon: Home, label: "Home", href: "#" },
    { id: "my-calendar", icon: Calendar, label: "My Calendar", href: "#" },
  ];

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40
          w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto shrink-0
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-4 pt-16 md:pt-4">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Smart Task</h1>
          </div>

          {/* Main Menu */}
          <nav className="space-y-1 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id || (item.id === "home" && pathname === "/app/home");
              return (
                <LinkWithLoading
                  key={item.id}
                  href="/app/home"
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </LinkWithLoading>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Workspaces */}
          <div>
            <div className="flex items-center justify-between mb-2 px-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Workspaces
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-4 h-4 text-gray-500" />
              </Button>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="space-y-2 px-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2 py-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </div>
              ) : workspaces.length === 0 ? (
                <p className="text-sm text-gray-500 px-3 py-2">No projects yet</p>
              ) : (
                workspaces.map((workspace) => (
                  <div key={workspace.id} className="group">
                    {/* Workspace Header */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleWorkspace(workspace.id)}
                        className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            expandedWorkspaces.has(workspace.id) ? "rotate-90" : ""
                          }`}
                        />
                        <div
                          className={`w-2 h-2 rounded-full ${workspace.color}`}
                        ></div>
                        <span className="flex-1 text-left truncate">
                          {workspace.name}
                        </span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === workspace.id ? null : workspace.id);
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>

                        {/* Dropdown Content */}
                        {openDropdown === workspace.id && (
                          <>
                            {/* Backdrop */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            
                            {/* Menu */}
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const project = projects.find(p => p.id === workspace.id);
                                  if (project) {
                                    handleEditProject(project);
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                                แก้ไข
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const project = projects.find(p => p.id === workspace.id);
                                  if (project) {
                                    handleDeleteProject(project);
                                  }
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                ลบ
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Workspace Items */}
                    {expandedWorkspaces.has(workspace.id) && (
                      <div className="ml-6 space-y-1 mt-1">
                        {workspace.items.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeItem === item.id;
                          return (
                            <LinkWithLoading
                              key={item.id}
                              href={item.to ?? "#"}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
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

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>
        </div>
      </aside>

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={handleProjectCreated}
      />

      {/* Edit Project Modal */}
      <EditWorkspaceModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={handleProjectUpdated}
        project={editingProject}
      />

      {/* Delete Project Modal */}
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
