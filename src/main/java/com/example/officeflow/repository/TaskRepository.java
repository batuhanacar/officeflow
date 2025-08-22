package com.example.officeflow.repository;

import com.example.officeflow.entity.Task;
import com.example.officeflow.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignees_Id(Long userId);
    List<Task> findByStatus(TaskStatus status);
}