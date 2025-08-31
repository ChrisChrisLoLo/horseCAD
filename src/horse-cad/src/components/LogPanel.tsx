import React, { useState, useRef, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/shadCnUtils";

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

  // Note: Compilation state logging is now handled by the CodeEditor component

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
    <div className="h-full w-full bg-background flex flex-col">
      {/* Header */}
      <div className="h-10 bg-card border-b border-border flex items-center px-3">
        <span className="text-sm font-medium text-foreground">Console</span>
        
        {/* Note: Compilation status is now shown in the CodeEditor header */}
        
        {/* Filter buttons */}
        <div className="ml-4 flex items-center space-x-1">
          {(['all', 'info', 'warning', 'error', 'debug'] as const).map((level) => (
            <Button
              key={level}
              variant={filter === level ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(level)}
              className="h-6 px-2 text-xs"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
              {level !== 'all' && (
                <Badge variant="secondary" className="ml-0 text-xs h-4 px-1">
                  {displayLogs.filter(log => log.level === level).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="ml-auto flex items-center space-x-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Log content */}
      <div 
        ref={logContainerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 text-xs font-mono"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-muted-foreground text-center py-4">
            No logs to display
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start space-x-2 p-2 rounded-md transition-colors hover:bg-muted/50",
                log.level === 'error' && "bg-red-900/30",
                log.level === 'warning' && "bg-yellow-900/30",
                log.level === 'info' && "bg-slate-900/30",
                log.level === 'debug' && "bg-neutral-900/30"
              )}
            >
              {/* Timestamp */}
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {formatTime(log.timestamp)}
              </span>
              
              {/* Level badge */}
              <Badge 
                variant={
                  log.level === 'error' ? 'destructive' :
                  log.level === 'warning' ? 'outline' :
                  log.level === 'info' ? 'default' :
                  'secondary'
                }
                className={cn(
                  "text-xs uppercase whitespace-nowrap",
                  log.level === 'warning' && "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                )}
              >
                {log.level}
              </Badge>
              
              {/* Source */}
              {log.source && (
                <Badge variant="outline" className="text-xs">
                  {log.source}
                </Badge>
              )}
              
              {/* Message */}
              <span className={cn(
                "flex-1",
                log.level === 'error' && "text-red-400",
                log.level === 'warning' && "text-yellow-400",
                log.level === 'info' && "text-slate-400",
                log.level === 'debug' && "text-neutral-400",
                !['error', 'warning', 'info', 'debug'].includes(log.level) && "text-foreground"
              )}>
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
