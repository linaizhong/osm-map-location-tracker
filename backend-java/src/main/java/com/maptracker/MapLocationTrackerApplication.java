package com.maptracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MapLocationTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(MapLocationTrackerApplication.class, args);
        System.out.println("\n===========================================");
        System.out.println("Map Location Tracker Backend is running!");
        System.out.println("Server: http://localhost:3000");
        System.out.println("===========================================\n");
    }
}