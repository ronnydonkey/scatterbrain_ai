import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import BoardOfDirectors from '@/components/board/BoardOfDirectors';

const BoardPage = () => {
  const { user } = useAuth();

  return <BoardOfDirectors userId={user?.id} />;
};

export default BoardPage;