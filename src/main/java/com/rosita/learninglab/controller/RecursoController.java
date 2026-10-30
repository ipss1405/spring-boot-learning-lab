package com.rosita.learninglab.controller;

import com.rosita.learninglab.dto.RecursoResponse;
import com.rosita.learninglab.service.RecursoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recursos")
public class RecursoController {

    private final RecursoService recursoService;

    public RecursoController(RecursoService recursoService) {
        this.recursoService = recursoService;
    }

    @GetMapping
    public List<RecursoResponse> listar() {
        return recursoService.listar();
    }
}
