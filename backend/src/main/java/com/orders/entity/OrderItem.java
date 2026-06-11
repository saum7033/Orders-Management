package com.orders.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Represents a single order line item (Table 1 – Parts / Orders data).
 * One Order Number can have many Part No rows.
 */
@Entity
@Table(name = "order_items", uniqueConstraints = {
    @UniqueConstraint(name = "uk_order_items_order_number_part_no",
                      columnNames = {"order_number", "part_no"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Primary keys / identifiers ──────────────────────────────────────────
    @Column(name = "order_number", nullable = false)
    private String orderNumber;

    @Column(name = "part_no", nullable = false)
    private String partNo;

    // ── Dealer info ──────────────────────────────────────────────────────────
    @Column(name = "dealer_code")
    private String dealerCode;

    @Column(name = "dealer")
    private String dealer;

    @Column(name = "division")
    private String division;

    @Column(name = "partner_type")
    private String partnerType;

    @Column(name = "order_date")
    private String orderDate;

    @Column(name = "order_type")
    private String orderType;

    @Column(name = "order_sub_type")
    private String orderSubType;

    @Column(name = "order_status")
    private String orderStatus;

    // ── Distributor ──────────────────────────────────────────────────────────
    @Column(name = "distributor_name")
    private String distributorName;

    @Column(name = "distributor_code")
    private String distributorCode;

    // ── Part details ─────────────────────────────────────────────────────────
    @Column(name = "part_desc", length = 500)
    private String partDesc;

    @Column(name = "qty_requested")
    private String qtyRequested;

    @Column(name = "value")
    private String value;

    @Column(name = "requested_qty_value")
    private String requestedQtyValue;

    @Column(name = "received_qty_value")
    private String receivedQtyValue;

    @Column(name = "received_qty")
    private String receivedQty;

    @Column(name = "pending_qty")
    private String pendingQty;

    @Column(name = "pending_days")
    private String pendingDays;

    @Column(name = "status")
    private String status;

    // Comment pulled from Table 2 by matching orderNumber (stored on update)
    @Column(name = "comments", length = 1000)
    private String comments;

    // ── Audit ────────────────────────────────────────────────────────────────
    @Column(name = "source")
    private String source; // "MANUAL" or "EXCEL"

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}