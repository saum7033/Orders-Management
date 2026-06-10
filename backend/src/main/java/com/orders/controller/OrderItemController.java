package com.orders.controller;


import com.orders.dto.ApiResponse;
import com.orders.dto.OrderItemDTO;
import com.orders.service.ExcelParserService;
import com.orders.service.OrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/order-items")
@RequiredArgsConstructor
public class OrderItemController {

    private final OrderItemService service;
    private final ExcelParserService excelParser;

    // ── GET all ───────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Fetched successfully", service.getAll()));
    }

    // ── GET by order number ───────────────────────────────────────────────────
    @GetMapping("/by-order/{orderNumber}")
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> getByOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.ok("Fetched", service.getByOrderNumber(orderNumber)));
    }

    // ── POST single (manual entry) ────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<OrderItemDTO>> create(@RequestBody OrderItemDTO dto) {
        if (dto.getOrderNumber() == null || dto.getOrderNumber().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Order Number is required"));
        }
        if (dto.getPartNo() == null || dto.getPartNo().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Part No is required"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Saved successfully", service.saveOne(dto)));
    }

    // ── PUT update ────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderItemDTO>> update(
            @PathVariable Long id, @RequestBody OrderItemDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Updated", service.update(id, dto)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ── DELETE single ─────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    // ── DELETE all ────────────────────────────────────────────────────────────
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAll() {
        service.deleteAll();
        return ResponseEntity.ok(ApiResponse.ok("All records deleted", null));
    }

    // ── POST Excel preview (parse only, no DB save) ───────────────────────────
    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> preview(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }
        try {
            List<OrderItemDTO> rows = excelParser.parseTable1(file);
            return ResponseEntity.ok(ApiResponse.ok("Parsed " + rows.size() + " rows", rows));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to parse file: " + e.getMessage()));
        }
    }

    // ── POST bulk save (after user clicks Save) ───────────────────────────────
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<OrderItemDTO>>> bulkSave(
            @RequestBody List<OrderItemDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No data to save"));
        }
        List<OrderItemDTO> saved = service.saveAll(dtos);
        return ResponseEntity.ok(ApiResponse.ok("Saved " + saved.size() + " records", saved));
    }
}