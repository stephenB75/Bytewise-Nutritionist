/**
 * User Profile Component
 * 
 * Displays user information and authentication status
 * Used in header and profile sections
 */

import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar } from 'lucide-react';

interface UserProfileProps {
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function UserProfile({ showDetails = false, size = 'md' }: UserProfileProps) {
  const { user, loading: isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        {showDetails && (
          <div className="space-y-1">
            <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-2 bg-gray-200 rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <User className="w-5 h-5" />
        {showDetails && <span className="text-sm">Not signed in</span>}
      </div>
    );
  }

  const avatarSize = size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12';
  const displayName = user.user_metadata?.firstName || user.user_metadata?.lastName 
    ? `${user.user_metadata?.firstName || ''} ${user.user_metadata?.lastName || ''}`.trim()
    : user.email?.split('@')[0] || 'User';

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Profile Image */}
        <div className="relative">
          {user.user_metadata?.profileImageUrl ? (
            <img 
              src={user.user_metadata.profileImageUrl} 
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white/20">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          
          {/* Online status */}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
        
        {/* User Details */}
        <div className="space-y-2 w-full">
          <h2 className="text-2xl font-bold text-white">
            {displayName}
          </h2>
          
          {user.email && (
            <p className="text-gray-400 flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
          )}
          
          <div className="flex justify-center">
            <Badge variant="secondary" className="text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              Member since {new Date(user.created_at).toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}