import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';

interface RegisterProps {
  onCreateAccount: (name: string, email: string) => void;
  onBackToLanding: () => void;
  loading: boolean;
  message: string | null;
  error: string | null;
}

export const Register: React.FC<RegisterProps> = ({
  onCreateAccount,
  onBackToLanding,
  loading,
  message,
  error
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onCreateAccount(name.trim(), email.trim());
    }
  };

  const UserIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const MailIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back button at top left */}
      <div className="p-6">
        <button
          onClick={onBackToLanding}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          ← 
        </button>
      </div>

      {/* Center form */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-900">Create your HSA account</h1>
            <p className="text-sm text-gray-600 mt-1">It takes less than a minute</p>
          </div>

          {/* Messages */}
          {message && (
            <div className="mb-6 p-4 bg-success-50 border border-green-200 rounded-lg animate-fade-in">
              <p className="text-sm text-green-600 font-medium">{message}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-sm text-error-500 font-medium">{error}</p>
            </div>
          )}

          {/* Form card */}
          <Card className="p-6 shadow-lg border rounded-2xl bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                icon={UserIcon}
                className="w-full"
                style={{ height: 56, fontSize: 16 }}
              />

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                icon={MailIcon}
                className="w-full"
                style={{ height: 56, fontSize: 16 }}
              />

              {/* Blue button like landing */}
              <Button
                type="submit"
                loading={loading}
                className="w-full btn-animate"
                style={{
                  background: 'var(--blue-600)',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '1rem 1.1rem',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                Create Account
              </Button>
            </form>
          </Card>

          {/* Footnote */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
