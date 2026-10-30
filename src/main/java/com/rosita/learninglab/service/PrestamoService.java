package com.rosita.learninglab.service;

import com.rosita.learninglab.dto.PrestamoRequest;
import com.rosita.learninglab.dto.PrestamoResponse;
import com.rosita.learninglab.entity.Prestamo;
import com.rosita.learninglab.entity.Recurso;
import com.rosita.learninglab.exception.PrestamoNoActivoException;
import com.rosita.learninglab.exception.PrestamoNoEncontradoException;
import com.rosita.learninglab.exception.RecursoNoDisponibleException;
import com.rosita.learninglab.exception.RecursoNoEncontradoException;
import com.rosita.learninglab.repository.PrestamoRepository;
import com.rosita.learninglab.repository.RecursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final RecursoRepository recursoRepository;

    public PrestamoService(PrestamoRepository prestamoRepository,
                           RecursoRepository recursoRepository) {
        this.prestamoRepository = prestamoRepository;
        this.recursoRepository = recursoRepository;
    }

    @Transactional
    public PrestamoResponse registrar(PrestamoRequest request) {
        Recurso recurso = recursoRepository.findById(request.recursoId())
                .orElseThrow(() -> new RecursoNoEncontradoException(request.recursoId()));

        if (!recurso.isDisponible()) {
            throw new RecursoNoDisponibleException(recurso.getNombre());
        }

        recurso.setDisponible(false);
        Prestamo prestamo = new Prestamo(request.nombreAlumno(), request.correoAlumno(), recurso);
        Prestamo guardado = prestamoRepository.save(prestamo);
        return PrestamoResponse.fromEntity(guardado);
    }

    @Transactional
    public PrestamoResponse devolver(Long id) {
        Prestamo prestamo = prestamoRepository.buscarParaDevolucion(id)
                .orElseThrow(() -> new PrestamoNoEncontradoException(id));

        if (!"ACTIVO".equals(prestamo.getEstado())) {
            throw new PrestamoNoActivoException(id);
        }

        prestamo.marcarDevuelto();
        prestamo.getRecurso().setDisponible(true);
        // El recurso está administrado por JPA: su cambio se guarda en esta transacción.
        return PrestamoResponse.fromEntity(prestamoRepository.save(prestamo));
    }

    @Transactional(readOnly = true)
    public List<PrestamoResponse> listar() {
        return prestamoRepository.findAll().stream()
                .map(PrestamoResponse::fromEntity)
                .toList();
    }
}
