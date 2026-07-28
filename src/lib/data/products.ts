import type { Product, ProductionRoute, RouteStep } from "../types";
import { MACHINES, PROCESSES } from "./catalog";

interface ModelSpec {
  model: string;
  base: string;
  conductor: "Медь" | "Алюминий";
  insulation: string;
  insulationMaterial: string;
  screen: string;
  armor: string;
  jacket: string;
  voltage: string;
  gost: string;
  tu: string;
  temperature: string;
  kind: "силовой" | "контрольный" | "гибкий";
  notes: string;
  sizes: Array<[number, number]>;
}

const MODELS: ModelSpec[] = [
  {
    model: "КВВГЭнг(А)",
    base: "Кабель контрольный экранированный, не распространяющий горение",
    conductor: "Медь",
    insulation: "ПВХ-пластикат изоляционный",
    insulationMaterial: "ПВХ И40-13А",
    screen: "Алюмополимерная лента с медным дренажным проводником",
    armor: "Отсутствует",
    jacket: "ПВХ-пластикат нг(А)",
    voltage: "0,66 кВ",
    gost: "ГОСТ 1508-78",
    tu: "ТУ 16.К71-310-2001",
    temperature: "−50…+50 °C, нагрев жилы до +70 °C",
    kind: "контрольный",
    notes:
      "Применяется для присоединения к электроприборам и аппаратам вторичных цепей при наличии электромагнитных помех. Прокладка в помещениях, каналах и туннелях, в том числе групповая.",
    sizes: [
      [4, 1.5],
      [7, 1.5],
      [10, 1.5],
      [14, 1.5],
      [19, 1.5],
      [27, 1.5],
      [4, 2.5],
      [7, 2.5],
      [10, 2.5],
      [14, 2.5],
    ],
  },
  {
    model: "КВВГнг(А)-LS",
    base: "Кабель контрольный с пониженным дымогазовыделением",
    conductor: "Медь",
    insulation: "ПВХ-пластикат изоляционный",
    insulationMaterial: "ПВХ И40-13А",
    screen: "Отсутствует",
    armor: "Отсутствует",
    jacket: "ПВХ-пластикат нг(А)-LS",
    voltage: "0,66 кВ",
    gost: "ГОСТ 1508-78",
    tu: "ТУ 16.К71-310-2001",
    temperature: "−50…+50 °C, нагрев жилы до +70 °C",
    kind: "контрольный",
    notes:
      "Рекомендован для прокладки в кабельных сооружениях и производственных помещениях с массовым пребыванием людей.",
    sizes: [
      [4, 1.5],
      [7, 1.5],
      [10, 1.5],
      [19, 1.5],
      [5, 2.5],
      [7, 2.5],
      [14, 2.5],
      [4, 4],
    ],
  },
  {
    model: "ВВГнг(А)-LS",
    base: "Кабель силовой с ПВХ изоляцией пониженной пожарной опасности",
    conductor: "Медь",
    insulation: "ПВХ-пластикат изоляционный",
    insulationMaterial: "ПВХ И40-13А",
    screen: "Отсутствует",
    armor: "Отсутствует",
    jacket: "ПВХ-пластикат нг(А)-LS",
    voltage: "0,66 / 1 кВ",
    gost: "ГОСТ 31996-2012",
    tu: "ТУ 16.К71-336-2004",
    temperature: "−50…+50 °C, нагрев жилы до +70 °C",
    kind: "силовой",
    notes:
      "Основной кабель для стационарной прокладки в жилых и общественных зданиях. Допускается прокладка групповым способом.",
    sizes: [
      [3, 1.5],
      [3, 2.5],
      [3, 4],
      [3, 6],
      [4, 2.5],
      [4, 4],
      [4, 6],
      [4, 10],
      [4, 16],
      [5, 2.5],
      [5, 4],
      [5, 6],
      [5, 10],
    ],
  },
  {
    model: "ВВГ",
    base: "Кабель силовой с ПВХ изоляцией и оболочкой",
    conductor: "Медь",
    insulation: "ПВХ-пластикат изоляционный",
    insulationMaterial: "ПВХ И40-13А",
    screen: "Отсутствует",
    armor: "Отсутствует",
    jacket: "ПВХ-пластикат",
    voltage: "0,66 / 1 кВ",
    gost: "ГОСТ 31996-2012",
    tu: "ТУ 16.К71-336-2004",
    temperature: "−50…+50 °C, нагрев жилы до +70 °C",
    kind: "силовой",
    notes: "Прокладка в сухих и влажных помещениях, каналах, туннелях при отсутствии механических воздействий.",
    sizes: [
      [2, 2.5],
      [3, 2.5],
      [3, 6],
      [4, 4],
      [4, 16],
      [4, 25],
      [4, 35],
    ],
  },
  {
    model: "АВВГ",
    base: "Кабель силовой с алюминиевыми жилами",
    conductor: "Алюминий",
    insulation: "ПВХ-пластикат изоляционный",
    insulationMaterial: "ПВХ И40-13А",
    screen: "Отсутствует",
    armor: "Отсутствует",
    jacket: "ПВХ-пластикат",
    voltage: "0,66 / 1 кВ",
    gost: "ГОСТ 31996-2012",
    tu: "ТУ 16.К71-336-2004",
    temperature: "−50…+50 °C, нагрев жилы до +70 °C",
    kind: "силовой",
    notes: "Магистральные линии электроснабжения, вводные щиты, распределительные пункты.",
    sizes: [
      [4, 16],
      [4, 25],
      [4, 35],
      [4, 50],
      [4, 70],
      [4, 95],
      [4, 120],
    ],
  },
  {
    model: "ВБбШв",
    base: "Кабель силовой бронированный стальными лентами",
    conductor: "Медь",
    insulation: "ПВХ-пластикат изоляционный",
    insulationMaterial: "ПВХ И40-13А",
    screen: "Отсутствует",
    armor: "Две стальные оцинкованные ленты 0,5 мм",
    jacket: "ПВХ-шланг",
    voltage: "1 кВ",
    gost: "ГОСТ 31996-2012",
    tu: "ТУ 16.К71-268-98",
    temperature: "−50…+50 °C, нагрев жилы до +70 °C",
    kind: "силовой",
    notes: "Прокладка в земле и траншеях без дополнительной защиты от механических повреждений.",
    sizes: [
      [4, 6],
      [4, 10],
      [4, 16],
      [4, 25],
      [4, 35],
      [5, 6],
      [5, 16],
    ],
  },
  {
    model: "ПвВГнг(А)-LS",
    base: "Кабель силовой с изоляцией из сшитого полиэтилена",
    conductor: "Медь",
    insulation: "Сшитый полиэтилен",
    insulationMaterial: "СПЭ пероксидной сшивки",
    screen: "Отсутствует",
    armor: "Отсутствует",
    jacket: "ПВХ-пластикат нг(А)-LS",
    voltage: "1 кВ",
    gost: "ГОСТ 31996-2012",
    tu: "ТУ 3500-001-56594541-2010",
    temperature: "−50…+50 °C, нагрев жилы до +90 °C",
    kind: "силовой",
    notes: "Повышенная нагрузочная способность за счёт рабочей температуры жилы +90 °C.",
    sizes: [
      [3, 10],
      [4, 10],
      [4, 25],
      [4, 50],
      [4, 95],
    ],
  },
  {
    model: "КГтп-ХЛ",
    base: "Кабель гибкий с резиновой изоляцией холодостойкий",
    conductor: "Медь",
    insulation: "Резина на основе натурального каучука",
    insulationMaterial: "Резиновая смесь РТИ-1",
    screen: "Отсутствует",
    armor: "Отсутствует",
    jacket: "Резиновая шланговая оболочка",
    voltage: "0,66 кВ",
    gost: "ГОСТ 24334-80",
    tu: "ТУ 16-705.169-80",
    temperature: "−60…+50 °C",
    kind: "гибкий",
    notes: "Питание передвижных механизмов, сварочных постов и строительной техники.",
    sizes: [
      [3, 2.5],
      [3, 4],
      [4, 4],
      [4, 6],
      [4, 10],
    ],
  },
];

function round(value: number, digits = 2) {
  const k = 10 ** digits;
  return Math.round(value * k) / k;
}

function buildProducts(): Product[] {
  const products: Product[] = [];
  let index = 1;
  for (const spec of MODELS) {
    for (const [cores, section] of spec.sizes) {
      const size = `${cores}x${section}`;
      const conductorDensity = spec.conductor === "Медь" ? 8.89 : 2.7;
      const conductorKg = round(cores * section * conductorDensity, 1); // кг/км
      const insulationThickness = section <= 2.5 ? 0.6 : section <= 10 ? 0.8 : section <= 35 ? 1.0 : 1.4;
      const coreDia = round(2 * Math.sqrt(section / Math.PI) * 1.08, 2);
      const insulatedDia = round(coreDia + 2 * insulationThickness, 2);
      const coreArea = Math.PI * ((insulatedDia / 2) ** 2 - (coreDia / 2) ** 2);
      const pvcKg = round(coreArea * cores * 1.38 + 40, 1);
      const bundleDia = round(insulatedDia * (cores <= 3 ? 2.16 : cores <= 5 ? 2.42 : Math.sqrt(cores) * 1.28), 2);
      const hasScreen = spec.screen !== "Отсутствует";
      const hasArmor = spec.armor !== "Отсутствует";
      const screenKg = hasScreen ? round(Math.PI * bundleDia * 0.05 * 2.71 * 1.15, 1) : 0;
      const armorKg = hasArmor ? round(Math.PI * (bundleDia + 1.6) * 0.5 * 7.85 * 1.2, 1) : 0;
      const jacketThickness = bundleDia < 10 ? 1.4 : bundleDia < 20 ? 1.8 : 2.2;
      const outer = round(bundleDia + (hasScreen ? 0.4 : 0) + (hasArmor ? 2.2 : 0) + 2 * jacketThickness, 1);
      const jacketKg = round(Math.PI * (outer - jacketThickness) * jacketThickness * 1.45, 1);
      const weight = round(conductorKg + pvcKg + screenKg + armorKg + jacketKg, 0);
      const priceBase = spec.conductor === "Медь" ? 128 : 42;
      const pricePerM = Math.round(
        (conductorKg * priceBase + (pvcKg + jacketKg) * 26 + screenKg * 52 + armorKg * 13) / 1000 + 900,
      );

      products.push({
        id: `prd-${String(index).padStart(3, "0")}`,
        article: `${spec.model.replace(/[^A-Za-zА-Яа-я0-9]/g, "")}-${size}`.toUpperCase(),
        model: spec.model,
        size,
        cores,
        section,
        name: `${spec.model} ${size}`,
        description: `${spec.base}. Число жил ${cores}, номинальное сечение ${section} мм². Токопроводящая жила — ${spec.conductor.toLowerCase()}, класс гибкости ${section <= 2.5 ? "1" : "2"} по ГОСТ 22483-2012.`,
        voltage: spec.voltage,
        conductor: `${spec.conductor}, ${section <= 2.5 ? "однопроволочная" : "многопроволочная"} круглая жила ${section} мм²`,
        conductorMaterial: spec.conductor,
        insulation: `${spec.insulation}, толщина ${insulationThickness} мм`,
        insulationMaterial: spec.insulationMaterial,
        screen: spec.screen,
        armor: spec.armor,
        jacket: `${spec.jacket}, толщина ${jacketThickness} мм`,
        weightKgPerKm: weight,
        outerDiameter: outer,
        temperature: spec.temperature,
        bendRadius: `${Math.round(outer * (hasArmor ? 10 : 7.5))} мм (${hasArmor ? "10" : "7,5"} наружных диаметров)`,
        gost: spec.gost,
        tu: spec.tu,
        notes: spec.notes,
        routeId: `rt-${String(index).padStart(3, "0")}`,
        copperKgPerKm: conductorKg,
        pvcKgPerKm: round(pvcKg + jacketKg, 1),
        screenKgPerKm: screenKg,
        armorKgPerKm: armorKg,
        pricePerM,
      } as unknown as Product);
      index += 1;
    }
  }
  return products;
}

// АВБШвнг(А)-LS 1 кВ — точные данные из технологической карты завода
// (масса материалов и диаметры взяты из таблиц норм расхода, не по общей формуле)
interface AvbshRow {
  cores: number;
  section: number;
  suffix: string;
  outerDiameter: number;
  weightKgPerKm: number;
  alWireKg: number;
  pvcInsKg: number;
  dyeKg: number;
  peTapeKg: number;
  pvcBeltKg: number;
  steelTapeKg: number;
  pvcSheathKg: number;
}

const AVBSH_INSULATION_THICKNESS: Record<number, number> = {
  70: 1.4,
  95: 1.6,
  120: 1.6,
  150: 1.8,
  185: 2.0,
  240: 2.2,
};

const AVBSH_ROWS: AvbshRow[] = [
  { cores: 2, section: 70, suffix: "", outerDiameter: 35.6, weightKgPerKm: 2149.9, alWireKg: 368.89, pvcInsKg: 181.57, dyeKg: 0.91, peTapeKg: 19.5, pvcBeltKg: 861.65, steelTapeKg: 328.26, pvcSheathKg: 408.62 },
  { cores: 2, section: 95, suffix: "", outerDiameter: 40.1, weightKgPerKm: 2709.38, alWireKg: 508.89, pvcInsKg: 242.96, dyeKg: 1.22, peTapeKg: 22.75, pvcBeltKg: 1116.1, steelTapeKg: 376.54, pvcSheathKg: 463.67 },
  { cores: 2, section: 120, suffix: "", outerDiameter: 43.34, weightKgPerKm: 3151.98, alWireKg: 645.75, pvcInsKg: 270.97, dyeKg: 1.36, peTapeKg: 25.09, pvcBeltKg: 1319.29, steelTapeKg: 411.29, pvcSheathKg: 503.31 },
  { cores: 2, section: 150, suffix: "", outerDiameter: 48.16, weightKgPerKm: 3861.68, alWireKg: 801.99, pvcInsKg: 340.05, dyeKg: 1.71, peTapeKg: 27.99, pvcBeltKg: 1648.49, steelTapeKg: 458.71, pvcSheathKg: 610.72 },
  { cores: 2, section: 185, suffix: "", outerDiameter: 52.46, weightKgPerKm: 4563.08, alWireKg: 991.0, pvcInsKg: 419.99, dyeKg: 2.11, peTapeKg: 31.1, pvcBeltKg: 1977.03, steelTapeKg: 504.84, pvcSheathKg: 668.11 },
  { cores: 2, section: 240, suffix: "", outerDiameter: 59.1, weightKgPerKm: 5754.04, alWireKg: 1298.27, pvcInsKg: 526.66, dyeKg: 2.65, peTapeKg: 35.32, pvcBeltKg: 2537.79, steelTapeKg: 571.78, pvcSheathKg: 816.9 },
  { cores: 3, section: 70, suffix: "", outerDiameter: 37.61, weightKgPerKm: 2368.89, alWireKg: 553.34, pvcInsKg: 271.9, dyeKg: 1.82, peTapeKg: 20.95, pvcBeltKg: 758.8, steelTapeKg: 349.82, pvcSheathKg: 433.21 },
  { cores: 3, section: 95, suffix: "", outerDiameter: 42.45, weightKgPerKm: 2994.74, alWireKg: 763.34, pvcInsKg: 363.83, dyeKg: 2.44, peTapeKg: 24.44, pvcBeltKg: 971.02, steelTapeKg: 401.72, pvcSheathKg: 492.39 },
  { cores: 3, section: 120, suffix: "", outerDiameter: 46.73, weightKgPerKm: 3603.58, alWireKg: 968.63, pvcInsKg: 405.78, dyeKg: 2.72, peTapeKg: 26.96, pvcBeltKg: 1191.43, steelTapeKg: 443.37, pvcSheathKg: 591.65 },
  { cores: 3, section: 150, suffix: "", outerDiameter: 51.05, weightKgPerKm: 4278.75, alWireKg: 1202.99, pvcInsKg: 510.08, dyeKg: 2.56, peTapeKg: 30.08, pvcBeltKg: 1424.06, steelTapeKg: 489.73, pvcSheathKg: 649.32 },
  { cores: 3, section: 185, suffix: "", outerDiameter: 55.67, weightKgPerKm: 5065.11, alWireKg: 1486.5, pvcInsKg: 629.98, dyeKg: 3.17, peTapeKg: 33.42, pvcBeltKg: 1695.13, steelTapeKg: 539.32, pvcSheathKg: 711.02 },
  { cores: 3, section: 240, suffix: "", outerDiameter: 62.75, weightKgPerKm: 6394.2, alWireKg: 1947.4, pvcInsKg: 789.99, dyeKg: 3.97, peTapeKg: 37.95, pvcBeltKg: 2172.17, steelTapeKg: 610.96, pvcSheathKg: 869.71 },
  { cores: 4, section: 70, suffix: "(N)", outerDiameter: 41.09, weightKgPerKm: 2745.28, alWireKg: 737.78, pvcInsKg: 363.14, dyeKg: 1.82, peTapeKg: 23.47, pvcBeltKg: 779.5, steelTapeKg: 387.2, pvcSheathKg: 475.83 },
  { cores: 4, section: 95, suffix: "(N)", outerDiameter: 47.32, weightKgPerKm: 3600.29, alWireKg: 1017.78, pvcInsKg: 485.92, dyeKg: 2.44, peTapeKg: 27.38, pvcBeltKg: 1045.02, steelTapeKg: 449.66, pvcSheathKg: 599.47 },
  { cores: 4, section: 120, suffix: "(N)", outerDiameter: 51.22, weightKgPerKm: 4197.56, alWireKg: 1291.51, pvcInsKg: 541.94, dyeKg: 2.72, peTapeKg: 30.2, pvcBeltKg: 1218.27, steelTapeKg: 491.54, pvcSheathKg: 651.57 },
  { cores: 4, section: 150, suffix: "(N)", outerDiameter: 56.86, weightKgPerKm: 5135.18, alWireKg: 1603.99, pvcInsKg: 680.11, dyeKg: 3.42, peTapeKg: 33.7, pvcBeltKg: 1515.28, steelTapeKg: 547.8, pvcSheathKg: 784.58 },
  { cores: 4, section: 185, suffix: "(N)", outerDiameter: 62.05, weightKgPerKm: 6081.19, alWireKg: 1982.0, pvcInsKg: 839.98, dyeKg: 4.22, peTapeKg: 37.44, pvcBeltKg: 1792.11, steelTapeKg: 603.38, pvcSheathKg: 859.5 },
  { cores: 4, section: 240, suffix: "(N)", outerDiameter: 70.08, weightKgPerKm: 7692.42, alWireKg: 2596.54, pvcInsKg: 1053.32, dyeKg: 5.29, peTapeKg: 42.53, pvcBeltKg: 2203.67, steelTapeKg: 678.87, pvcSheathKg: 1154.72 },
  { cores: 5, section: 70, suffix: "(N,PE)", outerDiameter: 45.78, weightKgPerKm: 3279.32, alWireKg: 922.23, pvcInsKg: 452.56, dyeKg: 3.65, peTapeKg: 26.27, pvcBeltKg: 888.75, steelTapeKg: 433.18, pvcSheathKg: 578.96 },
  { cores: 5, section: 95, suffix: "(N,PE)", outerDiameter: 51.86, weightKgPerKm: 4163.81, alWireKg: 1272.23, pvcInsKg: 605.56, dyeKg: 4.88, peTapeKg: 30.66, pvcBeltKg: 1122.75, steelTapeKg: 498.35, pvcSheathKg: 660.04 },
  { cores: 5, section: 120, suffix: "(N,PE)", outerDiameter: 57.03, weightKgPerKm: 5003.4, alWireKg: 1614.39, pvcInsKg: 675.39, dyeKg: 5.45, peTapeKg: 33.82, pvcBeltKg: 1371.66, steelTapeKg: 549.56, pvcSheathKg: 786.96 },
  { cores: 5, section: 150, suffix: "(N,PE)", outerDiameter: 62.46, weightKgPerKm: 6803.37, alWireKg: 2004.99, pvcInsKg: 850.14, dyeKg: 4.27, peTapeKg: 37.74, pvcBeltKg: 2470.77, steelTapeKg: 607.78, pvcSheathKg: 865.42 },
  { cores: 5, section: 185, suffix: "(N,PE)", outerDiameter: 69.26, weightKgPerKm: 8307.03, alWireKg: 2477.5, pvcInsKg: 1049.97, dyeKg: 5.28, peTapeKg: 41.93, pvcBeltKg: 2963.69, steelTapeKg: 670.05, pvcSheathKg: 1140.54 },
  { cores: 5, section: 240, suffix: "(N,PE)", outerDiameter: 77.55, weightKgPerKm: 10404.9, alWireKg: 3245.67, pvcInsKg: 1316.65, dyeKg: 6.62, peTapeKg: 47.63, pvcBeltKg: 3793.69, steelTapeKg: 758.92, pvcSheathKg: 1283.35 },
];

function buildAvbshProducts(): Product[] {
  return AVBSH_ROWS.map((r, i) => {
    const size = `${r.cores}x${r.section}${r.suffix}`;
    const insThk = AVBSH_INSULATION_THICKNESS[r.section];
    const armorWidth = r.cores <= 3 ? 35 : 45;
    const pvcKgPerKm = round(r.pvcInsKg + r.dyeKg + r.peTapeKg + r.pvcBeltKg + r.pvcSheathKg, 1);
    return {
      id: `prd-avbsh-${String(i + 1).padStart(2, "0")}`,
      article: `АВБШВНГ(А)LS-${r.cores}X${r.section}${r.suffix}`.replace(/[(),]/g, "").toUpperCase(),
      model: "АВБШвнг(А)-LS",
      size,
      cores: r.cores,
      section: r.section,
      name: `АВБШвнг(А)-LS ${size}`,
      description: `Кабель силовой бронированный стальными лентами, с ПВХ изоляцией пониженной пожарной опасности и заполнением поясной изоляции ПВХ пластикатом ППВ 30(БП). Число жил ${r.cores}, номинальное сечение ${r.section} мм². Токопроводящая жила — алюминий.`,
      voltage: "1 кВ",
      conductor: `Алюминий, многопроволочная круглая жила ${r.section} мм²`,
      conductorMaterial: "Алюминий",
      insulation: `ПВХ-пластикат пониженной пожарной опасности ППИ 30-30, толщина ${insThk} мм`,
      insulationMaterial: "ПВХ ППИ 30-30",
      screen: "Отсутствует",
      armor: `Две стальные оцинкованные ленты 0,3×${armorWidth} мм поверх поясной изоляции ППВ 30(БП)`,
      jacket: "ПВХ-пластикат нг(А)-LS ППО 30-35",
      weightKgPerKm: r.weightKgPerKm,
      outerDiameter: r.outerDiameter,
      temperature: "−50…+50 °C, нагрев жилы до +70 °C",
      bendRadius: `${Math.round(r.outerDiameter * 10)} мм (10 наружных диаметров)`,
      gost: "ГОСТ 31996-2012",
      tu: "ТУ 16.К71-268-98",
      notes:
        "Прокладка в земле, траншеях и кабельных сооружениях с защитой от механических повреждений. Масса материалов и диаметры — по технологической карте завода (норма расхода без отходов); значения перенесены со скана и рекомендуется сверить с оригиналом документа.",
      routeId: `rt-avbsh-${String(i + 1).padStart(2, "0")}`,
      copperKgPerKm: r.alWireKg,
      pvcKgPerKm,
      screenKgPerKm: 0,
      armorKgPerKm: r.steelTapeKg,
      pricePerM: 0,
    } as Product;
  });
}

export const PRODUCTS: Product[] = [...buildProducts(), ...buildAvbshProducts()];

function stepsForProduct(p: Product): RouteStep[] {
  const ids = [
    "p-rod",
    "p-drawing",
    "p-annealing",
    "p-bunching",
    "p-insulation",
    "p-spark",
    "p-cabling",
    "p-binder",
    ...(p.screen !== "Отсутствует" ? ["p-screen"] : []),
    ...(p.armor !== "Отсутствует" ? ["p-armor"] : []),
    "p-sheath",
    "p-test",
    "p-packing",
  ];

  return ids.map((processId, i) => {
    const proc = PROCESSES.find((x) => x.id === processId)!;
    const machineId = proc.machineIds[i % proc.machineIds.length];
    const machine = MACHINES.find((m) => m.id === machineId)!;
    const sizeFactor = Math.max(0.35, 1 - Math.log10(p.section + 1) * 0.32 - p.cores * 0.012);
    const rate = Math.round(Math.min(proc.baseRateMPerHour, machine.capacityMPerHour) * sizeFactor);
    return {
      processId,
      machineId,
      ratePerHour: rate,
      setupMinutes: proc.setupMinutes + (p.cores > 10 ? 15 : 0),
      note:
        processId === "p-insulation"
          ? `Экструзионный инструмент под жилу ${p.section} мм², цветовая маркировка ${p.cores} жил`
          : processId === "p-cabling"
            ? `Скрутка ${p.cores} изолированных жил, заполнение корделем`
            : processId === "p-sheath"
              ? `Наружный диаметр по чертежу ${p.outerDiameter} мм`
              : `Переход по маршрутной карте ${p.article}`,
    };
  });
}

export const ROUTES: ProductionRoute[] = PRODUCTS.map((p, i) => {
  const steps = stepsForProduct(p);
  const totalHours = steps.reduce((acc, s) => acc + 1000 / s.ratePerHour + s.setupMinutes / 60, 0);
  return {
    id: p.routeId,
    productId: p.id,
    code: `МК-${String(i + 1).padStart(3, "0")}/${new Date().getFullYear()}`,
    steps,
    totalHoursPer1000m: Math.round(totalHours * 10) / 10,
  };
});

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getRouteForProduct = (productId: string) => ROUTES.find((r) => r.productId === productId);
export const CABLE_MODELS = Array.from(new Set(PRODUCTS.map((p) => p.model)));
export const CABLE_SIZES = Array.from(new Set(PRODUCTS.map((p) => p.size)));
