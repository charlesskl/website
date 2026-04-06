import { useState, useEffect, useCallback, useRef } from 'react';

type Lang = 'en' | 'cn' | 'id';

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  arrangement?: string;
  description: string;
}

const i18n = {
  en: {
    allDepartments: 'All Departments',
    office: 'Office',
    production: 'Production',
    applyNow: 'Apply Now →',
    modalTitle: 'Apply for this position',
    position: 'Position',
    yourName: 'Your Name',
    namePlaceholder: 'Full name',
    sendTo: 'Send application to',
    submit: 'Submit Application →',
    close: 'Close',
    loadError: 'Unable to load job listings.',
    rriLocation: 'Kendal, Central Java',
    rrmLocation: 'Ngawi, East Java',
  },
  cn: {
    allDepartments: '所有部門',
    office: '辦公室',
    production: '生產',
    applyNow: '立即申請 →',
    modalTitle: '申請此職位',
    position: '職位',
    yourName: '您的姓名',
    namePlaceholder: '全名',
    sendTo: '發送申請至',
    submit: '提交申請 →',
    close: '關閉',
    loadError: '無法載入職位列表。',
    rriLocation: '肯德爾，中爪哇',
    rrmLocation: '恩加維，東爪哇',
  },
  id: {
    allDepartments: 'Semua Departemen',
    office: 'Kantor',
    production: 'Produksi',
    applyNow: 'Lamar Sekarang →',
    modalTitle: 'Lamar posisi ini',
    position: 'Posisi',
    yourName: 'Nama Anda',
    namePlaceholder: 'Nama lengkap',
    sendTo: 'Kirim lamaran ke',
    submit: 'Kirim Lamaran →',
    close: 'Tutup',
    loadError: 'Tidak dapat memuat daftar lowongan.',
    rriLocation: 'Kendal, Jawa Tengah',
    rrmLocation: 'Ngawi, Jawa Timur',
  },
};

interface Props {
  lang: Lang;
}

export default function CareersJobBoard({ lang }: Props) {
  const t = i18n[lang];
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState(false);
  const [modalJob, setModalJob] = useState<string | null>(null);

  useEffect(() => {
    fetch('/jobs.json')
      .then((r) => r.json())
      .then((data: Job[]) => setJobs(data))
      .catch(() => setError(true));
  }, []);

  const departments = [t.allDepartments, t.office, t.production];
  const deptMap: Record<string, string> = {
    [t.allDepartments]: 'All',
    [t.office]: 'Office',
    [t.production]: 'Production',
  };

  const filtered = filter === 'All' ? jobs : jobs.filter((j) => j.department === filter);

  return (
    <>
      {/* Filter bar */}
      <div className="filter-bar">
        {departments.map((d) => (
          <button
            key={d}
            className={`filter-btn${deptMap[d] === filter ? ' active' : ''}`}
            onClick={() => setFilter(deptMap[d])}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Job grid */}
      <div className="job-grid">
        {error && <p style={{ color: 'var(--text-muted)' }}>{t.loadError}</p>}
        {filtered.map((job) => (
          <div key={job.id} className="job-card reveal-up" data-dept={job.department}>
            <div className="job-dept">{job.department}</div>
            <h3>{job.title}</h3>
            <div className="job-meta">
              <span className="job-tag">{job.location}</span>
              <span className="job-tag">{job.type}</span>
              {job.arrangement && <span className="job-tag">{job.arrangement}</span>}
            </div>
            <p>{job.description}</p>
            <a
              href="#"
              className="job-apply"
              onClick={(e) => {
                e.preventDefault();
                setModalJob(job.title);
              }}
            >
              {t.applyNow}
            </a>
          </div>
        ))}
      </div>

      {/* Apply modal */}
      {modalJob !== null && (
        <ApplyModal
          lang={lang}
          jobTitle={modalJob}
          onClose={() => setModalJob(null)}
        />
      )}
    </>
  );
}

/* ── Apply Modal ── */
interface ModalProps {
  lang: Lang;
  jobTitle: string;
  onClose: () => void;
}

function ApplyModal({ lang, jobTitle, onClose }: ModalProps) {
  const t = i18n[lang];
  const [name, setName] = useState('');
  const [entity, setEntity] = useState('recruitment.rri@royalregentgroup.com');
  const nameRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<Element | null>(null);

  // Focus management
  useEffect(() => {
    lastFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameRef.current?.focus(), 100);

    return () => {
      document.body.style.overflow = '';
      if (lastFocusRef.current instanceof HTMLElement) {
        lastFocusRef.current.focus();
      }
    };
  }, []);

  // ESC to close + focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = () => {
    const subject = encodeURIComponent(`Application — ${jobTitle}`);
    const body = encodeURIComponent(
      `Name: ${name || '(not provided)'}\nPosition: ${jobTitle}\n\nPlease find my CV attached.`
    );
    window.location.href = `mailto:${entity}?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div
      className="apply-overlay active"
      role="dialog"
      aria-modal="true"
      aria-labelledby="applyModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="apply-modal" ref={modalRef}>
        <div className="apply-modal-header">
          <h3 id="applyModalTitle">{t.modalTitle}</h3>
          <button className="apply-modal-close" aria-label={t.close} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="apply-modal-body">
          <label>{t.position}</label>
          <div className="apply-job-title">{jobTitle}</div>
          <label>{t.yourName}</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
          />
          <label>{t.sendTo}</label>
          <div className="apply-entity-group">
            <label>
              <input
                type="radio"
                name="applyEntity"
                value="recruitment.rri@royalregentgroup.com"
                checked={entity === 'recruitment.rri@royalregentgroup.com'}
                onChange={(e) => setEntity(e.target.value)}
              />
              <span>
                <strong>PT Royal Regent Indonesia</strong>
                <br />
                <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{t.rriLocation}</small>
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="applyEntity"
                value="recruitment.rrm@royalregentid.com"
                checked={entity === 'recruitment.rrm@royalregentid.com'}
                onChange={(e) => setEntity(e.target.value)}
              />
              <span>
                <strong>PT Royal Regent Manufacturing</strong>
                <br />
                <small style={{ fontWeight: 400, color: 'var(--text-muted)' }}>{t.rrmLocation}</small>
              </span>
            </label>
          </div>
        </div>
        <div className="apply-modal-footer">
          <button onClick={handleSubmit}>{t.submit}</button>
        </div>
      </div>
    </div>
  );
}
