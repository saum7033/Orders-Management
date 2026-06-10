package com.orders.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    private Long id;
    private String orderNumber;
    private String partNo;
    private String dealerCode;
    private String dealer;
    private String division;
    private String partnerType;
    private String orderDate;
    private String orderType;
    private String orderSubType;
    private String orderStatus;
    private String distributorName;
    private String distributorCode;
    private String partDesc;
    private String qtyRequested;
    private String value;
    private String requestedQtyValue;
    private String receivedQtyValue;
    private String receivedQty;
    private String pendingQty;
    private String pendingDays;
    private String status;
    private String comments;
    private String source;
    private String createdAt;
}