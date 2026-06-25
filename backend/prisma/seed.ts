// prisma/seed.ts — Тестовые данные дипломного проекта
// 70 товаров, 15 пользователей, ~230 заказов

import { PrismaClient, Condition, OrderStatus, PaymentStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();
const PEPPER = process.env.PASSWORD_PEPPER || 'change_this_pepper_in_production!!';

function peppered(pw: string) { return `${PEPPER}:${pw}`; }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickMany<T>(arr: T[], n: number): T[] { return [...arr].sort(() => Math.random() - 0.5).slice(0, n); }
function randomDate(from: Date, to: Date): Date { return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime())); }
function slugify(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

const PRODUCTS = [
  {n:'Брошь с жемчугом арт-деко',c:'jewellery',e:'1920s',co:'France',p:185,cond:'EXCELLENT',fair:false,feat:true},
  {n:'Викторианское камейное колье',c:'jewellery',e:'1880s',co:'Italy',p:340,cond:'GOOD',fair:false,feat:true},
  {n:'Набор браслетов из бакелита',c:'jewellery',e:'1940s',co:'United States',p:95,cond:'GOOD',fair:true,feat:false},
  {n:'Брошь с эмалью в стиле модерн',c:'jewellery',e:'1900s',co:'France',p:220,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Эдвардианские серьги с бриллиантами',c:'jewellery',e:'1910s',co:'United Kingdom',p:890,cond:'EXCELLENT',fair:false,feat:true},
  {n:'Кольцо в стиле модернизм середины века',c:'jewellery',e:'1960s',co:'Denmark',p:145,cond:'GOOD',fair:true,feat:false},
  {n:'Георгианское колье со стразами',c:'jewellery',e:'1820s',co:'France',p:580,cond:'FAIR',fair:false,feat:false},
  {n:'Серьги из люцита в стиле поп-арт',c:'jewellery',e:'1970s',co:'United States',p:68,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Серебряная брошь с марказитом',c:'jewellery',e:'1930s',co:'Germany',p:125,cond:'GOOD',fair:false,feat:false},
  {n:'Бусы из муранского стекла',c:'jewellery',e:'1950s',co:'Italy',p:175,cond:'GOOD',fair:true,feat:false},
  {n:'Скандинавский серебряный браслет',c:'jewellery',e:'1960s',co:'Norway',p:290,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Кулон в египетском стиле',c:'jewellery',e:'1920s',co:'United Kingdom',p:195,cond:'GOOD',fair:false,feat:false},
  {n:'Коктейльное кольцо со стразами',c:'jewellery',e:'1950s',co:'United States',p:85,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Винтажная камейная брошь',c:'jewellery',e:'1940s',co:'Italy',p:155,cond:'GOOD',fair:false,feat:false},
  {n:'Медный браслет в стиле модернизм',c:'jewellery',e:'1970s',co:'United States',p:110,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Эдвардианская жемчужная тиара',c:'jewellery',e:'1900s',co:'France',p:1200,cond:'GOOD',fair:false,feat:false},
  {n:'Ретро брошь с цветочным мотивом',c:'jewellery',e:'1940s',co:'United States',p:120,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Ажурный серебряный браслет',c:'jewellery',e:'1930s',co:'Germany',p:240,cond:'GOOD',fair:false,feat:false},
  {n:'Колье в стиле флэппер с бисером',c:'jewellery',e:'1920s',co:'France',p:195,cond:'FAIR',fair:true,feat:false},
  {n:'Хромированное кольцо в стиле космической эры',c:'jewellery',e:'1970s',co:'Germany',p:89,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Платье-свинг 1950-х годов',c:'clothing',e:'1950s',co:'United Kingdom',p:220,cond:'GOOD',fair:false,feat:true},
  {n:'Пальто макси 1970-х годов',c:'clothing',e:'1970s',co:'Italy',p:175,cond:'GOOD',fair:false,feat:false},
  {n:'Эдвардианская блузка',c:'clothing',e:'1900s',co:'United Kingdom',p:145,cond:'FAIR',fair:false,feat:false},
  {n:'Мини-платье 1960-х годов',c:'clothing',e:'1960s',co:'France',p:195,cond:'GOOD',fair:true,feat:false},
  {n:'Шерстяной костюм в клетку гусиная лапка',c:'clothing',e:'1950s',co:'Italy',p:285,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Пиджак с плечами 1980-х годов',c:'clothing',e:'1980s',co:'United States',p:130,cond:'GOOD',fair:true,feat:false},
  {n:'Викторианское траурное платье',c:'clothing',e:'1880s',co:'United Kingdom',p:650,cond:'FAIR',fair:false,feat:false},
  {n:'Чайное платье 1940-х годов',c:'clothing',e:'1940s',co:'United Kingdom',p:195,cond:'GOOD',fair:false,feat:false},
  {n:'Крестьянская блузка 1970-х',c:'clothing',e:'1970s',co:'France',p:88,cond:'GOOD',fair:true,feat:false},
  {n:'Шёлковый жакет-кимоно',c:'clothing',e:'1930s',co:'Japan',p:320,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Джинсовая куртка 1980-х',c:'clothing',e:'1980s',co:'United States',p:145,cond:'GOOD',fair:true,feat:false},
  {n:'Геометрическое платье в стиле мод',c:'clothing',e:'1960s',co:'United Kingdom',p:215,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Вечернее платье с бисером',c:'clothing',e:'1930s',co:'France',p:580,cond:'GOOD',fair:false,feat:false},
  {n:'Комбинезон-халтер 1950-х',c:'clothing',e:'1950s',co:'United States',p:165,cond:'GOOD',fair:true,feat:false},
  {n:'Джинсы Levi\'s 501 1985 года',c:'clothing',e:'1980s',co:'United States',p:175,cond:'GOOD',fair:true,feat:true},
  {n:'Чайный сервиз Meissen',c:'tableware',e:'1930s',co:'Germany',p:890,cond:'EXCELLENT',fair:false,feat:true},
  {n:'Обеденный сервиз Royal Doulton',c:'tableware',e:'1950s',co:'United Kingdom',p:540,cond:'GOOD',fair:false,feat:false},
  {n:'Коктейльный набор арт-деко',c:'tableware',e:'1930s',co:'France',p:385,cond:'GOOD',fair:true,feat:false},
  {n:'Датский поднос из тика в стиле модерн',c:'tableware',e:'1960s',co:'Denmark',p:95,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Синяя яшмовая посуда Wedgwood',c:'tableware',e:'1900s',co:'United Kingdom',p:240,cond:'GOOD',fair:false,feat:false},
  {n:'Кофейный сервиз Limoges',c:'tableware',e:'1920s',co:'France',p:460,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Фарфоровая чаша советской эпохи',c:'tableware',e:'1960s',co:'Soviet Union',p:75,cond:'GOOD',fair:true,feat:false},
  {n:'Итальянские тарелки из майолики',c:'tableware',e:'1940s',co:'Italy',p:195,cond:'GOOD',fair:false,feat:false},
  {n:'Форма для запекания Pyrex с фламинго',c:'tableware',e:'1950s',co:'United States',p:85,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Столовые приборы из стерлингового серебра',c:'tableware',e:'1920s',co:'United Kingdom',p:720,cond:'GOOD',fair:false,feat:false},
  {n:'Финский стеклянный набор Iittala',c:'tableware',e:'1970s',co:'Finland',p:145,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Японский набор для сакэ',c:'tableware',e:'1940s',co:'Japan',p:125,cond:'GOOD',fair:false,feat:false},
  {n:'Супница в стиле модерн',c:'tableware',e:'1900s',co:'France',p:380,cond:'GOOD',fair:false,feat:false},
  {n:'Кувшин Fiestaware оранжевый',c:'tableware',e:'1940s',co:'United States',p:110,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Набор баварских пивных кружек',c:'tableware',e:'1920s',co:'Germany',p:195,cond:'GOOD',fair:false,feat:false},
  {n:'Бронзовая статуэтка в стиле модерн',c:'art-decor',e:'1900s',co:'France',p:620,cond:'GOOD',fair:false,feat:false},
  {n:'Эдвардианская серебряная фоторамка',c:'art-decor',e:'1900s',co:'United Kingdom',p:145,cond:'GOOD',fair:false,feat:false},
  {n:'Советский конструктивистский плакат',c:'art-decor',e:'1920s',co:'Soviet Union',p:280,cond:'FAIR',fair:false,feat:false},
  {n:'Настенные часы в стиле Bauhaus',c:'art-decor',e:'1930s',co:'Germany',p:390,cond:'GOOD',fair:true,feat:false},
  {n:'Керамическая ваза середины века',c:'art-decor',e:'1950s',co:'United States',p:165,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Японская гравюра на дереве',c:'art-decor',e:'1890s',co:'Japan',p:480,cond:'GOOD',fair:false,feat:false},
  {n:'Каминные часы арт-деко',c:'art-decor',e:'1930s',co:'France',p:520,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Лампа в стиле Tiffany',c:'art-decor',e:'1920s',co:'United States',p:840,cond:'GOOD',fair:false,feat:true},
  {n:'Советская пепельница эпохи освоения космоса',c:'art-decor',e:'1960s',co:'Soviet Union',p:55,cond:'GOOD',fair:true,feat:false},
  {n:'Шелкография в стиле поп-арт',c:'art-decor',e:'1970s',co:'United States',p:295,cond:'GOOD',fair:true,feat:false},
  {n:'Скульптура из муранского стекла',c:'art-decor',e:'1960s',co:'Italy',p:375,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Бельгийская кружевная скатерть',c:'art-decor',e:'1920s',co:'Belgium',p:175,cond:'FAIR',fair:false,feat:false},
  {n:'Часы Omega Constellation 1964 года',c:'watches',e:'1960s',co:'Switzerland',p:1450,cond:'EXCELLENT',fair:false,feat:true},
  {n:'Карманные часы Longines Railroad',c:'watches',e:'1920s',co:'Switzerland',p:680,cond:'GOOD',fair:false,feat:false},
  {n:'Советские часы Восток Командирские',c:'watches',e:'1980s',co:'Soviet Union',p:145,cond:'GOOD',fair:true,feat:false},
  {n:'Часы Seiko 5 Automatic 1975 года',c:'watches',e:'1970s',co:'Japan',p:280,cond:'GOOD',fair:true,feat:false},
  {n:'Часы Rolex Datejust 1968 года',c:'watches',e:'1960s',co:'Switzerland',p:4800,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Часы Tissot Seastar 1970-х годов',c:'watches',e:'1970s',co:'Switzerland',p:380,cond:'GOOD',fair:false,feat:false},
  {n:'Часы Bulova Accutron 1972 года',c:'watches',e:'1970s',co:'United States',p:320,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Часы-калькулятор Casio 1985 года',c:'watches',e:'1980s',co:'Japan',p:95,cond:'GOOD',fair:true,feat:false},

  // ── Дополнительные товары (добавлены для расширения коллекции) ──────
  // Украшения
  {n:'Золотая брошь с гранатами',c:'jewellery',e:'1890s',co:'Russia',p:420,cond:'GOOD',fair:false,feat:false},
  {n:'Серебряное кольцо с янтарём',c:'jewellery',e:'1930s',co:'Germany',p:165,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Жемчужное колье в три нити',c:'jewellery',e:'1950s',co:'France',p:680,cond:'GOOD',fair:false,feat:true},
  {n:'Брошь «Стрела» из позолоченного серебра',c:'jewellery',e:'1940s',co:'United Kingdom',p:210,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Кольцо с аметистом в серебре',c:'jewellery',e:'1960s',co:'Soviet Union',p:95,cond:'GOOD',fair:true,feat:false},
  {n:'Эмалевый медальон с миниатюрой',c:'jewellery',e:'1870s',co:'France',p:850,cond:'FAIR',fair:false,feat:false},
  {n:'Браслет-чарм из жёлтого золота',c:'jewellery',e:'1950s',co:'Italy',p:1100,cond:'EXCELLENT',fair:false,feat:true},
  // Одежда
  {n:'Шёлковый халат-кимоно',c:'clothing',e:'1920s',co:'Japan',p:380,cond:'GOOD',fair:false,feat:false},
  {n:'Твидовый жакет в стиле Шанель',c:'clothing',e:'1960s',co:'France',p:490,cond:'GOOD',fair:false,feat:true},
  {n:'Льняное платье в народном стиле',c:'clothing',e:'1970s',co:'Soviet Union',p:115,cond:'GOOD',fair:true,feat:false},
  {n:'Вечерняя накидка из парчи',c:'clothing',e:'1940s',co:'France',p:320,cond:'FAIR',fair:false,feat:false},
  {n:'Шерстяной берет 1930-х годов',c:'clothing',e:'1930s',co:'France',p:75,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Атласные перчатки выше локтя',c:'clothing',e:'1950s',co:'Italy',p:145,cond:'GOOD',fair:true,feat:false},
  // Посуда
  {n:'Кофейный сервиз советского фарфора',c:'tableware',e:'1970s',co:'Soviet Union',p:185,cond:'GOOD',fair:true,feat:false},
  {n:'Хрустальный графин с бокалами',c:'tableware',e:'1960s',co:'Czech Republic',p:240,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Фарфоровая чайница с росписью',c:'tableware',e:'1910s',co:'Germany',p:195,cond:'GOOD',fair:false,feat:false},
  {n:'Набор для специй из хромированной стали',c:'tableware',e:'1950s',co:'United States',p:85,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Серебряный самовар',c:'tableware',e:'1900s',co:'Russia',p:1800,cond:'GOOD',fair:false,feat:true},
  // Арт и декор
  {n:'Настольные часы «Яйцо Фаберже» (реплика)',c:'art-decor',e:'1970s',co:'Soviet Union',p:220,cond:'GOOD',fair:true,feat:false},
  {n:'Литография Пикассо (репродукция 1960-х)',c:'art-decor',e:'1960s',co:'France',p:480,cond:'EXCELLENT',fair:false,feat:false},
  {n:'Настенное бра в стиле ар-нуво',c:'art-decor',e:'1900s',co:'France',p:620,cond:'GOOD',fair:false,feat:false},
  {n:'Деревянная шкатулка с инкрустацией',c:'art-decor',e:'1930s',co:'Italy',p:145,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Советский агитационный фарфор',c:'art-decor',e:'1920s',co:'Soviet Union',p:390,cond:'FAIR',fair:false,feat:false},
  {n:'Бронзовый подсвечник эпохи модерн',c:'art-decor',e:'1900s',co:'Belgium',p:280,cond:'GOOD',fair:false,feat:false},
  // Часы
  {n:'Часы Patek Philippe 1958 года',c:'watches',e:'1950s',co:'Switzerland',p:8500,cond:'EXCELLENT',fair:false,feat:true},
  {n:'Наручные часы Zenith El Primero',c:'watches',e:'1970s',co:'Switzerland',p:1200,cond:'GOOD',fair:false,feat:false},
  {n:'Советские часы Полёт 1965 года',c:'watches',e:'1960s',co:'Soviet Union',p:185,cond:'GOOD',fair:true,feat:false},
  {n:'Карманные часы Waltham Railroad',c:'watches',e:'1910s',co:'United States',p:420,cond:'GOOD',fair:false,feat:false},
  {n:'Часы Citizen Bullhead 1971 года',c:'watches',e:'1970s',co:'Japan',p:560,cond:'EXCELLENT',fair:true,feat:false},
  {n:'Часы Girard-Perregaux Gyromatic',c:'watches',e:'1960s',co:'Switzerland',p:780,cond:'GOOD',fair:false,feat:false},
];

const NAMES = ['Elena Morozova','Ivan Petrov','Anna Sokolova','Dmitri Volkov','Maria Kozlova','Alexei Novikov','Natalia Fedorova','Sergei Popov','Olga Kuznetsova','Pavel Lebedev','Tatiana Romanova','Andrei Ivanov','Irina Sidorova','Mikhail Orlov','Yulia Smirnova'];
const CITIES = ['Amsterdam','Berlin','Paris','Brussels','Moscow','London'];
const COUNTRIES = ['Netherlands','Germany','France','Belgium','Russia','United Kingdom'];

async function main() {
  console.log('🌱 Seeding Ателье Историй...');

  const adminHash = await argon2.hash(peppered('Admin1234!'));
  const admin = await prisma.user.upsert({
    where:{email:'admin@ateliervieux.com'}, update:{},
    create:{ email:'admin@ateliervieux.com', name:'Shop Admin', passwordHash:adminHash, role:'ADMIN', consentGiven:true, consentGivenAt:new Date() },
  });

  const catRows = [
    {name:'Украшения',slug:'jewellery',sortOrder:1},{name:'Одежда',slug:'clothing',sortOrder:2},
    {name:'Посуда',slug:'tableware',sortOrder:3},{name:'Арт и декор',slug:'art-decor',sortOrder:4},
    {name:'Часы',slug:'watches',sortOrder:5},
  ];
  const cats: Record<string,any> = {};
  for (const c of catRows) {
    cats[c.slug] = await prisma.category.upsert({where:{slug:c.slug},update:{},create:c});
  }
  console.log('✅ Categories');

  const userHash = await argon2.hash(peppered('User1234!'));
  const users: any[] = [admin];
  for (let i=0;i<15;i++) {
    const fullName = NAMES[i];
    const email = fullName.toLowerCase().replace(' ','.')+'@example.com';
    const u = await prisma.user.upsert({
      where:{email}, update:{},
      create:{ email, name:fullName, passwordHash:userHash, role:'USER', consentGiven:true, consentGivenAt:new Date(), phone:`+7 (${randomInt(900,999)}) ${randomInt(100,999)}-${randomInt(10,99)}-${randomInt(10,99)}` },
    });
    users.push(u);
  }
  console.log(`✅ ${users.length} users`);

  const products: any[] = [];
  for (const t of PRODUCTS) {
    const slug = slugify(t.n);
    const existing = await prisma.product.findUnique({where:{slug}});
    if (existing) { products.push(existing); continue; }
    const p = await prisma.product.create({
      data:{
        name:t.n, slug, description:`${t.n} — ${t.co}, ${t.e}. Подлинный предмет в ${t.cond==='EXCELLENT'?'отличном':t.cond==='GOOD'?'хорошем':'удовлетворительном'} состоянии. Сертификат подлинности прилагается.`,
        price:t.p, stock:randomInt(0,3), images:[],  // Фото добавляются вручную через админ-панель
        era:t.e, countryOfOrigin:t.co, condition:t.cond as Condition,
        isActive:true, isFeatured:t.feat, isForFair:t.fair, hideFromMain:t.fair&&Math.random()<0.3,
        viewCount:randomInt(10,800), categoryId:cats[t.c].id,
      },
    });
    products.push(p);
  }
  console.log(`✅ ${products.length} products`);

  // Notification rules
  const regUsers = users.filter(u=>u.role==='USER');
  const ruleTemplates = [
    {name:'Американский винтаж 1980-х',countryOfOrigin:'United States',eraFrom:'1980',eraTo:'1990'},
    {name:'Французские украшения',categoryId:cats['jewellery'].id,countryOfOrigin:'France'},
    {name:'Швейцарские часы',categoryId:cats['watches'].id,countryOfOrigin:'Switzerland'},
    {name:'Винтаж до ₽20000',maxPrice:20000},
    {name:'Советский дизайн',countryOfOrigin:'Soviet Union'},
  ];
  for (let i=0;i<ruleTemplates.length;i++) {
    const id=`seed-rule-${i}`;
    await prisma.notificationRule.upsert({
      where:{id}, update:{},
      create:{id, userId:regUsers[i%regUsers.length].id, isActive:true, notifyByEmail:true, notifyInApp:true, ...ruleTemplates[i]} as any,
    });
  }
  console.log('✅ Notification rules');

  // Events
  const eventList = [
    {id:'seed-event-1',title:'Вечер Art Deco: украшения и стиль 1920-х',description:'Тематический вечер, посвящённый эпохе Art Deco. Лекция, демонстрация коллекции, живая музыка. Вас ждут уникальные экспонаты из частных коллекций, рассказы о судьбах вещей и атмосфера ушедшей эпохи.',location:'г. Ростов-на-Дону, ул. Пушкинская, 48',speaker:'Анна Соколова — куратор Ателье Историй',price:500,startsAt:new Date(Date.now()+14*86400000),endsAt:new Date(Date.now()+14*86400000+3*3600000),maxCapacity:30,isPublished:true},
    {id:'seed-event-2',title:'Лекция: Как отличить подлинный винтаж от копии',description:'Практическая лекция по определению подлинности антиквариата. Эксперт разберёт типичные признаки подделок, расскажет о методах датировки и научит проверять клейма, маркировки и материалы.',location:'г. Ростов-на-Дону, пр. Соколова, 22 (Дом Союзов)',speaker:'Мария Козлова — антикварный эксперт',price:0,startsAt:new Date(Date.now()+30*86400000),endsAt:new Date(Date.now()+30*86400000+2*3600000),maxCapacity:50,isPublished:true},
    {id:'seed-event-3',title:'Мастер-класс: уход за старинными тканями',description:'Правильное хранение и реставрация винтажной одежды. Практические приёмы чистки, глажки и хранения деликатных исторических тканей — шёлка, шерсти, кружева.',location:'г. Ростов-на-Дону, ул. Пушкинская, 48 (Студия Ателье Историй)',speaker:'Ирина Белова — текстильный реставратор',price:1200,startsAt:new Date(Date.now()-5*86400000),endsAt:new Date(Date.now()-5*86400000+3*3600000),isPublished:true},
  ];
  const events: any[] = [];
  for (const e of eventList) {
    const ev = await prisma.event.upsert({where:{id:e.id},update:{},create:e as any});
    events.push(ev);
  }
  for (const u of regUsers.slice(0,10)) {
    try { await prisma.eventRegistration.upsert({where:{eventId_userId:{eventId:events[0].id,userId:u.id}},update:{},create:{eventId:events[0].id,userId:u.id}}); } catch {}
  }
  for (const u of regUsers.slice(0,6)) {
    try { await prisma.eventRegistration.upsert({where:{eventId_userId:{eventId:events[1].id,userId:u.id}},update:{},create:{eventId:events[1].id,userId:u.id}}); } catch {}
  }
  console.log(`✅ ${events.length} events`);

  // Fairs
  const fairProds = products.filter(p=>p.isForFair);
  const fairList = [
    {id:'seed-fair-1',title:'Американский винтаж 1980-х',description:'Джинсы Levi\'s, power blazers, яркие украшения и культовые аксессуары.',startsAt:new Date(Date.now()+7*86400000),endsAt:new Date(Date.now()+14*86400000),isPublished:true},
    {id:'seed-fair-2',title:'Скандинавский дизайн 1950–1970',description:'Посуда Iittala, украшения из Норвегии и Дании, предметы интерьера.',startsAt:new Date(Date.now()-3*86400000),endsAt:new Date(Date.now()+4*86400000),isPublished:true},
  ];
  for (const f of fairList) {
    await prisma.fair.upsert({where:{id:f.id},update:{},create:f as any});
    const subset = f.id==='seed-fair-1'
      ? fairProds.filter((p:any)=>p.countryOfOrigin==='United States')
      : fairProds.filter((p:any)=>['Denmark','Norway','Finland'].includes(p.countryOfOrigin||''));
    for (const p of subset.slice(0,8)) {
      try { await prisma.fairItem.upsert({where:{fairId_productId:{fairId:f.id,productId:p.id}},update:{},create:{fairId:f.id,productId:p.id,discountPct:randomInt(10,25)}}); } catch {}
    }
  }
  console.log('✅ Fairs');

// Промо-баннеры создаются вручную через админ-панель

  // 230 orders
  const statuses:OrderStatus[] = ['PENDING','CONFIRMED','SHIPPED','DELIVERED','DELIVERED','DELIVERED','CANCELLED'];
  const payStatuses:PaymentStatus[] = ['AWAITING','PAID','PAID','PAID','FAILED'];
  const payMethods = ['card','transfer','cash'];
  const oneYearAgo = new Date(Date.now()-365*86400000);
  let orderCount = 0;

  const visibleProducts = products.filter(p=>p.isActive&&!p.hideFromMain);
  for (let i=0;i<230;i++) {
    const user = pick(regUsers);
    const orderDate = randomDate(oneYearAgo, new Date());
    const orderProds = pickMany(visibleProducts, randomInt(1,3));
    if (!orderProds.length) continue;
    const total = orderProds.reduce((s:number,p:any)=>s+Number(p.price),0);
    const ci = randomInt(0,CITIES.length-1);
    try {
      await prisma.order.create({
        data:{
          userId:user.id, status:pick(statuses), totalAmount:total,
          shippingAddress:`Str. ${randomInt(1,200)}`, shippingCity:CITIES[ci],
          shippingCountry:COUNTRIES[ci], shippingZip:`${randomInt(10000,99999)}`,
          paymentStatus:pick(payStatuses), paymentMethod:pick(payMethods),
          createdAt:orderDate, updatedAt:orderDate,
          items:{create:orderProds.map((p:any)=>({productId:p.id,quantity:1,priceAtTime:p.price}))},
        },
      });
      orderCount++;
    } catch {}
  }
  console.log(`✅ ${orderCount} orders`);

  // Demo notifications
  for (const u of regUsers.slice(0,5)) {
    await prisma.notification.createMany({
      data:[
        {userId:u.id,productId:products[0]?.id,type:'NEW_PRODUCT',title:'Новый товар по вашему правилу',body:`Появился "${products[0]?.name}" — €${products[0]?.price}`,isRead:false},
        {userId:u.id,eventId:events[0]?.id,type:'EVENT_REMINDER',title:'Напоминание о мероприятии',body:`Завтра: "${events[0]?.title}"`,isRead:false},
      ],
    });
  }

  console.log('\n🎉 Готово!');
  console.log('  Admin user created. Check .env for credentials.');
  console.log('  Test users created. Default password set via PASSWORD_PEPPER.');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
