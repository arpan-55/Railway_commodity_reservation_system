package com.example.railway.Controller;

import com.example.railway.Entity.Booking;
import com.example.railway.Service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking create(@RequestBody Booking booking) {
        try {
            return service.create(booking);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public List<Booking> getAll() {
        return service.getAll();
    }

    @GetMapping("/{pnr}")
    public Booking getByPnr(@PathVariable String pnr) {
        return service.getByPnr(pnr);
    }

    @GetMapping("/email/{email}")
    public List<Booking> getByEmail(@PathVariable String email) {
        return service.getByEmail(email);
    }

    @PutMapping("/{id}/cancel")
    public void cancel(@PathVariable Long id) {
        service.cancel(id);
    }
}