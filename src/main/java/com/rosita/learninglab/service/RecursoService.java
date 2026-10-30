package com.rosita.learninglab.service;

import com.rosita.learninglab.dto.RecursoResponse;
import com.rosita.learninglab.repository.RecursoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecursoService {

    private final RecursoRepository recursoRepository;

    public RecursoService(RecursoRepository recursoRepository) {
        this.recursoRepository = recursoRepository;
    }

    public List<RecursoResponse> listar() {
        return recursoRepository.findAll().stream()
                .map(RecursoResponse::fromEntity)
                .toList();
    }
}
