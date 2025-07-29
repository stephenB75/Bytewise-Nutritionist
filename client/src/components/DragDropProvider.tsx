import { createContext, useContext, useState, ReactNode } from 'react';

interface DragDropContextType {
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  draggedItem: any;
  setDraggedItem: (item: any) => void;
  dragOverItem: any;
  setDragOverItem: (item: any) => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragOverItem, setDragOverItem] = useState<any>(null);

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        setIsDragging,
        draggedItem,
        setDraggedItem,
        dragOverItem,
        setDragOverItem,
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