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
  const { user, isLoading, supabase } = useAuth();

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
  const displayName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.email?.split('@')[0] || 'User';

  return (
    <div className="relative bg-gradient-to-br from-amber-50 to-amber-100 backdrop-blur-md border-amber-200/40 rounded-2xl overflow-hidden">
      <div className="relative p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Profile Image with Glass Effect */}
          <div className="relative">
            {user.profileImageUrl ? (
              <img 
                src={user.profileImageUrl} 
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/70 shadow-2xl backdrop-blur-sm"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-[#1f4aa6] via-[#45c73e] to-[#faed39] rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white/70 shadow-2xl backdrop-blur-sm">
                <span className="drop-shadow-lg">{displayName.charAt(0).toUpperCase()}</span>
              </div>
            )}
            
            {/* Enhanced Online Status */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#45c73e] rounded-full border-3 border-white shadow-lg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          
          {/* Enhanced User Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <h3 className="text-4xl font-black text-gray-950 tracking-tight" style={{ fontFamily: "'League Spartan', sans-serif" }}>
                {displayName}
              </h3>
              <Badge className="text-sm bg-[#45c73e] text-white border-0 shadow-md">
                <div className="w-2 h-2 bg-white/80 rounded-full mr-1 animate-pulse" />
                Online
              </Badge>
            </div>
            
            {user.email && (
              <div className="flex items-center justify-center gap-3 text-gray-900 bg-amber-100/70 backdrop-blur-sm rounded-full px-4 py-2 border border-amber-300/40">
                <div className="p-1 bg-[#1f4aa6]/20 rounded-full">
                  <Mail className="w-4 h-4 text-[#1f4aa6]" />
                </div>
                <span className="text-base font-medium" style={{ fontFamily: "'Quicksand', sans-serif" }}>
                  {user.email}
                </span>
              </div>
            )}
            
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm bg-amber-100/70 backdrop-blur-sm border-amber-300/40 text-gray-900 shadow-sm">
                <div className="p-0.5 bg-[#faed39]/20 rounded-full mr-2">
                  <Calendar className="w-3 h-3 text-[#faed39]" />
                </div>
                Member since {new Date(user.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 w-full mt-6">
            <div className="text-center p-3 bg-amber-100/70 backdrop-blur-sm rounded-xl border border-amber-300/40 shadow-sm">
              <div className="text-2xl font-bold text-[#1f4aa6]">0</div>
              <div className="text-sm text-gray-900">Meals</div>
            </div>
            <div className="text-center p-3 bg-amber-100/70 backdrop-blur-sm rounded-xl border border-amber-300/40 shadow-sm">
              <div className="text-2xl font-bold text-[#45c73e]">0</div>
              <div className="text-sm text-gray-900">Recipes</div>
            </div>
            <div className="text-center p-3 bg-amber-100/70 backdrop-blur-sm rounded-xl border border-amber-300/40 shadow-sm">
              <div className="text-2xl font-bold text-[#faed39]">0</div>
              <div className="text-sm text-gray-900">Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}