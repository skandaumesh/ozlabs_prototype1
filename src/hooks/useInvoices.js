import { useState, useEffect } from 'react';

export function useInvoices(clientId = null) {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const url = clientId ? `/api/invoices?clientId=${clientId}` : '/api/invoices';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [clientId]);

  return { invoices, isLoading, error, refetch: fetchInvoices };
}
