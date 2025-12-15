package com.maptracker.service;

import com.maptracker.model.Location;
import com.maptracker.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class LocationService {

    @Autowired
    private LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public List<Location> getAllLocations() {
        return locationRepository.findAllByOrderByTimestampDesc();
    }

    @Transactional
    public Location saveLocation(Location location) {
        return locationRepository.save(location);
    }

    @Transactional(readOnly = true)
    public Optional<Location> getLocationById(Long id) {
        return locationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Location> searchByName(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllLocations();
        }
        return locationRepository.searchByName(keyword.trim());
    }

    @Transactional
    public boolean deleteLocation(Long id) {
        if (locationRepository.existsById(id)) {
            locationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public long getLocationCount() {
        return locationRepository.count();
    }
}