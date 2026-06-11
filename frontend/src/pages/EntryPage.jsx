import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Save, Trash2, RefreshCw, XCircle } from 'lucide-react';

import { orderItemsApi, orderSummariesApi, orderTransactionsApi } from '../services/api';
import { TABLE1_COLS, TABLE2_COLS, TABLE3_COLS } from '../utils/columns';
import DataTable       from '../components/DataTable';
import FileUploadZone  from '../components/FileUploadZone';
import ManualEntryForm from '../components/ManualEntryForm';
import SectionCard     from '../components/SectionCard';
import Btn             from '../components/Btn';

/* ── Import summary panel (shown after Excel save) ── */
function ImportSummaryPanel({ result, onDismiss }) {
  if (!result) return null;
  const hasErrors = result.failed > 0;
  return (
    <div style={{
      margin: '14px 0',
      padding: '14px 16px',
      borderRadius: 8,
      background: hasErrors ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
      border: `1px solid ${hasErrors ? 'rgba(239,68,68,0.28)' : 'rgba(34,197,94,0.28)'}`,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <span style={{ fontWeight:700, fontSize:11, letterSpacing:1, color: hasErrors ? '#f87171' : '#6ee7b7' }}>
          IMPORT SUMMARY
        </span>
        <button onClick={onDismiss} style={{
          background:'none', border:'none', cursor:'pointer',
          color:'#4b7a60', fontSize:16, lineHeight:1, padding:'0 2px',
        }}>✕</button>
      </div>
      <div style={{ display:'flex', gap:28, fontSize:12, marginBottom: result.errors?.length ? 12 : 0 }}>
        <span style={{ color:'#9ca3af' }}>Total rows: <strong style={{ color:'#e2e8f0' }}>{result.totalRows}</strong></span>
        <span style={{ color:'#9ca3af' }}>Imported: <strong style={{ color:'#6ee7b7' }}>{result.imported}</strong></span>
        <span style={{ color:'#9ca3af' }}>Failed: <strong style={{ color: hasErrors ? '#f87171' : '#6ee7b7' }}>{result.failed}</strong></span>
      </div>
      {result.errors?.length > 0 && (
        <div style={{ borderTop:'1px solid rgba(239,68,68,0.15)', paddingTop:8 }}>
          {result.errors.map((err, i) => (
            <div key={i} style={{
              fontSize:11, color:'#fca5a5', padding:'3px 0',
              borderBottom:'1px solid rgba(239,68,68,0.08)',
            }}>
              Row {err.rowIndex}{err.orderNumber ? ` · ${err.orderNumber}` : ''}: {err.reason}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Tab buttons ── */
function TableTab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'11px 28px', cursor:'pointer', border:'none',
      borderBottom: active ? '3px solid #22c55e' : '3px solid transparent',
      background:'transparent',
      color: active ? '#6ee7b7' : '#4b7a60',
      fontSize:13, fontWeight:700, letterSpacing:1,
      fontFamily:"'DM Mono',monospace", transition:'all 0.2s',
    }}>{children}</button>
  );
}
function ModeTab({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:'8px 20px', borderRadius:8, cursor:'pointer',
      border:`1px solid ${active ? '#059669' : '#1e3a2a'}`,
      background: active ? 'rgba(5,150,105,0.18)' : 'transparent',
      color: active ? '#6ee7b7' : '#4b7a60',
      fontSize:11, fontWeight:700, letterSpacing:1,
      fontFamily:"'DM Mono',monospace", transition:'all 0.2s',
    }}>{children}</button>
  );
}
function PreviewBanner() {
  return (
    <div style={{ padding:'7px 14px', borderRadius:6, marginBottom:12,
      background:'rgba(234,179,8,0.08)', border:'1px solid rgba(234,179,8,0.22)',
      color:'#fbbf24', fontSize:11 }}>
      ⚠️ <strong>Preview only</strong> — data is NOT saved yet.
      Click <strong>SAVE TO DB</strong> to persist.
    </div>
  );
}

const sortByIdDesc = arr => [...(arr || [])].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function EntryPage({ authUser }) {
  const role    = authUser?.role || 'USER';
  const isAdmin = role === 'ADMIN';

  const [activeTable, setActiveTable] = useState('T1');
  const [modeT1, setModeT1] = useState('manual');
  const [modeT2, setModeT2] = useState('manual');
  const [modeT3, setModeT3] = useState('excel');

  /* DB state */
  const [savedItems,        setSavedItems]        = useState([]);
  const [savedSummaries,    setSavedSummaries]    = useState([]);
  const [savedTransactions, setSavedTransactions] = useState([]);
  const [dbLoading,         setDbLoading]         = useState(false);

  /* Excel preview state — T1 */
  const [preview1,   setPreview1]   = useState([]);
  const [uploading1, setUploading1] = useState(false);
  const [saving1,    setSaving1]    = useState(false);
  const [upKey1,     setUpKey1]     = useState(0);

  /* Excel preview state — T2 */
  const [preview2,   setPreview2]   = useState([]);
  const [uploading2, setUploading2] = useState(false);
  const [saving2,    setSaving2]    = useState(false);
  const [upKey2,     setUpKey2]     = useState(0);

  /* Excel preview state — T3 */
  const [preview3,   setPreview3]   = useState([]);
  const [uploading3, setUploading3] = useState(false);
  const [saving3,    setSaving3]    = useState(false);
  const [upKey3,     setUpKey3]     = useState(0);

  const [manualSaving, setManualSaving] = useState(false);

  /* Import result summaries (shown after Excel bulk save) */
  const [importResult1, setImportResult1] = useState(null);
  const [importResult2, setImportResult2] = useState(null);
  const [importResult3, setImportResult3] = useState(null);

  /* ── TABLE 2 is SOURCE OF TRUTH for status, comments, remark ──────────── */
  const t2SyncMap = useMemo(() => {
    const m = {};
    savedSummaries.forEach(s => {
      if (s.orderNumber) {
        m[String(s.orderNumber).trim()] = {
          status:   s.status   || '',
          comments: s.comments || '',
          remark:   s.remark   || '',
        };
      }
    });
    return m;
  }, [savedSummaries]);

  /* T1 display — status synced from T2 */
  const itemsWithSync = useMemo(() =>
    savedItems.map(item => {
      const sync = t2SyncMap[String(item.orderNumber || '').trim()];
      if (!sync) return item;
      return { ...item, status: sync.status || item.status || '', comments: sync.comments || item.comments || '' };
    }),
  [savedItems, t2SyncMap]);

  /* T3 display — status synced from T2 */
  const transactionsWithSync = useMemo(() =>
    savedTransactions.map(txn => {
      const sync = t2SyncMap[String(txn.orderNumber || '').trim()];
      if (!sync) return txn;
      return { ...txn, status: sync.status || txn.status || '' };
    }),
  [savedTransactions, t2SyncMap]);

  /* ── Load all three tables ── */
  const loadSaved = useCallback(async () => {
    setDbLoading(true);
    try {
      const [items, summaries, transactions] = await Promise.all([
        orderItemsApi.getAll(),
        orderSummariesApi.getAll(),
        orderTransactionsApi.getAll(),
      ]);
      setSavedItems(sortByIdDesc(items));
      setSavedSummaries(sortByIdDesc(summaries || []));
      setSavedTransactions(sortByIdDesc(transactions || []));
    } catch (e) {
      toast.error('Could not load data: ' + e.message);
    } finally {
      setDbLoading(false);
    }
  }, []);
  useEffect(() => { loadSaved(); }, [loadSaved]);

  /* ── Manual add (T1 / T2 / T3) ── */
  const handleManualAdd = async (row) => {
    setManualSaving(true);
    try {
      if (activeTable === 'T1') {
        const orderNum = (row.orderNumber || '').trim().toLowerCase();
        const partNo   = (row.partNo   || '').trim().toLowerCase();
        if (!orderNum || !partNo) {
          throw new Error('Order Number and Part Number are required');
        }
        const duplicate = savedItems.some(
          item =>
            (item.orderNumber || '').trim().toLowerCase() === orderNum &&
            (item.partNo      || '').trim().toLowerCase() === partNo
        );
        if (duplicate) {
          throw new Error('Order Number + Part Number already exists');
        }
        await orderItemsApi.createOne({ ...row, source: 'MANUAL' });
        const items = await orderItemsApi.getAll();
        setSavedItems(sortByIdDesc(items));
        toast.success('Row saved to DB ✓');
      } else if (activeTable === 'T2') {
        const orderNum = (row.orderNumber || '').trim().toLowerCase();
        if (!orderNum) {
          throw new Error('Order Number is required');
        }
        const duplicate = savedSummaries.some(
          s => (s.orderNumber || '').trim().toLowerCase() === orderNum
        );
        if (duplicate) {
          const e = new Error('Order Number Already Exists');
          e.isWarning = true;
          throw e;
        }
        const result2 = await orderSummariesApi.bulkSave([row]);
        const summaries = await orderSummariesApi.getAll();
        setSavedSummaries(sortByIdDesc(summaries || []));
        if (!result2 || result2.imported === 0) {
          const reason = result2?.errors?.[0]?.reason || 'Order Number Already Exists';
          const e = new Error(reason);
          e.isWarning = true;
          throw e;
        }
        toast.success('1 Row Added Successfully');
      } else {
        const orderNum = (row.orderNumber || '').trim().toLowerCase();
        const partNo   = (row.partNo   || '').trim().toLowerCase();
        if (!orderNum) {
          throw new Error('Order Number is required');
        }
        const duplicate = savedTransactions.some(
          t =>
            (t.orderNumber || '').trim().toLowerCase() === orderNum &&
            (t.partNo      || '').trim().toLowerCase() === partNo
        );
        if (duplicate) {
          const e = new Error('Order Number + Part Number already exists');
          e.isWarning = true;
          throw e;
        }
        const result3 = await orderTransactionsApi.bulkUpsert([row]);
        const transactions = await orderTransactionsApi.getAll();
        setSavedTransactions(sortByIdDesc(transactions || []));
        if (!result3 || result3.imported === 0) {
          const reason = result3?.errors?.[0]?.reason || 'Order Number + Part Number already exists';
          const e = new Error(reason);
          e.isWarning = true;
          throw e;
        }
        toast.success('1 Row Added Successfully');
      }
    } catch (e) {
      if (e.isWarning) {
        toast(e.message, { icon: '⚠️' });
      } else {
        toast.error(e.message || 'Failed to Save Record');
      }
      throw e;
    } finally {
      setManualSaving(false);
    }
  };

  /* ── Sync helper: update T2 record matching an orderNumber ── */
  const syncStatusToT2 = useCallback(async (orderNumber, value) => {
    const t2Row = savedSummaries.find(s =>
      String(s.orderNumber || '').trim() === String(orderNumber || '').trim()
    );
    if (!t2Row) return;
    const updated = await orderSummariesApi.update(t2Row.id, { ...t2Row, status: value });
    setSavedSummaries(prev => prev.map(r => r.id === t2Row.id ? updated : r));
  }, [savedSummaries]);

  /* ── Status change — T1 (syncs to T2, propagates to T3 via memo) ── */
  const handleStatusChangeItem = async (id, field, value) => {
    try {
      const row = savedItems.find(r => r.id === id);
      if (!row) return;
      const updated = await orderItemsApi.update(id, { ...row, [field]: value });
      setSavedItems(prev => prev.map(r => r.id === id ? updated : r));
      if (field === 'status') await syncStatusToT2(row.orderNumber, value);
    } catch (e) { toast.error('Update failed: ' + e.message); }
  };

  /* ── Status change — T2 (propagates to T1 & T3 automatically via memo) ── */
  const handleStatusChangeSummary = async (id, field, value) => {
    try {
      const row = savedSummaries.find(r => r.id === id);
      if (!row) return;
      const updated = await orderSummariesApi.update(id, { ...row, [field]: value });
      setSavedSummaries(prev => prev.map(r => r.id === id ? updated : r));
    } catch (e) { toast.error('Update failed: ' + e.message); }
  };

  /* ── Status change — T3 (syncs to T2, propagates to T1 via memo) ── */
  const handleStatusChangeTransaction = async (id, field, value) => {
    try {
      const row = savedTransactions.find(r => r.id === id);
      if (!row) return;
      const updated = await orderTransactionsApi.update(id, { ...row, [field]: value });
      setSavedTransactions(prev => prev.map(r => r.id === id ? updated : r));
      if (field === 'status') await syncStatusToT2(row.orderNumber, value);
    } catch (e) { toast.error('Update failed: ' + e.message); }
  };

  /* ── Row update (edit modal save) ── */
  const handleUpdateItem = async (id, draft) => {
    try {
      const updated = await orderItemsApi.update(id, draft);
      setSavedItems(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Row updated ✓');
    } catch (e) { toast.error('Update failed: ' + e.message); }
  };

  const handleUpdateSummary = async (id, draft) => {
    try {
      const updated = await orderSummariesApi.update(id, draft);
      setSavedSummaries(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Row updated ✓');
    } catch (e) { toast.error('Update failed: ' + e.message); }
  };

  const handleUpdateTransaction = async (id, draft) => {
    try {
      const updated = await orderTransactionsApi.update(id, draft);
      setSavedTransactions(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('Row updated ✓');
    } catch (e) { toast.error('Update failed: ' + e.message); }
  };

  /* ── Delete ── */
  const handleDeleteItem = async (id) => {
    try {
      await orderItemsApi.deleteOne(id);
      setSavedItems(prev => { const n = prev.filter(r => r.id !== id); if (!n.length) setUpKey1(k => k+1); return n; });
      toast.success('Row deleted ✓');
    } catch (e) { toast.error('Delete failed: ' + e.message); }
  };
  const handleDeleteSummary = async (id) => {
    try {
      await orderSummariesApi.deleteOne(id);
      setSavedSummaries(prev => { const n = prev.filter(r => r.id !== id); if (!n.length) setUpKey2(k => k+1); return n; });
      toast.success('Row deleted ✓');
    } catch (e) { toast.error('Delete failed: ' + e.message); }
  };
  const handleDeleteTransaction = async (id) => {
    try {
      await orderTransactionsApi.deleteOne(id);
      setSavedTransactions(prev => { const n = prev.filter(r => r.id !== id); if (!n.length) setUpKey3(k => k+1); return n; });
      toast.success('Row deleted ✓');
    } catch (e) { toast.error('Delete failed: ' + e.message); }
  };

  /* ── Clear all ── */
  const handleClearAllItems = async () => {
    if (!window.confirm('Delete ALL order items?')) return;
    try { await orderItemsApi.deleteAll(); setSavedItems([]); setPreview1([]); setUpKey1(k=>k+1); toast.success('All order items cleared'); }
    catch (e) { toast.error(e.message); }
  };
  const handleClearAllSummaries = async () => {
    if (!window.confirm('Delete ALL order summaries?')) return;
    try { await orderSummariesApi.deleteAll(); setSavedSummaries([]); setPreview2([]); setUpKey2(k=>k+1); toast.success('All order summaries cleared'); }
    catch (e) { toast.error(e.message); }
  };
  const handleClearAllTransactions = async () => {
    if (!window.confirm('Delete ALL transaction records?')) return;
    try { await orderTransactionsApi.deleteAll(); setSavedTransactions([]); setPreview3([]); setUpKey3(k=>k+1); toast.success('All transaction records cleared'); }
    catch (e) { toast.error(e.message); }
  };

  /* ── Excel upload / preview ── */
  const handleFile1 = async (file) => {
    setUploading1(true); setPreview1([]); setImportResult1(null);
    try {
      const rows = await orderItemsApi.preview(file);
      setPreview1(rows || []);
      if (!rows?.length) toast('No data rows found', { icon: '⚠️' });
      else toast.success(`Parsed ${rows.length} rows — review then SAVE TO DB`);
    } catch (e) { toast.error('Parse failed: ' + e.message); }
    finally { setUploading1(false); }
  };
  const handleFile2 = async (file) => {
    setUploading2(true); setPreview2([]); setImportResult2(null);
    try {
      const rows = await orderSummariesApi.preview(file);
      setPreview2(rows || []);
      if (!rows?.length) toast('No data rows found', { icon: '⚠️' });
      else toast.success(`Parsed ${rows.length} rows — review then SAVE TO DB`);
    } catch (e) { toast.error('Parse failed: ' + e.message); }
    finally { setUploading2(false); }
  };
  const handleFile3 = async (file) => {
    setUploading3(true); setPreview3([]); setImportResult3(null);
    try {
      const rows = await orderTransactionsApi.preview(file);
      setPreview3(rows || []);
      if (!rows?.length) toast('No data rows found', { icon: '⚠️' });
      else toast.success(`Parsed ${rows.length} rows — review then UPSERT TO DB`);
    } catch (e) { toast.error('Parse failed: ' + e.message); }
    finally { setUploading3(false); }
  };

  /* ── Save / upsert ── */
  const handleSave1 = async () => {
    if (!preview1.length) return;
    setSaving1(true);
    const prevCount = savedItems.length;
    try {
      const result = await orderItemsApi.bulkSave(preview1);
      const items = await orderItemsApi.getAll();
      setSavedItems(sortByIdDesc(items));
      setPreview1([]); setUpKey1(k=>k+1);
      setImportResult1(result);
      const inserted = items.length - prevCount;
      const skipped  = preview1.length - Math.max(0, inserted);
      if (inserted === 0) {
        toast(`All ${preview1.length} rows already exist — nothing imported`, { icon: '⚠️' });
      } else if (skipped > 0) {
        toast(`${inserted} new rows added, ${skipped} already existed`, { icon: '⚠️' });
      } else {
        toast.success(`${inserted} rows imported successfully`);
      }
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving1(false); }
  };
  const handleSave2 = async () => {
    if (!preview2.length) return;
    setSaving2(true);
    const prevCount = savedSummaries.length;
    try {
      const result = await orderSummariesApi.bulkSave(preview2);
      const summaries = await orderSummariesApi.getAll();
      setSavedSummaries(sortByIdDesc(summaries || []));
      setPreview2([]); setUpKey2(k=>k+1);
      setImportResult2(result);
      const inserted = summaries.length - prevCount;
      const skipped  = preview2.length - Math.max(0, inserted);
      if (inserted === 0) {
        toast(`All ${preview2.length} rows already exist — nothing imported`, { icon: '⚠️' });
      } else if (skipped > 0) {
        toast(`${inserted} new rows added, ${skipped} already existed`, { icon: '⚠️' });
      } else {
        toast.success(`${inserted} rows imported successfully`);
      }
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving2(false); }
  };
  const handleSave3 = async () => {
    if (!preview3.length) return;
    setSaving3(true);
    const prevCount = savedTransactions.length;
    try {
      const result = await orderTransactionsApi.bulkUpsert(preview3);
      const transactions = await orderTransactionsApi.getAll();
      setSavedTransactions(sortByIdDesc(transactions || []));
      setPreview3([]); setUpKey3(k=>k+1);
      setImportResult3(result);
      const inserted = transactions.length - prevCount;
      const skipped  = preview3.length - Math.max(0, inserted);
      if (inserted === 0) {
        toast(`All ${preview3.length} rows already exist — nothing imported`, { icon: '⚠️' });
      } else if (skipped > 0) {
        toast(`${inserted} new rows added, ${skipped} already existed`, { icon: '⚠️' });
      } else {
        toast.success(`${inserted} rows imported successfully`);
      }
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving3(false); }
  };

  const discardPreview1 = () => { setPreview1([]); setUpKey1(k=>k+1); setImportResult1(null); };
  const discardPreview2 = () => { setPreview2([]); setUpKey2(k=>k+1); setImportResult2(null); };
  const discardPreview3 = () => { setPreview3([]); setUpKey3(k=>k+1); setImportResult3(null); };

  const curMode = activeTable === 'T1' ? modeT1 : activeTable === 'T2' ? modeT2 : modeT3;
  const hasSyncedRows = savedSummaries.length > 0 && itemsWithSync.some(r => r.comments || r.status);

  /* ════════════════════════════════════════════════ RENDER ════════════════ */
  return (
    <div style={{ maxWidth:1440, margin:'0 auto', padding:'28px 24px' }}>

      {/* Heading */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:900, color:'#ecfdf5', letterSpacing:-1 }}>
          Data Entry
        </h1>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:4 }}>
          <p style={{ margin:0, fontSize:10, color:'#2d4a3a', letterSpacing:2 }}>
            ORDERS &amp; REVENUE MANAGEMENT SYSTEM
          </p>
          {!isAdmin && (
            <span style={{ fontSize:10, color:'#fbbf24', background:'rgba(234,179,8,0.08)',
              border:'1px solid rgba(234,179,8,0.2)', borderRadius:6, padding:'2px 8px' }}>
              👤 USER — can edit Status / Comments / Remark
            </span>
          )}
        </div>
      </div>

      {/* Table tabs */}
      <div style={{ display:'flex', alignItems:'center', borderBottom:'1px solid #1a3028', marginBottom:24 }}>
        <TableTab active={activeTable==='T1'} onClick={()=>setActiveTable('T1')}>
          📋 Table 1 — Orders / Parts
        </TableTab>
        <TableTab active={activeTable==='T2'} onClick={()=>setActiveTable('T2')}>
          📊 Table 2 — Order Summary
        </TableTab>
        <TableTab active={activeTable==='T3'} onClick={()=>setActiveTable('T3')}>
          🧾 Table 3 — Transactions
        </TableTab>
        <div style={{ marginLeft:'auto', paddingBottom:6 }}>
          <Btn variant="ghost" onClick={loadSaved} disabled={dbLoading}>
            <RefreshCw size={12} style={dbLoading ? { animation:'spin 0.8s linear infinite' } : {}} />
            {dbLoading ? 'Loading…' : 'Refresh DB'}
          </Btn>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:22 }}>
        <ModeTab
          active={curMode==='manual'}
          onClick={()=> activeTable==='T1' ? setModeT1('manual') : activeTable==='T2' ? setModeT2('manual') : setModeT3('manual')}>
          📝 Manual Entry
        </ModeTab>
        <ModeTab
          active={curMode==='excel'}
          onClick={()=> activeTable==='T1' ? setModeT1('excel') : activeTable==='T2' ? setModeT2('excel') : setModeT3('excel')}>
          📂 Excel Upload
        </ModeTab>
      </div>

      {/* ════ TABLE 1 ════ */}
      {activeTable==='T1' && (
        <>
          {modeT1==='manual' && (
            <SectionCard title="Manual Entry — Table 1 (Orders / Parts)">
              <ManualEntryForm tableType="T1" onAdd={handleManualAdd} loading={manualSaving} role={role} />
            </SectionCard>
          )}

          {modeT1==='excel' && (
            <SectionCard title="Excel Upload — Table 1 (Orders / Parts)">
              <FileUploadZone
                uploadKey={upKey1}
                label="Upload Orders / Parts Excel (.xlsx / .xls)"
                hint="Expected columns: Dealer Code · Order Number · Part No · Part Desc · Qty Requested · Value · Order Status…"
                onFile={handleFile1}
                loading={uploading1}
              />
              <ImportSummaryPanel result={importResult1} onDismiss={() => setImportResult1(null)} />
              {preview1.length > 0 && (
                <div style={{ marginTop:24 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:11, color:'#6ee7b7', fontWeight:700, letterSpacing:1 }}>
                      PREVIEW — {preview1.length} ROWS (NOT SAVED)
                    </span>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn variant="ghost" size="sm" onClick={discardPreview1}><XCircle size={12}/> DISCARD</Btn>
                      <Btn variant="save" size="sm" onClick={handleSave1} disabled={saving1}>
                        <Save size={12}/>{saving1 ? 'SAVING…' : 'SAVE TO DB'}
                      </Btn>
                    </div>
                  </div>
                  <PreviewBanner />
                  <DataTable rows={preview1} cols={TABLE1_COLS} showActions={false} emptyMsg="" role={role} />
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard
            title="Saved — Order Items (Table 1)"
            count={itemsWithSync.length}
            actions={isAdmin && savedItems.length > 0 && (
              <Btn variant="danger" size="sm" onClick={handleClearAllItems}>
                <Trash2 size={11}/> CLEAR ALL
              </Btn>
            )}
          >
            {hasSyncedRows && (
              <div style={{ fontSize:11, marginBottom:10, padding:'6px 12px', borderRadius:6,
                background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.18)', color:'#4ade80' }}>
                🔄 Status / Comments are live-synced from Table 2 by Order Number.
              </div>
            )}
            <DataTable
              rows={itemsWithSync}
              cols={TABLE1_COLS}
              onSave={handleUpdateItem}
              onDelete={handleDeleteItem}
              onStatusChange={handleStatusChangeItem}
              emptyMsg="No order items yet. Use Manual Entry or Excel Upload above."
              role={role}
            />
          </SectionCard>
        </>
      )}

      {/* ════ TABLE 2 ════ */}
      {activeTable==='T2' && (
        <>
          {modeT2==='manual' && (
            <SectionCard title="Manual Entry — Table 2 (Order Summary / Finance)">
              <ManualEntryForm tableType="T2" onAdd={handleManualAdd} loading={manualSaving} role={role} />
            </SectionCard>
          )}

          {modeT2==='excel' && (
            <SectionCard title="Excel Upload — Table 2 (Order Summary / Finance)">
              <FileUploadZone
                uploadKey={upKey2}
                label="Upload Order Summary Excel (.xlsx / .xls)"
                hint="Expected columns: Order # · GSTIN · Priority Colour · Order Value · Comments · Expiry Date · Status…"
                onFile={handleFile2}
                loading={uploading2}
              />
              <ImportSummaryPanel result={importResult2} onDismiss={() => setImportResult2(null)} />
              {preview2.length > 0 && (
                <div style={{ marginTop:24 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:11, color:'#a78bfa', fontWeight:700, letterSpacing:1 }}>
                      PREVIEW — {preview2.length} ROWS (NOT SAVED)
                    </span>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn variant="ghost" size="sm" onClick={discardPreview2}><XCircle size={12}/> DISCARD</Btn>
                      <Btn variant="save" size="sm" onClick={handleSave2} disabled={saving2}>
                        <Save size={12}/>{saving2 ? 'SAVING…' : 'SAVE TO DB'}
                      </Btn>
                    </div>
                  </div>
                  <PreviewBanner />
                  <DataTable rows={preview2} cols={TABLE2_COLS} showActions={false} emptyMsg="" role={role} />
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard
            title="Saved — Order Summaries (Table 2)"
            count={savedSummaries.length}
            actions={isAdmin && savedSummaries.length > 0 && (
              <Btn variant="danger" size="sm" onClick={handleClearAllSummaries}>
                <Trash2 size={11}/> CLEAR ALL
              </Btn>
            )}
          >
            <div style={{ fontSize:11, marginBottom:10, padding:'6px 12px', borderRadius:6,
              background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.18)', color:'#a78bfa' }}>
              📡 Status changes here sync immediately to Table 1 and Table 3.
            </div>
            <DataTable
              rows={savedSummaries}
              cols={TABLE2_COLS}
              onSave={handleUpdateSummary}
              onDelete={handleDeleteSummary}
              onStatusChange={handleStatusChangeSummary}
              emptyMsg="No order summaries yet. Use Manual Entry or Excel Upload above."
              role={role}
            />
          </SectionCard>
        </>
      )}

      {/* ════ TABLE 3 ════ */}
      {activeTable==='T3' && (
        <>
          {modeT3==='manual' && (
            <SectionCard title="Manual Entry — Table 3 (Transactions)">
              <div style={{ fontSize:11, marginBottom:12, padding:'6px 12px', borderRadius:6,
                background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.18)', color:'#93c5fd' }}>
                📝 Order Number + Part Number combination must be unique.
              </div>
              <ManualEntryForm tableType="T3" onAdd={handleManualAdd} loading={manualSaving} />
            </SectionCard>
          )}

          {modeT3==='excel' && (
            <SectionCard title="Excel Upload — Table 3 (Transactions)">
              <div style={{ fontSize:11, marginBottom:12, padding:'6px 12px', borderRadius:6,
                background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.18)', color:'#93c5fd' }}>
                📤 Rows with an existing Order # + Part # combination will be skipped.
              </div>
              <FileUploadZone
                uploadKey={upKey3}
                label="Upload Transactions Excel (.xlsx / .xls)"
                hint="Expected columns: Order # · CGST · SGST · IGST · Part Description · SAP Invoice # · Total Invoice Amount…"
                onFile={handleFile3}
                loading={uploading3}
              />
              <ImportSummaryPanel result={importResult3} onDismiss={() => setImportResult3(null)} />
              {preview3.length > 0 && (
                <div style={{ marginTop:24 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontSize:11, color:'#93c5fd', fontWeight:700, letterSpacing:1 }}>
                      PREVIEW — {preview3.length} ROWS (NOT SAVED)
                    </span>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn variant="ghost" size="sm" onClick={discardPreview3}><XCircle size={12}/> DISCARD</Btn>
                      <Btn variant="save" size="sm" onClick={handleSave3} disabled={saving3}>
                        <Save size={12}/>{saving3 ? 'SAVING…' : 'UPSERT TO DB'}
                      </Btn>
                    </div>
                  </div>
                  <PreviewBanner />
                  <DataTable rows={preview3} cols={TABLE3_COLS} showActions={false} emptyMsg="" role={role} />
                </div>
              )}
            </SectionCard>
          )}

          <SectionCard
            title="Saved — Transactions (Table 3)"
            count={transactionsWithSync.length}
            actions={isAdmin && savedTransactions.length > 0 && (
              <Btn variant="danger" size="sm" onClick={handleClearAllTransactions}>
                <Trash2 size={11}/> CLEAR ALL
              </Btn>
            )}
          >
            <div style={{ fontSize:11, marginBottom:10, padding:'6px 12px', borderRadius:6,
              background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.18)', color:'#93c5fd' }}>
              🔄 Status is live-synced from Table 2 by Order Number. Changing status here also updates Table 2.
            </div>
            <DataTable
              rows={transactionsWithSync}
              cols={TABLE3_COLS}
              onSave={handleUpdateTransaction}
              onDelete={handleDeleteTransaction}
              onStatusChange={handleStatusChangeTransaction}
              emptyMsg="No transaction records yet. Upload an Excel file above."
              role={role}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
