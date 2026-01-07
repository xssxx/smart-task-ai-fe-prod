"use client";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { listProjects, Project } from "@/services/api";

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

  const [activeItem, setActiveItem] = useState("home");
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await listProjects();
        // API returns { success, message, data: { items, pagination }, error }
        const items = response.data?.data?.items ?? [];
        const projects: Project[] = Array.isArray(items) ? items : [];
        
        const mappedWorkspaces: Workspace[] = projects.map((project, index) => ({
          id: project.id,
          name: project.name,
          color: WORKSPACE_COLORS[index % WORKSPACE_COLORS.length],
          items: [
            {
              id: `overview-${project.id}`,
              icon: LayoutDashboard,
              label: "Overview",
              to: "/app/home",
            },
            {
              id: `board-${project.id}`,
              icon: FolderKanban,
              label: "Board",
              to: "/app/board",
            },
            {
              id: `chat-${project.id}`,
              icon: MessageCircle,
              label: "Chat AI",
              to: `/app/chat/${project.id}`,
            },
          ],
        }));
        
        setWorkspaces(mappedWorkspaces);
        if (mappedWorkspaces.length > 0) {
          setExpandedWorkspace(mappedWorkspaces[0].id);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeItem === item.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </button>
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
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-4 h-4 text-gray-500" />
              </Button>
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              ) : workspaces.length === 0 ? (
                <p className="text-sm text-gray-500 px-3 py-2">No projects yet</p>
              ) : (
                workspaces.map((workspace) => (
                  <div key={workspace.id}>
                    {/* Workspace Header */}
                    <button
                      onClick={() =>
                        setExpandedWorkspace(
                          expandedWorkspace === workspace.id ? null : workspace.id
                        )
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          expandedWorkspace === workspace.id ? "rotate-90" : ""
                        }`}
                      />
                      <div
                        className={`w-2 h-2 rounded-full ${workspace.color}`}
                      ></div>
                      <span className="flex-1 text-left truncate">
                        {workspace.name}
                      </span>
                    </button>

                    {/* Workspace Items */}
                    {expandedWorkspace === workspace.id && (
                      <div className="ml-6 space-y-1 mt-1">
                        {workspace.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.id}
                              href={item.to ?? "#"}
                              onClick={() => setActiveItem(item.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                activeItem === item.id
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.label}</span>
                            </Link>
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
    </>
  );
};

export default Sidebar;
