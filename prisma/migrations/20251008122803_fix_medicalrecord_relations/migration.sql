/*
  Warnings:

  - The values [PROCESSANDO,PAGO,ESTORNADO] on the enum `StatusPagamento` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLINICA] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `avaliadoId` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `avaliadorId` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `Clinica` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `Consulta` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Consulta` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Consulta` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `dosagem` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `duracao` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `frequencia` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `profissionalId` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `prontuarioId` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Prescricao` table. All the data in the column will be lost.
  - You are about to drop the column `clinicaId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profissao` on the `User` table. All the data in the column will be lost.
  - Added the required column `autorId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultaId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destinatarioId` to the `Avaliacao` table without a default value. This is not possible if the table is not empty.
  - Made the column `consultaId` on table `MedicalRecord` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `medicalRecordId` to the `Prescricao` table without a default value. This is not possible if the table is not empty.
  - Made the column `cpf` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusPagamento_new" AS ENUM ('PENDENTE', 'CONCLUIDO', 'CANCELADO');
ALTER TABLE "public"."Pagamento" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pagamento" ALTER COLUMN "status" TYPE "StatusPagamento_new" USING ("status"::text::"StatusPagamento_new");
ALTER TYPE "StatusPagamento" RENAME TO "StatusPagamento_old";
ALTER TYPE "StatusPagamento_new" RENAME TO "StatusPagamento";
DROP TYPE "public"."StatusPagamento_old";
ALTER TABLE "Pagamento" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('CLIENTE', 'PROFISSIONAL', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "tipo" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "tipo" TYPE "UserType_new" USING ("tipo"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "public"."UserType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_avaliadoId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_avaliadorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_consultaId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prescricao" DROP CONSTRAINT "Prescricao_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prescricao" DROP CONSTRAINT "Prescricao_prontuarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_clinicaId_fkey";

-- DropIndex
DROP INDEX "public"."Clinica_cnpj_key";

-- DropIndex
DROP INDEX "public"."MedicalRecord_consultaId_key";

-- DropIndex
DROP INDEX "public"."Pagamento_consultaId_key";

-- AlterTable
ALTER TABLE "Avaliacao" DROP COLUMN "avaliadoId",
DROP COLUMN "avaliadorId",
DROP COLUMN "createdAt",
ADD COLUMN     "autorId" TEXT NOT NULL,
ADD COLUMN     "consultaId" TEXT NOT NULL,
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "destinatarioId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Clinica" DROP COLUMN "cnpj";

-- AlterTable
ALTER TABLE "Consulta" DROP COLUMN "descricao",
DROP COLUMN "status",
DROP COLUMN "valor",
ADD COLUMN     "clinicaId" TEXT;

-- AlterTable
ALTER TABLE "MedicalRecord" ALTER COLUMN "consultaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Prescricao" DROP COLUMN "createdAt",
DROP COLUMN "dosagem",
DROP COLUMN "duracao",
DROP COLUMN "frequencia",
DROP COLUMN "observacoes",
DROP COLUMN "profissionalId",
DROP COLUMN "prontuarioId",
DROP COLUMN "tipo",
ADD COLUMN     "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "medicalRecordId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clinicaId",
DROP COLUMN "profissao",
ALTER COLUMN "cpf" SET NOT NULL,
ALTER COLUMN "tipo" DROP DEFAULT;

-- DropEnum
DROP TYPE "public"."StatusConsulta";

-- DropEnum
DROP TYPE "public"."TipoPrescricao";

-- CreateTable
CREATE TABLE "_ProfissionaisDaClinica" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfissionaisDaClinica_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProfissionaisDaClinica_B_index" ON "_ProfissionaisDaClinica"("B");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_clinicaId_fkey" FOREIGN KEY ("clinicaId") REFERENCES "Clinica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_destinatarioId_fkey" FOREIGN KEY ("destinatarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfissionaisDaClinica" ADD CONSTRAINT "_ProfissionaisDaClinica_A_fkey" FOREIGN KEY ("A") REFERENCES "Clinica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfissionaisDaClinica" ADD CONSTRAINT "_ProfissionaisDaClinica_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
