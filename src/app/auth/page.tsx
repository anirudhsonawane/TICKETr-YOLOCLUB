'use client';

import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

export default function AuthPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {isLoginMode ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <SignupForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  );
}
