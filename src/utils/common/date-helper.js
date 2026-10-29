/**
 * Calculates total weekdays (Monday - Friday) in a given month and year
 * @param {number} year e.g. 2026
 * @param {number} month 1-indexed (1 for Jan, 12 for Dec)
 * @returns {number} total working days in that month
 */
const getWorkingDaysInMonth = (year, month) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            workingDays++;
        }
    }
    return workingDays > 0 ? workingDays : 22; // fallback to 22 if month calculation fails
};

/**
 * Returns formatted start and end dates (YYYY-MM-DD) for a given month and year
 * @param {number} year e.g. 2026
 * @param {number} month 1-indexed
 * @returns {{ startDate: string, endDate: string }}
 */
const getMonthDateRange = (year, month) => {
    const paddedMonth = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    const paddedLastDay = String(lastDay).padStart(2, '0');

    return {
        startDate: `${year}-${paddedMonth}-01`,
        endDate: `${year}-${paddedMonth}-${paddedLastDay}`
    };
};

module.exports = {
    getWorkingDaysInMonth,
    getMonthDateRange
};
