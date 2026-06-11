package com.orders.repository;

import com.orders.entity.OrderSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderSummaryRepository extends JpaRepository<OrderSummary, Long> {

    List<OrderSummary> findByOrderNumberIgnoreCase(String orderNumber);

    @Query(value = "SELECT COUNT(*) FROM order_summaries WHERE LOWER(order_number) = LOWER(:orderNumber)",
           nativeQuery = true)
    int countByOrderNumber(@Param("orderNumber") String orderNumber);
}
