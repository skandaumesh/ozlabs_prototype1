'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/dashboard/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to load projects', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const formatType = (type) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="space-y-8 animate-fade pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Projects</h1>
        </div>
        <Link 
          href="/dashboard/projects/new"
          className="btn-primary"
        >
          New Project
        </Link>
      </div>

      <div className="glass overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-[rgba(255,255,255,0.55)] font-semibold">
            No projects found. Click the button above to create one.
          </div>
        ) : (
          <ul className="flex flex-col">
            {projects.map((project, index) => (
              <li key={project._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors group`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col">
                    <p className="font-semibold text-white text-[15px]">{project.name}</p>
                    <p className="text-[13px] text-[rgba(255,255,255,0.55)] font-medium mt-1">
                      {project.clientId?.name || 'Unknown Client'} • {formatType(project.type)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col text-right">
                      <p className="label-section text-[11px]">Due Date</p>
                      <p className="text-[13px] text-[rgba(255,255,255,0.55)] font-medium">
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '-'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span className={`badge ${project.status === 'active' ? 'badge-blue' : 'badge-green'}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                      
                      <Link 
                        href={`/dashboard/projects/${project._id}`}
                        className="btn-secondary py-2 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
