package com.example.officeflow.controller;

import com.example.officeflow.dto.NoteDTO;
import com.example.officeflow.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NoteDTO>> getMyNotes(Authentication authentication) {
        return ResponseEntity.ok(noteService.getNotesForUser(authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NoteDTO> createNote(@RequestBody NoteDTO noteDTO, Authentication authentication) {
        NoteDTO createdNote = noteService.createNote(noteDTO, authentication.getName());
        return new ResponseEntity<>(createdNote, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNote(@PathVariable Long id, Authentication authentication) {
        noteService.deleteNote(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}