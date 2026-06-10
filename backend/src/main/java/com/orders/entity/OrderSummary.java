package com.orders.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents an order-level summary record (Table 2 – Finance / Summary data).
 * Keyed by Order # from the second Excel sheet.
 */
@Entity
@Table(name = "order_summaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Primary key ──────────────────────────────────────────────────────────
    @Column(name = "order_number")
    private String orderNumber;          // "Order #"

    // ── Finance ──────────────────────────────────────────────────────────────
    @Column(name = "order_parts_discount")
    private String orderPartsDiscount;

    @Column(name = "order_parts_discount_pct")
    private String orderPartsDiscountPct;

    @Column(name = "order_value")
    private String orderValue;

    @Column(name = "other_parts_charge_amount")
    private String otherPartsChargeAmount;

    @Column(name = "other_parts_charge_pct")
    private String otherPartsChargePct;

    @Column(name = "line_items_total")
    private String lineItemsTotal;

    @Column(name = "total_line_item_discount_amount")
    private String totalLineItemDiscountAmount;

    @Column(name = "mrc_total")
    private String mrcTotal;

    @Column(name = "nrc_total")
    private String nrcTotal;

    // ── Header info ──────────────────────────────────────────────────────────
    @Column(name = "expiry_date")
    private String expiryDate;

    @Column(name = "gstin")
    private String gstin;

    @Column(name = "channel_type")
    private String channelType;

    @Column(name = "priority_colour")
    private String priorityColour;

    @Column(name = "bill_to_account")
    private String billToAccount;

    @Column(name = "billing_account")
    private String billingAccount;

    @Column(name = "comments", length = 1000)
    private String comments;

    @Column(name = "return_to_account")
    private String returnToAccount;

    @Column(name = "ship_to_account")
    private String shipToAccount;

    @Column(name = "primary_payer_account")
    private String primaryPayerAccount;

    // ── Order details ────────────────────────────────────────────────────────
    @Column(name = "order_for")
    private String orderFor;

    @Column(name = "order_sub_type")
    private String orderSubType;

    @Column(name = "pay_to_account")
    private String payToAccount;

    @Column(name = "revision")
    private String revision;

    @Column(name = "order_date")
    private String orderDate;

    @Column(name = "transporter_name")
    private String transporterName;

    @Column(name = "consignment_docket")
    private String consignmentDocket;

    @Column(name = "type")
    private String type;

    @Column(name = "status")
    private String status;

    @Column(name = "division")
    private String division;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "priority")
    private String priority;

    @Column(name = "price_list")
    private String priceList;

    @Column(name = "organization")
    private String organization;

    @Column(name = "test_document")
    private String testDocument;

    @Column(name = "remark", length = 1000)
    private String remark;

    // ── Audit ────────────────────────────────────────────────────────────────
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}