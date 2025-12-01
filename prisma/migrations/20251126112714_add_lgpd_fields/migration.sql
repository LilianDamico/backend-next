/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Consentimento` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Consentimento` table. All the data in the column will be lost.
  - Added the required column `atualizadoEm` to the `Consentimento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consentimento" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "atualizadoEm" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Consentimento_userId_idx" ON "Consentimento"("userId");
