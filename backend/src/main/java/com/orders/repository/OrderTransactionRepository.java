package com.orders.repository;

import com.orders.entity.OrderTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderTransactionRepository extends JpaRepository<OrderTransaction, Long> {

    Optional<OrderTransaction> findByOrderNumber(String orderNumber);

    List<OrderTransaction> findByOrderNumberIgnoreCase(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);
}
