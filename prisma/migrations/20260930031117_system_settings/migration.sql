-- CreateTable
CREATE TABLE "system_setting" (
    "id" TEXT NOT NULL,
    "policy" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_audit_log" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorEmail" TEXT NOT NULL,
    "before" JSONB NOT NULL,
    "after" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "system_audit_log_createdAt_idx" ON "system_audit_log"("createdAt");
