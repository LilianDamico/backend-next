-- CreateTable
CREATE TABLE "PesquisaSatisfacao" (
    "id" TEXT NOT NULL,
    "consultaId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PesquisaSatisfacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PesquisaSatisfacao_consultaId_idx" ON "PesquisaSatisfacao"("consultaId");

-- AddForeignKey
ALTER TABLE "PesquisaSatisfacao" ADD CONSTRAINT "PesquisaSatisfacao_consultaId_fkey" FOREIGN KEY ("consultaId") REFERENCES "Consulta"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
