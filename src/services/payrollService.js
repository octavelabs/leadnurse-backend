const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function calcHours(startTime, endTime) {
  return Math.max(0, (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
}

async function generatePayrollReport({ periodStart, periodEnd, generatedById, notes }) {
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      checkInTime: { gte: new Date(periodStart) },
      checkOutTime: { lte: new Date(periodEnd) },
      checkInTime: { not: null },
      checkOutTime: { not: null },
    },
    include: { shift: true, user: true },
  });

  const userMap = {};
  for (const rec of attendanceRecords) {
    if (!rec.checkInTime || !rec.checkOutTime) continue;
    const uid = rec.userId;
    if (!userMap[uid]) {
      userMap[uid] = { userId: uid, regularHours: 0, overtimeHours: 0, hourlyRate: rec.shift.hourlyRate, shiftsWorked: 0 };
    }
    const scheduledHours = calcHours(rec.shift.startTime, rec.shift.endTime);
    const actualHours = rec.hoursWorked || calcHours(rec.checkInTime, rec.checkOutTime);
    const overtime = Math.max(0, actualHours - scheduledHours);
    userMap[uid].regularHours += Math.min(actualHours, scheduledHours);
    userMap[uid].overtimeHours += overtime;
    userMap[uid].shiftsWorked += 1;
    // use the latest shift hourly rate
    userMap[uid].hourlyRate = rec.shift.hourlyRate;
  }

  let totalAmount = 0;
  const entries = Object.values(userMap).map((e) => {
    const regularPay = e.regularHours * e.hourlyRate;
    const overtimePay = e.overtimeHours * e.hourlyRate * 1.5;
    const totalPay = regularPay + overtimePay;
    totalAmount += totalPay;
    return { ...e, regularPay, overtimePay, totalPay };
  });

  const report = await prisma.payrollReport.create({
    data: {
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      generatedById,
      notes,
      totalAmount,
      entries: { create: entries },
    },
    include: { entries: { include: { user: { select: { id: true, name: true, email: true } } } } },
  });

  return report;
}

module.exports = { generatePayrollReport };
