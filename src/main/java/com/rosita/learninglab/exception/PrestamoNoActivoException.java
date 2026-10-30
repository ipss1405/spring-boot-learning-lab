package com.rosita.learninglab.exception;

public class PrestamoNoActivoException extends RuntimeException {
    public PrestamoNoActivoException(Long id) {
        super("El préstamo con id " + id + " no está ACTIVO y no puede devolverse");
    }
}
