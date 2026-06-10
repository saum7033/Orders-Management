package com.orders.service;

import com.orders.dto.OrderTransactionDTO;
import com.orders.entity.OrderTransaction;
import com.orders.repository.OrderTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderTransactionService {

    private final OrderTransactionRepository repo;

    public List<OrderTransactionDTO> getAll() {
        return repo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    /**
     * Bulk upsert — if Order Number already exists, update that record;
     * otherwise insert a new one.  Supports thousands of rows efficiently.
     */
    @Transactional
    public List<OrderTransactionDTO> bulkUpsert(List<OrderTransactionDTO> dtos) {
        List<OrderTransaction> toSave = new ArrayList<>();
        for (OrderTransactionDTO dto : dtos) {
            if (dto.getOrderNumber() == null || dto.getOrderNumber().isBlank()) continue;
            Optional<OrderTransaction> existing = repo.findByOrderNumber(dto.getOrderNumber().trim());
            if (existing.isPresent()) {
                OrderTransaction e = existing.get();
                updateEntity(e, dto);
                toSave.add(e);
            } else {
                toSave.add(toEntity(dto));
            }
        }
        return repo.saveAll(toSave).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public OrderTransactionDTO update(Long id, OrderTransactionDTO dto) {
        OrderTransaction existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderTransaction not found: " + id));
        updateEntity(existing, dto);
        return toDTO(repo.save(existing));
    }

    @Transactional
    public void deleteById(Long id) {
        repo.deleteById(id);
    }

    @Transactional
    public void deleteAll() {
        repo.deleteAll();
    }

    private OrderTransactionDTO toDTO(OrderTransaction e) {
        return OrderTransactionDTO.builder()
                .id(e.getId())
                .orderNumber(e.getOrderNumber())
                .cgst(e.getCgst())
                .igst(e.getIgst())
                .sgst(e.getSgst())
                .utgst(e.getUtgst())
                .gstInvoice(e.getGstInvoice())
                .irnStatus(e.getIrnStatus())
                .irnDate(e.getIrnDate())
                .irnAckDate(e.getIrnAckDate())
                .irn(e.getIrn())
                .tcsAmount(e.getTcsAmount())
                .partDescription(e.getPartDescription())
                .transporterName(e.getTransporterName())
                .lrDate(e.getLrDate())
                .lrNumber(e.getLrNumber())
                .cashDiscount(e.getCashDiscount())
                .cashDiscountPercentage(e.getCashDiscountPercentage())
                .commitFlag(e.getCommitFlag())
                .discountPerPart(e.getDiscountPerPart())
                .discountPerPartPercentage(e.getDiscountPerPartPercentage())
                .weightedAvg(e.getWeightedAvg())
                .movementType(e.getMovementType())
                .discountAmount(e.getDiscountAmount())
                .otherChargesAmount(e.getOtherChargesAmount())
                .sapOrderNum(e.getSapOrderNum())
                .vat(e.getVat())
                .transactionDate(e.getTransactionDate())
                .transactionNumber(e.getTransactionNumber())
                .status(e.getStatus())
                .challanQuantity(e.getChallanQuantity())
                .wareHouseName(e.getWareHouseName())
                .partNo(e.getPartNo())
                .recdQty(e.getRecdQty())
                .sapInvoice(e.getSapInvoice())
                .condition(e.getCondition())
                .tmAccount(e.getTmAccount())
                .tmAcctType(e.getTmAcctType())
                .additionalTax(e.getAdditionalTax())
                .challanDate(e.getChallanDate())
                .challanNo(e.getChallanNo())
                .cst(e.getCst())
                .cstSurcharge(e.getCstSurcharge())
                .cstVat(e.getCstVat())
                .divisionName(e.getDivisionName())
                .lineItemInvoiceTotal(e.getLineItemInvoiceTotal())
                .invoiceDate(e.getInvoiceDate())
                .lst(e.getLst())
                .lstSurcharge(e.getLstSurcharge())
                .netAmount(e.getNetAmount())
                .octroi(e.getOctroi())
                .purchaseOrderDate(e.getPurchaseOrderDate())
                .tmOrderFor(e.getTmOrderFor())
                .orderType(e.getOrderType())
                .payerCode(e.getPayerCode())
                .sparesOrderType(e.getSparesOrderType())
                .totalTaxAmount(e.getTotalTaxAmount())
                .tot(e.getTot())
                .totalInvoiceAmount(e.getTotalInvoiceAmount())
                .vendorInvoice(e.getVendorInvoice())
                .vendorName(e.getVendorName())
                .createdAt(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .build();
    }

    private OrderTransaction toEntity(OrderTransactionDTO dto) {
        return OrderTransaction.builder()
                .orderNumber(dto.getOrderNumber())
                .cgst(dto.getCgst())
                .igst(dto.getIgst())
                .sgst(dto.getSgst())
                .utgst(dto.getUtgst())
                .gstInvoice(dto.getGstInvoice())
                .irnStatus(dto.getIrnStatus())
                .irnDate(dto.getIrnDate())
                .irnAckDate(dto.getIrnAckDate())
                .irn(dto.getIrn())
                .tcsAmount(dto.getTcsAmount())
                .partDescription(dto.getPartDescription())
                .transporterName(dto.getTransporterName())
                .lrDate(dto.getLrDate())
                .lrNumber(dto.getLrNumber())
                .cashDiscount(dto.getCashDiscount())
                .cashDiscountPercentage(dto.getCashDiscountPercentage())
                .commitFlag(dto.getCommitFlag())
                .discountPerPart(dto.getDiscountPerPart())
                .discountPerPartPercentage(dto.getDiscountPerPartPercentage())
                .weightedAvg(dto.getWeightedAvg())
                .movementType(dto.getMovementType())
                .discountAmount(dto.getDiscountAmount())
                .otherChargesAmount(dto.getOtherChargesAmount())
                .sapOrderNum(dto.getSapOrderNum())
                .vat(dto.getVat())
                .transactionDate(dto.getTransactionDate())
                .transactionNumber(dto.getTransactionNumber())
                .status(dto.getStatus())
                .challanQuantity(dto.getChallanQuantity())
                .wareHouseName(dto.getWareHouseName())
                .partNo(dto.getPartNo())
                .recdQty(dto.getRecdQty())
                .sapInvoice(dto.getSapInvoice())
                .condition(dto.getCondition())
                .tmAccount(dto.getTmAccount())
                .tmAcctType(dto.getTmAcctType())
                .additionalTax(dto.getAdditionalTax())
                .challanDate(dto.getChallanDate())
                .challanNo(dto.getChallanNo())
                .cst(dto.getCst())
                .cstSurcharge(dto.getCstSurcharge())
                .cstVat(dto.getCstVat())
                .divisionName(dto.getDivisionName())
                .lineItemInvoiceTotal(dto.getLineItemInvoiceTotal())
                .invoiceDate(dto.getInvoiceDate())
                .lst(dto.getLst())
                .lstSurcharge(dto.getLstSurcharge())
                .netAmount(dto.getNetAmount())
                .octroi(dto.getOctroi())
                .purchaseOrderDate(dto.getPurchaseOrderDate())
                .tmOrderFor(dto.getTmOrderFor())
                .orderType(dto.getOrderType())
                .payerCode(dto.getPayerCode())
                .sparesOrderType(dto.getSparesOrderType())
                .totalTaxAmount(dto.getTotalTaxAmount())
                .tot(dto.getTot())
                .totalInvoiceAmount(dto.getTotalInvoiceAmount())
                .vendorInvoice(dto.getVendorInvoice())
                .vendorName(dto.getVendorName())
                .build();
    }

    private void updateEntity(OrderTransaction e, OrderTransactionDTO dto) {
        e.setOrderNumber(dto.getOrderNumber());
        e.setCgst(dto.getCgst());
        e.setIgst(dto.getIgst());
        e.setSgst(dto.getSgst());
        e.setUtgst(dto.getUtgst());
        e.setGstInvoice(dto.getGstInvoice());
        e.setIrnStatus(dto.getIrnStatus());
        e.setIrnDate(dto.getIrnDate());
        e.setIrnAckDate(dto.getIrnAckDate());
        e.setIrn(dto.getIrn());
        e.setTcsAmount(dto.getTcsAmount());
        e.setPartDescription(dto.getPartDescription());
        e.setTransporterName(dto.getTransporterName());
        e.setLrDate(dto.getLrDate());
        e.setLrNumber(dto.getLrNumber());
        e.setCashDiscount(dto.getCashDiscount());
        e.setCashDiscountPercentage(dto.getCashDiscountPercentage());
        e.setCommitFlag(dto.getCommitFlag());
        e.setDiscountPerPart(dto.getDiscountPerPart());
        e.setDiscountPerPartPercentage(dto.getDiscountPerPartPercentage());
        e.setWeightedAvg(dto.getWeightedAvg());
        e.setMovementType(dto.getMovementType());
        e.setDiscountAmount(dto.getDiscountAmount());
        e.setOtherChargesAmount(dto.getOtherChargesAmount());
        e.setSapOrderNum(dto.getSapOrderNum());
        e.setVat(dto.getVat());
        e.setTransactionDate(dto.getTransactionDate());
        e.setTransactionNumber(dto.getTransactionNumber());
        e.setStatus(dto.getStatus());
        e.setChallanQuantity(dto.getChallanQuantity());
        e.setWareHouseName(dto.getWareHouseName());
        e.setPartNo(dto.getPartNo());
        e.setRecdQty(dto.getRecdQty());
        e.setSapInvoice(dto.getSapInvoice());
        e.setCondition(dto.getCondition());
        e.setTmAccount(dto.getTmAccount());
        e.setTmAcctType(dto.getTmAcctType());
        e.setAdditionalTax(dto.getAdditionalTax());
        e.setChallanDate(dto.getChallanDate());
        e.setChallanNo(dto.getChallanNo());
        e.setCst(dto.getCst());
        e.setCstSurcharge(dto.getCstSurcharge());
        e.setCstVat(dto.getCstVat());
        e.setDivisionName(dto.getDivisionName());
        e.setLineItemInvoiceTotal(dto.getLineItemInvoiceTotal());
        e.setInvoiceDate(dto.getInvoiceDate());
        e.setLst(dto.getLst());
        e.setLstSurcharge(dto.getLstSurcharge());
        e.setNetAmount(dto.getNetAmount());
        e.setOctroi(dto.getOctroi());
        e.setPurchaseOrderDate(dto.getPurchaseOrderDate());
        e.setTmOrderFor(dto.getTmOrderFor());
        e.setOrderType(dto.getOrderType());
        e.setPayerCode(dto.getPayerCode());
        e.setSparesOrderType(dto.getSparesOrderType());
        e.setTotalTaxAmount(dto.getTotalTaxAmount());
        e.setTot(dto.getTot());
        e.setTotalInvoiceAmount(dto.getTotalInvoiceAmount());
        e.setVendorInvoice(dto.getVendorInvoice());
        e.setVendorName(dto.getVendorName());
    }
}
