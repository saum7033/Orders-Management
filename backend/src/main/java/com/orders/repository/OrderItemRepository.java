package com.orders.repository;

import com.orders.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderNumberIgnoreCase(String orderNumber);

    List<OrderItem> findByDealerCodeIgnoreCase(String dealerCode);

    List<OrderItem> findBySourceIgnoreCase(String source);

    boolean existsByOrderNumberAndPartNo(String orderNumber, String partNo);

    @Query("SELECT DISTINCT o.orderNumber FROM OrderItem o ORDER BY o.orderNumber")
    List<String> findAllDistinctOrderNumbers();
}
