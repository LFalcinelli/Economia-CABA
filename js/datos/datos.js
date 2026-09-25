"use strict";
/* Datos de los capítulos (rankings, barras, series anuales). */

/* ============ datos ============ */
const D = {
  m2: [[2014,101579],[2015,112072],[2016,63478],[2017,66752],[2018,57360],[2019,61308],[2020,54951],[2021,60516],[2022,38211],[2023,20532],[2024,95646],[2025,126340],[2026,152009]],
  usd: [["2022","I",18],["2022","II",17],["2022","III",23],["2022","IV",24],["2023","I",34],["2023","II",51],["2023","III",67],["2023","IV",29],["2024","I",31],["2024","II",25],["2024","III",29],["2024","IV",21],["2025","I",23],["2025","II",20],["2025","III",23],["2025","IV",25],["2026","I",28]],
  hipProv: [["CABA",46.3],["Chubut",19.4],["Neuquén",16.5],["Tierra del Fuego",15.7],["Mendoza",13],["Córdoba",11.5],["Río Negro",11.4],["Santa Fe",11.1],["Buenos Aires",10.4],["Santa Cruz",9.1],["La Pampa",8.2],["Entre Ríos",6.3],["San Juan",6.1],["San Luis",5.4],["Tucumán",4.8],["Salta",4.5],["Corrientes",3.1],["La Rioja",2.1],["Jujuy",2.1],["Catamarca",2],["Chaco",1.8],["Misiones",1.3],["Santiago del Estero",0.9],["Formosa",0.8]],
  escr: [[2010,38294],[2011,39860],[2012,31834],[2013,21450],[2014,20861],[2015,22484],[2016,25394],[2017,36599],[2018,40028],[2019,21713],[2020,8478],[2021,17219],[2022,19996],[2023,23398],[2024,30204],[2025,42549],[2026,41583]],
  pob: [["CABA",-55],["Gran Tucumán",-46],["Santiago del Estero",-44],["Río Cuarto",-44],["Gran Córdoba",-40],["Formosa",-39],["Mar del Plata",-39],["Gran Rosario",-38],["Río Gallegos",-38],["Gran Santa Fe",-37],["Bahía Blanca",-35],["Gran Mendoza",-31],["Gran La Plata",-27],["Rawson – Trelew",-27],["Partidos del GBA",-27],["Neuquén – Plottier",-26],["Ushuaia – Río Grande",-12]],
  ind: [["Río Cuarto",-70],["Santiago del Estero",-69],["Formosa",-69],["Gran Tucumán",-68],["Neuquén – Plottier",-64],["Gran Rosario",-63],["Gran Mendoza",-60],["Mar del Plata",-56],["Gran Córdoba",-51],["Rawson – Trelew",-50],["Partidos del GBA",-43],["Gran La Plata",-42],["CABA",-41],["Gran Santa Fe",-38],["Río Gallegos",0],["Ushuaia – Río Grande",5],["Bahía Blanca",25]],
  delitos: [["Robos",-19,-21],["Hurtos",-15,-19],["Homicidios dolosos",-18,-14],["Muertes en siniestros viales",-10,-12]],
  robos: [["Tucumán",-39.8],["Santa Fe",-35.5],["Córdoba",-28.1],["Entre Ríos",-25.2],["Salta",-23.9],["CABA",-20.9],["Total nacional",-19.4],["Mendoza",-14.3],["Misiones",-4.0]],
  autos: [["Río Negro",53],["Mendoza",50],["Jujuy",45],["Chubut",37],["Neuquén",36],["Santa Fe",29],["Córdoba",28],["San Juan",26],["Entre Ríos",26],["Santiago del Estero",23],["CABA",21],["Buenos Aires",21],["La Pampa",18],["Corrientes",16],["Chaco",13],["Tucumán",11],["Tierra del Fuego",10],["Catamarca",10],["La Rioja",10],["San Luis",10],["Formosa",-1],["Salta",-13],["Santa Cruz",-15],["Misiones",-17]],
  motos: [["Jujuy",152],["Tucumán",150],["San Juan",132],["Corrientes",124],["Santiago del Estero",111],["Chaco",109],["Neuquén",106],["Río Negro",96],["Salta",94],["Entre Ríos",93],["Catamarca",93],["La Pampa",93],["Mendoza",92],["Misiones",83],["Santa Fe",75],["Buenos Aires",73],["Córdoba",68],["Formosa",57],["San Luis",54],["Chubut",40],["La Rioja",34],["Santa Cruz",27],["CABA",8],["Tierra del Fuego",-21]],
  act: [["Nación (EMAE)","ctx2",[100,94.9,100.7,103.1],"Nación"],["Provincia de Bs. As.","2",[100,94.2,98.2,101.2],"PBA"],["Ciudad","hi",[100,94.2,98.4,99.1],"Ciudad"]],
  pbg: [["Financiero (14%)",11],["Transporte y comunicaciones (s/d)",4],["Hoteles y restaurantes (4%)",2],["Servicios sociales y de salud (7%)",1],["Enseñanza (3%)",1],["Administración pública (5%)",0],["Inmobiliarios y empresariales (20%)",-1],["Primario (2%)",-1],["Construcción (4%)",-1],["Servicio doméstico (1%)",-2],["Industria (12%)",-2],["Comercio (14%)",-2],["Servicios comunitarios y personales (4%)",-4],["Electricidad, gas y agua (1%)",-7]],
  food: [["Azúcar y dulces",-46],["Frutas y verduras",-28],["Otros alimentos",-16],["Bebidas",-15],["Cereales y legumbres",-8],["Leche, yogur y lácteos",-1],["Aceites y grasas",1],["Carnes y huevos",6],["Expensas",25]],
  calle: [["2017-11",636,966],["2018-05",662,1091],["2018-11",858,1260],["2019-05",870,1146],["2019-11",833,901],["2021-05",1605,968],["2022-05",1600,1011],["2023-05",2268,1243],["2023-11",2108,1178],["2024-05",2235,1325],["2024-11",2813,1236],["2025-05",2948,1574],["2025-11",3546,1613]],
  cities: [["CABA",4274],["Seúl",3400],["Barcelona",2500],["San Pablo",2300],["Madrid",2300],["Ciudad de México",2000]],
  /* Entender la Ciudad · series de producción, empleo e ingresos publicadas por IDECBA */
  pgb: [[2004,91224],[2005,100824],[2006,112414],[2007,121983],[2008,127107],[2009,127005],[2010,136078],[2011,144205],[2012,146478],[2013,148654],[2014,146338],[2015,149805],[2016,146422],[2017,150659],[2018,149767],[2019,145961],[2020,130515],[2021,143880],[2022,152674],[2023,155183],[2024,146559],[2025,153023]],
  sect: [["Intermediación financiera (13,5%)",12.2],["Agro, pesca y minería (1,9%)",6.2],["Servicios sociales y de salud (7,2%)",2.8],["Enseñanza (2,8%)",1.5],["Inmobiliarios y empresariales (20,1%)",-1.4],["Transporte y comunicaciones (9,0%)",-1.8],["Servicios comunitarios y personales (4,0%)",-1.8],["Administración pública (5,5%)",-2.0],["Electricidad, gas y agua (0,7%)",-2.9],["Comercio (15,0%)",-4.5],["Servicio doméstico (0,8%)",-4.8],["Hoteles y restaurantes (3,3%)",-6.0],["Industria manufacturera (12,5%)",-7.7],["Construcción (3,7%)",-13.4]],
  desoc: [["II trim. 2023",6.8],["II trim. 2025",7.7],["II trim. 2026",7.2]],
  desocZona: [["Norte",5.6,"zn"],["Centro",7.0,"zc"],["Ciudad",7.2,"ctx2"],["Sur",9.1,"zs"]],
  itfReal: [["Sur",2.0,"zs"],["Ciudad",-4.2,"ctx2"],["Centro",-5.1,"zc"],["Norte",-6.0,"zn"]]
};


