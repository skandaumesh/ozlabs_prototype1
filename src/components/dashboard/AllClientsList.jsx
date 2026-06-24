import Link from 'next/link';

export default function AllClientsList({ clients, projects }) {
  // Group projects by client
  const projectsByClient = projects.reduce((acc, project) => {
    const clientId = project.clientId._id.toString();
    if (!acc[clientId]) acc[clientId] = [];
    acc[clientId].push(project);
    return acc;
  }, {});

  if (!clients || clients.length === 0) {
    return (
      <div className="bg-card rounded-[16px] p-8 flex items-center justify-center text-muted text-sm font-medium">
        No clients or projects yet. Start by creating a client.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clients.map((client) => {
        const clientProjects = projectsByClient[client._id.toString()] || [];
        const activeProjects = clientProjects.filter(p => p.status === 'active');

        return (
          <div key={client._id} className="bg-card rounded-[16px] p-6 hover:bg-card-hover transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">{client.company}</h3>
                <p className="text-xs text-muted font-medium mt-1">{client.name} • {client.email}</p>
              </div>
              <Link 
                href={`/dashboard/clients/${client._id}`}
                className="px-4 py-2 bg-background hover:bg-[#222] text-foreground text-[10px] font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Profile
              </Link>
            </div>

            {clientProjects.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">Active Projects ({activeProjects.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeProjects.map(project => (
                    <Link 
                      href={`/dashboard/projects/${project._id}`} 
                      key={project._id}
                      className="flex items-center justify-between p-4 rounded-xl bg-background hover:bg-[#222] transition-colors group"
                    >
                      <div className="truncate pr-4">
                        <p className="text-sm font-bold truncate group-hover:text-white transition-colors">{project.name}</p>
                        <p className="text-[10px] text-muted font-medium capitalize mt-1">{project.type.replace('_', ' ')}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-md text-[9px] font-bold bg-foreground text-background uppercase tracking-widest">
                          Active
                        </span>
                      </div>
                    </Link>
                  ))}
                  {activeProjects.length === 0 && (
                    <div className="text-[10px] text-muted font-medium p-2">No active projects.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-[10px] text-muted font-medium mt-4">No projects yet.</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
