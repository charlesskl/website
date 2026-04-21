import { useState, useCallback, useRef, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  arrangement?: string;
  description: string;
}

const PASS_HASH = '597c28c381ef1feee61f3e9677a628b4cbd41cfb2539c8938062e1df2a882d39';
const JOBS_VERSION = '2';

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [editing, setEditing] = useState<number | null>(null); // null=list, -1=new, 0+=edit index
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ msg: string; isError: boolean } | null>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDept, setFormDept] = useState('Office');
  const [formLocation, setFormLocation] = useState('Indonesia, Kendal');
  const [formType, setFormType] = useState('Full-Time');
  const [formArrangement, setFormArrangement] = useState('On-site');
  const [formDesc, setFormDesc] = useState('');

  const showStatus = useCallback((msg: string, isError = false) => {
    setStatus({ msg, isError });
    if (statusTimer.current) clearTimeout(statusTimer.current);
    statusTimer.current = setTimeout(() => setStatus(null), 3000);
  }, []);

  const saveLocal = useCallback((data: Job[]) => {
    try {
      localStorage.setItem('jobs_data', JSON.stringify(data));
      localStorage.setItem('jobs_dirty', '1');
    } catch {}
  }, []);

  const loadJobs = useCallback(() => {
    try {
      const isDirty = !!localStorage.getItem('jobs_dirty');
      const cachedVersion = localStorage.getItem('jobs_version');
      if (isDirty && cachedVersion === JOBS_VERSION) {
        const cached = localStorage.getItem('jobs_data');
        if (cached) {
          setJobs(JSON.parse(cached));
          setDirty(true);
          return;
        }
      }
    } catch {}

    fetch('/jobs.json')
      .then((r) => r.json())
      .then((data: Job[]) => {
        setJobs(data);
        try {
          localStorage.setItem('jobs_data', JSON.stringify(data));
          localStorage.setItem('jobs_version', JOBS_VERSION);
          localStorage.removeItem('jobs_dirty');
        } catch {}
      })
      .catch(() => {
        try {
          const cached = localStorage.getItem('jobs_data');
          if (cached) {
            setJobs(JSON.parse(cached));
            return;
          }
        } catch {}
        showStatus('Unable to load job listings.', true);
      });
  }, [showStatus]);

  const tryUnlock = useCallback(async () => {
    const hash = await sha256(password);
    if (hash === PASS_HASH) {
      setAuthed(true);
      setPassword('');
      setPwdError(false);
      loadJobs();
    } else {
      setPwdError(true);
    }
  }, [password, loadJobs]);

  const openForm = useCallback(
    (index: number) => {
      setEditing(index);
      if (index >= 0 && jobs[index]) {
        const j = jobs[index];
        setFormTitle(j.title);
        setFormDept(j.department);
        setFormLocation(j.location);
        setFormType(j.type);
        setFormArrangement(j.arrangement || '');
        setFormDesc(j.description);
      } else {
        setFormTitle('');
        setFormDept('Office');
        setFormLocation('Indonesia, Kendal');
        setFormType('Full-Time');
        setFormArrangement('On-site');
        setFormDesc('');
      }
    },
    [jobs]
  );

  const saveJob = useCallback(() => {
    const title = formTitle.trim();
    if (!title) {
      showStatus('Title is required.', true);
      return;
    }

    const job: Job = {
      id:
        editing !== null && editing >= 0
          ? jobs[editing].id
          : title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+$/, ''),
      title,
      department: formDept,
      location: formLocation,
      type: formType,
      arrangement: formArrangement || undefined,
      description: formDesc.trim(),
    };

    const updated = [...jobs];
    if (editing !== null && editing >= 0) {
      updated[editing] = job;
    } else {
      updated.push(job);
    }

    setJobs(updated);
    setDirty(true);
    saveLocal(updated);
    setEditing(null);
    showStatus('Job saved locally. Export JSON to deploy.');
  }, [editing, jobs, formTitle, formDept, formLocation, formType, formArrangement, formDesc, saveLocal, showStatus]);

  const deleteJob = useCallback(
    (index: number) => {
      if (!confirm(`Delete "${jobs[index].title}"?`)) return;
      const updated = jobs.filter((_, i) => i !== index);
      setJobs(updated);
      setDirty(true);
      saveLocal(updated);
    },
    [jobs, saveLocal]
  );

  const resetToServer = useCallback(() => {
    if (!confirm('Discard all local changes and reload jobs from the server?')) return;
    try {
      localStorage.removeItem('jobs_data');
      localStorage.removeItem('jobs_dirty');
    } catch {}
    setDirty(false);
    loadJobs();
    showStatus('Reset to server data');
  }, [loadJobs, showStatus]);

  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(jobs, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'jobs.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }, [jobs]);

  // Password gate
  if (!authed) {
    return (
      <div className="admin-container" style={{ padding: '60px 28px', textAlign: 'center' }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: '22px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          Admin Access
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Enter password to continue</p>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPwdError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') tryUnlock();
          }}
          placeholder="Password"
          style={{
            padding: '10px 16px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '15px',
            width: '240px',
            marginRight: '8px',
          }}
        />
        <button className="btn-sm primary" onClick={tryUnlock}>
          Unlock
        </button>
        {pwdError && (
          <p style={{ color: '#c0392b', fontSize: '13px', marginTop: '8px' }}>Incorrect password.</p>
        )}
      </div>
    );
  }

  // Admin panel
  return (
    <div className="admin-container">
      <div id="main-content">
        <div className="admin-header">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: '22px', fontWeight: 600, margin: 0 }}>
            {editing === null ? 'Manage Jobs' : editing === -1 ? 'Add New Job' : 'Edit Job'}
          </h2>
          <div className="admin-header-actions">
            {dirty && editing === null && (
              <button
                className="btn-sm ghost"
                onClick={resetToServer}
                style={{ fontSize: '11px' }}
                title="Discard all local changes and reload from jobs.json"
              >
                Reset
              </button>
            )}
            {editing === null && (
              <button className="btn-sm export" onClick={exportJSON}>
                Export JSON
              </button>
            )}
          </div>
        </div>
        <div className="admin-body">
          {status && (
            <div
              className="save-status"
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '12px',
                fontSize: '13px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: status.isError ? '#fdecea' : '#e8f5e9',
                color: status.isError ? '#c0392b' : '#2e7d32',
              }}
            >
              {status.msg}
            </div>
          )}

          {editing === null ? (
            /* Job list view */
            <div>
              <div
                style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                </span>
                <button className="btn-sm primary" onClick={() => openForm(-1)}>
                  + Add Job
                </button>
              </div>
              <ul className="admin-job-list">
                {jobs.map((job, i) => (
                  <li key={job.id} className="admin-job-item">
                    <div className="admin-job-info">
                      <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 2px' }}>{job.title}</h4>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {job.department} &middot; {job.location}
                      </span>
                    </div>
                    <div className="admin-job-actions">
                      <button className="edit-btn" onClick={() => openForm(i)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => deleteJob(i)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            /* Job form view */
            <div className="admin-form active">
              <label>Job Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Mold Design Engineer"
              />
              <div className="form-row">
                <div>
                  <label>Department</label>
                  <select value={formDept} onChange={(e) => setFormDept(e.target.value)}>
                    <option value="Office">Office</option>
                    <option value="Production">Production</option>
                  </select>
                </div>
                <div>
                  <label>Location</label>
                  <select value={formLocation} onChange={(e) => setFormLocation(e.target.value)}>
                    <option value="Indonesia, Kendal">Indonesia, Kendal</option>
                    <option value="Indonesia, Ngawi">Indonesia, Ngawi</option>
                    <option value="Dongguan, China">Dongguan, China</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label>Type</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value)}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label>Arrangement</label>
                  <select value={formArrangement} onChange={(e) => setFormArrangement(e.target.value)}>
                    <option value="On-site">On-site</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="">Not specified</option>
                  </select>
                </div>
              </div>
              <label>Description</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Job description..."
              />
            </div>
          )}
        </div>

        {editing !== null && (
          <div className="admin-footer" style={{ display: 'flex', padding: '16px 28px', borderTop: '1px solid var(--border)', gap: '8px', justifyContent: 'flex-end' }}>
            <button className="btn-sm ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn-sm primary" onClick={saveJob}>
              Save Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
