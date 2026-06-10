package com.orders.service;


import com.orders.dto.OrderItemDTO;
import com.orders.dto.OrderSummaryDTO;
import com.orders.dto.OrderTransactionDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class ExcelParserService {

    // ── Table 1 column header mapping ────────────────────────────────────────
    private static final Map<String, String> T1_MAP = new LinkedHashMap<>();
    static {
        T1_MAP.put("dealer code",          "dealerCode");
        T1_MAP.put("dealer",               "dealer");
        T1_MAP.put("division",             "division");
        T1_MAP.put("partner type",         "partnerType");
        T1_MAP.put("order date",           "orderDate");
        T1_MAP.put("order number",         "orderNumber");
        T1_MAP.put("order type",           "orderType");
        T1_MAP.put("order sub-type",       "orderSubType");
        T1_MAP.put("order status",         "orderStatus");
        T1_MAP.put("distributor name",     "distributorName");
        T1_MAP.put("distributor code",     "distributorCode");
        T1_MAP.put("part no",              "partNo");
        T1_MAP.put("part desc",            "partDesc");
        T1_MAP.put("qty requested",        "qtyRequested");
        T1_MAP.put("value",                "value");
        T1_MAP.put("requested qty value",  "requestedQtyValue");
        T1_MAP.put("received qty value",   "receivedQtyValue");
        T1_MAP.put("received qty",         "receivedQty");
        T1_MAP.put("pending qty",          "pendingQty");
        T1_MAP.put("pending days",         "pendingDays");
        T1_MAP.put("status",               "status");
    }

    // ── Table 2 column header mapping ────────────────────────────────────────
    private static final Map<String, String> T2_MAP = new LinkedHashMap<>();
    static {
        T2_MAP.put("order #",                        "orderNumber");
        T2_MAP.put("expiry date",                    "expiryDate");
        T2_MAP.put("gstin",                          "gstin");
        T2_MAP.put("channel type",                   "channelType");
        T2_MAP.put("priority colour",                "priorityColour");
        T2_MAP.put("bill to account",                "billToAccount");
        T2_MAP.put("billing account",                "billingAccount");
        T2_MAP.put("comments",                       "comments");
        T2_MAP.put("return to account",              "returnToAccount");
        T2_MAP.put("ship to account",                "shipToAccount");
        T2_MAP.put("primary payer account",          "primaryPayerAccount");
        T2_MAP.put("mrc total",                      "mrcTotal");
        T2_MAP.put("nrc total",                      "nrcTotal");
        T2_MAP.put("order parts discount",           "orderPartsDiscount");
        T2_MAP.put("order parts discount %",         "orderPartsDiscountPct");
        T2_MAP.put("order value",                    "orderValue");
        T2_MAP.put("other parts charge amount",      "otherPartsChargeAmount");
        T2_MAP.put("other parts charge %",           "otherPartsChargePct");
        T2_MAP.put("line items total",               "lineItemsTotal");
        T2_MAP.put("total line item discount amount","totalLineItemDiscountAmount");
        T2_MAP.put("order for",                      "orderFor");
        T2_MAP.put("order subtype",                  "orderSubType");
        T2_MAP.put("pay to account",                 "payToAccount");
        T2_MAP.put("revision",                       "revision");
        T2_MAP.put("order date",                     "orderDate");
        T2_MAP.put("transporter name",               "transporterName");
        T2_MAP.put("consignment/docket #",           "consignmentDocket");
        T2_MAP.put("type",                           "type");
        T2_MAP.put("status",                         "status");
        T2_MAP.put("division",                       "division");
        T2_MAP.put("last name",                      "lastName");
        T2_MAP.put("first name",                     "firstName");
        T2_MAP.put("priority",                       "priority");
        T2_MAP.put("price list",                     "priceList");
        T2_MAP.put("organization",                   "organization");
        T2_MAP.put("test document",                  "testDocument");
    }

    // ─────────────────────────────────────────────────────────────────────────

    public List<OrderItemDTO> parseTable1(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = parseGeneric(file, T1_MAP);
        List<OrderItemDTO> result = new ArrayList<>();
        for (Map<String, String> row : rows) {
            String orderNo = row.getOrDefault("orderNumber", "").trim();
            String partNo  = row.getOrDefault("partNo", "").trim();
            if (orderNo.isEmpty() && partNo.isEmpty()) continue; // skip blank rows

            result.add(OrderItemDTO.builder()
                    .orderNumber(orderNo)
                    .partNo(partNo)
                    .dealerCode(row.getOrDefault("dealerCode", ""))
                    .dealer(row.getOrDefault("dealer", ""))
                    .division(row.getOrDefault("division", ""))
                    .partnerType(row.getOrDefault("partnerType", ""))
                    .orderDate(row.getOrDefault("orderDate", ""))
                    .orderType(row.getOrDefault("orderType", ""))
                    .orderSubType(row.getOrDefault("orderSubType", ""))
                    .orderStatus(row.getOrDefault("orderStatus", ""))
                    .distributorName(row.getOrDefault("distributorName", ""))
                    .distributorCode(row.getOrDefault("distributorCode", ""))
                    .partDesc(row.getOrDefault("partDesc", ""))
                    .qtyRequested(row.getOrDefault("qtyRequested", ""))
                    .value(row.getOrDefault("value", ""))
                    .requestedQtyValue(row.getOrDefault("requestedQtyValue", ""))
                    .receivedQtyValue(row.getOrDefault("receivedQtyValue", ""))
                    .receivedQty(row.getOrDefault("receivedQty", ""))
                    .pendingQty(row.getOrDefault("pendingQty", ""))
                    .pendingDays(row.getOrDefault("pendingDays", ""))
                    .status(row.getOrDefault("status", ""))
                    .source("EXCEL")
                    .build());
        }
        return result;
    }

    public List<OrderSummaryDTO> parseTable2(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = parseGeneric(file, T2_MAP);
        List<OrderSummaryDTO> result = new ArrayList<>();
        for (Map<String, String> row : rows) {
            String orderNo = row.getOrDefault("orderNumber", "").trim();
            if (orderNo.isEmpty()) continue;

            result.add(OrderSummaryDTO.builder()
                    .orderNumber(orderNo)
                    .orderPartsDiscount(row.getOrDefault("orderPartsDiscount", ""))
                    .orderPartsDiscountPct(row.getOrDefault("orderPartsDiscountPct", ""))
                    .orderValue(row.getOrDefault("orderValue", ""))
                    .otherPartsChargeAmount(row.getOrDefault("otherPartsChargeAmount", ""))
                    .otherPartsChargePct(row.getOrDefault("otherPartsChargePct", ""))
                    .lineItemsTotal(row.getOrDefault("lineItemsTotal", ""))
                    .totalLineItemDiscountAmount(row.getOrDefault("totalLineItemDiscountAmount", ""))
                    .mrcTotal(row.getOrDefault("mrcTotal", ""))
                    .nrcTotal(row.getOrDefault("nrcTotal", ""))
                    .expiryDate(row.getOrDefault("expiryDate", ""))
                    .gstin(row.getOrDefault("gstin", ""))
                    .channelType(row.getOrDefault("channelType", ""))
                    .priorityColour(row.getOrDefault("priorityColour", ""))
                    .billToAccount(row.getOrDefault("billToAccount", ""))
                    .billingAccount(row.getOrDefault("billingAccount", ""))
                    .comments(row.getOrDefault("comments", ""))
                    .returnToAccount(row.getOrDefault("returnToAccount", ""))
                    .shipToAccount(row.getOrDefault("shipToAccount", ""))
                    .primaryPayerAccount(row.getOrDefault("primaryPayerAccount", ""))
                    .orderFor(row.getOrDefault("orderFor", ""))
                    .orderSubType(row.getOrDefault("orderSubType", ""))
                    .payToAccount(row.getOrDefault("payToAccount", ""))
                    .revision(row.getOrDefault("revision", ""))
                    .orderDate(row.getOrDefault("orderDate", ""))
                    .transporterName(row.getOrDefault("transporterName", ""))
                    .consignmentDocket(row.getOrDefault("consignmentDocket", ""))
                    .type(row.getOrDefault("type", ""))
                    .status(row.getOrDefault("status", ""))
                    .division(row.getOrDefault("division", ""))
                    .lastName(row.getOrDefault("lastName", ""))
                    .firstName(row.getOrDefault("firstName", ""))
                    .priority(row.getOrDefault("priority", ""))
                    .priceList(row.getOrDefault("priceList", ""))
                    .organization(row.getOrDefault("organization", ""))
                    .testDocument(row.getOrDefault("testDocument", ""))
                    .build());
        }
        return result;
    }

    // ── Table 3 column header mapping ────────────────────────────────────────
    private static final Map<String, String> T3_MAP = new LinkedHashMap<>();
    static {
        T3_MAP.put("order #",                        "orderNumber");
        T3_MAP.put("cgst",                           "cgst");
        T3_MAP.put("igst",                           "igst");
        T3_MAP.put("sgst",                           "sgst");
        T3_MAP.put("utgst",                          "utgst");
        T3_MAP.put("gst invoice #",                  "gstInvoice");
        T3_MAP.put("irn status",                     "irnStatus");
        // "irn date" appears twice — first = irnDate, second = irnAckDate (handled in parseTable3)
        T3_MAP.put("irn",                            "irn");
        T3_MAP.put("tcs amount",                     "tcsAmount");
        T3_MAP.put("part description",               "partDescription");
        T3_MAP.put("transporter name",               "transporterName");
        T3_MAP.put("lr date",                        "lrDate");
        T3_MAP.put("lr number",                      "lrNumber");
        T3_MAP.put("cash discount",                  "cashDiscount");
        T3_MAP.put("cash discount percentage",       "cashDiscountPercentage");
        T3_MAP.put("commit flag",                    "commitFlag");
        T3_MAP.put("discount per part",              "discountPerPart");
        T3_MAP.put("discount per part percentage",   "discountPerPartPercentage");
        T3_MAP.put("weighted avg",                   "weightedAvg");
        T3_MAP.put("movement type",                  "movementType");
        T3_MAP.put("discount amount",                "discountAmount");
        T3_MAP.put("other charges amount",           "otherChargesAmount");
        T3_MAP.put("sap order num",                  "sapOrderNum");
        T3_MAP.put("vat",                            "vat");
        T3_MAP.put("transaction date",               "transactionDate");
        T3_MAP.put("transaction number",             "transactionNumber");
        T3_MAP.put("status",                         "status");
        T3_MAP.put("challan quantity",               "challanQuantity");
        T3_MAP.put("ware house name",                "wareHouseName");
        T3_MAP.put("part #",                         "partNo");
        T3_MAP.put("recd qty",                       "recdQty");
        T3_MAP.put("sap invoice #",                  "sapInvoice");
        T3_MAP.put("condition",                      "condition");
        T3_MAP.put("tm account",                     "tmAccount");
        T3_MAP.put("tm acct type",                   "tmAcctType");
        T3_MAP.put("additional tax",                 "additionalTax");
        T3_MAP.put("challan date",                   "challanDate");
        T3_MAP.put("challan #",                      "challanNo");
        T3_MAP.put("cst",                            "cst");
        T3_MAP.put("cst surcharge",                  "cstSurcharge");
        T3_MAP.put("cst vat",                        "cstVat");
        T3_MAP.put("division name",                  "divisionName");
        T3_MAP.put("line item invoice total",        "lineItemInvoiceTotal");
        T3_MAP.put("invoice_date",                   "invoiceDate");
        T3_MAP.put("lst",                            "lst");
        T3_MAP.put("lst surcharge",                  "lstSurcharge");
        T3_MAP.put("net amount",                     "netAmount");
        T3_MAP.put("octroi",                         "octroi");
        T3_MAP.put("purchase_order_date",            "purchaseOrderDate");
        T3_MAP.put("tm order for",                   "tmOrderFor");
        T3_MAP.put("order type",                     "orderType");
        T3_MAP.put("payer code",                     "payerCode");
        T3_MAP.put("spares order type",              "sparesOrderType");
        T3_MAP.put("total_tax_amount",               "totalTaxAmount");
        T3_MAP.put("tot",                            "tot");
        T3_MAP.put("total_invoice_amount",           "totalInvoiceAmount");
        T3_MAP.put("vendor invoice #",               "vendorInvoice");
        T3_MAP.put("vendor name",                    "vendorName");
    }

    public List<OrderTransactionDTO> parseTable3(MultipartFile file) throws IOException {
        List<Map<String, String>> rows = parseTable3Generic(file);
        List<OrderTransactionDTO> result = new ArrayList<>();
        for (Map<String, String> row : rows) {
            String orderNo = row.getOrDefault("orderNumber", "").trim();
            if (orderNo.isEmpty()) continue;

            result.add(OrderTransactionDTO.builder()
                    .orderNumber(orderNo)
                    .cgst(row.getOrDefault("cgst", ""))
                    .igst(row.getOrDefault("igst", ""))
                    .sgst(row.getOrDefault("sgst", ""))
                    .utgst(row.getOrDefault("utgst", ""))
                    .gstInvoice(row.getOrDefault("gstInvoice", ""))
                    .irnStatus(row.getOrDefault("irnStatus", ""))
                    .irnDate(row.getOrDefault("irnDate", ""))
                    .irnAckDate(row.getOrDefault("irnAckDate", ""))
                    .irn(row.getOrDefault("irn", ""))
                    .tcsAmount(row.getOrDefault("tcsAmount", ""))
                    .partDescription(row.getOrDefault("partDescription", ""))
                    .transporterName(row.getOrDefault("transporterName", ""))
                    .lrDate(row.getOrDefault("lrDate", ""))
                    .lrNumber(row.getOrDefault("lrNumber", ""))
                    .cashDiscount(row.getOrDefault("cashDiscount", ""))
                    .cashDiscountPercentage(row.getOrDefault("cashDiscountPercentage", ""))
                    .commitFlag(row.getOrDefault("commitFlag", ""))
                    .discountPerPart(row.getOrDefault("discountPerPart", ""))
                    .discountPerPartPercentage(row.getOrDefault("discountPerPartPercentage", ""))
                    .weightedAvg(row.getOrDefault("weightedAvg", ""))
                    .movementType(row.getOrDefault("movementType", ""))
                    .discountAmount(row.getOrDefault("discountAmount", ""))
                    .otherChargesAmount(row.getOrDefault("otherChargesAmount", ""))
                    .sapOrderNum(row.getOrDefault("sapOrderNum", ""))
                    .vat(row.getOrDefault("vat", ""))
                    .transactionDate(row.getOrDefault("transactionDate", ""))
                    .transactionNumber(row.getOrDefault("transactionNumber", ""))
                    .status(row.getOrDefault("status", ""))
                    .challanQuantity(row.getOrDefault("challanQuantity", ""))
                    .wareHouseName(row.getOrDefault("wareHouseName", ""))
                    .partNo(row.getOrDefault("partNo", ""))
                    .recdQty(row.getOrDefault("recdQty", ""))
                    .sapInvoice(row.getOrDefault("sapInvoice", ""))
                    .condition(row.getOrDefault("condition", ""))
                    .tmAccount(row.getOrDefault("tmAccount", ""))
                    .tmAcctType(row.getOrDefault("tmAcctType", ""))
                    .additionalTax(row.getOrDefault("additionalTax", ""))
                    .challanDate(row.getOrDefault("challanDate", ""))
                    .challanNo(row.getOrDefault("challanNo", ""))
                    .cst(row.getOrDefault("cst", ""))
                    .cstSurcharge(row.getOrDefault("cstSurcharge", ""))
                    .cstVat(row.getOrDefault("cstVat", ""))
                    .divisionName(row.getOrDefault("divisionName", ""))
                    .lineItemInvoiceTotal(row.getOrDefault("lineItemInvoiceTotal", ""))
                    .invoiceDate(row.getOrDefault("invoiceDate", ""))
                    .lst(row.getOrDefault("lst", ""))
                    .lstSurcharge(row.getOrDefault("lstSurcharge", ""))
                    .netAmount(row.getOrDefault("netAmount", ""))
                    .octroi(row.getOrDefault("octroi", ""))
                    .purchaseOrderDate(row.getOrDefault("purchaseOrderDate", ""))
                    .tmOrderFor(row.getOrDefault("tmOrderFor", ""))
                    .orderType(row.getOrDefault("orderType", ""))
                    .payerCode(row.getOrDefault("payerCode", ""))
                    .sparesOrderType(row.getOrDefault("sparesOrderType", ""))
                    .totalTaxAmount(row.getOrDefault("totalTaxAmount", ""))
                    .tot(row.getOrDefault("tot", ""))
                    .totalInvoiceAmount(row.getOrDefault("totalInvoiceAmount", ""))
                    .vendorInvoice(row.getOrDefault("vendorInvoice", ""))
                    .vendorName(row.getOrDefault("vendorName", ""))
                    .build());
        }
        return result;
    }

    // Custom parser for T3 — handles the duplicate "IRN Date" header
    private List<Map<String, String>> parseTable3Generic(MultipartFile file) throws IOException {
        List<Map<String, String>> result = new ArrayList<>();
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();

        try (java.io.InputStream is = file.getInputStream();
             Workbook workbook = filename.endsWith(".xls")
                     ? new org.apache.poi.hssf.usermodel.HSSFWorkbook(is)
                     : new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return result;

            Map<Integer, String> colIndex = new HashMap<>();
            int irnDateCount = 0;
            for (Cell cell : headerRow) {
                String header = getCellValue(cell).toLowerCase().trim();
                if (header.equals("irn date")) {
                    irnDateCount++;
                    colIndex.put(cell.getColumnIndex(), irnDateCount == 1 ? "irnDate" : "irnAckDate");
                } else if (T3_MAP.containsKey(header)) {
                    colIndex.put(cell.getColumnIndex(), T3_MAP.get(header));
                }
            }

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                Map<String, String> rowData = new HashMap<>();
                boolean hasData = false;
                for (Map.Entry<Integer, String> entry : colIndex.entrySet()) {
                    Cell cell = row.getCell(entry.getKey());
                    String val = getCellValue(cell);
                    rowData.put(entry.getValue(), val);
                    if (!val.isEmpty()) hasData = true;
                }
                if (hasData) result.add(rowData);
            }
        }
        return result;
    }

    // ─── Generic parser: reads header row and maps to field names ────────────
    private List<Map<String, String>> parseGeneric(MultipartFile file,
                                                   Map<String, String> columnMap) throws IOException {
        List<Map<String, String>> result = new ArrayList<>();
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();

        try (InputStream is = file.getInputStream();
             Workbook workbook = filename.endsWith(".xls")
                     ? new HSSFWorkbook(is)
                     : new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) return result;

            // Build index → fieldName mapping from header row
            Map<Integer, String> colIndex = new HashMap<>();
            for (Cell cell : headerRow) {
                String header = getCellValue(cell).toLowerCase().trim();
                if (columnMap.containsKey(header)) {
                    colIndex.put(cell.getColumnIndex(), columnMap.get(header));
                }
            }

            // Parse data rows
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Map<String, String> rowData = new HashMap<>();
                boolean hasData = false;
                for (Map.Entry<Integer, String> entry : colIndex.entrySet()) {
                    Cell cell = row.getCell(entry.getKey());
                    String val = getCellValue(cell);
                    rowData.put(entry.getValue(), val);
                    if (!val.isEmpty()) hasData = true;
                }
                if (hasData) result.add(rowData);
            }
        }
        return result;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                }
                double d = cell.getNumericCellValue();
                yield d == Math.floor(d) ? String.valueOf((long) d) : String.valueOf(d);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try { yield String.valueOf(cell.getNumericCellValue()); }
                catch (Exception e) { yield cell.getStringCellValue(); }
            }
            default -> "";
        };
    }
}
