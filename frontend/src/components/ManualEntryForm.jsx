import React, { useState, useRef } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { STATUS_OPTIONS } from '../utils/columns';

/* ── T1 fields matching OrderItem entity ── */
const FIELDS_T1 = [
  { key:'orderNumber',   label:'Order Number',      required:true,  placeholder:'CPPUR-ShrBsr-IP1-2627-000392' },
  { key:'partNo',        label:'Part No',            required:true,  placeholder:'257581100101' },
  { key:'dealerCode',    label:'Dealer Code',        required:false, placeholder:'2089314' },
  { key:'dealer',        label:'Dealer Name',        required:false, placeholder:'SHREE BALAJI SERVICES' },
  { key:'division',      label:'Division',           required:false, placeholder:'Division' },
  { key:'partnerType',   label:'Partner Type',       required:false, placeholder:'' },
  { key:'orderDate',     label:'Order Date',         required:false, type:'date' },
  { key:'orderType',     label:'Order Type',         required:false, placeholder:'' },
  { key:'orderSubType',  label:'Order Sub-Type',     required:false, placeholder:'' },
  { key:'orderStatus',   label:'Order Status',       required:false, placeholder:'' },
  { key:'distributorName', label:'Distributor Name', required:false, placeholder:'' },
  { key:'distributorCode', label:'Distributor Code', required:false, placeholder:'' },
  { key:'partDesc',      label:'Part Desc',          required:false, placeholder:'SUNVISOR RH' },
  { key:'qtyRequested',  label:'Qty Requested',      required:false, placeholder:'2' },
  { key:'value',         label:'Value (₹)',          required:false, placeholder:'1164' },
  { key:'requestedQtyValue', label:'Req. Qty Value', required:false, placeholder:'' },
  { key:'receivedQtyValue',  label:'Rcvd Qty Value', required:false, placeholder:'' },
  { key:'receivedQty',   label:'Received Qty',       required:false, placeholder:'' },
  { key:'pendingQty',    label:'Pending Qty',        required:false, placeholder:'' },
  { key:'pendingDays',   label:'Pending Days',       required:false, placeholder:'' },
];

/* ── T2 fields matching OrderSummary entity ── */
const FIELDS_T2 = [
  { key:'orderNumber',               label:'Order Number',            required:true,  placeholder:'CPPUR-ShrBsr-IP1-2627-TOP0260' },
  { key:'status',                    label:'Status',                  required:false, type:'status_select' },
  { key:'comments',                  label:'Comments',                required:false, textarea:true, placeholder:'Enter any notes here' },
  { key:'remark',                    label:'Remark',                  required:false, textarea:true, placeholder:'Internal remark' },
  { key:'orderPartsDiscount',        label:'Parts Discount',          required:false, placeholder:'' },
  { key:'orderPartsDiscountPct',     label:'Parts Disc %',            required:false, placeholder:'' },
  { key:'orderValue',                label:'Order Value',             required:false, placeholder:'81691.79' },
  { key:'otherPartsChargeAmount',    label:'Other Parts Charge',      required:false, placeholder:'' },
  { key:'otherPartsChargePct',       label:'Other Parts Chg %',       required:false, placeholder:'' },
  { key:'lineItemsTotal',            label:'Line Items Total',        required:false, placeholder:'' },
  { key:'totalLineItemDiscountAmount',label:'Line Discount Amt',      required:false, placeholder:'' },
  { key:'mrcTotal',                  label:'MRC Total',               required:false, placeholder:'' },
  { key:'nrcTotal',                  label:'NRC Total',               required:false, placeholder:'' },
  { key:'expiryDate',                label:'Expiry Date',             required:false, type:'date' },
  { key:'gstin',                     label:'GSTIN',                   required:false, placeholder:'23ACDFA6179M1Z4' },
  { key:'channelType',               label:'Channel Type',            required:false, placeholder:'' },
  { key:'priorityColour',            label:'Priority Colour',         required:false, placeholder:'Green / Red / Yellow / Black' },
  { key:'billToAccount',             label:'Bill To Account',         required:false, placeholder:'' },
  { key:'billingAccount',            label:'Billing Account',         required:false, placeholder:'' },
  { key:'returnToAccount',           label:'Return To Account',       required:false, placeholder:'' },
  { key:'shipToAccount',             label:'Ship To Account',         required:false, placeholder:'' },
  { key:'primaryPayerAccount',       label:'Primary Payer',           required:false, placeholder:'' },
  { key:'orderFor',                  label:'Order For',               required:false, placeholder:'' },
  { key:'orderSubType',              label:'Sub-Type',                required:false, placeholder:'' },
  { key:'payToAccount',              label:'Pay To Account',          required:false, placeholder:'' },
  { key:'revision',                  label:'Revision',                required:false, placeholder:'' },
  { key:'orderDate',                 label:'Order Date',              required:false, type:'date' },
  { key:'transporterName',           label:'Transporter Name',        required:false, placeholder:'' },
  { key:'consignmentDocket',         label:'Consignment Docket',      required:false, placeholder:'' },
  { key:'type',                      label:'Type',                    required:false, placeholder:'Purchase Order' },
  { key:'division',                  label:'Division',                required:false, placeholder:'' },
  { key:'lastName',                  label:'Last Name',               required:false, placeholder:'' },
  { key:'firstName',                 label:'First Name',              required:false, placeholder:'' },
  { key:'priority',                  label:'Priority',                required:false, placeholder:'' },
  { key:'priceList',                 label:'Price List',              required:false, placeholder:'' },
  { key:'organization',              label:'Organization',            required:false, placeholder:'' },
  { key:'testDocument',              label:'Test Document',           required:false, placeholder:'' },
];

/* ── T3 fields matching OrderTransaction entity ── */
const FIELDS_T3 = [
  { key:'orderNumber',              label:'Order #',                    required:true,  placeholder:'CPPUR-ShrBsr-IP1-2627-000392' },
  { key:'status',                   label:'Status',                     required:false, type:'status_select' },
  { key:'partDescription',          label:'Part Description',           required:false, placeholder:'SUNVISOR RH' },
  { key:'partNo',                   label:'Part #',                     required:false, placeholder:'257581100101' },
  { key:'orderType',                label:'Order Type',                 required:false, placeholder:'' },
  { key:'sparesOrderType',          label:'Spares Order Type',          required:false, placeholder:'' },
  { key:'vendorName',               label:'Vendor Name',                required:false, placeholder:'' },
  { key:'vendorInvoice',            label:'Vendor Invoice #',           required:false, placeholder:'' },
  { key:'sapInvoice',               label:'SAP Invoice #',              required:false, placeholder:'' },
  { key:'sapOrderNum',              label:'SAP Order Num',              required:false, placeholder:'' },
  { key:'totalInvoiceAmount',       label:'Total Invoice Amount',       required:false, placeholder:'' },
  { key:'netAmount',                label:'Net Amount',                 required:false, placeholder:'' },
  { key:'totalTaxAmount',           label:'Total Tax Amount',           required:false, placeholder:'' },
  { key:'cgst',                     label:'CGST',                       required:false, placeholder:'' },
  { key:'sgst',                     label:'SGST',                       required:false, placeholder:'' },
  { key:'igst',                     label:'IGST',                       required:false, placeholder:'' },
  { key:'utgst',                    label:'UTGST',                      required:false, placeholder:'' },
  { key:'gstInvoice',               label:'GST Invoice #',              required:false, placeholder:'' },
  { key:'irnStatus',                label:'IRN Status',                 required:false, placeholder:'' },
  { key:'irnDate',                  label:'IRN Date',                   required:false, type:'date' },
  { key:'irnAckDate',               label:'IRN Ack Date',               required:false, type:'date' },
  { key:'irn',                      label:'IRN',                        required:false, placeholder:'' },
  { key:'tcsAmount',                label:'TCS Amount',                 required:false, placeholder:'' },
  { key:'transporterName',          label:'Transporter Name',           required:false, placeholder:'' },
  { key:'lrDate',                   label:'LR Date',                    required:false, type:'date' },
  { key:'lrNumber',                 label:'LR Number',                  required:false, placeholder:'' },
  { key:'cashDiscount',             label:'Cash Discount',              required:false, placeholder:'' },
  { key:'cashDiscountPercentage',   label:'Cash Discount %',            required:false, placeholder:'' },
  { key:'commitFlag',               label:'Commit Flag',                required:false, placeholder:'' },
  { key:'discountPerPart',          label:'Discount Per Part',          required:false, placeholder:'' },
  { key:'discountPerPartPercentage',label:'Discount Per Part %',        required:false, placeholder:'' },
  { key:'weightedAvg',              label:'Weighted Avg',               required:false, placeholder:'' },
  { key:'movementType',             label:'Movement Type',              required:false, placeholder:'' },
  { key:'discountAmount',           label:'Discount Amount',            required:false, placeholder:'' },
  { key:'otherChargesAmount',       label:'Other Charges Amount',       required:false, placeholder:'' },
  { key:'vat',                      label:'VAT',                        required:false, placeholder:'' },
  { key:'transactionDate',          label:'Transaction Date',           required:false, type:'date' },
  { key:'transactionNumber',        label:'Transaction Number',         required:false, placeholder:'' },
  { key:'challanQuantity',          label:'Challan Quantity',           required:false, placeholder:'' },
  { key:'wareHouseName',            label:'Ware House Name',            required:false, placeholder:'' },
  { key:'recdQty',                  label:'Recd Qty',                   required:false, placeholder:'' },
  { key:'condition',                label:'Condition',                  required:false, placeholder:'' },
  { key:'tmAccount',                label:'TM Account',                 required:false, placeholder:'' },
  { key:'tmAcctType',               label:'TM Acct Type',               required:false, placeholder:'' },
  { key:'additionalTax',            label:'Additional Tax',             required:false, placeholder:'' },
  { key:'challanDate',              label:'Challan Date',               required:false, type:'date' },
  { key:'challanNo',                label:'Challan #',                  required:false, placeholder:'' },
  { key:'cst',                      label:'CST',                        required:false, placeholder:'' },
  { key:'cstSurcharge',             label:'CST Surcharge',              required:false, placeholder:'' },
  { key:'cstVat',                   label:'CST VAT',                    required:false, placeholder:'' },
  { key:'divisionName',             label:'Division Name',              required:false, placeholder:'' },
  { key:'lineItemInvoiceTotal',     label:'Line Item Invoice Total',    required:false, placeholder:'' },
  { key:'invoiceDate',              label:'Invoice Date',               required:false, type:'date' },
  { key:'lst',                      label:'LST',                        required:false, placeholder:'' },
  { key:'lstSurcharge',             label:'LST Surcharge',              required:false, placeholder:'' },
  { key:'octroi',                   label:'Octroi',                     required:false, placeholder:'' },
  { key:'purchaseOrderDate',        label:'Purchase Order Date',        required:false, type:'date' },
  { key:'tmOrderFor',               label:'TM Order For',               required:false, placeholder:'' },
  { key:'payerCode',                label:'Payer Code',                 required:false, placeholder:'' },
  { key:'tot',                      label:'TOT',                        required:false, placeholder:'' },
];

function getFields(tableType) {
  if (tableType === 'T1') return FIELDS_T1;
  if (tableType === 'T2') return FIELDS_T2;
  return FIELDS_T3;
}

function makeEmpty(fields) {
  const e = {};
  fields.forEach(f => { e[f.key] = f.type === 'status_select' ? 'Pending Approval' : ''; });
  return e;
}

const inputStyle = (err) => ({
  width:'100%', background:'rgba(9,22,17,0.8)',
  border:`1px solid ${err ? '#f87171' : '#1e3a2a'}`,
  borderRadius:8, padding:'9px 12px', color:'#d1fae5',
  fontSize:12, outline:'none', boxSizing:'border-box',
  fontFamily:"'DM Mono',monospace", transition:'border-color 0.2s',
});

export default function ManualEntryForm({ onAdd, loading, tableType = 'T1' }) {
  const fields    = getFields(tableType);
  const emptyForm = makeEmpty(fields);

  const [form,   setForm]   = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false);

  const validate = () => {
    const e = {};
    fields.filter(f => f.required).forEach(f => { if (!form[f.key]?.trim()) e[f.key] = 'Required'; });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (submittingRef.current || loading) return;
    if (!validate()) {
      toast.error('Please fill in all required fields (marked with *)');
      return;
    }
    submittingRef.current = true;
    try {
      await onAdd({ ...form });
      setForm(emptyForm);
      setErrors({});
    } catch {
      // error already shown by caller via toast
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12, marginBottom:18 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:1.5,
              color: errors[f.key] ? '#f87171' : '#6ee7b7',
              textTransform:'uppercase', marginBottom:5 }}>
              {f.label} {f.required && <span style={{ color:'#f87171' }}>*</span>}
            </label>

            {f.textarea ? (
              <textarea value={form[f.key]}
                onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder} rows={2}
                style={{ ...inputStyle(errors[f.key]), resize:'vertical' }}
                onFocus={e => { e.target.style.borderColor = '#059669'; }}
                onBlur={e => { e.target.style.borderColor = errors[f.key] ? '#f87171' : '#1e3a2a'; }} />
            ) : f.type === 'status_select' ? (
              <select value={form[f.key] || 'Pending Approval'}
                onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                style={{ ...inputStyle(errors[f.key]), cursor:'pointer' }}>
                {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={f.type || 'text'}
                value={form[f.key]}
                onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder || ''}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                style={{ ...inputStyle(errors[f.key]) }}
                onFocus={e => { e.target.style.borderColor = '#059669'; }}
                onBlur={e => { e.target.style.borderColor = errors[f.key] ? '#f87171' : '#1e3a2a'; }} />
            )}
            {errors[f.key] && <span style={{ fontSize:10, color:'#f87171' }}>{errors[f.key]}</span>}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10 }}>
        <button onClick={handleSubmit} disabled={loading} style={{
          display:'flex', alignItems:'center', gap:7,
          background: loading ? '#1e3a2a' : 'linear-gradient(135deg,#059669,#047857)',
          border:'none', borderRadius:8, padding:'10px 24px',
          color: loading ? '#4b7a60' : '#fff',
          fontWeight:700, fontSize:12, letterSpacing:1,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily:"'DM Mono',monospace",
        }}>
          {loading ? '⏳ Saving…' : <><Plus size={14}/> ADD &amp; SAVE</>}
        </button>
        <button onClick={() => { setForm(emptyForm); setErrors({}); }} style={{
          display:'flex', alignItems:'center', gap:7,
          background:'transparent', border:'1px solid #1e3a2a',
          borderRadius:8, padding:'10px 18px',
          color:'#4b7a60', fontWeight:700, fontSize:12,
          cursor:'pointer', fontFamily:"'DM Mono',monospace",
        }}>
          <RotateCcw size={13}/> RESET
        </button>
      </div>
    </div>
  );
}
