import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DragDropContextType {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  draggedItem: any;
  setDraggedItem: (item: any) => void;
  dragOverItem: any;
  setDragOverItem: (item: any) => void;
  startDrag: (item: any, element?: any) => void;
  endDrag: () => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverItem, setDragOverItem] = useState<any>(null);

  const startDrag = (item: any, element?: any) => {
    setIsDragging(true);
    setDraggedItem(item);
  };

  const endDrag = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        setIsDragging,
        draggedItem,
        setDraggedItem,
        dragOverItem,
        setDragOverItem,
        startDrag,
        endDrag,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (context === undefined) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}