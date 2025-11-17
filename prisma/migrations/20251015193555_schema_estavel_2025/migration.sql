/*
  Warnings:

  - You are about to drop the column `autorId` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `destinatarioId` on the `Avaliacao` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Clinica` table. All the data in the column will be lost.
  - You are about to drop the column `responsavelId` on the `Clinica` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Clinica` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `diagnostico` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `historicoMedico` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `pacienteId` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `profissionalId` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Pagamento` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `especialidade` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Prescricao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProfissionaisDaClinica` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[horarioId]` on the table `Consulta` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `descricao` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Pagamento` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CLIENTE', 'PROFISSIONAL');

-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_autorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Avaliacao" DROP CONSTRAINT "Avaliacao_destinatarioId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Clinica" DROP CONSTRAINT "Clinica_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Consulta" DROP CONSTRAINT "Consulta_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_pacienteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_profissionalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pagamento" DROP CONSTRAINT "Pagamento_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prescricao" DROP CONSTRAINT "Prescricao_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProfissionaisDaClinica" DROP CONSTRAINT "_ProfissionaisDaClinica_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ProfissionaisDaClinica" DROP CONSTRAINT "_ProfissionaisDaClinica_B_fkey";

-- DropIndex
DROP INDEX "public"."Clinica_responsavelId_key";

-- AlterTable
ALTER TABLE "Avaliacao" DROP COLUMN "autorId",
DROP COLUMN "data",
DROP COLUMN "destinatarioId",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Clinica" DROP COLUMN "createdAt",
DROP COLUMN "responsavelId",
DROP COLUMN "updatedAt",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Consulta" ADD COLUMN     "horarioId" TEXT,
ALTER COLUMN "clienteId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MedicalRecord" DROP COLUMN "createdAt",
DROP COLUMN "diagnostico",
DROP COLUMN "historicoMedico",
DROP COLUMN "observacoes",
DROP COLUMN "pacienteId",
DROP COLUMN "profissionalId",
DROP COLUMN "updatedAt",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "descricao" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Pagamento" DROP COLUMN "createdAt",
DROP COLUMN "userId",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "especialidade",
DROP COLUMN "updatedAt",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoUsuario" NOT NULL;

-- DropTable
DROP TABLE "public"."Prescricao";

-- DropTable
DROP TABLE "public"."_ProfissionaisDaClinica";

-- DropEnum
DROP TYPE "public"."StatusPagamento";

-- DropEnum
DROP TYPE "public"."UserType";

-- CreateTable
CREATE TABLE "HorarioDisponivel" (
    "id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HorarioDisponivel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Consulta_horarioId_key" ON "Consulta"("horarioId");

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consulta" ADD CONSTRAINT "Consulta_horarioId_fkey" FOREIGN KEY ("horarioId") REFERENCES "HorarioDisponivel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
