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

export const PRODUCTS: Product[] = buildProducts();

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
