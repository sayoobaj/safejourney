-- CreateTable
CREATE TABLE "AlertSubscription" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "minSeverity" TEXT NOT NULL DEFAULT 'MODERATE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastAlertAt" TIMESTAMP(3),

    CONSTRAINT "AlertSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertSubscription_platform_userId_idx" ON "AlertSubscription"("platform", "userId");

-- CreateIndex
CREATE INDEX "AlertSubscription_type_target_idx" ON "AlertSubscription"("type", "target");

-- CreateIndex
CREATE INDEX "AlertSubscription_active_idx" ON "AlertSubscription"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AlertSubscription_platform_userId_type_target_key" ON "AlertSubscription"("platform", "userId", "type", "target");
