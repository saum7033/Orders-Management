package com.orders.controller;



import com.orders.dto.ApiResponse;
import com.orders.dto.ImportResult;
import com.orders.dto.OrderSummaryDTO;
import com.orders.service.ExcelParserService;
import com.orders.service.OrderSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/order-summaries")
@RequiredArgsConstructor
public class OrderSummaryController {

    private final OrderSummaryService service;
    private final ExcelParserService excelParser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderSummaryDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Fetched", service.getAll()));
    }

    @GetMapping("/by-order/{orderNumber}")
    public ResponseEntity<ApiResponse<List<OrderSummaryDTO>>> getByOrder(@PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.ok("Fetched", service.getByOrderNumber(orderNumber)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderSummaryDTO>> update(
            @PathVariable Long id, @RequestBody OrderSummaryDTO dto) {
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
        return ResponseEntity.ok(ApiResponse.ok("All summaries deleted", null));
    }

    // ── POST Excel preview (parse only, no DB save) ───────────────────────────
    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<List<OrderSummaryDTO>>> preview(
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }
        try {
            List<OrderSummaryDTO> rows = excelParser.parseTable2(file);
            return ResponseEntity.ok(ApiResponse.ok("Parsed " + rows.size() + " rows", rows));
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to parse: " + e.getMessage()));
        }
    }

    // ── POST single record (manual entry) ────────────────────────────────────
    @PostMapping
    public ResponseEntity<ApiResponse<OrderSummaryDTO>> createOne(@RequestBody OrderSummaryDTO dto) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Created", service.saveOne(dto)));
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(ApiResponse.error(e.getMessage()));
        }
    }

    // ── POST bulk save (after user clicks Save) ───────────────────────────────
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<ImportResult<OrderSummaryDTO>>> bulkSave(
            @RequestBody List<OrderSummaryDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No data to save"));
        }
        ImportResult<OrderSummaryDTO> result = service.saveAll(dtos);
        String msg = String.format("Processed %d rows: %d imported, %d failed",
                result.getTotalRows(), result.getImported(), result.getFailed());
        return ResponseEntity.ok(ApiResponse.ok(msg, result));
    }
}
