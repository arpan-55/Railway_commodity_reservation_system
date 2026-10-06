package com.example.railway.Controller;

import com.example.railway.Entity.Parcel;
import com.example.railway.Service.ParcelService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/parcels")
public class ParcelController {

    private final ParcelService service;

    public ParcelController(ParcelService service) {
        this.service = service;
    }

    @PostMapping
    public Parcel create(@RequestBody Parcel parcel) {
        try {
            return service.create(parcel);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public List<Parcel> getAll() {
        return service.getAll();
    }

    @GetMapping("/email/{email}")
    public List<Parcel> getByEmail(@PathVariable String email) {
        return service.getByEmail(email);
    }
}