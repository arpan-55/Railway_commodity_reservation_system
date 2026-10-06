package com.example.railway.Controller;

import com.example.railway.Entity.Train;
import com.example.railway.Service.TrainService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trains")
public class TrainController {

    private final TrainService service;

    public TrainController(TrainService service) {
        this.service = service;
    }

    @GetMapping
    public List<Train> getAll() {
        return service.getAll();
    }

    @GetMapping("/search")
    public List<Train> search(@RequestParam String source,
                               @RequestParam String destination) {
        return service.search(source, destination);
    }

    @GetMapping("/{trainNumber}")
    public Train getByNumber(@PathVariable String trainNumber) {
        return service.getByNumber(trainNumber);
    }
}