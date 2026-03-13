import React, { createContext, useContext, useState, useEffect } from 'react';
import { Todo, Priority } from '../types/todo';
import { supabase } from '../lib/supabase';

interface TodoContextType {
  todos: Todo[];
  addTodo: (text: string, priority: Priority, description?: string, dueDate?: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  lastDeletedTodo: Todo | null;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  isLoading: boolean;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDeletedTodo, setLastDeletedTodo] = useState<Todo | null>(null);

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
      } else {
        setTodos(data as Todo[]);
      }
      setIsLoading(false);
    };

    fetchTodos();

    // --- Real-time Subscription ---
    const subscription = supabase
      .channel('public:todos')
      .on('postgres_changes', { event: '*', table: 'todos', schema: 'public' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newTodo = payload.new as Todo;
          setTodos((prev) => {
            if (prev.some((t) => t.id === newTodo.id)) return prev;
            return [newTodo, ...prev];
          });
        } else if (payload.eventType === 'UPDATE') {
          setTodos((prev) => prev.map((t) => (t.id === payload.new.id ? { ...t, ...(payload.new as Todo) } : t)));
        } else if (payload.eventType === 'DELETE') {
          setTodos((prev) => prev.filter((t) => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const addTodo = async (text: string, priority: Priority, description?: string, dueDate?: string) => {
    const id = crypto.randomUUID();
    const createdAt = Date.now();
    
    const newTodo: Todo = {
      id,
      text,
      description,
      completed: false,
      priority,
      dueDate,
      createdAt,
      isSyncing: true
    };

    // Optimistic Update
    setTodos(prev => [newTodo, ...prev]);

    // Omit isSyncing for Supabase
    const { isSyncing: _, ...dbData } = newTodo;
    const { error } = await supabase.from('todos').insert([dbData]);
    
    if (error) {
      console.error('Error adding todo:', error);
      // Rollback
      setTodos(prev => prev.filter(t => t.id !== newTodo.id));
    } else {
      setTodos(prev => prev.map(t => t.id === newTodo.id ? { ...t, isSyncing: false } : t));
    }
  };

  const toggleTodo = async (id: string) => {
    const originalTodos = [...todos];
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic Update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, isSyncing: true } : t));

    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', id);

    if (error) {
      console.error('Error toggling todo:', error);
      setTodos(originalTodos); // Rollback
    } else {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isSyncing: false } : t));
    }
  };

  const deleteTodo = async (id: string) => {
    const todoToDelete = todos.find(t => t.id === id);
    if (!todoToDelete) return;

    setLastDeletedTodo(todoToDelete);
    const originalTodos = [...todos];
    
    // Optimistic Update
    setTodos(prev => prev.filter(t => t.id !== id));

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
      setTodos(originalTodos); // Rollback
    }
  };

  const undoDelete = async () => {
    if (!lastDeletedTodo) return;

    const todoToRestore = { ...lastDeletedTodo, isSyncing: true };
    setTodos(prev => [todoToRestore, ...prev].sort((a, b) => b.createdAt - a.createdAt));
    
    const { isSyncing: _, ...dbData } = lastDeletedTodo;
    const { error } = await supabase.from('todos').insert([dbData]);

    if (error) {
      console.error('Error undoing delete:', error);
      setTodos(prev => prev.filter(t => t.id !== lastDeletedTodo.id));
    } else {
      setTodos(prev => prev.map(t => t.id === lastDeletedTodo.id ? { ...t, isSyncing: false } : t));
      setLastDeletedTodo(null);
    }
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    const originalTodos = [...todos];

    // Optimistic Update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates, isSyncing: true } : t));

    // Remove UI-only fields from updates
    const { isSyncing: _, ...dbUpdates } = updates as any;

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
      setTodos(originalTodos); // Rollback
    } else {
      setTodos(prev => prev.map(t => t.id === id ? { ...t, isSyncing: false } : t));
    }
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, toggleTodo, deleteTodo, undoDelete, lastDeletedTodo, updateTodo, isLoading }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodos must be used within a TodoProvider');
  return context;
};
