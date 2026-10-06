package com.example.railway.Service;

import com.example.railway.Entity.Booking;
import com.example.railway.repository.BookingRepository;
import com.example.railway.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public Booking create(Booking booking) {
        // ENFORCE: user must be registered
        if (booking.getPassengerEmail() == null ||
            !userRepository.existsByEmail(booking.getPassengerEmail())) {
            throw new RuntimeException("Please register and login before booking");
        }

        if (booking.getPnr() == null || booking.getPnr().isEmpty()) {
            booking.setPnr("PNR" + Math.floor(100000 + Math.random() * 900000));
        }
        if (booking.getStatus() == null) {
            booking.setStatus("Confirmed");
        }
        return repository.save(booking);
    }

    public List<Booking> getAll() {
        return repository.findAll();
    }

    public Booking getByPnr(String pnr) {
        return repository.findByPnr(pnr).orElse(null);
    }

    public List<Booking> getByEmail(String email) {
        return repository.findByPassengerEmail(email);
    }

    public void cancel(Long id) {
        Booking b = repository.findById(id).orElse(null);
        if (b == null) return;
        b.setStatus("Cancelled");
        repository.save(b);
    }
}