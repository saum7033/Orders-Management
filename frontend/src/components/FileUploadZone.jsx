import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';

export default function FileUploadZone({ label, hint, onFile, uploadKey, loading }) {
  const inputRef  = useRef(null);
  const [fileName, setFileName] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState('');

  const handle = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['xlsx','xls'].includes(ext)) { setError('Please upload a .xlsx or .xls file'); return; }
    setError('');
    setFileName(file.name);
    onFile(file);
    if (inputRef.current) inputRef.current.value = '';   // allow re-select same file
  }, [onFile]);

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#6ee7b7', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]); }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#22c55e' : '#1e3a2a'}`,
          borderRadius: 10, padding: '22px 16px', textAlign: 'center', cursor: 'pointer',
          background: dragging ? 'rgba(22,163,74,0.07)' : 'rgba(9,22,17,0.6)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { if (!dragging) e.currentTarget.style.borderColor = '#4ade80'; }}
        onMouseLeave={e => { if (!dragging) e.currentTarget.style.borderColor = '#1e3a2a'; }}
      >
        {/* key prop forces remount → clears internal value → allows re-upload after clearing */}
        <input key={uploadKey} ref={inputRef} type="file" accept=".xlsx,.xls"
          style={{ display: 'none' }} onChange={e => handle(e.target.files?.[0])} />

        {loading ? (
          <span style={{ color: '#6ee7b7', fontSize: 12 }}>⏳ Uploading & parsing…</span>
        ) : fileName ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#a7f3d0', fontSize: 12 }}>
            <FileSpreadsheet size={15} /> {fileName}
          </div>
        ) : (
          <div style={{ color: '#4b7a60', fontSize: 12 }}>
            <UploadCloud size={22} style={{ margin: '0 auto 6px', display: 'block', color: '#2d4a3a' }} />
            Drop <strong style={{ color: '#4ade80' }}>.xlsx</strong> here or{' '}
            <span style={{ color: '#4ade80', textDecoration: 'underline' }}>click to browse</span>
          </div>
        )}
      </div>
      {hint  && <div style={{ fontSize: 10, color: '#2d4a3a', marginTop: 5, lineHeight: 1.5 }}>{hint}</div>}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f87171', fontSize: 11, marginTop: 5 }}>
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </div>
  );
}