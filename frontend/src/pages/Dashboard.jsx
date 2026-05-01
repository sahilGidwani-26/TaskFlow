import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { format } from 'date-fns';

const StatCard = ({ label, value, color, icon, delay }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'var(--transition)',
    animation: `fadeUp 0.5s ease ${delay}s both`,
    cursor: 'default',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: '20px', padding: '8px', background: `${color}15`, borderRadius: 'var(--radius-sm)' }}>{icon}</span>
    </div>
    <span style={{ fontSize: '36px', fontWeight: '700', fontFamily: 'var(--font-display)', color }}>
      {value ?? '—'}
    </span>
  </div>
);

const RecentTaskItem = ({ task }) => {
  const statusColors = { 'todo': 'var(--text-muted)', 'in-progress': 'var(--yellow)', 'done': 'var(--green)' };
  const priorityColors = { 'low': 'var(--blue)', 'medium': 'var(--yellow)', 'high': 'var(--red)' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
        background: statusColors[task.status],
        boxShadow: `0 0 6px ${statusColors[task.status]}`,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
        }}>
          {task.title}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          {format(new Date(task.createdAt), 'MMM d, yyyy')}
        </div>
      </div>
      <span style={{
        fontSize: '11px', fontWeight: '600', padding: '3px 8px',
        borderRadius: '20px', background: `${priorityColors[task.priority]}15`,
        color: priorityColors[task.priority], textTransform: 'capitalize',
        flexShrink: 0,
      }}>
        {task.priority}
      </span>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          taskAPI.getStats(),
          taskAPI.getAll({ limit: 5, sortBy: 'createdAt', order: 'desc' }),
        ]);
        setStats(statsRes.data.data);
        setRecentTasks(tasksRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0];

  return (
    <div style={{ padding: '40px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '36px', animation: 'fadeUp 0.4s ease both' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '30px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {greeting}, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          {format(new Date(), 'EEEE, MMMM d')} · Here's what's happening with your tasks
        </p>
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        <StatCard label="Total Tasks" value={stats?.total} color="var(--accent)" icon="✦" delay={0.1} />
        <StatCard label="To Do" value={stats?.byStatus?.todo} color="var(--text-secondary)" icon="○" delay={0.15} />
        <StatCard label="In Progress" value={stats?.byStatus?.['in-progress']} color="var(--yellow)" icon="◑" delay={0.2} />
        <StatCard label="Completed" value={stats?.byStatus?.done} color="var(--green)" icon="●" delay={0.25} />
      </div>

      {/* Priority breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
      }}>
        {/* Recent tasks */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          animation: 'fadeUp 0.5s ease 0.3s both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600' }}>Recent Tasks</h2>
            <Link to="/tasks" style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500' }}>View all →</Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '48px' }} />)}
            </div>
          ) : recentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✦</div>
              No tasks yet
            </div>
          ) : (
            recentTasks.map(task => <RecentTaskItem key={task._id} task={task} />)
          )}
        </div>

        {/* Priority breakdown */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          animation: 'fadeUp 0.5s ease 0.35s both',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Priority Breakdown</h2>
          {['high', 'medium', 'low'].map((p) => {
            const colors = { high: 'var(--red)', medium: 'var(--yellow)', low: 'var(--blue)' };
            const count = stats?.byPriority?.[p] || 0;
            const total = stats?.total || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={p} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{p} priority</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: colors[p] }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: colors[p],
                    borderRadius: '99px',
                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <Link
              to="/tasks"
              style={{
                display: 'block', textAlign: 'center',
                padding: '11px', background: 'var(--accent-dim)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--accent-light)', fontWeight: '500', fontSize: '14px',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(112,96,255,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-dim)'}
            >
              + Create New Task
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .skeleton {
          background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>
    </div>
  );
}
