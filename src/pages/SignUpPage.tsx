import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthForm, AuthFormData } from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';

export const SignUpPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (formData: AuthFormData) => {
    if (!formData.username || !formData.displayName) {
      setError('Username and display name are required');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      await signUp(formData.email, formData.password, formData.username, formData.displayName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AuthForm 
        mode="signup" 
        onSubmit={handleSignUp} 
        loading={loading} 
        error={error} 
      />
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};