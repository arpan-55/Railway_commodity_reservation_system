package com.example.railway;

import com.example.railway.Entity.Train;
import com.example.railway.repository.TrainRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final TrainRepository trainRepository;

    public DataSeeder(TrainRepository trainRepository) {
        this.trainRepository = trainRepository;
    }

    @Override
    public void run(String... args) {
        if (trainRepository.count() > 0) return; // already seeded

        trainRepository.save(new Train("12301", "Rajdhani Express", "Kolkata", "Delhi",
                "16:50", "10:00", "AC 2 Tier", 1850, 100));

        trainRepository.save(new Train("12302", "Superfast Express", "Kolkata", "Delhi",
                "18:30", "11:30", "AC 3 Tier", 1250, 120));

        trainRepository.save(new Train("12303", "Duronto Express", "Kolkata", "Mumbai",
                "20:15", "16:30", "AC 2 Tier", 2100, 90));

        trainRepository.save(new Train("12304", "Shatabdi Express", "Delhi", "Kolkata",
                "06:00", "22:30", "AC Chair Car", 1500, 80));

        System.out.println(">>> Seeded " + trainRepository.count() + " trains");
    }
}