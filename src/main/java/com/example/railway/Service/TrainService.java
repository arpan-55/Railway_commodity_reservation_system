package com.example.railway.Service;

import com.example.railway.Entity.Train;
import com.example.railway.repository.TrainRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrainService {

    private final TrainRepository repository;

    public TrainService(TrainRepository repository) {
        this.repository = repository;
    }

    public List<Train> search(String source, String destination) {
        return repository.findBySourceIgnoreCaseAndDestinationIgnoreCase(source, destination);
    }

    public List<Train> getAll() {
        return repository.findAll();
    }

    public Train getByNumber(String trainNumber) {
        return repository.findByTrainNumber(trainNumber).orElse(null);
    }
}