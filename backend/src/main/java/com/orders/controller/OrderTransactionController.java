package com.orders.controller;

import com.orders.dto.ApiResponse;
import com.orders.dto.OrderTransactionDTO;
import com.orders.service.ExcelParserService;
import com.orders.service.OrderTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/order-transactions")
@RequiredArgsConstructor
public class OrderTransactionController {

    private final OrderTransactionService service;
    private final ExcelParserService excelParser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderTransactionDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Fetched successfully", service.getAll()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderTransactionDTO>> update(
            @PathVariable Long id, @RequestBody OrderTransactionDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Updated", service.update(id, dto)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Deleted", null));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> deleteAll() {
        service.deleteAll();
        return ResponseEntity.ok(ApiResponse.ok("All records deleted", null));
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<List<OrderTransactionDTO>>> preview(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }
        try {
            List<OrderTransactionDTO> rows = excelParser.parseTable3(file);
            return ResponseEntity.ok(ApiResponse.ok("Parsed " + rows.size() + " rows", rows));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to parse file: " + e.getMessage()));
        }
    }

    @PostMapping("/bulk-upsert")
    public ResponseEntity<ApiResponse<List<OrderTransactionDTO>>> bulkUpsert(
            @RequestBody List<OrderTransactionDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No data to save"));
        }
        List<OrderTransactionDTO> saved = service.bulkUpsert(dtos);
        return ResponseEntity.ok(ApiResponse.ok("Upserted " + saved.size() + " records", saved));
    }
}
