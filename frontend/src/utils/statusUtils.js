export const STATUS_TRANSLATIONS = {
    TODO: 'Yapılacak',
    IN_PROGRESS: 'Devam Ediyor',
    DONE: 'Tamamlandı',
};

export const STATUS_OPTIONS = [
    { key: 'TODO', text: 'Yapılacak' },
    { key: 'IN_PROGRESS', text: 'Devam Ediyor' },
    { key: 'DONE', text: 'Tamamlandı' },
];

export const getStatusChipColor = (status) => {
    switch (status) {
        case 'TODO':
            return 'default';
        case 'IN_PROGRESS':
            return 'primary';
        case 'DONE':
            return 'success';
        default:
            return 'default';
    }
};

export const getCalendarEventColor = (status) => {
    switch (status) {
        case 'TODO':
            return '#6c757d'; // Gri
        case 'IN_PROGRESS':
            return '#0d6efd'; // Mavi
        case 'DONE':
            return '#198754'; // Yeşil
        default:
            return 'gray';
    }
};