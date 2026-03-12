import { AnimatePresence } from 'framer-motion';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/todo';
import { Sparkles } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onTaskDetail: (todo: Todo) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onTaskDetail }) => {
  if (todos.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-icon-wrapper">
          <Sparkles size={40} strokeWidth={1.5} />
        </div>
        <h3 className="empty-title">Clear Space, Clear Mind</h3>
        <p className="empty-subtitle">Your task list is a blank canvas. What will you achieve today?</p>
      </div>
    );
  }

  // Separate completed and uncompleted tasks
  const active = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);

  return (
    <div className="todo-list">
      <AnimatePresence mode="popLayout">
        {active.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onTaskDetail={onTaskDetail} />
        ))}
      </AnimatePresence>

      {completed.length > 0 && (
        <>
          <div className="section-title" style={{ marginTop: '1.5rem' }}>
            <h3>Completed</h3>
          </div>
          <AnimatePresence mode="popLayout">
            {completed.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onTaskDetail={onTaskDetail} />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};
