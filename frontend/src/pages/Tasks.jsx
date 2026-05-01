import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { taskAPI } from '../services/api';
import { format } from 'date-fns';
import Loader from '../components/Loader';

const STATUS_CONFIG = {
  'todo': { label: 'To Do', color: 'var(--text-secondary)', bg: 'rgba(144,144,184,0.1)' },
  'in-progress': { label: 'In Progress', color: 'var(--yellow)', bg: 'rgba(240,180,41,0.1)' },
  'done': { label: 'Done', color: 'var(--green)', bg: 'rgba(46,202,139,0.1)' },
};

const PRIORITY_CONFIG = {
  'low': { label: 'Low', color: 'var(--blue)' },
  'medium': { label: 'Medium', color: 'var(--yellow)' },
  'high': { label: 'High', color: 'var(--red)' },
};

// ── Modal ──────────────────────────────────────────────────────────────
const TaskModal = ({ task, onClose, onSave }) => {
  const isEdit = !!task?._id;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
  });
  const [saving, setSaving] = useState(false);

  const field = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined };
      if (isEdit) await taskAPI.update(task._id, payload);
      else await taskAPI.create(payload);
      toast.success(isEdit ? 'Task updated' : 'Task created');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setSaving(false); }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: '14px',
    outline: 'none', transition: 'var(--transition)',
  };

  const labelStyle = { fontSize: '12px', fontWeight: '500', color: 'var(--text-secondary)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '6px', display: 'block' };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '24px', backdropFilter: 'blur(4px)',
        animation: 'fadeOverlay 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '480px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          animation: 'slideModal 0.25s ease',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700' }}>
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={e => field('title', e.target.value)}
              placeholder="What needs to be done?"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={form.description} onChange={e => field('description', e.target.value)}
              placeholder="Add more context..."
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.status} onChange={e => field('status', e.target.value)}>
                {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.priority} onChange={e => field('priority', e.target.value)}>
                {Object.entries(PRIORITY_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Due Date</label>
            <input type="date" style={{ ...inputStyle, colorScheme: 'dark' }}
              value={form.dueDate} onChange={e => field('dueDate', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px', background: 'transparent',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '14px', cursor: 'pointer',
            }}>Cancel</button>
            <button type="submit" disabled={saving} style={{
              flex: 2, padding: '11px',
              background: saving ? 'rgba(112,96,255,0.5)' : 'var(--accent)',
              border: 'none', borderRadius: 'var(--radius-sm)',
              color: 'white', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '14px',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {saving ? <><Loader size={16} inline /> Saving...</> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes fadeOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideModal { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

// ── Task Card ────────────────────────────────────────────────────────────
const TaskCard = ({ task, onEdit, onDelete }) => {
  const status = STATUS_CONFIG[task.status];
  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.isOverdue;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 20px',
      display: 'flex',
      gap: '16px',
      alignItems: 'flex-start',
      transition: 'var(--transition)',
      animation: 'fadeUp 0.3s ease both',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(112,96,255,0.3)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateX(0)'; }}
    >
      {/* Priority dot */}
      <div style={{
        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '5px',
        background: priority.color, boxShadow: `0 0 6px ${priority.color}`,
      }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
          <h3 style={{
            fontSize: '15px', fontWeight: '500', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            lineHeight: '1.4',
          }}>{task.title}</h3>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={() => onEdit(task)} title="Edit" style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '12px', transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >Edit</button>
            <button onClick={() => onDelete(task._id)} title="Delete" style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '5px 10px', cursor: 'pointer',
              color: 'var(--text-secondary)', fontSize: '12px', transition: 'var(--transition)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >Delete</button>
          </div>
        </div>

        {task.description && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px', lineHeight: '1.5' }}>
            {task.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
            background: status.bg, color: status.color,
          }}>{status.label}</span>

          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px',
            background: `${priority.color}15`, color: priority.color,
          }}>{priority.label}</span>

          {task.dueDate && (
            <span style={{
              fontSize: '11px', color: isOverdue ? 'var(--red)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {isOverdue ? '⚠ ' : '📅 '}{format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Tasks Page ──────────────────────────────────────────────────────
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1 });

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await taskAPI.getAll(params);
      setTasks(res.data.data);
      setMeta(res.data.meta || {});
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch { toast.error('Delete failed'); }
  };

  const handleEdit = (task) => { setEditTask(task); setShowModal(true); };
  const handleCreate = () => { setEditTask(null); setShowModal(true); };
  const handleModalClose = () => { setShowModal(false); setEditTask(null); };
  const handleModalSave = () => { handleModalClose(); fetchTasks(); };
  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const chipStyle = (active) => ({
    padding: '6px 14px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: 'none',
    background: active ? 'var(--accent)' : 'var(--bg-card)',
    color: active ? 'white' : 'var(--text-secondary)',
    transition: 'var(--transition)',
  });

  return (
    <div style={{ padding: '40px', maxWidth: '900px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', animation: 'fadeUp 0.3s ease both' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '700' }}>My Tasks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            {meta.total ?? 0} tasks total
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px', background: 'var(--accent)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            color: 'white', fontFamily: 'var(--font-display)', fontWeight: '600', fontSize: '14px',
            cursor: 'pointer', transition: 'var(--transition)', letterSpacing: '0.3px',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeUp 0.35s ease both' }}>
        <input
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          placeholder="Search tasks..."
          style={{
            padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)', fontSize: '14px', outline: 'none', width: '100%',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button style={chipStyle(!filters.status)} onClick={() => setFilter('status', '')}>All</button>
          {Object.entries(STATUS_CONFIG).map(([v, c]) => (
            <button key={v} style={chipStyle(filters.status === v)} onClick={() => setFilter('status', v)}>{c.label}</button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 4px' }} />
          {Object.entries(PRIORITY_CONFIG).map(([v, c]) => (
            <button key={v} style={{
              ...chipStyle(filters.priority === v),
              ...(filters.priority === v ? {} : { color: c.color }),
            }} onClick={() => setFilter('priority', filters.priority === v ? '' : v)}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeUp 0.4s ease both' }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '90px' }} />)
        ) : tasks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.4 }}>✦</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '500' }}>No tasks found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {filters.status || filters.search ? 'Try clearing your filters' : 'Create your first task to get started'}
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard key={task._id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setFilters(f => ({ ...f, page: p }))}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', border: '1px solid',
                borderColor: filters.page === p ? 'var(--accent)' : 'var(--border)',
                background: filters.page === p ? 'var(--accent)' : 'var(--bg-card)',
                color: filters.page === p ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                transition: 'var(--transition)',
              }}
            >{p}</button>
          ))}
        </div>
      )}

      {showModal && <TaskModal task={editTask} onClose={handleModalClose} onSave={handleModalSave} />}

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .skeleton { background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
