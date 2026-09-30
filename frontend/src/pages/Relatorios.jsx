import React, { useState } from "react";
import ModaisRelatorios from "../components/Modais_relatorios";
import Sidebar from "../layout/Sidebar";
import { baixarRelatorio } from "../utils/pdf/baixarRelatorio";

import { relatoriosConfig } from "../utils/constants/relatoriosConfig";
import {
  Users,
  AlertTriangle,
  DollarSign,
  CalendarDays,
  Dumbbell,
  BarChart3,
  Download,
  FileText,
} from "lucide-react";

import "../styles/relatorios.css";
import "../styles/globals.css";


export default function Relatorios() {
  const [modalEtapa, setModalEtapa] = useState(null);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);

  const abrirModal = (tipo) => {
    setRelatorioSelecionado(tipo);
    setModalEtapa(1);
  };

  const fecharModal = () => {
    setModalEtapa(null);
    setRelatorioSelecionado(null);
  };

  const cards = relatoriosConfig;


  return (
    <div className="relatorios-layout">
      <Sidebar />

      <main className="relatorios-page">
        <header className="relatorios-header">
          <h1>Relatórios</h1>
          <p>Geração e exportação de relatórios do sistema</p>
        </header>

        <section className="filtro-box">
          <div className="campo-filtro">
            <label>Período Inicial</label>
            <input type="date" />
          </div>

          <div className="campo-filtro">
            <label>Período Final</label>
            <input type="date" />
          </div>

          <button className="btn btn--primary btn--lg">Aplicar Filtro</button>
        </section>

        <section className="cards-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            

            return (
              <article className="relatorio-card" key={card.tipo}>
                <div className="card-topo">
                  <div className={`card-icon ${card.cor}`}>
                    <Icon />
                  </div>

                  <div>
                    <h3>{card.titulo}</h3>
                    <p>{card.subtitulo}</p>
                  </div>
                </div>


                <button
                  className="btn btn--outline btn--full btn-exportar"
                  onClick={() => abrirModal(card.tipo)}
                >
                  <Download size={16} />
                  Exportar PDF
                </button>
              </article>
            );
          })}
        </section>
      </main>

      <ModaisRelatorios
        modalEtapa={modalEtapa}
        setModalEtapa={setModalEtapa}
        fecharModal={fecharModal}
        relatorioSelecionado={relatorioSelecionado}
      />
    </div>
  );
}
