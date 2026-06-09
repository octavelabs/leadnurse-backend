-- CreateEnum
CREATE TYPE "ReferenceRelationship" AS ENUM ('LINE_MANAGER', 'SUPERVISOR', 'COLLEAGUE', 'HR_CONTACT', 'OTHER');

-- CreateEnum
CREATE TYPE "ReferenceStatus" AS ENUM ('PENDING', 'SENT', 'COMPLETED', 'DECLINED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Reference" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "refereeName" TEXT NOT NULL,
    "refereeEmail" TEXT NOT NULL,
    "refereeJobTitle" TEXT,
    "refereeOrganisation" TEXT,
    "relationship" "ReferenceRelationship" NOT NULL DEFAULT 'OTHER',
    "employmentStart" DATE,
    "employmentEnd" DATE,
    "status" "ReferenceStatus" NOT NULL DEFAULT 'PENDING',
    "token" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "requestedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferenceResponse" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "jobTitleDuringTenure" TEXT,
    "reliability" INTEGER NOT NULL,
    "timekeeping" INTEGER NOT NULL,
    "teamwork" INTEGER NOT NULL,
    "communication" INTEGER NOT NULL,
    "overallPerformance" INTEGER NOT NULL,
    "wouldRehire" BOOLEAN NOT NULL,
    "reasonForLeaving" TEXT,
    "additionalComments" TEXT,
    "declarationSigned" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReferenceResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reference_token_key" ON "Reference"("token");

-- CreateIndex
CREATE INDEX "Reference_workerId_idx" ON "Reference"("workerId");

-- CreateIndex
CREATE INDEX "Reference_status_idx" ON "Reference"("status");

-- CreateIndex
CREATE INDEX "Reference_token_idx" ON "Reference"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ReferenceResponse_referenceId_key" ON "ReferenceResponse"("referenceId");

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reference" ADD CONSTRAINT "Reference_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferenceResponse" ADD CONSTRAINT "ReferenceResponse_referenceId_fkey" FOREIGN KEY ("referenceId") REFERENCES "Reference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
