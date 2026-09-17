-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "missedCheckoutAlertSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ShiftAssignment" ADD COLUMN     "endReminderSentAt" TIMESTAMP(3),
ADD COLUMN     "startReminderSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WorkerCompliance" ADD COLUMN     "expiredNotifiedAt" TIMESTAMP(3),
ADD COLUMN     "expiringSoonNotifiedAt" TIMESTAMP(3);

