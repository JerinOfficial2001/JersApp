export const groupMessagesByDate = messages => {
  if (!messages || messages.length === 0) {
    return {};
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getMonthName = monthIndex => {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[monthIndex];
  };

  return messages.reduce((acc, message) => {
    const messageDate = new Date(message.createdAt);
    let dateLabel;

    if (isSameDay(messageDate, today)) {
      dateLabel = 'Today';
    } else if (isSameDay(messageDate, yesterday)) {
      dateLabel = 'Yesterday';
    } else {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      if (messageDate >= startOfWeek) {
        const dayOfWeek = messageDate.getDay();
        const dayNames = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        dateLabel = dayNames[dayOfWeek];
      } else {
        dateLabel = `${messageDate.getDate()} ${getMonthName(
          messageDate.getMonth(),
        )} ${messageDate.getFullYear()}`;
      }
    }

    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }
    acc[dateLabel].push(message);
    return acc;
  }, {});
};

export const getTime = timeStamp => {
  const date = new Date(timeStamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + formattedMinutes + ' ' + ampm;
};

export const getCreatedDay = elem => {
  if (!elem) {
    return '';
  }

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Function to format time as 12-hour format with leading zeros
  const formatTime = date => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Function to format date as DD/MM/YYYY
  const formatDate = date => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  const messageDate = new Date(elem.createdAt);
  let dateLabel;

  if (isSameDay(messageDate, today)) {
    dateLabel = formatTime(messageDate); // Format as 12-hour time
  } else if (isSameDay(messageDate, yesterday)) {
    dateLabel = 'Yesterday';
  } else {
    dateLabel = formatDate(messageDate); // Format as DD/MM/YYYY
  }

  return dateLabel;
};
