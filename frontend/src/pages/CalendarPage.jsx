import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCalendarEventColor, STATUS_TRANSLATIONS } from '../utils/statusUtils';

const CalendarPage = () => {
    const { user, isTeamLead } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasksForCalendar = async () => {
            try {
                setIsLoading(true);
                const endpoint = isTeamLead ? '/tasks/all' : '/tasks/my-tasks';
                const response = await axiosInstance.get(endpoint);

                const formattedEvents = response.data
                    .filter(task => task.dueDate)
                    .map(task => ({
                        id: task.id,
                        title: task.title,
                        start: task.dueDate,
                        color: getCalendarEventColor(task.status),
                        extendedProps: {
                            assignees: task.assignees && task.assignees.length > 0
                                ? task.assignees.map(a => a.fullName).join(', ')
                                : 'Atanmamış',
                            status: STATUS_TRANSLATIONS[task.status] || task.status
                        }
                    }));

                setEvents(formattedEvents);
                setError('');
            } catch (err) {
                setError("Görevler takvime yüklenirken bir hata oluştu.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchTasksForCalendar();
        }
    }, [user, isTeamLead]);

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
                    navigate(`/tasks/${info.event.id}`);
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