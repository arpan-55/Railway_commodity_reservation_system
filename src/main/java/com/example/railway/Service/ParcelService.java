package com.example.railway.Service;

import com.example.railway.Entity.Parcel;
import com.example.railway.repository.ParcelRepository;
import com.example.railway.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParcelService {

    private final ParcelRepository repository;
    private final UserRepository userRepository;

    public ParcelService(ParcelRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public Parcel create(Parcel parcel) {
        // require registered user
        if (parcel.getBookedByEmail() == null ||
            !userRepository.existsByEmail(parcel.getBookedByEmail())) {
            throw new RuntimeException("Please register and login before booking a parcel");
        }

        if (parcel.getParcelId() == null || parcel.getParcelId().isEmpty()) {
            parcel.setParcelId("PCL" + Math.floor(10000 + Math.random() * 90000));
        }
        if (parcel.getStatus() == null) {
            parcel.setStatus("Booked");
        }
        return repository.save(parcel);
    }

    public List<Parcel> getAll() {
        return repository.findAll();
    }

    public List<Parcel> getByEmail(String email) {
        return repository.findByBookedByEmail(email);
    }
}