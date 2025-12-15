package com.maptracker.repository;

import com.maptracker.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    
    // Find all locations ordered by timestamp descending (newest first)
    List<Location> findAllByOrderByTimestampDesc();

    // Check if a location with the given name exists
    boolean existsByName(String name);

    // Find location by name
    Optional<Location> findByName(String name);

    // Search locations by name (case-insensitive, partial match)
    @Query("SELECT l FROM Location l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY l.timestamp DESC")
    List<Location> searchByName(@Param("keyword") String keyword);
}