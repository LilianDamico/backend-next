-- CreateTable
CREATE TABLE "Prescricao" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consultaId" TEXT NOT NULL,

    CONSTRAINT "Prescricao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prescricao" ADD CONSTRAINT "Prescricao_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
