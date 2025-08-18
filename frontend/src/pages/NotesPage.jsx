import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { Box, Button, Typography, CircularProgress, Alert, Paper, TextField, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/notes');
            setNotes(response.data);
            setError('');
        } catch (err) {
            setError('Notlar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleCreateNote = async (e) => {
        e.preventDefault();
        if (!newNoteTitle.trim()) {
            toast.error("Başlık boş olamaz.");
            return;
        }
        setIsSubmitting(true);
        try {
            await axiosInstance.post('/notes', { title: newNoteTitle, content: newNoteContent });
            toast.success('Not başarıyla eklendi.');
            setNewNoteTitle('');
            setNewNoteContent('');
            fetchNotes();
        } catch (err) {
            toast.error('Not eklenemedi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (window.confirm("Bu notu silmek istediğinizden emin misiniz?")) {
            try {
                await axiosInstance.delete(`/notes/${noteId}`);
                toast.success('Not başarıyla silindi.');
                fetchNotes();
            } catch (err) {
                toast.error('Not silinemedi.');
            }
        }
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Kişisel Notlarım
            </Typography>
            <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
                <Box component="form" onSubmit={handleCreateNote}>
                    <Typography variant="h6">Yeni Not Ekle</Typography>
                    <TextField label="Başlık" variant="outlined" fullWidth required value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} sx={{ mt: 2, mb: 1 }} />
                    <TextField label="İçerik (İsteğe Bağlı)" variant="outlined" fullWidth multiline rows={3} value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} sx={{ mb: 2 }} />
                    <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : "Ekle"}
                    </Button>
                </Box>
            </Paper>

            {isLoading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}

            {!isLoading && !error && (
                <List>
                    {notes.length > 0 ? (
                        notes.map(note => (
                            <Paper key={note.id} sx={{ mb: 2 }}>
                                <ListItem
                                    secondaryAction={
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    }
                                >
                                    <ListItemText
                                        primary={note.title}
                                        secondary={note.content}
                                    />
                                </ListItem>
                            </Paper>
                        ))
                    ) : (
                        <Typography>Henüz hiç not eklemediniz.</Typography>
                    )}
                </List>
            )}
        </Box>
    );
};

export default NotesPage;