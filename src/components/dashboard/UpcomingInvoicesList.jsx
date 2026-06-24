import Link from 'next/link';

export default function UpcomingInvoicesList({ clients }) {
  // Find clients with upcoming billing dates in the next 7 days
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const upcomingClients = clients
    .filter(client => client.billingProfile?.autoInvoiceEnabled)
    .map(client => {
      const billingDay = client.billingProfile.billingDate;
      let daysUntil = billingDay - currentDay;
      
      // If billing day already passed this month, it's next month
      if (daysUntil < 0) {
        daysUntil += daysInMonth;
      }
      
      return { ...client, daysUntil };
    })
    .filter(client => client.daysUntil >= 0 && client.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  if (!upcomingClients || upcomingClients.length === 0) {
    return (
      <div className="bg-card rounded-[16px] p-8 flex items-center justify-center text-muted text-sm font-medium">
        No automated invoices due in the next 7 days.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-[16px] overflow-hidden">
      <ul className="divide-y divide-background">
        {upcomingClients.map((client) => {
          const isToday = client.daysUntil === 0;
          const isSoon = client.daysUntil <= 2;

          return (
            <li key={client._id} className="p-5 hover:bg-card-hover transition-colors">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">{client.company}</p>
                  <p className="text-xs text-muted font-medium mt-1">₹{client.billingProfile.retainerAmount?.toLocaleString('en-IN')} • Bills on day {client.billingProfile.billingDate}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-extrabold ${isToday ? 'text-foreground' : isSoon ? 'text-foreground' : 'text-muted'}`}>
                    {isToday ? 'TODAY' : `${client.daysUntil}D`}
                  </span>
                  <Link 
                    href={`/dashboard/clients/${client._id}`}
                    className="px-3 py-1.5 bg-background hover:bg-[#222] text-foreground text-[10px] font-bold rounded-lg transition-colors uppercase tracking-widest"
                  >
                    View
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
