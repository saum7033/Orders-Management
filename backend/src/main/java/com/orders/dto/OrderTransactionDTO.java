package com.orders.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTransactionDTO {
    private Long id;
    private String orderNumber;
    private String cgst;
    private String igst;
    private String sgst;
    private String utgst;
    private String gstInvoice;
    private String irnStatus;
    private String irnDate;
    private String irnAckDate;
    private String irn;
    private String tcsAmount;
    private String partDescription;
    private String transporterName;
    private String lrDate;
    private String lrNumber;
    private String cashDiscount;
    private String cashDiscountPercentage;
    private String commitFlag;
    private String discountPerPart;
    private String discountPerPartPercentage;
    private String weightedAvg;
    private String movementType;
    private String discountAmount;
    private String otherChargesAmount;
    private String sapOrderNum;
    private String vat;
    private String transactionDate;
    private String transactionNumber;
    private String status;
    private String challanQuantity;
    private String wareHouseName;
    private String partNo;
    private String recdQty;
    private String sapInvoice;
    private String condition;
    private String tmAccount;
    private String tmAcctType;
    private String additionalTax;
    private String challanDate;
    private String challanNo;
    private String cst;
    private String cstSurcharge;
    private String cstVat;
    private String divisionName;
    private String lineItemInvoiceTotal;
    private String invoiceDate;
    private String lst;
    private String lstSurcharge;
    private String netAmount;
    private String octroi;
    private String purchaseOrderDate;
    private String tmOrderFor;
    private String orderType;
    private String payerCode;
    private String sparesOrderType;
    private String totalTaxAmount;
    private String tot;
    private String totalInvoiceAmount;
    private String vendorInvoice;
    private String vendorName;
    private String createdAt;
}
