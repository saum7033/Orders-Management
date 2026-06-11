package com.orders.service;

import com.orders.dto.ImportResult;
import com.orders.dto.OrderItemDTO;
import com.orders.entity.OrderItem;
import com.orders.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository repo;

    public List<OrderItemDTO> getAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "id"))
                   .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<OrderItemDTO> getByOrderNumber(String orderNumber) {
        return repo.findByOrderNumberIgnoreCase(orderNumber)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public OrderItemDTO saveOne(OrderItemDTO dto) {
        String orderNum = dto.getOrderNumber().trim();
        String partNo   = dto.getPartNo().trim();
        if (repo.countDuplicateCombination(orderNum, partNo) > 0) {
            throw new RuntimeException("Order Number + Part Number already exists");
        }
        dto.setSource("MANUAL");
        return toDTO(repo.save(toEntity(dto)));
    }

    /** Bulk save — validates Order Number (mandatory), Part Number (mandatory),
     *  checks duplicate by (Order Number + Part Number) combination, returns ImportResult with per-row errors. */
    @Transactional
    public ImportResult<OrderItemDTO> saveAll(List<OrderItemDTO> dtos) {
        List<OrderItem> toInsert = new ArrayList<>();
        List<ImportResult.ImportError> errors = new ArrayList<>();
        Set<String> seenKeys = new HashSet<>();
        int rowIndex = 0;

        for (OrderItemDTO dto : dtos) {
            rowIndex++;

            if (dto.getOrderNumber() == null || dto.getOrderNumber().isBlank()) {
                errors.add(ImportResult.ImportError.builder()
                        .rowIndex(rowIndex)
                        .reason("Order Number is missing.")
                        .build());
                continue;
            }

            String orderNum = dto.getOrderNumber().trim();

            if (dto.getPartNo() == null || dto.getPartNo().isBlank()) {
                errors.add(ImportResult.ImportError.builder()
                        .rowIndex(rowIndex)
                        .orderNumber(orderNum)
                        .reason("Part Number is missing.")
                        .build());
                continue;
            }

            String partNo = dto.getPartNo().trim();
            String compositeKey = orderNum.toLowerCase() + "|" + partNo.toLowerCase();

            if (repo.countDuplicateCombination(orderNum, partNo) > 0
                    || seenKeys.contains(compositeKey)) {
                errors.add(ImportResult.ImportError.builder()
                        .rowIndex(rowIndex)
                        .orderNumber(orderNum)
                        .reason("Order Number + Part Number already exists")
                        .build());
                continue;
            }

            seenKeys.add(compositeKey);
            toInsert.add(toEntity(dto));
        }

        List<OrderItemDTO> savedDtos = repo.saveAll(toInsert).stream().map(this::toDTO).collect(Collectors.toList());

        return ImportResult.<OrderItemDTO>builder()
                .totalRows(rowIndex)
                .imported(savedDtos.size())
                .failed(errors.size())
                .savedRows(savedDtos)
                .errors(errors)
                .build();
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