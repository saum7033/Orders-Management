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
      setSavedItems(items || []);
      setSavedSummaries(summaries || []);
      setSavedTransactions(transactions || []);
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
        const saved = await orderItemsApi.createOne({ ...row, source: 'MANUAL' });
        setSavedItems(prev => [saved, ...prev]);
        toast.success('Row saved to DB ✓');
      } else if (activeTable === 'T2') {
        const saved = await orderSummariesApi.bulkSave([row]);
        if (!saved.length) {
          toast('Order Number already exists — row skipped', { icon: '⚠️' });
        } else {
          setSavedSummaries(prev => [...saved, ...prev]);
          toast.success('Row saved to DB ✓');
        }
      } else {
        const saved = await orderTransactionsApi.bulkUpsert([row]);
        if (!saved.length) {
          toast('No data upserted', { icon: '⚠️' });
        } else {
          setSavedTransactions(prev => {
            const updatedIds = new Set(saved.map(r => r.id));
            const kept = prev.filter(r => !updatedIds.has(r.id));
            return [...saved, ...kept];
          });
          toast.success('Row upserted to DB ✓');
        }
      }
    } catch (e) {
      toast.error('Save failed: ' + e.message);
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
    setUploading1(true); setPreview1([]);
    try {
      const rows = await orderItemsApi.preview(file);
      setPreview1(rows || []);
      if (!rows?.length) toast('No data rows found', { icon: '⚠️' });
      else toast.success(`Parsed ${rows.length} rows — review then SAVE TO DB`);
    } catch (e) { toast.error('Parse failed: ' + e.message); }
    finally { setUploading1(false); }
  };
  const handleFile2 = async (file) => {
    setUploading2(true); setPreview2([]);
    try {
      const rows = await orderSummariesApi.preview(file);
      setPreview2(rows || []);
      if (!rows?.length) toast('No data rows found', { icon: '⚠️' });
      else toast.success(`Parsed ${rows.length} rows — review then SAVE TO DB`);
    } catch (e) { toast.error('Parse failed: ' + e.message); }
    finally { setUploading2(false); }
  };
  const handleFile3 = async (file) => {
    setUploading3(true); setPreview3([]);
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
    try {
      const saved = await orderItemsApi.bulkSave(preview1);
      setSavedItems(prev => [...saved, ...prev]);
      setPreview1([]); setUpKey1(k=>k+1);
      const skipped = preview1.length - saved.length;
      toast.success(skipped > 0 ? `Saved ${saved.length} rows ✓ (${skipped} duplicates skipped)` : `All ${saved.length} rows saved ✓`);
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving1(false); }
  };
  const handleSave2 = async () => {
    if (!preview2.length) return;
    setSaving2(true);
    try {
      const saved = await orderSummariesApi.bulkSave(preview2);
      setSavedSummaries(prev => [...saved, ...prev]);
      setPreview2([]); setUpKey2(k=>k+1);
      const skipped = preview2.length - saved.length;
      toast.success(skipped > 0 ? `Saved ${saved.length} rows ✓ (${skipped} duplicates skipped)` : `All ${saved.length} rows saved ✓`);
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving2(false); }
  };
  const handleSave3 = async () => {
    if (!preview3.length) return;
    setSaving3(true);
    try {
      const saved = await orderTransactionsApi.bulkUpsert(preview3);
      // Replace existing records that were updated, append new ones
      setSavedTransactions(prev => {
        const updatedIds = new Set(saved.map(r => r.id));
        const kept = prev.filter(r => !updatedIds.has(r.id));
        return [...saved, ...kept];
      });
      setPreview3([]); setUpKey3(k=>k+1);
      toast.success(`${saved.length} records upserted ✓`);
    } catch (e) { toast.error('Save failed: ' + e.message); }
    finally { setSaving3(false); }
  };

  const discardPreview1 = () => { setPreview1([]); setUpKey1(k=>k+1); };
  const discardPreview2 = () => { setPreview2([]); setUpKey2(k=>k+1); };
  const discardPreview3 = () => { setPreview3([]); setUpKey3(k=>k+1); };

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
                📝 Entering a row with an existing Order # will update that record (upsert).
              </div>
              <ManualEntryForm tableType="T3" onAdd={handleManualAdd} loading={manualSaving} />
            </SectionCard>
          )}

          {modeT3==='excel' && (
            <SectionCard title="Excel Upload — Table 3 (Transactions)">
              <div style={{ fontSize:11, marginBottom:12, padding:'6px 12px', borderRadius:6,
                background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.18)', color:'#93c5fd' }}>
                📤 Uploading updates existing records by Order # or inserts new ones — no duplicates created.
              </div>
              <FileUploadZone
                uploadKey={upKey3}
                label="Upload Transactions Excel (.xlsx / .xls)"
                hint="Expected columns: Order # · CGST · SGST · IGST · Part Description · SAP Invoice # · Total Invoice Amount…"
                onFile={handleFile3}
                loading={uploading3}
              />
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
