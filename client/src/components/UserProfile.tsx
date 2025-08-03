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
    <div className="flex items-center gap-2 w-full">
      {user.user_metadata?.profileImageUrl ? (
        <img 
          src={user.user_metadata.profileImageUrl} 
          alt={displayName}
          className={`${avatarSize} rounded-full object-cover`}
        />
      ) : (
        <div className={`${avatarSize} bg-blue-600 rounded-full flex items-center justify-center`}>
          <User className="w-4 h-4 text-white" />
        </div>
      )}
      
      {showDetails && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {displayName}
          </p>
          {user.email && (
            <p className="text-xs text-gray-400 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          )}
          <Badge variant="secondary" className="text-xs mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            Member since {new Date(user.created_at).toLocaleDateString()}
          </Badge>
        </div>
      )}
    </div>
  );
}