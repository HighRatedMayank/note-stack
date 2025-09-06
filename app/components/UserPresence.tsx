"use client";

import { useEffect, useState } from "react";
import { Users, Wifi, WifiOff } from "lucide-react";

type User = {
  name: string;
  color: string;
  clientId: number;
};

type Props = {
  users: User[];
  connectionStatus: string;
  isConnected: boolean;
};

export default function UserPresence({ users, connectionStatus, isConnected }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 dark:text-green-400';
      case 'connecting':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'disconnected':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi size={16} className="text-green-600 dark:text-green-400" />;
      case 'connecting':
        return <Wifi size={16} className="text-yellow-600 dark:text-yellow-400 animate-pulse" />;
      case 'disconnected':
        return <WifiOff size={16} className="text-red-600 dark:text-red-400" />;
      default:
        return <WifiOff size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Connection Status */}
      <div className="mb-2 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
        {getStatusIcon(connectionStatus)}
        <span className={`text-sm font-medium ${getStatusColor(connectionStatus)}`}>
          {connectionStatus === 'connected' ? 'Connected' : 
           connectionStatus === 'connecting' ? 'Connecting...' : 
           connectionStatus === 'disconnected' ? 'Disconnected' : 'Unknown'}
        </span>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Users size={16} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {users.length} user{users.length !== 1 ? 's' : ''} online
          </span>
          <div className={`ml-auto transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 8L2 4h8L6 8z" />
            </svg>
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700">
            {users.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No other users online
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.clientId}
                  className="px-3 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {user.name}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
