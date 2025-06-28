
import { useCallback, useEffect, useRef } from 'react';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<any>; // Changed from Promise<void> to Promise<any>
  interval?: number;
  debounceTime?: number;
}

export function useAutoSave<T>({ 
  data, 
  onSave, 
  interval = 30000, // Default: 30 seconds
  debounceTime = 5000 // Default: 5 seconds
}: UseAutoSaveOptions<T>) {
  const lastSavedData = useRef<T>(data);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const saveData = useCallback(async () => {
    try {
      // Only save if data has changed
      if (JSON.stringify(data) !== JSON.stringify(lastSavedData.current)) {
        await onSave(data);
        lastSavedData.current = JSON.parse(JSON.stringify(data));
        console.log('Auto-saved at', new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, onSave]);
  
  // Setup debounced save when data changes
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveData();
    }, debounceTime);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceTime, saveData]);
  
  // Setup interval save
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      saveData();
    }, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, saveData]);
  
  // Function to manually trigger a save
  const forceSave = useCallback(() => {
    saveData();
  }, [saveData]);
  
  return { forceSave };
}
