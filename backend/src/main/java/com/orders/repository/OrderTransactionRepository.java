package com.orders.repository;

import com.orders.entity.OrderTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderTransactionRepository extends JpaRepository<OrderTransaction, Long> {

    Optional<OrderTransaction> findByOrderNumber(String orderNumber);

    List<OrderTransaction> findByOrderNumberIgnoreCase(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    @Query(value = "SELECT COUNT(*) FROM order_transactions WHERE LOWER(order_number) = LOWER(:orderNumber) AND LOWER(COALESCE(part_no, '')) = LOWER(:partNo)", nativeQuery = true)
    int countDuplicateCombination(@Param("orderNumber") String orderNumber, @Param("partNo") String partNo);
}
