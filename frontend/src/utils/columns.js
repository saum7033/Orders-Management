export const DEFAULT_COL_WIDTH = 140;

// ── TABLE 1 — OrderItem entity fields ONLY ────────────────────────────────
export const TABLE1_COLS = [
  { key: 'orderNumber',       label: 'Order Number',       width: 230 },
  { key: 'partNo',            label: 'Part No',            width: 160 },
  { key: 'dealerCode',        label: 'Dealer Code',        width: 120 },
  { key: 'dealer',            label: 'Dealer',             width: 200 },
  { key: 'division',          label: 'Division',           width: 160 },
  { key: 'partnerType',       label: 'Partner Type',       width: 130 },
  { key: 'orderDate',         label: 'Order Date',         width: 110, type: 'date' },
  { key: 'orderType',         label: 'Order Type',         width: 140 },
  { key: 'orderSubType',      label: 'Sub-Type',           width: 150 },
  { key: 'orderStatus',       label: 'Order Status',       width: 130 },
  { key: 'distributorName',   label: 'Distributor Name',   width: 200 },
  { key: 'distributorCode',   label: 'Distributor Code',   width: 130 },
  { key: 'partDesc',          label: 'Part Desc',          width: 220 },
  { key: 'qtyRequested',      label: 'Qty Requested',      width: 110 },
  { key: 'value',             label: 'Value',              width: 100 },
  { key: 'requestedQtyValue', label: 'Req. Qty Value',     width: 130 },
  { key: 'receivedQtyValue',  label: 'Rcvd Qty Value',     width: 130 },
  { key: 'receivedQty',       label: 'Received Qty',       width: 110 },
  { key: 'pendingQty',        label: 'Pending Qty',        width: 110 },
  { key: 'pendingDays',       label: 'Pending Days',       width: 110 },
  // ── Synced from Table 2 (read-only in T1) ──────────────────────────────
  { key: 'status',            label: 'Status',             width: 140, type: 'status_dropdown' },
  { key: 'comments',          label: 'Comments',           width: 220 },
  // ── Audit ───────────────────────────────────────────────────────────────
  { key: 'source',            label: 'Source',             width: 90 },
];

// ── TABLE 2 — OrderSummary entity fields ONLY ─────────────────────────────
export const TABLE2_COLS = [
  { key: 'orderNumber',                label: 'Order Number',              width: 230 },
  // Editable by both roles
  { key: 'status',                     label: 'Status',                    width: 160, type: 'status_dropdown' },
  { key: 'comments',                   label: 'Comments',                  width: 220 },
  { key: 'remark',                     label: 'Remark',                    width: 220 },
  // Read-only data
  { key: 'orderPartsDiscount',         label: 'Parts Discount',            width: 130 },
  { key: 'orderPartsDiscountPct',      label: 'Parts Disc %',              width: 110 },
  { key: 'orderValue',                 label: 'Order Value',               width: 120 },
  { key: 'otherPartsChargeAmount',     label: 'Other Parts Charge',        width: 150 },
  { key: 'otherPartsChargePct',        label: 'Other Parts Chg %',         width: 140 },
  { key: 'lineItemsTotal',             label: 'Line Items Total',          width: 140 },
  { key: 'totalLineItemDiscountAmount',label: 'Line Discount Amt',         width: 150 },
  { key: 'mrcTotal',                   label: 'MRC Total',                 width: 110 },
  { key: 'nrcTotal',                   label: 'NRC Total',                 width: 110 },
  { key: 'expiryDate',                 label: 'Expiry Date',               width: 120, type: 'date' },
  { key: 'gstin',                      label: 'GSTIN',                     width: 180 },
  { key: 'channelType',                label: 'Channel Type',              width: 130 },
  { key: 'priorityColour',             label: 'Priority Colour',           width: 130 },
  { key: 'billToAccount',              label: 'Bill To Account',           width: 180 },
  { key: 'billingAccount',             label: 'Billing Account',           width: 180 },
  { key: 'returnToAccount',            label: 'Return To Account',         width: 170 },
  { key: 'shipToAccount',              label: 'Ship To Account',           width: 170 },
  { key: 'primaryPayerAccount',        label: 'Primary Payer',             width: 160 },
  { key: 'orderFor',                   label: 'Order For',                 width: 140 },
  { key: 'orderSubType',               label: 'Sub-Type',                  width: 150 },
  { key: 'payToAccount',               label: 'Pay To Account',            width: 160 },
  { key: 'revision',                   label: 'Revision',                  width: 100 },
  { key: 'orderDate',                  label: 'Order Date',                width: 120, type: 'date' },
  { key: 'transporterName',            label: 'Transporter Name',          width: 180 },
  { key: 'consignmentDocket',          label: 'Consignment Docket',        width: 170 },
  { key: 'type',                       label: 'Type',                      width: 140 },
  { key: 'division',                   label: 'Division',                  width: 160 },
  { key: 'lastName',                   label: 'Last Name',                 width: 140 },
  { key: 'firstName',                  label: 'First Name',                width: 140 },
  { key: 'priority',                   label: 'Priority',                  width: 120 },
  { key: 'priceList',                  label: 'Price List',                width: 180 },
  { key: 'organization',               label: 'Organization',              width: 200 },
  { key: 'testDocument',               label: 'Test Document',             width: 140 },
];

export const STATUS_OPTIONS = [
  'Pending Approval',
  'Order Placed',
  'TML Order Placed',
  'Cancelled',
];

export const PRIORITY_COLORS = {
  Green:  { bg: '#14532d', text: '#4ade80', dot: '#22c55e' },
  Red:    { bg: '#450a0a', text: '#f87171', dot: '#ef4444' },
  Yellow: { bg: '#422006', text: '#fbbf24', dot: '#eab308' },
  Black:  { bg: '#1c1917', text: '#a8a29e', dot: '#57534e' },
};

export const STATUS_COLORS = {
  'Pending Approval': { bg: 'rgba(234,179,8,0.15)',   color: '#fbbf24', border: 'rgba(234,179,8,0.35)' },
  'Order Placed':     { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.35)' },
  'TML Order Placed': { bg: 'rgba(139,92,246,0.15)',  color: '#c4b5fd', border: 'rgba(139,92,246,0.35)' },
  'Cancelled':        { bg: 'rgba(239,68,68,0.15)',   color: '#f87171', border: 'rgba(239,68,68,0.35)' },
};

// ── TABLE 3 — OrderTransaction (exact Excel column headers) ──────────────────
export const TABLE3_COLS = [
  { key: 'orderNumber',             label: 'Order #',                     width: 230 },
  { key: 'status',                  label: 'Status',                      width: 160, type: 'status_dropdown' },
  { key: 'partDescription',         label: 'Part Description',            width: 220 },
  { key: 'partNo',                  label: 'Part #',                      width: 160 },
  { key: 'orderType',               label: 'Order Type',                  width: 140 },
  { key: 'sparesOrderType',         label: 'Spares Order Type',           width: 160 },
  { key: 'vendorName',              label: 'Vendor Name',                 width: 200 },
  { key: 'vendorInvoice',           label: 'Vendor Invoice #',            width: 170 },
  { key: 'sapInvoice',              label: 'SAP Invoice #',               width: 160 },
  { key: 'sapOrderNum',             label: 'SAP Order Num',               width: 160 },
  { key: 'totalInvoiceAmount',      label: 'Total_Invoice_Amount',        width: 170 },
  { key: 'netAmount',               label: 'Net Amount',                  width: 130 },
  { key: 'totalTaxAmount',          label: 'Total_Tax_Amount',            width: 150 },
  { key: 'cgst',                    label: 'CGST',                        width: 110 },
  { key: 'sgst',                    label: 'SGST',                        width: 110 },
  { key: 'igst',                    label: 'IGST',                        width: 110 },
  { key: 'utgst',                   label: 'UTGST',                       width: 110 },
  { key: 'gstInvoice',              label: 'GST Invoice #',               width: 160 },
  { key: 'irnStatus',               label: 'IRN Status',                  width: 130 },
  { key: 'irnDate',                 label: 'IRN Date',                    width: 130 },
  { key: 'irnAckDate',              label: 'IRN Ack Date',                width: 130 },
  { key: 'irn',                     label: 'IRN',                         width: 180 },
  { key: 'tcsAmount',               label: 'TCS Amount',                  width: 120 },
  { key: 'transporterName',         label: 'Transporter Name',            width: 180 },
  { key: 'lrDate',                  label: 'LR Date',                     width: 120 },
  { key: 'lrNumber',                label: 'LR Number',                   width: 140 },
  { key: 'cashDiscount',            label: 'Cash Discount',               width: 130 },
  { key: 'cashDiscountPercentage',  label: 'Cash Discount Percentage',    width: 180 },
  { key: 'commitFlag',              label: 'Commit Flag',                 width: 120 },
  { key: 'discountPerPart',         label: 'Discount Per Part',           width: 150 },
  { key: 'discountPerPartPercentage', label: 'Discount Per Part Percentage', width: 200 },
  { key: 'weightedAvg',             label: 'Weighted Avg',                width: 130 },
  { key: 'movementType',            label: 'Movement Type',               width: 140 },
  { key: 'discountAmount',          label: 'Discount Amount',             width: 150 },
  { key: 'otherChargesAmount',      label: 'Other Charges Amount',        width: 170 },
  { key: 'vat',                     label: 'VAT',                         width: 100 },
  { key: 'transactionDate',         label: 'Transaction Date',            width: 150 },
  { key: 'transactionNumber',       label: 'Transaction Number',          width: 160 },
  { key: 'challanQuantity',         label: 'Challan Quantity',            width: 140 },
  { key: 'wareHouseName',           label: 'Ware House Name',             width: 170 },
  { key: 'recdQty',                 label: 'Recd Qty',                    width: 110 },
  { key: 'condition',               label: 'Condition',                   width: 120 },
  { key: 'tmAccount',               label: 'TM Account',                  width: 200 },
  { key: 'tmAcctType',              label: 'TM Acct Type',                width: 130 },
  { key: 'additionalTax',           label: 'Additional Tax',              width: 130 },
  { key: 'challanDate',             label: 'Challan Date',                width: 130 },
  { key: 'challanNo',               label: 'Challan #',                   width: 130 },
  { key: 'cst',                     label: 'CST',                         width: 100 },
  { key: 'cstSurcharge',            label: 'CST Surcharge',               width: 130 },
  { key: 'cstVat',                  label: 'CST VAT',                     width: 110 },
  { key: 'divisionName',            label: 'Division Name',               width: 150 },
  { key: 'lineItemInvoiceTotal',    label: 'Line Item Invoice Total',      width: 180 },
  { key: 'invoiceDate',             label: 'Invoice_Date',                width: 140 },
  { key: 'lst',                     label: 'LST',                         width: 100 },
  { key: 'lstSurcharge',            label: 'LST Surcharge',               width: 130 },
  { key: 'octroi',                  label: 'Octroi',                      width: 110 },
  { key: 'purchaseOrderDate',       label: 'Purchase_Order_Date',         width: 170 },
  { key: 'tmOrderFor',              label: 'TM Order For',                width: 150 },
  { key: 'payerCode',               label: 'Payer Code',                  width: 130 },
  { key: 'tot',                     label: 'TOT',                         width: 100 },
];

export function extractDate(val) {
  if (!val) return '';
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toLocaleDateString('en-IN');
  return String(val).split(/[ T]/)[0];
}

export function extractTime(val) {
  if (!val) return '';
  const d = new Date(val);
  if (!isNaN(d.getTime()))
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const parts = String(val).split(/[ T]/);
  return parts.length > 1 ? parts[1].split('.')[0] : '';
}

export function getSourceKey(col) {
  return col.key.replace('Time', 'Date');
}
