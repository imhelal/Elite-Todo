import { useState, useCallback, useMemo, useEffect } from 'react';
import { TodoProvider, useTodos } from './context/TodoContext';
import { TodoList } from './components/TodoList';
import { Plus, X, Calendar, CheckCircle2, Sun, Moon, Sunrise, Sparkles, Zap, Flame } from 'lucide-react';
import { Priority, Todo } from './types/todo';
import { AnimatePresence, motion } from 'framer-motion';

function MainContent() {
  const { todos, addTodo, isLoading } = useTodos();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<Todo | null>(null);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoDescription, setNewTodoDescription] = useState('');
  const [newTodoPriority, setNewTodoPriority] = useState<Priority>('medium');

  const pendingCount = useMemo(() => todos.filter(t => !t.completed).length, [todos]);

  // --- App Icon Badging ---
  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (pendingCount > 0) {
        (navigator as any).setAppBadge(pendingCount).catch((err: any) => {
          console.error('Error setting app badge:', err);
        });
      } else {
        (navigator as any).clearAppBadge().catch((err: any) => {
          console.error('Error clearing app badge:', err);
        });
      }
    }
  }, [pendingCount]);

  const today = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(new Date());
  }, []);

  const userName = "Tafhim"; // Change this to your name!

  const { timeIcon, greetingLabel } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { timeIcon: <Sun size={22} color="#ffffff" />, greetingLabel: 'Good morning' };
    if (hour < 18) return { timeIcon: <Sunrise size={22} color="#ffffff" />, greetingLabel: 'Good afternoon' };
    return { timeIcon: <Moon size={22} color="#ffffff" />, greetingLabel: 'Good evening' };
  }, []);

  const handleAddTodo = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    addTodo(newTodoText, newTodoPriority, newTodoDescription);
    setNewTodoText('');
    setNewTodoDescription('');
    setNewTodoPriority('medium');
    setIsAddOpen(false);
  }, [newTodoText, newTodoPriority, newTodoDescription, addTodo]);

  const priorityIcons: Record<Priority, React.ReactNode> = {
    low: <Sparkles size={24} color="#10b981" />,
    medium: <Zap size={24} color="#f97316" />,
    high: <Flame size={24} color="#ef4444" />
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-noise"></div>
        <div className="header-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        <div className="header-decor">
          <CheckCircle2 size={120} strokeWidth={1} />
        </div>

        <div className="greeting-card">
          <div className="header-top">
            <div className="time-badge">
              {timeIcon}
              <span>{today}</span>
            </div>
            <div className="cloud-status" title="Synced with Cloud">
              <div className="status-dot"></div>
            </div>
          </div>
          
          <h2 className="greeting-text">
            <div>{greetingLabel},</div>
            <div style={{ opacity: 0.9 }}>{userName}.</div>
          </h2>
          
          <div className="header-stats">
            <div className="stat-item">
              <Calendar size={14} />
              <span>{pendingCount} Pending</span>
            </div>
            <div className="stat-item">
              <CheckCircle2 size={14} />
              <span>{todos.length - pendingCount} Done</span>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="section-header">
          <h3>Your Tasks</h3>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            {todos.length} Total
          </span>
        </div>
        {isLoading ? (
          <div className="skeleton-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="shimmer-wrapper"></div>
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-text"></div>
                  <div className="skeleton-sub"></div>
                </div>
                <div className="skeleton-action"></div>
                <div className="skeleton-action"></div>
              </div>
            ))}
          </div>
        ) : (
          <TodoList todos={todos} onTaskDetail={setSelectedTaskDetail} />
        )}
      </main>

      <motion.button
        className="fab"
        onClick={() => setIsAddOpen(true)}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Plus size={24} strokeWidth={3} />
      </motion.button>

      <AnimatePresence>
        {isAddOpen && (
          <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
            <motion.div
              className="add-modal"
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="modal-header">
                <h2>New Task</h2>
                <button className="close-btn" onClick={() => setIsAddOpen(false)}>
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleAddTodo} className="form-group">
                <input
                  className="input-pill"
                  placeholder="What's on your mind?"
                  value={newTodoText}
                  onChange={e => setNewTodoText(e.target.value)}
                />

                <textarea
                  className="input-pill description-input"
                  placeholder="Add a description (optional)..."
                  value={newTodoDescription}
                  onChange={e => setNewTodoDescription(e.target.value)}
                  rows={2}
                />

                <div className="priority-toggle-group">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`priority-btn ${newTodoPriority === p ? `active ${p}` : ''}`}
                      onClick={() => setNewTodoPriority(p)}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>

                <button type="submit" className="submit-btn" style={newTodoText ? { background: '#f97316' } : {}}>
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {selectedTaskDetail && (
          <div className="detail-overlay" onClick={() => setSelectedTaskDetail(null)}>
            <motion.div
              className="detail-sheet"
              onClick={e => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="detail-handle"></div>
              
              <div className="detail-header">
                <div className="detail-section" style={{ marginBottom: '1rem' }}>
                  <span className="detail-label">Priority Level</span>
                  <div className={`priority-badge-large ${selectedTaskDetail.priority}`} style={{ 
                    background: selectedTaskDetail.priority === 'low' ? 'rgba(34, 197, 94, 0.1)' : 
                               selectedTaskDetail.priority === 'medium' ? 'rgba(249, 115, 22, 0.1)' : 
                               'rgba(239, 68, 68, 0.1)',
                    color: selectedTaskDetail.priority === 'low' ? '#16a34a' : 
                           selectedTaskDetail.priority === 'medium' ? '#f97316' : 
                           '#dc2626'
                  }}>
                    {priorityIcons[selectedTaskDetail.priority]}
                    {selectedTaskDetail.priority.toUpperCase()}
                  </div>
                </div>
                <h3 className="detail-title">{selectedTaskDetail.text}</h3>
              </div>

              {selectedTaskDetail.description && (
                <div className="detail-section">
                  <span className="detail-label">Task Notes</span>
                  <div className="detail-content">
                    {selectedTaskDetail.description}
                  </div>
                </div>
              )}

              <button 
                className="submit-btn" 
                onClick={() => setSelectedTaskDetail(null)}
                style={{ 
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.2)',
                  marginTop: '1rem'
                }}
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <TodoProvider>
      <MainContent />
    </TodoProvider>
  );
}

export default App;
