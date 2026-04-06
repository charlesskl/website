import { useState, useRef, useCallback, useEffect } from 'react';

type Lang = 'en' | 'cn' | 'id';

const i18n = {
  en: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    company: 'Company',
    subject: 'Subject',
    message: 'Message',
    send: 'Send Message →',
    sent: 'Sent Successfully',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
    subjects: [
      'OEM Manufacturing Inquiry',
      'Sample Request',
      'Plastic',
      'Plush',
      'Dolls',
      'RC',
      'Costumes',
      'Licensed / Branded Products',
      'Careers',
      'Other',
    ],
  },
  cn: {
    firstName: '名字',
    lastName: '姓氏',
    email: '電子郵件地址',
    company: '公司',
    subject: '主題',
    message: '留言',
    send: '發送訊息 →',
    sent: '發送成功',
    required: '此欄位為必填',
    invalidEmail: '請輸入有效的電子郵件地址',
    subjects: [
      'OEM製造諮詢',
      '樣品需求',
      '塑膠玩具',
      '毛絨玩具',
      '娃娃',
      '遙控車',
      '服裝',
      '授權 / 品牌產品',
      '招聘',
      '其他',
    ],
  },
  id: {
    firstName: 'Nama Depan',
    lastName: 'Nama Belakang',
    email: 'Alamat Email',
    company: 'Perusahaan',
    subject: 'Subjek',
    message: 'Pesan',
    send: 'Kirim Pesan →',
    sent: 'Berhasil Terkirim',
    required: 'Kolom ini wajib diisi',
    invalidEmail: 'Harap masukkan alamat email yang valid',
    subjects: [
      'Pertanyaan Manufaktur OEM',
      'Permintaan Sampel',
      'Plastik',
      'Plush',
      'Boneka',
      'RC',
      'Kostum',
      'Produk Berlisensi / Bermerek',
      'Karier',
      'Lainnya',
    ],
  },
};

interface FieldState {
  value: string;
  error: string;
  touched: boolean;
}

interface Props {
  lang: Lang;
}

export default function ContactForm({ lang }: Props) {
  const t = i18n[lang];
  const formRef = useRef<HTMLFormElement>(null);

  const [fields, setFields] = useState<Record<string, FieldState>>({
    firstName: { value: '', error: '', touched: false },
    lastName: { value: '', error: '', touched: false },
    email: { value: '', error: '', touched: false },
    company: { value: '', error: '', touched: false },
    subject: { value: '', error: '', touched: false },
    message: { value: '', error: '', touched: false },
  });
  const [isSent, setIsSent] = useState(false);

  const totalFields = 6;
  const filledCount = Object.values(fields).filter((f) => f.value.trim()).length;
  const progress = (filledCount / totalFields) * 100;

  const updateField = useCallback((name: string, value: string) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], value, error: '', touched: true },
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!fields.firstName.value.trim()) errors.firstName = t.required;
    if (!fields.lastName.value.trim()) errors.lastName = t.required;
    if (!fields.email.value.trim()) {
      errors.email = t.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.value)) {
      errors.email = t.invalidEmail;
    }
    if (!fields.message.value.trim()) errors.message = t.required;

    if (Object.keys(errors).length > 0) {
      setFields((prev) => {
        const next = { ...prev };
        for (const [key, msg] of Object.entries(errors)) {
          next[key] = { ...next[key], error: msg, touched: true };
        }
        return next;
      });

      // Shake the submit button via GSAP if available
      const btn = formRef.current?.querySelector('.submit-btn');
      if (btn && typeof (window as any).gsap !== 'undefined') {
        const gsap = (window as any).gsap;
        gsap.to(btn, {
          x: -8, duration: 0.08, repeat: 5, yoyo: true, ease: 'power2.inOut',
          onComplete: () => gsap.set(btn, { x: 0 }),
        });
      }
      return false;
    }
    return true;
  }, [fields, t]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      const name = `${fields.firstName.value} ${fields.lastName.value}`.trim();
      const subject = encodeURIComponent(
        `[Website] ${fields.subject.value || 'Enquiry'} — ${name}`
      );
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${fields.email.value}` +
          (fields.company.value ? `\nCompany: ${fields.company.value}` : '') +
          `\nSubject: ${fields.subject.value || 'N/A'}` +
          `\n\n${fields.message.value}`
      );
      window.location.href = `mailto:info@royalregenthk.com?subject=${subject}&body=${body}`;

      setIsSent(true);
      setTimeout(() => {
        setIsSent(false);
        setFields({
          firstName: { value: '', error: '', touched: false },
          lastName: { value: '', error: '', touched: false },
          email: { value: '', error: '', touched: false },
          company: { value: '', error: '', touched: false },
          subject: { value: '', error: '', touched: false },
          message: { value: '', error: '', touched: false },
        });
      }, 3000);
    },
    [fields, validate]
  );

  return (
    <div className="contact-form-card">
      <div className="form-progress">
        <div className="form-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        {/* Honeypot */}
        <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

        <div className="form-row">
          <FloatField
            id="firstName"
            type="text"
            label={t.firstName}
            value={fields.firstName.value}
            error={fields.firstName.error}
            required
            autoComplete="given-name"
            onChange={(v) => updateField('firstName', v)}
          />
          <FloatField
            id="lastName"
            type="text"
            label={t.lastName}
            value={fields.lastName.value}
            error={fields.lastName.error}
            required
            autoComplete="family-name"
            onChange={(v) => updateField('lastName', v)}
          />
        </div>

        <FloatField
          id="email"
          type="email"
          label={t.email}
          value={fields.email.value}
          error={fields.email.error}
          required
          autoComplete="email"
          onChange={(v) => updateField('email', v)}
        />

        <FloatField
          id="company"
          type="text"
          label={t.company}
          value={fields.company.value}
          error={fields.company.error}
          autoComplete="organization"
          onChange={(v) => updateField('company', v)}
        />

        <div className="float-group">
          <select
            id="subject"
            value={fields.subject.value}
            className={fields.subject.value ? 'has-value' : ''}
            onChange={(e) => updateField('subject', e.target.value)}
          >
            <option value="" disabled />
            {t.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label htmlFor="subject">{t.subject}</label>
        </div>

        <FloatField
          id="message"
          type="textarea"
          label={t.message}
          value={fields.message.value}
          error={fields.message.error}
          required
          onChange={(v) => updateField('message', v)}
        />

        <button
          type="submit"
          className={`submit-btn magnetic${isSent ? ' sent' : ''}`}
          data-strength="0.15"
        >
          <span className="btn-text">{t.send}</span>
          <span className="btn-success">
            <span className="check-circle">
              <svg viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            {t.sent}
          </span>
        </button>
      </form>
    </div>
  );
}

/* ── Reusable floating-label field ── */
interface FloatFieldProps {
  id: string;
  type: 'text' | 'email' | 'textarea';
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  onChange: (value: string) => void;
}

function FloatField({ id, type, label, value, error, required, autoComplete, onChange }: FloatFieldProps) {
  const hasValue = value.length > 0;
  const errorId = `${id}Error`;

  const sharedProps = {
    id,
    value,
    required,
    autoComplete,
    className: hasValue ? 'has-value' : '',
    'aria-invalid': error ? ('true' as const) : undefined,
    'aria-describedby': error ? errorId : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };

  return (
    <div className="float-group">
      {type === 'textarea' ? (
        <textarea {...sharedProps} />
      ) : (
        <input type={type} {...sharedProps} />
      )}
      <label htmlFor={id}>{label}</label>
      {required && (
        <div className="error-message" id={errorId} role="alert" aria-live="polite">
          {error || ''}
        </div>
      )}
    </div>
  );
}
