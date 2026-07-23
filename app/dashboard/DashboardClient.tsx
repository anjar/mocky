'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createProjectAction } from './actions';

interface Endpoint {
  id: string;
  method: string;
  path: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  api_prefix: string;
  created_at: string;
  endpoints?: Endpoint[];
}

interface DashboardClientProps {
  initialProjects: Project[];
  userEmail: string;
}

export default function DashboardClient({ initialProjects, userEmail }: DashboardClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  // Filter projects by search query
  const filteredProjects = projects.filter((project) => {
    const term = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(term) ||
      (project.description || '').toLowerCase().includes(term) ||
      project.api_prefix.toLowerCase().includes(term)
    );
  });

  // Calculate stats
  const totalMocks = projects.reduce((acc, p) => acc + (p.endpoints?.length || 0), 0);
  const totalRequestsFormatted = projects.length > 0 ? "1.2M" : "0";
  const avgLatencyFormatted = projects.length > 0 ? "4ms" : "0ms";

  // Handle project creation
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('name', projectName);
      formData.append('description', projectDesc);

      const result = await createProjectAction(formData);

      if (result.success) {
        // Reset and close
        setProjectName('');
        setProjectDesc('');
        setIsModalOpen(false);

        // Let page reload to fetch updated DB state from server
        window.location.reload();
      } else {
        setErrorMessage(result.error || 'Failed to create project');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to determine the best material-symbols icon for a project based on its name
  const getProjectIcon = (name: string): string => {
    const lowercaseName = name.toLowerCase();

    // E-Commerce
    if (lowercaseName.includes('shop') || lowercaseName.includes('commerce') || lowercaseName.includes('store') || lowercaseName.includes('cart')) {
      return 'shopping_cart';
    }

    // Fintech
    if (lowercaseName.includes('fintech') || lowercaseName.includes('bank') || lowercaseName.includes('ledger') || lowercaseName.includes('core') || lowercaseName.includes('pay')) {
      return 'account_balance';
    }

    // Analytics / Metrics
    if (lowercaseName.includes('metric') || lowercaseName.includes('stat') || lowercaseName.includes('analytics') || lowercaseName.includes('dashboard')) {
      return 'analytics';
    }

    // AI / ML / Brain
    if (lowercaseName.includes('ml') || lowercaseName.includes('ai') || lowercaseName.includes('predict') || lowercaseName.includes('psychology') || lowercaseName.includes('brain') || lowercaseName.includes('inference')) {
      return 'psychology';
    }

    return 'folder_open';
  };

  // Helper to determine background colors for icons to give variety and match the spec theme
  const getProjectIconBg = (name: string, index: number) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('shop') || lowercaseName.includes('commerce') || lowercaseName.includes('store') || lowercaseName.includes('cart')) {
      return 'bg-blue-100 text-blue-700 dark:bg-[#003d9b]/40 dark:text-[#dae2ff]';
    }
    if (lowercaseName.includes('fintech') || lowercaseName.includes('bank') || lowercaseName.includes('ledger') || lowercaseName.includes('core') || lowercaseName.includes('pay')) {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200';
    }
    if (lowercaseName.includes('metric') || lowercaseName.includes('stat') || lowercaseName.includes('analytics') || lowercaseName.includes('dashboard')) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-200';
    }
    if (lowercaseName.includes('ml') || lowercaseName.includes('ai') || lowercaseName.includes('predict') || lowercaseName.includes('psychology') || lowercaseName.includes('brain') || lowercaseName.includes('inference')) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200';
    }

    const colors = [
      'bg-blue-100 text-blue-700 dark:bg-[#003d9b]/40 dark:text-[#dae2ff]',
      'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200',
      'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200'
    ];
    return colors[index % colors.length];
  };

  // Helper to get dynamic status
  const getProjectStatus = (project: Project, index: number) => {
    const numEndpoints = project.endpoints?.length || 0;
    if (numEndpoints > 0) {
      if (index % 4 === 2) {
        return { label: 'Staging', dotColor: 'bg-yellow-500', textColor: 'text-yellow-600 dark:text-yellow-400' };
      }
      return { label: 'Live', dotColor: 'bg-green-500', textColor: 'text-green-600 dark:text-green-400', pulse: true };
    }
    return { label: 'Offline', dotColor: 'bg-red-500 dark:bg-[#ffb4ab]', textColor: 'text-red-500 dark:text-[#ffb4ab]' };
  };

  // Helper for static mockup team avatars exactly as specified in the design HTML files
  const getProjectTeamAvatars = (name: string, index: number) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('shop') || lowercaseName.includes('commerce') || lowercaseName.includes('store') || lowercaseName.includes('cart')) {
      return (
        <div className="flex -space-x-2">
          <img className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] object-cover" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzgRjCIYfAGIo1xhhFS2XbYQB_KGwPxI08CtpMkgzSWbGhpbB0gqpe_yBbJmPeyrdoxPy2APwO73gfi3yhHMa9V42SjBw1FxQpRpHTsBYmMi9IzgRkBdfZo55kS8bvEDzhT4-YdVUD2isRK7P52SFjylhQBspRbCoJDaCjwX5luaiZcYQNnLnsCfZ-UccHFmF8uLWe2khIv3yAUr67KQYpT4QQaJFHSrcVRuE2vxxbs0jJo6LaAmmKPILQWv6OJt_WkZoM2Xco9PPC" />
          <img className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] object-cover" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoG4CzrAPI4r30IcRpYdIW3RSInrhn3-xusqzovYcZzAP9mT4_udLDXyeAa3cO1jtNJuHi7TRvg3tRou9Hvk4lBIfjkZWoRfRMQtoBqnCpTQK7espedvEImPUYnQpcPxud7kP0yMOmoa7kTk05oB4R_2iKpZ7tDHCorzDSdYSJioboYnnrdrLD8TGbdT2P9NAn27cZqXJqwaK5il2GEMcC_OBcW7BvCbCg_vgSB3O4bYJGYuUMDOxLe4aMGPmvZnp7SbyZG7uQ2LxP" />
          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 select-none">+3</div>
        </div>
      );
    }
    if (lowercaseName.includes('fintech') || lowercaseName.includes('bank') || lowercaseName.includes('ledger') || lowercaseName.includes('core') || lowercaseName.includes('pay')) {
      return (
        <div className="flex -space-x-2">
          <img className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] object-cover" alt="Team member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArFF2aiJaIUgY0G7thF-4n4QxZnrCM0Q6uyWIlYtP8uhu3b6dvAgqvU6ic9Owf6S2j1rofSrFiIh5uOqVQtA53xpPUvRVqcEzY2EfbS8PYdY_6teteEjI0mMauh0Hr7XDDrMS7_8DbptNlyHqE4CmToLddaGUqL7IsX-N76tMT7B-pepKMkxq2umUPwMEW70UndMU4hbrE5FlPjl9FWbXAb8_yh3ChJWyUcdrT-nmxYQWP9xjnkH30DtkdTvZPhuByr3ox0C30o4J3" />
        </div>
      );
    }
    if (lowercaseName.includes('metric') || lowercaseName.includes('stat') || lowercaseName.includes('analytics') || lowercaseName.includes('dashboard')) {
      return (
        <div className="flex -space-x-2 select-none">
          <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">JD</div>
        </div>
      );
    }
    if (lowercaseName.includes('ml') || lowercaseName.includes('ai') || lowercaseName.includes('predict') || lowercaseName.includes('psychology') || lowercaseName.includes('brain') || lowercaseName.includes('inference')) {
      return (
        <div className="flex -space-x-2">
          <img className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] object-cover" alt="ML Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAhRRCzNpiBFDmtL5OPq4VPUM8IeOT5RrFLbUFd6rJOFueos6B8YRujot_xeECOua5jc0_c2qqHjX67gwH88e-Nkz4JI51_FVwOAORKgt0bDVe1r5avyXFrLB_60DTqbZdPUGWFnGsOt3Jcpg4uwJEKPf02IGkpIVF_3xTyuBSvbxVyXT81jRpzlQALYEjzwlVSx6fNt4jSDaaRdC9Uc6yLgumUBsidYQ73gfCt9ppbU_4lO9twhMkMHh3ZDsaIUTPKdBDeuiI2E5v" />
        </div>
      );
    }

    // Generic fallback letters based on index
    const names = ['JD', 'AC', 'SK', 'TL'];
    return (
      <div className="flex -space-x-2 select-none">
        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#0c1324] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
          {names[index % names.length]}
        </div>
      </div>
    );
  };

  // Helper for dynamic dynamic update labels
  const getProjectTimeLabel = (index: number) => {
    const times = ['2m ago', '1h ago', 'Yesterday', '3h ago', '2d ago'];
    return times[index % times.length];
  };

  return (
    <div className="dashboard-surface flex flex-col w-full h-full pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#e2e2e6]">
            Project Workspace
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#c3c6d6] mt-1.5">
            Manage your API mocks and orchestration environments.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-150 dark:bg-[#23293e] rounded-lg p-1 border border-transparent dark:border-[#434654]/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2e3449] text-[#0052cc] dark:text-[#b2c5ff] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-[#c3c6d6] dark:hover:text-[#e2e2e6]'
              }`}
              title="Grid view"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#2e3449] text-[#0052cc] dark:text-[#b2c5ff] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:text-[#c3c6d6] dark:hover:text-[#e2e2e6]'
              }`}
              title="List view"
            >
              <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
              List
            </button>
          </div>
        </div>
      </div>

      {/* Grid or List layout */}
      {filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const status = getProjectStatus(project, index);
              const numEndpoints = project.endpoints?.length || 0;
              const iconName = getProjectIcon(project.name);
              const iconBg = getProjectIconBg(project.name, index);

              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-[#070d1f] border border-gray-200 dark:border-[#434654]/40 rounded-xl p-6 flex flex-col hover:border-[#0052cc] dark:hover:border-[#0052cc] transition-colors duration-200 shadow-sm group relative"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center transition-colors duration-200`}>
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {iconName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${status.dotColor} ${status.pulse ? 'animate-pulse' : ''}`}></span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-[#c3c6d6]">{status.label}</span>

                      <button className="ml-3 text-gray-400 hover:text-gray-600 dark:text-[#c3c6d6] dark:hover:text-[#0052cc] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6] transition-colors mb-1 truncate">
                    {project.name}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-[#c3c6d6] line-clamp-2 min-h-[2rem] mb-4">
                    {project.description || 'Define a custom mock workspace for orchestrating endpoints.'}
                  </p>

                  <div className="bg-blue-50/50 dark:bg-[#0052cc]/10 text-[#0052cc] dark:text-[#b2c5ff] font-mono text-xs px-3.5 py-2 rounded-lg border border-blue-100/50 dark:border-[#0052cc]/20 mb-6 truncate" title={`Prefix: ${project.api_prefix}`}>
                    mocky.api/v2/{project.api_prefix}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#434654]/30 flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      {getProjectTeamAvatars(project.name, index)}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-[#c3c6d6] italic">
                        {getProjectTimeLabel(index)}
                      </span>
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-xs font-bold text-[#0052cc] dark:text-[#b2c5ff] hover:underline flex items-center gap-0.5"
                      >
                        Manage
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty Slot "Start New Project" button card */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="border-2 border-dashed border-gray-200 dark:border-[#434654]/40 rounded-xl flex flex-col items-center justify-center p-6 bg-transparent hover:bg-gray-50/50 dark:hover:bg-[#151b2d]/50 hover:border-[#0052cc] dark:hover:border-[#0052cc] transition-colors duration-200 group min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:bg-[#0052cc] group-hover:text-white transition-colors duration-200 mb-3">
                <span className="material-symbols-outlined text-[28px]">add_circle</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-[#e2e2e6]">Start New Project</span>
              <span className="text-xs text-gray-400 dark:text-[#c3c6d6] mt-1">Define a new API workspace</span>
            </button>
          </div>
        ) : (
          /* List Layout */
          <div className="border border-gray-200 dark:border-[#434654]/30 rounded-xl overflow-hidden bg-white dark:bg-[#070d1f] shadow-sm flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#434654]/40 bg-gray-50 dark:bg-[#151b2d]/30 text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider">
                    <th className="py-4 px-6">Workspace Name</th>
                    <th className="py-4 px-6">API Base URL</th>
                    <th className="py-4 px-6">Endpoints</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#434654]/20 text-sm">
                  {filteredProjects.map((project, index) => {
                    const status = getProjectStatus(project, index);
                    const numEndpoints = project.endpoints?.length || 0;
                    return (
                      <tr key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-[#191f33]/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${getProjectIconBg(project.name, index)} flex items-center justify-center`}>
                              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                {getProjectIcon(project.name)}
                              </span>
                            </div>
                            <div>
                              <Link href={`/dashboard/projects/${project.id}`} className="font-bold text-gray-900 dark:text-[#e2e2e6] hover:text-[#0052cc] transition-colors">
                                {project.name}
                              </Link>
                              <div className="text-xs text-gray-400 dark:text-[#c3c6d6] line-clamp-1 max-w-[200px] mt-0.5">
                                {project.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <code className="bg-blue-50 text-[#0052cc] dark:bg-[#0052cc]/10 dark:text-[#b2c5ff] font-mono text-xs px-2.5 py-1 rounded border border-blue-100/50 dark:border-[#0052cc]/20">
                            mocky.api/v2/{project.api_prefix}
                          </code>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-600 dark:text-[#e2e2e6]">
                          {numEndpoints} mocks
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 w-max">
                            <span className={`w-2 h-2 rounded-full ${status.dotColor} ${status.pulse ? 'animate-pulse' : ''}`}></span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-[#c3c6d6]">{status.label}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="text-xs font-bold text-[#0052cc] dark:text-[#b2c5ff] hover:underline bg-gray-50 hover:bg-blue-50 dark:bg-[#191f33] dark:hover:bg-[#23293e] px-3.5 py-2 rounded-lg border border-gray-150 dark:border-[#434654]/45 transition-colors"
                          >
                            Manage Endpoints &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick footer add slot */}
            <div className="p-4 bg-gray-50 dark:bg-[#151b2d]/10 border-t border-gray-150 dark:border-[#434654]/35 flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-xs font-bold text-[#0052cc] dark:text-[#b2c5ff] hover:text-[#0040a2] flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Create New Project Workspace
              </button>
            </div>
          </div>
        )
      ) : (
        /* Empty State */
        <div className="border border-gray-200 dark:border-[#434654]/30 rounded-xl p-12 bg-white dark:bg-[#0c1324] text-center flex flex-col items-center justify-center min-h-[350px] shadow-sm">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
            <span className="material-symbols-outlined text-[36px]">folder_open</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e2e2e6] mb-2">No projects found</h3>
          <p className="text-sm text-gray-500 dark:text-[#c3c6d6] max-w-sm mb-6">
            {searchQuery
              ? `No projects match "${searchQuery}". Try updating your search or clear it.`
              : "It looks like you haven't created any API mocking projects yet. Start by creating your first workspace to organize your endpoints."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-[#0052cc] dark:text-[#b2c5ff] border border-[#0052cc]/20 hover:bg-blue-50 px-4 py-2 rounded-lg"
            >
              Clear Search Query
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0052cc] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#0040a2] shadow transition-colors duration-200 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Create Your First Project
            </button>
          )}
        </div>
      )}

      {/* Stats overlay section at the bottom, mimicking the high-fidelity mockups */}
      <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#151b2d] p-6 rounded-xl border border-gray-150 dark:border-[#434654]/25 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider">Total Requests</p>
          <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{totalRequestsFormatted}</h4>
          <div className="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>+12% from last week</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151b2d] p-6 rounded-xl border border-gray-150 dark:border-[#434654]/25 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider">Active Mocks</p>
          <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{totalMocks}</h4>
          <div className="mt-2 flex items-center gap-1.5 text-gray-400 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span>
            <span className="text-gray-500 dark:text-[#c3c6d6]">All systems operational</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151b2d] p-6 rounded-xl border border-gray-150 dark:border-[#434654]/25 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider">Avg. Latency</p>
          <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{avgLatencyFormatted}</h4>
          <div className="mt-2 flex items-center gap-1 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-blue-500">speed</span>
            <span className="text-gray-500 dark:text-[#c3c6d6]">Optimized edge routing</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#151b2d] p-6 rounded-xl border border-gray-150 dark:border-[#434654]/25 shadow-sm">
          <p className="text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider">Team Seats</p>
          <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1.5">{projects.length > 0 ? "8 / 10" : "1 / 10"}</h4>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
            <span className="material-symbols-outlined text-[16px] text-purple-500">group</span>
            <span className="text-gray-500 dark:text-[#c3c6d6]">{projects.length > 0 ? "2 invites pending" : "Professional Plan"}</span>
          </div>
        </div>
      </section>

      {/* Create New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/75 flex items-center justify-center p-4 z-[100] animate-in duration-200 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0c1324] border border-gray-200 dark:border-[#434654] rounded-xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-[#c3c6d6] dark:hover:text-[#0052cc] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0052cc]">add_box</span>
              Create New Project Workspace
            </h3>

            {errorMessage && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider" htmlFor="name">
                  Project Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Premium API"
                  required
                  disabled={isSubmitting}
                  className="rounded-lg px-3.5 py-2.5 bg-white dark:bg-[#151b2d] border border-gray-200 dark:border-[#434654]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-[#c3c6d6] uppercase tracking-wider" htmlFor="description">
                  Description (optional)
                </label>
                <input
                  type="text"
                  id="description"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Microservices mocking layer"
                  disabled={isSubmitting}
                  className="rounded-lg px-3.5 py-2.5 bg-white dark:bg-[#151b2d] border border-gray-200 dark:border-[#434654]/70 text-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 dark:border-[#434654]/30 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-200 dark:border-[#434654]/75 text-gray-600 dark:text-[#c3c6d6] rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0052cc] hover:bg-[#0040a2] text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">done</span>
                      Create Project
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
