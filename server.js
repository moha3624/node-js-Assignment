const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public')); // Serve the HTML file

// Endpoint to calculate total target excluding Fridays
app.get('/calculate', (req, res) => {
  const { startDate, endDate, totalAnnualTarget } = req.query;

  if (!startDate || !endDate || isNaN(totalAnnualTarget)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  function calculateTotalTarget(startDate, endDate, totalAnnualTarget) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    function getWorkingDaysInMonth(year, month) {
      let workingDays = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 5) { // Exclude Fridays (5 is Friday)
          workingDays++;
        }
      }
      return workingDays;
    }

    function getDaysWorkedInRange(start, end) {
      let yearStart = start.getFullYear();
      let monthStart = start.getMonth();
      let yearEnd = end.getFullYear();
      let monthEnd = end.getMonth();

      let daysExcludingFridays = [];
      let daysWorkedExcludingFridays = [];
      let monthlyTargets = [];
      let totalWorkedDays = 0;

      for (let year = yearStart; year <= yearEnd; year++) {
        let monthStartIndex = year === yearStart ? monthStart : 0;
        let monthEndIndex = year === yearEnd ? monthEnd : 11;

        for (let month = monthStartIndex; month <= monthEndIndex; month++) {
          const totalWorkingDays = getWorkingDaysInMonth(year, month);
          daysExcludingFridays.push(totalWorkingDays);

          const firstDay = (year === yearStart && month === monthStart) ? start.getDate() : 1;
          const lastDay = (year === yearEnd && month === monthEnd) ? end.getDate() : new Date(year, month + 1, 0).getDate();

          let workedDays = 0;
          for (let day = firstDay; day <= lastDay; day++) {
            const currentDate = new Date(year, month, day);
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 5) {
              workedDays++;
            }
          }
          daysWorkedExcludingFridays.push(workedDays);
          totalWorkedDays += workedDays;
        }
      }

      for (let i = 0; i < daysWorkedExcludingFridays.length; i++) {
        const monthlyTarget = (daysWorkedExcludingFridays[i] / totalWorkedDays) * totalAnnualTarget;
        monthlyTargets.push(monthlyTarget);
      }

      return {
        daysExcludingFridays,
        daysWorkedExcludingFridays,
        monthlyTargets,
        totalTarget: monthlyTargets.reduce((a, b) => a + b, 0),
      };
    }

    return getDaysWorkedInRange(new Date(startDate), new Date(endDate));
  }

  const result = calculateTotalTarget(startDate, endDate, parseFloat(totalAnnualTarget));
  res.json(result);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
