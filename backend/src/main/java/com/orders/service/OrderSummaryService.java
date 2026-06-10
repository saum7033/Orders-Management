package com.orders.service;

import com.orders.dto.OrderSummaryDTO;
import com.orders.entity.OrderSummary;
import com.orders.repository.OrderSummaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderSummaryService {

    private final OrderSummaryRepository repo;

    public List<OrderSummaryDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderSummaryDTO> getByOrderNumber(String orderNumber) {
        return repo.findByOrderNumberIgnoreCase(orderNumber)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    /** Bulk save — skips rows where orderNumber already exists */
    @Transactional
    public List<OrderSummaryDTO> saveAll(List<OrderSummaryDTO> dtos) {
        List<OrderSummary> toInsert = new ArrayList<>();
        for (OrderSummaryDTO dto : dtos) {
            if (dto.getOrderNumber() == null || dto.getOrderNumber().isBlank()) continue;
            if (!repo.existsByOrderNumber(dto.getOrderNumber().trim())) {
                toInsert.add(toEntity(dto));
            }
        }
        return repo.saveAll(toInsert).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    @Transactional
    public void deleteAll() {
        repo.deleteAll();
    }

    @Transactional
    public OrderSummaryDTO update(Long id, OrderSummaryDTO dto) {
        OrderSummary existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderSummary not found: " + id));
        updateEntity(existing, dto);
        return toDTO(repo.save(existing));
    }

    private OrderSummaryDTO toDTO(OrderSummary e) {
        return OrderSummaryDTO.builder()
                .id(e.getId())
                .orderNumber(e.getOrderNumber())
                .orderPartsDiscount(e.getOrderPartsDiscount())
                .orderPartsDiscountPct(e.getOrderPartsDiscountPct())
                .orderValue(e.getOrderValue())
                .otherPartsChargeAmount(e.getOtherPartsChargeAmount())
                .otherPartsChargePct(e.getOtherPartsChargePct())
                .lineItemsTotal(e.getLineItemsTotal())
                .totalLineItemDiscountAmount(e.getTotalLineItemDiscountAmount())
                .mrcTotal(e.getMrcTotal())
                .nrcTotal(e.getNrcTotal())
                .expiryDate(e.getExpiryDate())
                .gstin(e.getGstin())
                .channelType(e.getChannelType())
                .priorityColour(e.getPriorityColour())
                .billToAccount(e.getBillToAccount())
                .billingAccount(e.getBillingAccount())
                .comments(e.getComments())
                .returnToAccount(e.getReturnToAccount())
                .shipToAccount(e.getShipToAccount())
                .primaryPayerAccount(e.getPrimaryPayerAccount())
                .orderFor(e.getOrderFor())
                .orderSubType(e.getOrderSubType())
                .payToAccount(e.getPayToAccount())
                .revision(e.getRevision())
                .orderDate(e.getOrderDate())
                .transporterName(e.getTransporterName())
                .consignmentDocket(e.getConsignmentDocket())
                .type(e.getType())
                .status(e.getStatus())
                .division(e.getDivision())
                .lastName(e.getLastName())
                .firstName(e.getFirstName())
                .priority(e.getPriority())
                .priceList(e.getPriceList())
                .organization(e.getOrganization())
                .testDocument(e.getTestDocument())
                .remark(e.getRemark())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }

    private OrderSummary toEntity(OrderSummaryDTO dto) {
        return OrderSummary.builder()
                .orderNumber(dto.getOrderNumber())
                .orderPartsDiscount(dto.getOrderPartsDiscount())
                .orderPartsDiscountPct(dto.getOrderPartsDiscountPct())
                .orderValue(dto.getOrderValue())
                .otherPartsChargeAmount(dto.getOtherPartsChargeAmount())
                .otherPartsChargePct(dto.getOtherPartsChargePct())
                .lineItemsTotal(dto.getLineItemsTotal())
                .totalLineItemDiscountAmount(dto.getTotalLineItemDiscountAmount())
                .mrcTotal(dto.getMrcTotal())
                .nrcTotal(dto.getNrcTotal())
                .expiryDate(dto.getExpiryDate())
                .gstin(dto.getGstin())
                .channelType(dto.getChannelType())
                .priorityColour(dto.getPriorityColour())
                .billToAccount(dto.getBillToAccount())
                .billingAccount(dto.getBillingAccount())
                .comments(dto.getComments())
                .returnToAccount(dto.getReturnToAccount())
                .shipToAccount(dto.getShipToAccount())
                .primaryPayerAccount(dto.getPrimaryPayerAccount())
                .orderFor(dto.getOrderFor())
                .orderSubType(dto.getOrderSubType())
                .payToAccount(dto.getPayToAccount())
                .revision(dto.getRevision())
                .orderDate(dto.getOrderDate())
                .transporterName(dto.getTransporterName())
                .consignmentDocket(dto.getConsignmentDocket())
                .type(dto.getType())
                .status(dto.getStatus())
                .division(dto.getDivision())
                .lastName(dto.getLastName())
                .firstName(dto.getFirstName())
                .priority(dto.getPriority())
                .priceList(dto.getPriceList())
                .organization(dto.getOrganization())
                .testDocument(dto.getTestDocument())
                .remark(dto.getRemark())
                .build();
    }

    private void updateEntity(OrderSummary e, OrderSummaryDTO dto) {
        e.setOrderNumber(dto.getOrderNumber());
        e.setOrderPartsDiscount(dto.getOrderPartsDiscount());
        e.setOrderValue(dto.getOrderValue());
        e.setLineItemsTotal(dto.getLineItemsTotal());
        e.setExpiryDate(dto.getExpiryDate());
        e.setGstin(dto.getGstin());
        e.setPriorityColour(dto.getPriorityColour());
        e.setBillToAccount(dto.getBillToAccount());
        e.setComments(dto.getComments());
        e.setType(dto.getType());
        e.setStatus(dto.getStatus());
        e.setDivision(dto.getDivision());
        e.setOrderDate(dto.getOrderDate());
        e.setOrganization(dto.getOrganization());
        e.setPriceList(dto.getPriceList());
        e.setPriority(dto.getPriority());
        e.setTransporterName(dto.getTransporterName());
        e.setMrcTotal(dto.getMrcTotal());
        e.setNrcTotal(dto.getNrcTotal());
        e.setTotalLineItemDiscountAmount(dto.getTotalLineItemDiscountAmount());
        e.setOtherPartsChargeAmount(dto.getOtherPartsChargeAmount());
        e.setOtherPartsChargePct(dto.getOtherPartsChargePct());
        e.setOrderPartsDiscountPct(dto.getOrderPartsDiscountPct());
        e.setOrderFor(dto.getOrderFor());
        e.setOrderSubType(dto.getOrderSubType());
        e.setPayToAccount(dto.getPayToAccount());
        e.setRevision(dto.getRevision());
        e.setLastName(dto.getLastName());
        e.setFirstName(dto.getFirstName());
        e.setRemark(dto.getRemark());
    }
}