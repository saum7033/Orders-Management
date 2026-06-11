package com.orders.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportResult<T> {

    private int totalRows;
    private int imported;
    private int failed;
    private List<T> savedRows;
    private List<ImportError> errors;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ImportError {
        private int rowIndex;
        private String orderNumber;
        private String reason;
    }
}
