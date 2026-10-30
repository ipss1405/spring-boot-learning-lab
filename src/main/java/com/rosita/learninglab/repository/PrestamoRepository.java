package com.rosita.learninglab.repository;

import com.rosita.learninglab.entity.Prestamo;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Prestamo p where p.id = :id")
    Optional<Prestamo> buscarParaDevolucion(@Param("id") Long id);
}
