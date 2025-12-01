/*
  Warnings:

  - You are about to drop the column `atualizadoEm` on the `Consentimento` table. All the data in the column will be lost.
  - Added the required column `origem` to the `Consentimento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `versao` to the `Consentimento` table without a default value. This is not possible if the table is not empty.
  - Made the column `metodo` on table `Consentimento` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Consentimento_userId_idx";

-- DropIndex
DROP INDEX "public"."idx_consulta_prof_cliente";

-- AlterTable
ALTER TABLE "Consentimento" DROP COLUMN "atualizadoEm",
ADD COLUMN     "origem" TEXT NOT NULL,
ADD COLUMN     "versao" TEXT NOT NULL,
ALTER COLUMN "metodo" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Consentimento_userId_criadoEm_idx" ON "Consentimento"("userId", "criadoEm");
