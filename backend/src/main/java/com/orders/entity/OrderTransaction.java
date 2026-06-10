package com.orders.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number")
    private String orderNumber;          // "Order #" — master key

    @Column(name = "cgst")
    private String cgst;

    @Column(name = "igst")
    private String igst;

    @Column(name = "sgst")
    private String sgst;

    @Column(name = "utgst")
    private String utgst;

    @Column(name = "gst_invoice")
    private String gstInvoice;

    @Column(name = "irn_status")
    private String irnStatus;

    @Column(name = "irn_date")
    private String irnDate;

    @Column(name = "irn_ack_date")
    private String irnAckDate;

    @Column(name = "irn", length = 512)
    private String irn;

    @Column(name = "tcs_amount")
    private String tcsAmount;

    @Column(name = "part_description", length = 500)
    private String partDescription;

    @Column(name = "transporter_name")
    private String transporterName;

    @Column(name = "lr_date")
    private String lrDate;

    @Column(name = "lr_number")
    private String lrNumber;

    @Column(name = "cash_discount")
    private String cashDiscount;

    @Column(name = "cash_discount_percentage")
    private String cashDiscountPercentage;

    @Column(name = "commit_flag")
    private String commitFlag;

    @Column(name = "discount_per_part")
    private String discountPerPart;

    @Column(name = "discount_per_part_percentage")
    private String discountPerPartPercentage;

    @Column(name = "weighted_avg")
    private String weightedAvg;

    @Column(name = "movement_type")
    private String movementType;

    @Column(name = "discount_amount")
    private String discountAmount;

    @Column(name = "other_charges_amount")
    private String otherChargesAmount;

    @Column(name = "sap_order_num")
    private String sapOrderNum;

    @Column(name = "vat")
    private String vat;

    @Column(name = "transaction_date")
    private String transactionDate;

    @Column(name = "transaction_number")
    private String transactionNumber;

    @Column(name = "status")
    private String status;

    @Column(name = "challan_quantity")
    private String challanQuantity;

    @Column(name = "ware_house_name")
    private String wareHouseName;

    @Column(name = "part_no")
    private String partNo;

    @Column(name = "recd_qty")
    private String recdQty;

    @Column(name = "sap_invoice")
    private String sapInvoice;

    @Column(name = "condition_val")
    private String condition;

    @Column(name = "tm_account")
    private String tmAccount;

    @Column(name = "tm_acct_type")
    private String tmAcctType;

    @Column(name = "additional_tax")
    private String additionalTax;

    @Column(name = "challan_date")
    private String challanDate;

    @Column(name = "challan_no")
    private String challanNo;

    @Column(name = "cst")
    private String cst;

    @Column(name = "cst_surcharge")
    private String cstSurcharge;

    @Column(name = "cst_vat")
    private String cstVat;

    @Column(name = "division_name")
    private String divisionName;

    @Column(name = "line_item_invoice_total")
    private String lineItemInvoiceTotal;

    @Column(name = "invoice_date")
    private String invoiceDate;

    @Column(name = "lst")
    private String lst;

    @Column(name = "lst_surcharge")
    private String lstSurcharge;

    @Column(name = "net_amount")
    private String netAmount;

    @Column(name = "octroi")
    private String octroi;

    @Column(name = "purchase_order_date")
    private String purchaseOrderDate;

    @Column(name = "tm_order_for")
    private String tmOrderFor;

    @Column(name = "order_type")
    private String orderType;

    @Column(name = "payer_code")
    private String payerCode;

    @Column(name = "spares_order_type")
    private String sparesOrderType;

    @Column(name = "total_tax_amount")
    private String totalTaxAmount;

    @Column(name = "tot")
    private String tot;

    @Column(name = "total_invoice_amount")
    private String totalInvoiceAmount;

    @Column(name = "vendor_invoice")
    private String vendorInvoice;

    @Column(name = "vendor_name")
    private String vendorName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
