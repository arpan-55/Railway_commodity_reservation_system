package com.example.railway.repository;

import com.example.railway.Entity.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TrainRepository extends JpaRepository<Train, Long> {

    List<Train> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    Optional<Train> findByTrainNumber(String trainNumber);
}