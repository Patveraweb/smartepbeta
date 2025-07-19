import { useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ChatInterface from '@/components/ChatInterface';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingSpinner onComplete={handleLoadingComplete} />;
  }

  return <ChatInterface />;
};

export default Index;
