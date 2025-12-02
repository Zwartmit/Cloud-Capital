// import { InvestmentClass } from '@cloud-capital/shared';
export enum InvestmentClass {
  BRONCE = 'BRONCE',
  PLATA = 'PLATA',
  BASIC = 'BASIC',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export interface InvestmentClassData {
  name: string;
  color: string;
  capitalMin: number;
  desc: string;
  dailyProfit: string;
  monthlyCommission: string;
  avgDailyProfit?: string;
  priority: string;
  timeToDuplicate: string;
  icon: string;
  upgradeTarget: number | null;
  upgradeCostRate: number;
}

export const investmentClasses: Record<InvestmentClass, InvestmentClassData> = {
  [InvestmentClass.BRONCE]: {
    name: 'BRONCE',
    color: 'text-profit',
    capitalMin: 100,
    desc: 'Ideal para principiantes. Acceso a las operaciones base de la plataforma con menor prioridad.',
    dailyProfit: '3% Mensual',
    monthlyCommission: '0%',
    priority: 'SIN REFERIDOS',
    timeToDuplicate: 'N/A',
    icon: 'cloud',
    upgradeTarget: 300,
    upgradeCostRate: 0.15,
  },
  [InvestmentClass.PLATA]: {
    name: 'PLATA PREMIUM',
    color: 'text-profit',
    capitalMin: 300,
    desc: 'Clase intermedia. Rendimiento 6% mensual. Mínimo 1 referido activo.',
    dailyProfit: '6% Mensual',
    monthlyCommission: '0%',
    priority: 'Referidos minimos: 1',
    timeToDuplicate: 'N/A',
    icon: 'crown',
    upgradeTarget: 700,
    upgradeCostRate: 0.1,
  },
  [InvestmentClass.BASIC]: {
    name: 'BASIC / STARTER',
    color: 'text-gray-500',
    capitalMin: 100,
    desc: 'Punto de inicio en minería. Rendimiento moderado y estructura clara.',
    dailyProfit: '0.5% – 0.9 %',
    monthlyCommission: '8',
    avgDailyProfit: '≈ 0.8 %',
    timeToDuplicate: '≈ 8.5 – 9 meses',
    priority: 'SIN REFERIDOS',
    icon: 'activity',
    upgradeTarget: 250,
    upgradeCostRate: 0.1,
  },
  [InvestmentClass.SILVER]: {
    name: 'SILVER',
    color: 'text-gray-300',
    capitalMin: 250,
    desc: 'Nivel medio. Rentabilidad estable y mejor tiempo de duplicación.',
    dailyProfit: '0.8 % – 1.1 %',
    monthlyCommission: '8.5',
    avgDailyProfit: '≈ 1.0 %',
    timeToDuplicate: '≈ 7 – 7.5 meses',
    priority: 'SIN REFERIDOS',
    icon: 'server',
    upgradeTarget: 1000,
    upgradeCostRate: 0.08,
  },
  [InvestmentClass.GOLD]: {
    name: 'GOLD',
    color: 'text-yellow-400',
    capitalMin: 1000,
    desc: 'Rendimiento premium y alta prioridad en el pool de minería.',
    dailyProfit: '1.0 % – 1.5 %',
    monthlyCommission: '9',
    avgDailyProfit: '≈ 1.2 %',
    timeToDuplicate: '≈ 6 meses y 2 semanas',
    priority: 'SIN REFERIDOS',
    icon: 'activity',
    upgradeTarget: 2500,
    upgradeCostRate: 0.05,
  },
  [InvestmentClass.PLATINUM]: {
    name: 'PLATINUM',
    color: 'text-sky-300',
    capitalMin: 2500,
    desc: 'Acceso a infraestructura de élite y los rendimientos más altos por capital.',
    dailyProfit: '1.5 % – 1.8 %',
    monthlyCommission: '9.5',
    avgDailyProfit: '≈ 1.6 %',
    timeToDuplicate: '≈ 5 – 5.5 meses',
    priority: 'SIN REFERIDOS',
    icon: 'star',
    upgradeTarget: 5000,
    upgradeCostRate: 0.05,
  },
  [InvestmentClass.DIAMOND]: {
    name: 'DIAMOND',
    color: 'text-pink-400',
    capitalMin: 5000,
    desc: 'La máxima categoría. Rendimiento optimizado y soporte dedicado.',
    dailyProfit: '1.8 % – 2.2 %',
    monthlyCommission: '10',
    avgDailyProfit: '≈ 2.0 %',
    timeToDuplicate: '≈ 4.5 – 5 meses',
    priority: 'SIN REFERIDOS',
    icon: 'gem',
    upgradeTarget: null,
    upgradeCostRate: 0,
  },
};

export const getUserClass = (balance: number): InvestmentClassData => {
  if (balance >= investmentClasses.DIAMOND.capitalMin) return investmentClasses.DIAMOND;
  if (balance >= investmentClasses.PLATINUM.capitalMin) return investmentClasses.PLATINUM;
  if (balance >= investmentClasses.GOLD.capitalMin) return investmentClasses.GOLD;
  if (balance >= investmentClasses.SILVER.capitalMin) return investmentClasses.SILVER;
  if (balance >= investmentClasses.BASIC.capitalMin) return investmentClasses.BASIC;
  if (balance >= investmentClasses.PLATA.capitalMin) return investmentClasses.PLATA;
  return investmentClasses.BRONCE;
};
