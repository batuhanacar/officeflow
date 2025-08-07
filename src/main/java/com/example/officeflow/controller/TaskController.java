package com.example.officeflow.controller;

import com.example.officeflow.dto.TaskCreateDTO;
import com.example.officeflow.dto.TaskViewDTO;
import com.example.officeflow.entity.TaskStatus;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.UserRepository;
import com.example.officeflow.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<List<TaskViewDTO>> getAllTasks(Authentication authentication) {

        boolean isTeamLead = authentication.getAuthorities().stream()
                .anyMatch(ga -> ga.getAuthority().equals("ROLE_TEAM_LEAD"));

        if (isTeamLead) {
            return ResponseEntity.ok(taskService.getAllTasks(null));
        } else {
            Optional<User> currentUserOpt = userRepository.findByUsername(authentication.getName());

            if (currentUserOpt.isPresent()) {
                User currentUser = currentUserOpt.get();
                return ResponseEntity.ok(taskService.getAllTasks(currentUser.getId()));
            }

            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<TaskViewDTO> createTask(@Valid @RequestBody TaskCreateDTO taskCreateDTO) {
        TaskViewDTO createdTask = taskService.createTask(taskCreateDTO);
        return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<TaskViewDTO> getTaskById(@PathVariable Long id) {
        TaskViewDTO task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD') or @taskService.isTaskOwner(#id, authentication.name)")
    public ResponseEntity<TaskViewDTO> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        TaskStatus newStatus = TaskStatus.valueOf(body.get("status").toUpperCase());
        TaskViewDTO updatedTask = taskService.updateTaskStatus(id, newStatus);
        return ResponseEntity.ok(updatedTask);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_TEAM_LEAD')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}