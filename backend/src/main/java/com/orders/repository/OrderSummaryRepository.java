package com.orders.repository;

import com.orders.entity.OrderSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderSummaryRepository extends JpaRepository<OrderSummary, Long> {

    List<OrderSummary> findByOrderNumberIgnoreCase(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);
}
