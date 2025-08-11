import React, { useState, useEffect, useContext } from 'react'; // useContext'i import et
import { Link as RouterLink } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext'; // AuthContext'i import et

import { Box, Typography, CircularProgress, Alert, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const CalendarPage = () => {
    const { isTeamLead } = useContext(AuthContext); // Context'ten kullanıcının lider olup olmadığını al
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasksForCalendar = async () => {
            try {
                // KULLANICININ ROLÜNE GÖRE DOĞRU ENDPOINT'İ SEÇ
                const endpoint = isTeamLead ? '/tasks/all' : '/tasks/my-tasks';
                const response = await axiosInstance.get(endpoint);

                const formattedEvents = response.data.map(task => ({
                    id: task.id,
                    title: task.title,
                    start: task.dueDate,
                    color: task.status === 'DONE' ? 'green' : (task.status === 'IN_PROGRESS' ? 'blue' : 'gray'),
                    extendedProps: {
                        assignee: task.assignee.fullName
                    }
                }));

                setEvents(formattedEvents);
            } catch (err) {
                console.error("Takvim verisi çekilirken hata:", err);
                setError("Görevler takvime yüklenirken bir hata oluştu.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasksForCalendar();
    }, [isTeamLead]); // isTeamLead değiştiğinde (pek olası değil ama doğru kullanım) yeniden çalış

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Button component={RouterLink} to="/dashboard" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Görev Panosuna Dön
            </Button>
            <Typography variant="h4" component="h1" gutterBottom>
                Görev Takvimi
            </Typography>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                events={events}
                eventClick={(info) => {
                    alert(
                        `Görev: ${info.event.title}\n` +
                        `Atanan: ${info.event.extendedProps.assignee}`
                    );
                }}
                locale="tr"
                buttonText={{
                    today:    'bugün',
                    month:    'ay',
                    week:     'hafta',
                    day:      'gün'
                }}
            />
        </Paper>
    );
};

export default CalendarPage;