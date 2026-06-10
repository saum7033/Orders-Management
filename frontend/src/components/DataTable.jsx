import React, { useState, useRef, useCallback, useMemo, useEffect, useLayoutEffect } from 'react';
import { Trash2, Pencil, Save, XCircle, Search, X, Check } from 'lucide-react';
import {
  PRIORITY_COLORS, STATUS_OPTIONS, STATUS_COLORS,
  DEFAULT_COL_WIDTH, extractDate, extractTime, getSourceKey,
} from '../utils/columns';

/* ─── helpers ────────────────────────────────────────────────────────────── */
function displayVal(col, row) {
  if (col.type === 'date')  return extractDate(row[col.key]);
  if (col.type === 'time')  return extractTime(row[getSourceKey(col)]);
  return row[col.key];
}

/* ─── Badges ─────────────────────────────────────────────────────────────── */
function PriorityBadge({ value }) {
  const c = PRIORITY_COLORS[value];
  if (!c) return <span style={{ color: '#4b5563' }}>{value || '—'}</span>;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5,
      background:c.bg, color:c.text, padding:'2px 9px', borderRadius:12, fontSize:10, fontWeight:700 }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }} />
      {value}
    </span>
  );
}
function StatusBadge({ value }) {
  const c = STATUS_COLORS[value] || { bg:'rgba(100,100,100,0.1)', color:'#9ca3af', border:'rgba(100,100,100,0.2)' };
  return (
    <span style={{ display:'inline-block', background:c.bg, color:c.color,
      border:`1px solid ${c.border}`, padding:'2px 9px', borderRadius:12,
      fontSize:10, fontWeight:700, whiteSpace:'nowrap' }}>
      {value || 'Pending Approval'}
    </span>
  );
}
function SourceBadge({ value }) {
  const manual = value === 'MANUAL';
  return (
    <span style={{ display:'inline-block',
      background: manual ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.12)',
      color: manual ? '#93c5fd' : '#6ee7b7',
      border:`1px solid ${manual ? 'rgba(59,130,246,0.3)' : 'rgba(16,185,129,0.25)'}`,
      padding:'1px 8px', borderRadius:10, fontSize:10, fontWeight:700, letterSpacing:1 }}>
      {value || '—'}
    </span>
  );
}
function CommentCell({ value }) {
  if (!value) return <span style={{ color:'#2d4a3a' }}>—</span>;
  return (
    <span title={value} style={{ color:'#fbbf24', display:'block',
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
      💬 {value}
    </span>
  );
}
function RemarkCell({ value }) {
  if (!value) return <span style={{ color:'#2d4a3a' }}>—</span>;
  return (
    <span title={value} style={{ color:'#a78bfa', display:'block',
      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
      📝 {value}
    </span>
  );
}

/* ─── Inline single-cell editor (User role — comments / remark) ──────────── */
function InlineEditCell({ value, onSave, isComment }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');

  const open   = () => { setDraft(value || ''); setEditing(true); };
  const commit = () => { onSave(draft); setEditing(false); };
  const abort  = () => setEditing(false);

  const color = isComment ? '#fbbf24' : '#a78bfa';
  const icon  = isComment ? '💬 ' : '📝 ';
  const btnBase = { background:'none', border:'none', cursor:'pointer',
    display:'inline-flex', alignItems:'center', padding:'1px 3px', borderRadius:4 };

  if (editing) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:3, width:'100%' }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter') commit(); if (e.key==='Escape') abort(); }}
          autoFocus
          style={{ flex:1, minWidth:0, background:'#0a1a13', border:'1px solid #059669',
            borderRadius:4, color:'#d1fae5', padding:'2px 6px', fontSize:11,
            fontFamily:"'DM Mono',monospace", outline:'none', boxSizing:'border-box' }} />
        <button onClick={commit} title="Save"
          style={{ ...btnBase, color:'#4ade80', background:'rgba(5,150,105,0.18)' }}>
          <Check size={10} />
        </button>
        <button onClick={abort} title="Cancel"
          style={{ ...btnBase, color:'#6b7280', background:'rgba(107,114,128,0.1)' }}>
          <X size={10} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:4, maxWidth:'100%' }}>
      {value
        ? <span title={value} style={{ color, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {icon}{value}
          </span>
        : <span style={{ color:'#2d4a3a', flex:1 }}>—</span>
      }
      <button onClick={open} title={isComment ? 'Edit comment' : 'Edit remark'}
        style={{ ...btnBase, color:'#4b7a60', flexShrink:0 }}
        onMouseEnter={e => e.currentTarget.style.color='#6ee7b7'}
        onMouseLeave={e => e.currentTarget.style.color='#4b7a60'}>
        <Pencil size={9} />
      </button>
    </div>
  );
}

/* ─── Status Dropdown ────────────────────────────────────────────────────── */
function StatusDropdown({ value, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const cur = value || 'Pending Approval';
  const c = STATUS_COLORS[cur] || STATUS_COLORS['Pending Approval'];

  const toggle = (e) => {
    e.stopPropagation();
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div style={{ display:'inline-block' }}>
      <button ref={btnRef} onClick={toggle} style={{
        display:'inline-flex', alignItems:'center', gap:5,
        background:c.bg, color:c.color, border:`1px solid ${c.border}`,
        padding:'3px 10px', borderRadius:12, fontSize:10,
        fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
        fontFamily:"'DM Mono',monospace",
      }}>
        {cur} <span style={{ fontSize:8 }}>▼</span>
      </button>
      {open && (
        /* position:fixed escapes all overflow:hidden ancestors */
        <div onMouseDown={e => e.stopPropagation()}
          style={{ position:'fixed', top:pos.top, left:pos.left,
            background:'#0d1f18', border:'1px solid #1e3a2a', borderRadius:8,
            zIndex:99999, minWidth:160, boxShadow:'0 8px 24px rgba(0,0,0,0.6)', overflow:'hidden' }}>
          {STATUS_OPTIONS.map(opt => {
            const oc = STATUS_COLORS[opt] || {};
            return (
              <div key={opt} onClick={() => { onUpdate(opt); setOpen(false); }}
                style={{ padding:'8px 14px', cursor:'pointer', color:oc.color||'#d1fae5',
                  fontSize:11, borderBottom:'1px solid #111e16', fontFamily:"'DM Mono',monospace",
                  background: cur===opt ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background=cur===opt?'rgba(255,255,255,0.05)':'transparent'}>
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── shared cell/button styles ─────────────────────────────────────────── */
const TD = {
  padding:'7px 10px', color:'#d1fae5', overflow:'hidden',
  textOverflow:'ellipsis', whiteSpace:'nowrap',
  borderBottom:'1px solid #0a1a13', verticalAlign:'middle',
  boxSizing:'border-box',
};
const mkBtn = (color, bg) => ({
  background:bg, border:`1px solid ${color}44`, color,
  borderRadius:6, padding:'4px 8px', cursor:'pointer',
  display:'inline-flex', alignItems:'center', justifyContent:'center',
});

/* ─── Editable row ───────────────────────────────────────────────────────── */
function EditRow({ row, cols, widths, onSave, onCancel, saving, role }) {
  const [draft, setDraft] = useState({ ...row });
  const canEdit = (col) => {
    if (role === 'USER') return ['status','comments','remark'].includes(col.key);
    return !col.derived;
  };

  const field = (col) => {
    if (col.derived || col.type==='time') return <span style={{ color:'#4b7a60',fontSize:11 }}>{displayVal(col,row)}</span>;
    if (col.key==='source') return <SourceBadge value={row[col.key]} />;
    if (col.key==='priorityColour') return <span style={{ color:'#d1fae5',fontSize:11 }}>{row[col.key]||'—'}</span>;
    if (!canEdit(col)) return <span style={{ color:'#d1fae5',fontSize:11 }}>{displayVal(col,row)||'—'}</span>;
    if (col.type==='status_dropdown' || col.type==='status_display') {
      return (
        <select value={draft[col.key]||'Pending Approval'} onChange={e=>setDraft(d=>({...d,[col.key]:e.target.value}))}
          style={{ background:'#0a1a13', border:'1px solid #059669', borderRadius:5,
            color:'#d1fae5', padding:'3px 6px', fontSize:11, width:'100%', fontFamily:"'DM Mono',monospace", outline:'none' }}>
          {STATUS_OPTIONS.map(o=><option key={o}>{o}</option>)}
        </select>
      );
    }
    return (
      <input value={draft[col.key]||''} onChange={e=>setDraft(d=>({...d,[col.key]:e.target.value}))}
        onKeyDown={e=>{ if(e.key==='Enter') onSave(draft); if(e.key==='Escape') onCancel(); }}
        style={{ background:'#0a1a13', border:'1px solid #059669', borderRadius:5,
          color:'#d1fae5', padding:'3px 8px', fontSize:11, width:'100%',
          fontFamily:"'DM Mono',monospace", outline:'none', boxSizing:'border-box' }} />
    );
  };

  return (
    <>
      {cols.map(col => (
        <td key={col.key} style={{ ...TD, width:widths[col.key], minWidth:widths[col.key], maxWidth:widths[col.key], background:'rgba(5,150,105,0.07)' }}>
          {field(col)}
        </td>
      ))}
      <td style={{ ...TD, width:90, minWidth:90, background:'rgba(5,150,105,0.07)', whiteSpace:'nowrap' }}>
        <div style={{ display:'flex', gap:5 }}>
          <button onClick={()=>onSave(draft)} disabled={saving} title="Save" style={mkBtn('#4ade80','rgba(5,150,105,0.2)')}>
            {saving ? '…' : <Save size={12} />}
          </button>
          <button onClick={onCancel} title="Cancel" style={mkBtn('#f87171','rgba(239,68,68,0.1)')}>
            <XCircle size={12} />
          </button>
        </div>
      </td>
    </>
  );
}

/* ─── Read row ───────────────────────────────────────────────────────────── */
function ReadRow({ row, cols, widths, onEdit, onDelete, onStatusChange, role, showActions }) {
  const cell = (col) => {
    const val = displayVal(col, row);
    if (col.key==='priorityColour') return <PriorityBadge value={row[col.key]} />;
    if (col.key==='source')         return <SourceBadge value={row[col.key]} />;

    // USER role — inline pencil edit directly on the cell
    if (col.key==='comments' && role==='USER')
      return <InlineEditCell value={row[col.key]} onSave={v=>onStatusChange(row.id,'comments',v)} isComment />;
    if (col.key==='remark' && role==='USER')
      return <InlineEditCell value={row[col.key]} onSave={v=>onStatusChange(row.id,'remark',v)} isComment={false} />;

    // ADMIN — static display (admin edits via full-row edit button)
    if (col.key==='comments') return <CommentCell value={row[col.key]} />;
    if (col.key==='remark')   return <RemarkCell value={row[col.key]} />;

    if (col.type==='status_dropdown') return (
      <StatusDropdown value={row[col.key]} onUpdate={v=>onStatusChange(row.id, col.key, v)} />
    );
    if (col.type==='status_display') return <StatusBadge value={row[col.key]} />;
    if (!val && val!==0) return <span style={{ color:'#2d4a3a' }}>—</span>;
    if (col.key==='status') return <StatusBadge value={val} />;
    return <span title={String(val)} style={{ overflow:'hidden', textOverflow:'ellipsis', display:'block', maxWidth:'100%' }}>{String(val)}</span>;
  };

  return (
    <>
      {cols.map(col => (
        <td key={col.key} style={{ ...TD, width:widths[col.key], minWidth:widths[col.key], maxWidth:widths[col.key] }}>
          {cell(col)}
        </td>
      ))}
      {showActions && (
        <td style={{ ...TD, width:90, minWidth:90, whiteSpace:'nowrap' }}>
          {/* Edit + Delete visible to ADMIN only */}
          {role==='ADMIN' && (
            <div style={{ display:'flex', gap:5 }}>
              <button onClick={()=>onEdit(row.id)} title="Edit row" style={mkBtn('#93c5fd','rgba(59,130,246,0.12)')}><Pencil size={12}/></button>
              <button onClick={()=>{ if(window.confirm('Delete this row?')) onDelete(row.id); }}
                title="Delete row" style={mkBtn('#f87171','rgba(239,68,68,0.1)')}><Trash2 size={12}/></button>
            </div>
          )}
        </td>
      )}
    </>
  );
}

/* ─── Resizable TH ───────────────────────────────────────────────────────── */
function ResizerTh({ col, width, onResize, filterVal, onFilter, showFilter }) {
  const x0 = useRef(0), w0 = useRef(0);
  const handleRef = useRef(null);

  const startDrag = useCallback(e => {
    e.preventDefault();
    x0.current = e.clientX; w0.current = width;
    if (handleRef.current) handleRef.current.style.background = '#22c55e';
    const move = ev => onResize(Math.max(60, w0.current + ev.clientX - x0.current));
    const up = () => {
      if (handleRef.current) handleRef.current.style.background = 'transparent';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }, [width, onResize]);

  return (
    <th style={{ position:'relative', width, minWidth:width, maxWidth:width,
      background:'#060f0b', borderBottom:'2px solid #1e3a2a',
      padding:0, userSelect:'none', verticalAlign:'top', boxSizing:'border-box' }}>
      <div style={{ padding:'9px 12px 6px', color:'#6ee7b7', fontWeight:700, fontSize:11,
        letterSpacing:1, textTransform:'uppercase', whiteSpace:'nowrap',
        overflow:'hidden', textOverflow:'ellipsis' }}>
        {col.label}
      </div>
      {showFilter && (
        <div style={{ padding:'0 6px 6px' }}>
          {(col.type === 'status_dropdown' || col.type === 'status_display') ? (
            <select value={filterVal} onChange={e => onFilter(e.target.value)}
              style={{ width:'100%', background:'#0a1810', border:'1px solid #1e3a2a',
                borderRadius:4, color:'#a7f3d0', fontSize:10, padding:'3px 4px',
                fontFamily:"'DM Mono',monospace", outline:'none', boxSizing:'border-box' }}>
              <option value="">All</option>
              {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input value={filterVal} onChange={e=>onFilter(e.target.value)}
              placeholder="filter…"
              style={{ width:'100%', background:'#0a1810', border:'1px solid #1e3a2a',
                borderRadius:4, color:'#a7f3d0', fontSize:10, padding:'3px 6px',
                fontFamily:"'DM Mono',monospace", outline:'none', boxSizing:'border-box' }} />
          )}
        </div>
      )}
      {/* drag-to-resize handle — visible line on right edge, widens on hover */}
      <div ref={handleRef} onMouseDown={startDrag}
        style={{ position:'absolute', right:0, top:0, bottom:0, width:4,
          cursor:'col-resize', background:'transparent',
          borderRight:'2px solid #1e3a2a', transition:'background 0.15s' }}
        onMouseEnter={e=>{ e.currentTarget.style.background='rgba(34,197,94,0.35)'; e.currentTarget.style.borderRightColor='#22c55e'; }}
        onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderRightColor='#1e3a2a'; }} />
    </th>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN DataTable
   Architecture: TWO separate scroll-synced divs.
     - headerDiv  : overflow-x:auto, overflow-y:hidden  → shows header table
     - bodyDiv    : overflow-x:auto, overflow-y:auto     → shows body table
   Both tables use identical colgroup driven by colWidths state.
   onScroll on bodyDiv syncs headerDiv.scrollLeft and vice-versa so they
   always move together — giving the appearance of a single table with a
   sticky header.
════════════════════════════════════════════════════════════════════════════ */
export default function DataTable({
  rows, cols, onDelete, onSave, onStatusChange,
  emptyMsg, showActions = true, role = 'USER',
}) {
  const [editingId,  setEditingId]  = useState(null);
  const [savingId,   setSavingId]   = useState(null);
  const [globalQ,    setGlobalQ]    = useState('');
  const [colFilters, setColFilters] = useState({});
  const [showFilter, setShowFilter] = useState(false);

  const headerRef = useRef(null);
  const bodyRef   = useRef(null);
  const syncingRef = useRef(false); // prevent scroll-loop

  // ── col widths ────────────────────────────────────────────────────────────
  const [widths, setWidths] = useState(() => {
    const w = {};
    cols.forEach(c => { w[c.key] = c.width || DEFAULT_COL_WIDTH; });
    return w;
  });

  // Re-init when cols prop changes (switching T1 ↔ T2)
  useEffect(() => {
    setWidths(() => {
      const w = {};
      cols.forEach(c => { w[c.key] = c.width || DEFAULT_COL_WIDTH; });
      return w;
    });
    setEditingId(null);
    setGlobalQ('');
    setColFilters({});
  }, [cols]);

  const setW = useCallback((key, val) => {
    setWidths(prev => ({ ...prev, [key]: Math.max(60, val) }));
  }, []);

  const ACTIONS_W = 90;
  const showActualActions = showActions && role === 'ADMIN';
  const totalW = useMemo(
    () => cols.reduce((s,c) => s + (widths[c.key]||DEFAULT_COL_WIDTH), 0) + (showActualActions ? ACTIONS_W : 0),
    [cols, widths, showActualActions]
  );

  // ── sync scroll ───────────────────────────────────────────────────────────
  const onBodyScroll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (headerRef.current && bodyRef.current)
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    syncingRef.current = false;
  }, []);

  const onHeaderScroll = useCallback(() => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    if (headerRef.current && bodyRef.current)
      bodyRef.current.scrollLeft = headerRef.current.scrollLeft;
    syncingRef.current = false;
  }, []);

  // ── filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!rows) return [];
    let r = rows;
    if (globalQ.trim()) {
      const q = globalQ.toLowerCase();
      r = r.filter(row => cols.some(col => {
        const v = displayVal(col, row);
        return v != null && String(v).toLowerCase().includes(q);
      }));
    }
    cols.forEach(col => {
      const f = (colFilters[col.key]||'').trim().toLowerCase();
      if (!f) return;
      r = r.filter(row => {
        const v = displayVal(col, row);
        return v != null && String(v).toLowerCase().includes(f);
      });
    });
    return r;
  }, [rows, globalQ, colFilters, cols]);

  const handleSave = async (id, draft) => {
    setSavingId(id);
    try { await onSave(id, draft); setEditingId(null); }
    finally { setSavingId(null); }
  };

  const hasFilters = globalQ || Object.values(colFilters).some(Boolean);

  // shared colgroup markup for BOTH tables (guarantees identical widths)
  const ColGroup = () => (
    <colgroup>
      {cols.map(col => <col key={col.key} style={{ width:widths[col.key]||DEFAULT_COL_WIDTH, minWidth:widths[col.key]||DEFAULT_COL_WIDTH }} />)}
      {showActualActions && <col style={{ width:ACTIONS_W, minWidth:ACTIONS_W }} />}
    </colgroup>
  );

  if (!rows || rows.length === 0)
    return (
      <div style={{ padding:'32px 0', textAlign:'center', color:'#2d4a3a', fontSize:12, fontStyle:'italic' }}>
        {emptyMsg||'No data'}
      </div>
    );

  return (
    <div>
      {/* ── search toolbar ── */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:'1 1 220px', minWidth:180 }}>
          <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#4b7a60', pointerEvents:'none' }} />
          <input value={globalQ} onChange={e=>setGlobalQ(e.target.value)} placeholder="Search entire table…"
            style={{ width:'100%', background:'#0a1810', border:'1px solid #1e3a2a', borderRadius:8,
              color:'#d1fae5', padding:'7px 10px 7px 32px', fontSize:12,
              fontFamily:"'DM Mono',monospace", outline:'none', boxSizing:'border-box' }} />
          {globalQ && <button onClick={()=>setGlobalQ('')}
            style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#4b7a60', padding:0 }}>
            <X size={12} /></button>}
        </div>
        <button onClick={()=>setShowFilter(v=>!v)} style={{
          display:'flex', alignItems:'center', gap:6,
          background: showFilter?'rgba(16,185,129,0.15)':'transparent',
          border:`1px solid ${showFilter?'#059669':'#1e3a2a'}`,
          borderRadius:8, color:showFilter?'#6ee7b7':'#4b7a60',
          padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer',
          fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>
          <Search size={12}/> COL FILTERS {showFilter?'ON':'OFF'}
        </button>
        {hasFilters && (
          <button onClick={()=>{ setGlobalQ(''); setColFilters({}); }} style={{
            display:'flex', alignItems:'center', gap:5, background:'rgba(239,68,68,0.1)',
            border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171',
            padding:'7px 12px', fontSize:11, cursor:'pointer', fontFamily:"'DM Mono',monospace" }}>
            <X size={12}/> CLEAR FILTERS
          </button>
        )}
        <span style={{ fontSize:11, color:'#4b7a60', marginLeft:'auto' }}>
          {filtered.length}/{rows.length} rows
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          STICKY HEADER + SYNCED BODY
          Key technique:
          - headerDiv: overflow-x:auto, overflow-y:hidden, no scrollbar shown
          - bodyDiv:   overflow-x:auto, overflow-y:auto, max-height capped
          - Both use same colgroup widths so columns align perfectly
          - onScroll handlers keep scrollLeft in sync bidirectionally
      ══════════════════════════════════════════════════════════════════ */}
      <div style={{ border:'1px solid #1a3028', borderRadius:10, overflow:'hidden' }}>

        {/* ─ HEADER (sticky, never scrolls vertically) ─ */}
        <div ref={headerRef} onScroll={onHeaderScroll}
          style={{ overflowX:'auto', overflowY:'hidden',
            /* Hide the scrollbar on the header div */
            scrollbarWidth:'none', msOverflowStyle:'none' }}>
          {/* inline style to hide webkit scrollbar */}
          <style>{`
            .hdr-scroll::-webkit-scrollbar { display: none; }
          `}</style>
          <table className="hdr-scroll" style={{ borderCollapse:'collapse', tableLayout:'fixed', width:totalW, minWidth:totalW }}>
            <ColGroup />
            <thead>
              <tr>
                {cols.map(col => (
                  <ResizerTh key={col.key} col={col}
                    width={widths[col.key]||DEFAULT_COL_WIDTH}
                    onResize={w=>setW(col.key,w)}
                    filterVal={colFilters[col.key]||''}
                    onFilter={v=>setColFilters(p=>({...p,[col.key]:v}))}
                    showFilter={showFilter} />
                ))}
                {showActualActions && (
                  <th style={{ width:ACTIONS_W, minWidth:ACTIONS_W, background:'#060f0b',
                    borderBottom:'2px solid #1e3a2a', padding:'9px 10px',
                    color:'#6ee7b7', fontSize:11, fontWeight:700, letterSpacing:1,
                    textTransform:'uppercase', whiteSpace:'nowrap', boxSizing:'border-box' }}>
                    ACTIONS
                  </th>
                )}
              </tr>
            </thead>
          </table>
        </div>

        {/* ─ BODY (scrollable, synced with header) ─ */}
        <div ref={bodyRef} onScroll={onBodyScroll}
          style={{ overflowX:'auto', overflowY:'auto', maxHeight:500 }}>
          <table style={{ borderCollapse:'collapse', tableLayout:'fixed', width:totalW, minWidth:totalW }}>
            <ColGroup />
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={cols.length+(showActualActions?1:0)}
                  style={{ padding:'28px 0', textAlign:'center', color:'#4b7a60', fontSize:12, fontStyle:'italic' }}>
                  No rows match the current filters
                </td></tr>
              ) : filtered.map((row, i) => (
                <tr key={row.id??i} style={{
                  background: editingId===(row.id??i)
                    ? 'rgba(5,150,105,0.08)'
                    : i%2===0 ? 'rgba(9,22,17,0.5)' : 'rgba(6,15,10,0.4)',
                  transition:'background 0.15s',
                }}>
                  {showActualActions && editingId===(row.id??i)
                    ? <EditRow row={row} cols={cols} widths={widths}
                        saving={savingId===(row.id??i)}
                        onSave={draft=>handleSave(row.id??i, draft)}
                        onCancel={()=>setEditingId(null)} role={role} />
                    : <ReadRow row={row} cols={cols} widths={widths}
                        onEdit={id=>setEditingId(id)}
                        onDelete={onDelete}
                        onStatusChange={onStatusChange}
                        role={role} showActions={showActualActions} />
                  }
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
