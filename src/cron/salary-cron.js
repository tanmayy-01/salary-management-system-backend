const cron = require('node-cron');
const { SalaryService } = require('../services');
const { Logger } = require('../config');

/**
 * Initializes Cron Job for Automated Salary Calculation.
 * Runs on the 2nd day of each month at midnight (00:00:00).
 * Cron Expression: '0 0 2 * *'
 */
const initSalaryCron = () => {
    // Schedule: At 00:00 on day-of-month 2
    cron.schedule('0 0 2 * *', async () => {
        console.log('[CRON] Starting automated monthly salary calculation...');
        try {
            const { month, year } = SalaryService.getPreviousMonthAndYear();
            console.log(`[CRON] Calculating salaries for previous month: ${month}/${year}`);

            const report = await SalaryService.generateSalariesForAllEmployees(month, year);
            console.log(`[CRON] Salary calculation completed. Processed: ${report.processedCount}, Skipped: ${report.skippedCount}, Errors: ${report.errorCount}`);
        } catch (error) {
            console.error('[CRON] Error during automated salary calculation:', error.message);
        }
    });

    console.log('[CRON] Salary calculation cron job scheduled for the 2nd day of each month (00:00).');
};

module.exports = {
    initSalaryCron
};
