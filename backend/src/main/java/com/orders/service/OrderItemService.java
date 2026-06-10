package com.orders.service;

import com.orders.dto.OrderItemDTO;
import com.orders.entity.OrderItem;
import com.orders.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository repo;

    public List<OrderItemDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderItemDTO> getByOrderNumber(String orderNumber) {
        return repo.findByOrderNumberIgnoreCase(orderNumber)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public OrderItemDTO saveOne(OrderItemDTO dto) {
        dto.setSource("MANUAL");
        return toDTO(repo.save(toEntity(dto)));
    }

    /** Bulk save — skips rows that already exist (orderNumber + partNo duplicate check) */
    @Transactional
    public List<OrderItemDTO> saveAll(List<OrderItemDTO> dtos) {
        List<OrderItem> toInsert = new ArrayList<>();
        for (OrderItemDTO dto : dtos) {
            if (dto.getOrderNumber() == null || dto.getPartNo() == null) continue;
            boolean exists = repo.existsByOrderNumberAndPartNo(
                    dto.getOrderNumber().trim(), dto.getPartNo().trim());
            if (!exists) {
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
    public OrderItemDTO update(Long id, OrderItemDTO dto) {
        OrderItem existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found: " + id));
        updateEntity(existing, dto);
        return toDTO(repo.save(existing));
    }

    private OrderItemDTO toDTO(OrderItem e) {
        return OrderItemDTO.builder()
                .id(e.getId())
                .orderNumber(e.getOrderNumber())
                .partNo(e.getPartNo())
                .dealerCode(e.getDealerCode())
                .dealer(e.getDealer())
                .division(e.getDivision())
                .partnerType(e.getPartnerType())
                .orderDate(e.getOrderDate())
                .orderType(e.getOrderType())
                .orderSubType(e.getOrderSubType())
                .orderStatus(e.getOrderStatus())
                .distributorName(e.getDistributorName())
                .distributorCode(e.getDistributorCode())
                .partDesc(e.getPartDesc())
                .qtyRequested(e.getQtyRequested())
                .value(e.getValue())
                .requestedQtyValue(e.getRequestedQtyValue())
                .receivedQtyValue(e.getReceivedQtyValue())
                .receivedQty(e.getReceivedQty())
                .pendingQty(e.getPendingQty())
                .pendingDays(e.getPendingDays())
                .status(e.getStatus())
                .comments(e.getComments())
                .source(e.getSource())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }

    private OrderItem toEntity(OrderItemDTO dto) {
        return OrderItem.builder()
                .orderNumber(dto.getOrderNumber())
                .partNo(dto.getPartNo())
                .dealerCode(dto.getDealerCode())
                .dealer(dto.getDealer())
                .division(dto.getDivision())
                .partnerType(dto.getPartnerType())
                .orderDate(dto.getOrderDate())
                .orderType(dto.getOrderType())
                .orderSubType(dto.getOrderSubType())
                .orderStatus(dto.getOrderStatus())
                .distributorName(dto.getDistributorName())
                .distributorCode(dto.getDistributorCode())
                .partDesc(dto.getPartDesc())
                .qtyRequested(dto.getQtyRequested())
                .value(dto.getValue())
                .requestedQtyValue(dto.getRequestedQtyValue())
                .receivedQtyValue(dto.getReceivedQtyValue())
                .receivedQty(dto.getReceivedQty())
                .pendingQty(dto.getPendingQty())
                .pendingDays(dto.getPendingDays())
                .status(dto.getStatus())
                .comments(dto.getComments())
                .source(dto.getSource() != null ? dto.getSource() : "EXCEL")
                .build();
    }

    private void updateEntity(OrderItem e, OrderItemDTO dto) {
        e.setOrderNumber(dto.getOrderNumber());
        e.setPartNo(dto.getPartNo());
        e.setDealerCode(dto.getDealerCode());
        e.setDealer(dto.getDealer());
        e.setDivision(dto.getDivision());
        e.setPartnerType(dto.getPartnerType());
        e.setOrderDate(dto.getOrderDate());
        e.setOrderType(dto.getOrderType());
        e.setOrderSubType(dto.getOrderSubType());
        e.setOrderStatus(dto.getOrderStatus());
        e.setDistributorName(dto.getDistributorName());
        e.setDistributorCode(dto.getDistributorCode());
        e.setPartDesc(dto.getPartDesc());
        e.setQtyRequested(dto.getQtyRequested());
        e.setValue(dto.getValue());
        e.setRequestedQtyValue(dto.getRequestedQtyValue());
        e.setReceivedQtyValue(dto.getReceivedQtyValue());
        e.setReceivedQty(dto.getReceivedQty());
        e.setPendingQty(dto.getPendingQty());
        e.setPendingDays(dto.getPendingDays());
        e.setStatus(dto.getStatus());
        e.setComments(dto.getComments());
    }
}