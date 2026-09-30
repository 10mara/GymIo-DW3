import {
  Users,
  AlertTriangle,
  DollarSign,
  CalendarDays,
  Dumbbell,
  BarChart3,
} from "lucide-react";

export const relatoriosConfig = [
  {
    tipo: "alunos",
    titulo: "Alunos Ativos/Inativos",
    subtitulo: "Relação e comparação de alunos",
    icon: Users,
    cor: "blue",
  },
  {
    tipo: "inadimplencia",
    titulo: "Inadimplência",
    subtitulo: "Análise de pagamentos em atraso",
    icon: AlertTriangle,
    cor: "orange",
  },
  {
    tipo: "receita",
    titulo: "Receita Mensal",
    subtitulo: "Faturamento e detalhes",
    icon: DollarSign,
    cor: "green",
  },
  {
    tipo: "frequencia",
    titulo: "Frequência de Alunos",
    subtitulo: "Padrões de acesso e utilização",
    icon: CalendarDays,
    cor: "blue",
  },
  {
    tipo: "equipamentos",
    titulo: "Equipamentos",
    subtitulo: "Status e manutenções realizadas",
    icon: Dumbbell,
    cor: "blue",
  },
  {
    tipo: "geral",
    titulo: "Relatório Geral",
    subtitulo: "Resumo completo do sistema",
    icon: BarChart3,
    cor: "green",
  },
];