package com.example.officeflow.service;

import com.example.officeflow.dto.TaskCreateDTO;
import com.example.officeflow.dto.TaskViewDTO;
import com.example.officeflow.dto.UserViewDTO;
import com.example.officeflow.entity.Task;
import com.example.officeflow.entity.TaskStatus;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.TaskRepository;
import com.example.officeflow.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskViewDTO createTask(TaskCreateDTO taskCreateDTO) {
        List<User> assigneesList = userRepository.findAllById(taskCreateDTO.getAssigneeIds());
        if (assigneesList.size() != taskCreateDTO.getAssigneeIds().size()) {
            throw new EntityNotFoundException("Atanan kullanıcılardan bazıları bulunamadı.");
        }

        Task task = Task.builder()
                .title(taskCreateDTO.getTitle())
                .description(taskCreateDTO.getDescription())
                .status(TaskStatus.TODO)
                .assignees(new HashSet<>(assigneesList))
                .dueDate(taskCreateDTO.getDueDate())
                .build();

        Task savedTask = taskRepository.save(task);
        return convertToTaskViewDTO(savedTask);
    }

    public List<TaskViewDTO> getAllTasks() {
        return taskRepository.findAll().stream().map(this::convertToTaskViewDTO).collect(Collectors.toList());
    }

    public List<TaskViewDTO> getTasksByAssigneeId(Long userId) {
        return taskRepository.findByAssignees_Id(userId).stream().map(this::convertToTaskViewDTO).collect(Collectors.toList());
    }

    public TaskViewDTO getTaskById(Long id) {
        return taskRepository.findById(id).map(this::convertToTaskViewDTO).orElseThrow(() -> new EntityNotFoundException("Görev bulunamadı"));
    }

    @Transactional
    public TaskViewDTO updateTaskStatus(Long taskId, TaskStatus newStatus) {
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new EntityNotFoundException("Güncellenecek görev bulunamadı"));
        task.setStatus(newStatus);
        return convertToTaskViewDTO(task);
    }

    public void deleteTask(Long taskId) {
        taskRepository.deleteById(taskId);
    }

    public boolean isTaskOwner(Long taskId, String username) {
        return taskRepository.findById(taskId)
                .map(task -> task.getAssignees().stream().anyMatch(user -> user.getUsername().equals(username)))
                .orElse(false);
    }

    private TaskViewDTO convertToTaskViewDTO(Task task) {
        TaskViewDTO taskViewDTO = new TaskViewDTO();
        taskViewDTO.setId(task.getId());
        taskViewDTO.setTitle(task.getTitle());
        taskViewDTO.setDescription(task.getDescription());
        taskViewDTO.setStatus(task.getStatus());
        taskViewDTO.setCreatedDate(task.getCreatedDate());
        taskViewDTO.setDueDate(task.getDueDate());
        Set<UserViewDTO> assigneeDTOs = task.getAssignees().stream()
                .map(user -> new UserViewDTO(user.getId(), user.getFullName(), user.getUsername()))
                .collect(Collectors.toSet());
        taskViewDTO.setAssignees(assigneeDTOs);
        return taskViewDTO;
    }

    @Transactional
    public long cleanupAllCompletedTasks() {
        List<Task> completedTasks = taskRepository.findByStatus(TaskStatus.DONE);
        taskRepository.deleteAll(completedTasks);
        return completedTasks.size();
    }
}