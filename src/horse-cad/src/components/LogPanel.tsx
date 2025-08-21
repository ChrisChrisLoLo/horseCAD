import React, { useState, useRef, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';

export interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source?: string;
}

interface LogPanelProps {
  logs?: LogEntry[];
  onClear?: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs = [], onClear }) => {
  const [internalLogs, setInternalLogs] = useState<LogEntry[]>([
    {
      id: 1,
      timestamp: new Date(),
      level: 'info',
      message: 'HorseCAD initialized successfully',
      source: 'System'
    },
    {
      id: 2,
      timestamp: new Date(),
      level: 'info',
      message: 'Monaco Editor loaded with Rhai language support',
      source: 'Editor'
    },
    {
      id: 3,
      timestamp: new Date(),
      level: 'info',
      message: 'Three.js canvas initialized',
      source: 'Renderer'
    }
  ]);
  
  const [filter, setFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'debug'>('all');
  const logContainerRef = useRef<HTMLDivElement>(null);
  const listenerSetupRef = useRef(false);

  // Listen for Tauri log events
  useEffect(() => {
    // Prevent multiple listener setups
    // This check ensures we only set up the listener once
    // This is particlarly useful in strict mode where components may mount/unmount multiple times
    if (listenerSetupRef.current) {
      return;
    }
    listenerSetupRef.current = true;

    let unlisten: (() => void) | undefined;

    const setupLogListener = async () => {
      try {
        unlisten = await listen<{
          timestamp: string;
          level: string;
          message: string;
          source?: string;
        }>('log_entry', (event) => {
          console.log('Received log from Tauri:', event.payload);
          
          const newLog: LogEntry = {
            id: Date.now() + Math.random(), // Ensure unique ID
            timestamp: new Date(event.payload.timestamp),
            level: event.payload.level as LogEntry['level'],
            message: event.payload.message,
            source: event.payload.source
          };

          setInternalLogs(prev => [...prev, newLog]);
        });

        // Add initial frontend log
        setInternalLogs(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date(),
          level: 'info',
          message: 'Connected to Tauri backend, listening for compilation logs',
          source: 'Frontend'
        }]);
      } catch (error) {
        console.error('Failed to setup Tauri log listener:', error);
        setInternalLogs(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date(),
          level: 'error',
          message: `Failed to connect to Tauri backend: ${error}`,
          source: 'Frontend'
        }]);
      }
    };

    setupLogListener();

    // Cleanup function to remove event listener
    return () => {
      // DON'T reset the ref here - let it stay true to prevent re-setup in Strict Mode
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  // Use provided logs or internal logs
  const displayLogs = logs.length > 0 ? logs : internalLogs;

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayLogs]);

  const filteredLogs = displayLogs.filter(log => 
    filter === 'all' || log.level === filter
  );

  const getLogLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-yellow-300';
      case 'info':
        return 'text-cyan-300';
      case 'debug':
        return 'text-gray-300';
      default:
        return 'text-gray-200';
    }
  };

  const getLogLevelBg = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'bg-red-900/20';
      case 'warning':
        return 'bg-yellow-900/20';
      case 'info':
        return 'bg-blue-900/20';
      case 'debug':
        return 'bg-gray-900/20';
      default:
        return 'bg-gray-800/20';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      setInternalLogs([]);
    }
  };

  return (
    <div className="h-full w-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-3">
        <span className="text-sm text-gray-300 font-medium">Console</span>
        
        {/* Filter buttons */}
        <div className="ml-4 flex items-center space-x-1">
          {(['all', 'info', 'warning', 'error', 'debug'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                filter === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
              {level !== 'all' && (
                <span className="ml-1 text-xs opacity-75">
                  ({displayLogs.filter(log => log.level === level).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="ml-auto flex items-center space-x-2">
          <button
            onClick={handleClear}
            className="px-2 py-0.5 text-xs bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Log content */}
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 text-sm font-mono"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start space-x-2 p-2 rounded ${getLogLevelBg(log.level)} hover:bg-gray-700/30 transition-colors`}
            >
              {/* Timestamp */}
              <span className="text-gray-500 text-xs whitespace-nowrap">
                {formatTime(log.timestamp)}
              </span>
              
              {/* Level badge */}
              <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded whitespace-nowrap ${
                log.level === 'error' ? 'text-red-200 bg-red-900/40' :
                log.level === 'warning' ? 'text-yellow-200 bg-yellow-900/40' :
                log.level === 'info' ? 'text-cyan-200 bg-cyan-900/40' :
                log.level === 'debug' ? 'text-gray-200 bg-gray-700/40' :
                'text-gray-200 bg-gray-700/40'
              }`}>
                {log.level}
              </span>
              
              {/* Source */}
              {log.source && (
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  [{log.source}]
                </span>
              )}
              
              {/* Message */}
              <span className={`flex-1 ${getLogLevelColor(log.level)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LogPanel;
