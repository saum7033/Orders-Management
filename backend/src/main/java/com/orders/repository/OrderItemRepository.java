package com.orders.repository;

import com.orders.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderNumberIgnoreCase(String orderNumber);

    List<OrderItem> findByDealerCodeIgnoreCase(String dealerCode);

    List<OrderItem> findBySourceIgnoreCase(String source);

    boolean existsByOrderNumberIgnoreCase(String orderNumber);

    @Query(value = "SELECT COUNT(*) FROM order_items " +
                   "WHERE LOWER(order_number) = LOWER(:orderNumber) " +
                   "AND LOWER(part_no) = LOWER(:partNo)",
           nativeQuery = true)
    int countDuplicateCombination(@Param("orderNumber") String orderNumber,
                                  @Param("partNo") String partNo);

    @Query("SELECT DISTINCT o.orderNumber FROM OrderItem o ORDER BY o.orderNumber")
    List<String> findAllDistinctOrderNumbers();
}
