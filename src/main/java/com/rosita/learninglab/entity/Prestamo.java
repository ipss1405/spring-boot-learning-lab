package com.rosita.learninglab.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class Prestamo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombreAlumno;
    private String correoAlumno;
    private LocalDateTime fechaPrestamo;
    private String estado;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    private Recurso recurso;

    protected Prestamo() {
    }

    public Prestamo(String nombreAlumno, String correoAlumno, Recurso recurso) {
        this.nombreAlumno = nombreAlumno;
        this.correoAlumno = correoAlumno;
        this.recurso = recurso;
        this.fechaPrestamo = LocalDateTime.now();
        this.estado = "ACTIVO";
    }

    public void marcarDevuelto() {
        this.estado = "DEVUELTO";
    }

    public Long getId() { return id; }
    public String getNombreAlumno() { return nombreAlumno; }
    public String getCorreoAlumno() { return correoAlumno; }
    public LocalDateTime getFechaPrestamo() { return fechaPrestamo; }
    public String getEstado() { return estado; }
    public Recurso getRecurso() { return recurso; }
}
