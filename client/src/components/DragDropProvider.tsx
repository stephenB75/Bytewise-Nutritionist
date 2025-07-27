import { createContext, useContext, useState, useRef } from 'react';
import { Food } from '@shared/schema';

interface DragDropContextValue {
  draggedItem: Food | null;
  isDragging: boolean;
  startDrag: (item: Food, element: HTMLElement) => void;
  endDrag: () => void;
  onDrop: (item: Food) => void;
  setOnDrop: (callback: (item: Food) => void) => void;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [draggedItem, setDraggedItem] = useState<Food | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const onDropRef = useRef<(item: Food) => void>(() => {});

  const startDrag = (item: Food, element: HTMLElement) => {
    setDraggedItem(item);
    setIsDragging(true);
    
    // Add visual feedback
    element.style.opacity = '0.5';
    element.style.transform = 'scale(1.05)';
  };

  const endDrag = () => {
    if (draggedItem && onDropRef.current) {
      onDropRef.current(draggedItem);
    }
    
    setDraggedItem(null);
    setIsDragging(false);
    
    // Reset visual feedback
    document.querySelectorAll('.dragging').forEach((el) => {
      const element = el as HTMLElement;
      element.style.opacity = '';
      element.style.transform = '';
      element.classList.remove('dragging');
    });
  };

  const onDrop = (item: Food) => {
    if (onDropRef.current) {
      onDropRef.current(item);
    }
  };

  const setOnDrop = (callback: (item: Food) => void) => {
    onDropRef.current = callback;
  };

  return (
    <DragDropContext.Provider value={{
      draggedItem,
      isDragging,
      startDrag,
      endDrag,
      onDrop,
      setOnDrop
    }}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}
