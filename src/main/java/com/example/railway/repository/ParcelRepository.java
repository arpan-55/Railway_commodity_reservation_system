package com.example.railway.repository;

import com.example.railway.Entity.Parcel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParcelRepository extends JpaRepository<Parcel, Long> {
    List<Parcel> findByBookedByEmail(String email);
}