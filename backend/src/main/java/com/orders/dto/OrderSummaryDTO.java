package com.orders.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryDTO {
    private Long id;
    private String orderNumber;
    private String orderPartsDiscount;
    private String orderPartsDiscountPct;
    private String orderValue;
    private String otherPartsChargeAmount;
    private String otherPartsChargePct;
    private String lineItemsTotal;
    private String totalLineItemDiscountAmount;
    private String mrcTotal;
    private String nrcTotal;
    private String expiryDate;
    private String gstin;
    private String channelType;
    private String priorityColour;
    private String billToAccount;
    private String billingAccount;
    private String comments;
    private String returnToAccount;
    private String shipToAccount;
    private String primaryPayerAccount;
    private String orderFor;
    private String orderSubType;
    private String payToAccount;
    private String revision;
    private String orderDate;
    private String transporterName;
    private String consignmentDocket;
    private String type;
    private String status;
    private String division;
    private String lastName;
    private String firstName;
    private String priority;
    private String priceList;
    private String organization;
    private String testDocument;
    private String remark;
    private String createdAt;
}