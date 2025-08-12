/**
 * Simple Food Search Component
 * 
 * A basic search input field without dropdown or history features
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SimpleFoodSearchProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SimpleFoodSearch({
  onSearchChange,
  placeholder = "Search foods...",
  className = ""
}: SimpleFoodSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearchChange(value);
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 h-12 text-base bg-white/80 backdrop-blur-sm border-gray-200 focus:border-brand-yellow focus:ring-brand-yellow"
      />
    </div>
  );
}