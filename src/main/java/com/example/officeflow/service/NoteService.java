package com.example.officeflow.service;

import com.example.officeflow.dto.NoteDTO;
import com.example.officeflow.entity.Note;
import com.example.officeflow.entity.User;
import com.example.officeflow.repository.NoteRepository;
import com.example.officeflow.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoteDTO> getNotesForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));
        return noteRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteDTO createNote(NoteDTO noteDTO, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));
        Note note = Note.builder()
                .title(noteDTO.getTitle())
                .content(noteDTO.getContent())
                .user(user)
                .build();
        Note savedNote = noteRepository.save(note);
        return convertToDto(savedNote);
    }

    @Transactional
    public void deleteNote(Long noteId, String username) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Not bulunamadı: " + noteId));

        if (!note.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("Bu notu silme yetkiniz yok.");
        }
        noteRepository.delete(note);
    }

    private NoteDTO convertToDto(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}