import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm, AuthFormData } from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';

export const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (formData: AuthFormData) => {
    setError('');
    setLoading(true);
    
    try {
      await signIn(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthForm 
        mode="signin" 
        onSubmit={handleSignIn} 
        loading={loading} 
        error={error} 
      />
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-purple-600 hover:text-purple-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};