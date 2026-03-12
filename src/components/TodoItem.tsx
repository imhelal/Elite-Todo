import { motion } from 'framer-motion';
import { Check, Trash2, Sparkles, Zap, Flame, Eye, Cloud } from 'lucide-react';
import { Todo, Priority } from '../types/todo';
import { useTodos } from '../context/TodoContext';

interface TodoItemProps {
  todo: Todo;
  onTaskDetail: (todo: Todo) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onTaskDetail }) => {
  const { toggleTodo, deleteTodo } = useTodos();

  const priorityIcons: Record<Priority, React.ReactNode> = {
    low: <Sparkles size={22} color="#10b981" />,
    medium: <Zap size={22} color="#f97316" />,
    high: <Flame size={22} color="#ef4444" />
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <div className={`todo-item-card-wrapper ${todo.completed ? 'completed' : ''} ${todo.isSyncing ? 'syncing' : ''}`}>
        <div className="todo-item-card">
          <motion.div 
            className={`todo-icon ${todo.priority}`}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {priorityIcons[todo.priority]}
          </motion.div>
          
          <div className="todo-details">
            <span className="todo-label">{todo.text}</span>
            <div className="todo-meta">
              <span className={`todo-sub ${todo.priority}`}>{todo.priority.toUpperCase()}</span>
              {todo.isSyncing && (
                <motion.div 
                  className="sync-tag"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Cloud size={10} />
                  <span>SYNCING</span>
                </motion.div>
              )}
            </div>
          </div>

          <div className="todo-actions">
            {todo.description && (
              <button 
                className="info-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskDetail(todo);
                }}
                aria-label="View description"
              >
                <Eye size={18} strokeWidth={2.5} />
              </button>
            )}

            <button 
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
              }}
              aria-label="Delete task"
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
            
            <button 
              className="todo-check" 
              onClick={() => toggleTodo(todo.id)}
              aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
            >
              {todo.completed && <Check size={20} strokeWidth={4} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
