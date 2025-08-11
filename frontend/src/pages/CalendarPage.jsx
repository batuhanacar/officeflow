import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosInstance from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, CircularProgress, Alert, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getCalendarEventColor } from '../utils/statusUtils';

const CalendarPage = () => {
    const { isTeamLead } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTasksForCalendar = async () => {
            try {
                const endpoint = isTeamLead ? '/tasks/all' : '/tasks/my-tasks';
                const response = await axiosInstance.get(endpoint);

                const formattedEvents = response.data.map(task => ({
                    id: task.id,
                    title: task.title,
                    start: task.dueDate,
                    color: getCalendarEventColor(task.status),
                    extendedProps: {
                        assignee: task.assignee.fullName
                    }
                }));

                setEvents(formattedEvents);
            } catch (err) {
                setError("Görevler takvime yüklenirken bir hata oluştu.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTasksForCalendar();
    }, [isTeamLead]);

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