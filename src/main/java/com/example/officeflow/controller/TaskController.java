package com.example.officeflow.controller;

import com.example.officeflow.dto.TaskCreateDTO;
import com.example.officeflow.dto.TaskViewDTO;
import com.example.officeflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @PreAuthorize("hasRole('TEAM_LEAD')")
    public ResponseEntity<TaskViewDTO> createTask(@Valid @RequestBody TaskCreateDTO taskCreateDTO) {
        TaskViewDTO createdTask = taskService.createTask(taskCreateDTO);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TaskViewDTO>> getAllTasks() {
        List<TaskViewDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskViewDTO> getTaskById(@PathVariable Long id) {
        TaskViewDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }
}