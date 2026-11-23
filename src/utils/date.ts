export const formatDateDayTime = (dateString: string | Date | undefined | null) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    // Check for invalid date
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday =
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    const isYesterday =
        date.getDate() === now.getDate() - 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();

    let datePart = '';
    if (isToday) {
        datePart = 'Today';
    } else if (isYesterday) {
        datePart = 'Yesterday';
    } else {
        // Format: 12 Feb
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        datePart = `${day} ${month}`;
    }

    // Format time: 11:18 pm
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    return `${datePart} ${hours}:${minutesStr} ${ampm}`;
};
