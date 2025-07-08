import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Save, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API to update the password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update password. Please check your current password.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto pt-16">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-success-700/20 border border-success-700 text-white' 
            : 'bg-error-700/20 border border-error-700 text-white'
        }`}>
          <AlertCircle className={`h-5 w-5 ${message.type === 'success' ? 'text-success-500' : 'text-error-500'}`} />
          <span>{message.text}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 block w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center space-x-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Save className="h-5 w-5" />
              <span>Update Profile</span>
            </button>
          </form>
        </div>
        
        {/* Password Change */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Change Password</h2>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-300 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="block w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-300 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full bg-neutral-700 border border-neutral-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center justify-center space-x-2 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Save className="h-5 w-5" />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="mt-12 bg-neutral-800 rounded-lg p-6 border border-error-700">
        <h2 className="text-xl font-semibold mb-6">Danger Zone</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Log out from all devices</h3>
              <p className="text-sm text-neutral-400">This will log you out from all devices except this one.</p>
            </div>
            <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors">
              Log Out All
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Delete Account</h3>
              <p className="text-sm text-neutral-400">This will permanently delete your account and all your data.</p>
            </div>
            <button className="px-4 py-2 bg-error-600 hover:bg-error-700 text-white rounded-md transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;