import { useState, useEffect } from 'react';

export function useComments(reviewToken) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = async () => {
    if (!reviewToken) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/review/${reviewToken}/comments`);
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [reviewToken]);

  return { comments, isLoading, error, refetch: fetchComments };
}
