package com.maptracker.controller;

import com.maptracker.model.Location;
import com.maptracker.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLocations() {
        try {
            List<Location> locations = locationService.getAllLocations();
            Map<String, Object> response = new HashMap<>();
            response.put("locations", locations);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch locations"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        try {
            return locationService.getLocationById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createLocation(@RequestBody Location location) {
        try {
            if (location.getAddress() == null || location.getLatitude() == null || location.getLongitude() == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Missing required fields: address, latitude, or longitude");
                return ResponseEntity.badRequest().body(error);
            }

            Location savedLocation = locationService.saveLocation(location);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedLocation.getId());
            response.put("name", savedLocation.getName());
            response.put("address", savedLocation.getAddress());
            response.put("latitude", savedLocation.getLatitude());
            response.put("longitude", savedLocation.getLongitude());
            response.put("message", "Location saved successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to save location: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchLocations(@RequestParam String keyword) {
        try {
            List<Location> locations = locationService.searchByName(keyword);
            Map<String, Object> response = new HashMap<>();
            response.put("locations", locations);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search locations"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteLocation(@PathVariable Long id) {
        try {
            boolean deleted = locationService.deleteLocation(id);
            
            Map<String, Object> response = new HashMap<>();
            if (deleted) {
                response.put("message", "Location deleted successfully");
                response.put("deletedRows", 1);
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Location not found");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete location: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}