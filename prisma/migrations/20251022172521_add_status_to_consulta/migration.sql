/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Consulta` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `HorarioDisponivel` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `HorarioDisponivel` table. All the data in the column will be lost.
  - Added the required column `dataHora` to the `HorarioDisponivel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profissionalId` to the `HorarioDisponivel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Consulta" DROP COLUMN "createdAt",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'AGENDADA';

-- AlterTable
ALTER TABLE "HorarioDisponivel" DROP COLUMN "createdAt",
DROP COLUMN "data",
ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataHora" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "profissionalId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "HorarioDisponivel" ADD CONSTRAINT "HorarioDisponivel_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
