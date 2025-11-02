'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Camera, Utensils, Wine, Coffee, Heart, Users, ChefHat, Sparkles, ArrowRight, CheckCircle, Clock, Star, Globe, AlertTriangle, Eye, EyeOff, Mail, Lock, LogOut, Scan, Languages, DollarSign, TrendingUp, Award, Zap, Target, BarChart3, MapPin, Crown, Gift, Share2, Trophy, Calendar, Flame, Compass, Settings } from 'lucide-react'

interface MenuItem {
  name: string
  category: 'entrada' | 'principal' | 'bebida' | 'sobremesa'
  price?: string
  description?: string
  priceRange?: 'baixo' | 'medio' | 'alto'
  beverageType?: 'cerveja' | 'vinho-tinto' | 'vinho-branco' | 'espumante' | 'drink-alcoolico' | 'drink-sem-alcool' | 'suco-natural' | 'suco-industrial' | 'especial-casa'
  dishType?: 'frutos-do-mar' | 'terrestre' | 'vegetariano'
  compatibilityScore?: number
  isRegional?: boolean
  culturalInfo?: string
}

interface HarmonizationRecommendation {
  entrada: MenuItem & { compatibilityScore: number; preparationTime?: string }
  principal: MenuItem & { compatibilityScore: number; ingredients?: string[] }
  bebida: MenuItem & { compatibilityScore: number; adventureAlternative?: { name: string; price: string; description: string } }
  justificativa: string
  overallScore: number
  adventureAlternative?: {
    entrada: MenuItem
    principal: MenuItem
    bebida: MenuItem
    reason: string
  }
  sommelierTip?: string
  totalExperienceTime?: string
  adventureLevel?: 'Conservador' | 'Equilibrado' | 'Aventureiro'
}

interface Analysis {
  id: string
  timestamp: number
  menuItems: MenuItem[]
  preference: string
  allergies: string[]
  recommendations: HarmonizationRecommendation
  socialContribution: number // R$ 2,00 por análise premium
  location?: {
    city: string
    state: string
    country: string
  }
  hospitalBenefited?: string
}

interface UserPreferences {
  favoriteCategories: string[]
  dietaryRestrictions: string[]
  language: string
  lastAnalysis?: Analysis
  totalAnalyses: number
  totalSocialContribution: number
  location?: {
    city: string
    state: string
    country: string
  }
  subscriptionPlan: 'free' | 'premium-monthly' | 'premium-annual'
  freeAnalysesUsed: number
  badges: string[]
  referralCode?: string
  referrals: number
}

interface User {
  id: string
  email: string
  name: string
  provider: 'email' | 'google'
}

interface RegionalData {
  [key: string]: {
    typicalDrinks: string[]
    typicalDishes: string[]
    culturalInfo: string
    priceMultiplier: number
  }
}

// Regional Database
const regionalDatabase: RegionalData = {
  'SP': {
    typicalDrinks: ['Cerveja Brahma', 'Caipirinha', 'Vinho Aurora', 'Suco de Caju'],
    typicalDishes: ['Virado à Paulista', 'Sanduíche de Mortadela', 'Pastel de Feira'],
    culturalInfo: 'São Paulo é conhecida pela diversidade gastronômica e influência italiana.',
    priceMultiplier: 1.2
  },
  'RJ': {
    typicalDrinks: ['Cerveja Bohemia', 'Caipirinha', 'Água de Coco', 'Mate Gelado'],
    typicalDishes: ['Feijoada', 'Pão de Açúcar', 'Biscoito Globo'],
    culturalInfo: 'Rio de Janeiro combina tradição carioca com influências internacionais.',
    priceMultiplier: 1.15
  },
  'MG': {
    typicalDrinks: ['Cachaça Artesanal', 'Café Especial', 'Suco de Goiaba'],
    typicalDishes: ['Pão de Queijo', 'Feijão Tropeiro', 'Doce de Leite'],
    culturalInfo: 'Minas Gerais é famosa pela culinária tradicional e hospitalidade.',
    priceMultiplier: 0.9
  },
  'RS': {
    typicalDrinks: ['Cerveja Polar', 'Vinho Miolo', 'Chimarrão'],
    typicalDishes: ['Churrasco', 'Arroz Carreteiro', 'Cucuca'],
    culturalInfo: 'Rio Grande do Sul tem forte tradição gaúcha e vinícola.',
    priceMultiplier: 1.0
  },
  'PE': {
    typicalDrinks: ['Cerveja Devassa', 'Batida de Coco', 'Cachaça Pitú'],
    typicalDishes: ['Tapioca', 'Acarajé', 'Bolo de Rolo'],
    culturalInfo: 'Pernambuco oferece sabores únicos do Nordeste brasileiro.',
    priceMultiplier: 0.8
  }
}

// Translations
const translations = {
  pt: {
    title: 'PlateWise',
    subtitle: 'Consultor Gastronômico IA',
    tagline: 'O único app que te ajuda a escolher o prato perfeito E salva vidas ao mesmo tempo',
    // Login translations
    login: 'Entrar',
    register: 'Cadastrar',
    email: 'E-mail',
    password: 'Senha',
    name: 'Nome',
    loginWithGoogle: 'Entrar com Google',
    loginWithEmail: 'Entrar com E-mail',
    dontHaveAccount: 'Não tem conta?',
    alreadyHaveAccount: 'Já tem conta?',
    createAccount: 'Criar conta',
    logout: 'Sair',
    welcome: 'Bem-vindo',
    // Camera translations
    scanMenu: 'Escanear Cardápio',
    scanMenuDescription: 'Use a câmera para escanear o cardápio',
    takePhoto: 'Tirar Foto',
    retakePhoto: 'Tirar Nova Foto',
    usePhoto: 'Usar Esta Foto',
    translateMenu: 'Traduzir Cardápio',
    translateMenuQuestion: 'Deseja traduzir o cardápio para outro idioma?',
    translateTo: 'Traduzir para',
    skipTranslation: 'Pular Tradução',
    translating: 'Traduzindo...',
    // Core features
    premiumAnalysis: 'Análise Premium',
    premiumAnalysisDescription: 'Cada análise premium contribui com R$ 2,00 para hospitais parceiros',
    socialMission: 'Missão Social',
    socialMissionDescription: '3% da renda líquida destinada a hospitais públicos e instituições sem fins lucrativos',
    transparencyReport: 'Relatório de Transparência',
    monthlyDonations: 'Doações Mensais',
    publicReceipts: 'Comprovantes Públicos',
    legalCompliance: 'Conformidade Legal',
    // Genius Feature - Macro Question
    quickQuestionBeforeAnalysis: '🤖 Rápida pergunta antes de analisar:',
    whatsYourPreferenceToday: 'Qual sua preferência para hoje?',
    fruitsOfSea: 'FRUTOS DO MAR',
    fromEarth: 'DA TERRA',
    vegetarian: 'VEGETARIANO',
    balanced: 'TANTO FAZ',
    // Harmonization 360°
    harmonization360: 'Harmonização 360° Completa',
    compatibilityScore: 'Score de Compatibilidade',
    overallHarmony: 'Harmonia Geral',
    adventureOption: 'Opção Aventura',
    tryAdventure: 'Experimentar Aventura',
    whyAdventure: 'Por que esta combinação?',
    // Geolocation
    detectingLocation: 'Detectando localização...',
    locationDetected: 'Localização detectada',
    typicalFromRegion: 'Típico da região',
    tryTypicalHere: 'Experimente o que é típico daqui',
    touristSpecial: 'Bebidas que você não encontra em',
    regionalExplanation: 'Explicação Cultural',
    priceAdjusted: 'Preço ajustado para região',
    // Premium Features
    upgradeToExperience: 'Upgrade para Experiência Completa',
    perfectGastronomicExperience: '🍽️ Sua Experiência Gastronômica Perfeita',
    basedOnProfileHarmonization: 'Baseada no seu perfil + harmonização expert',
    wantThisCompleteExperience: 'QUERO ESSA EXPERIÊNCIA COMPLETA',
    preparationTime: 'Tempo de Preparo',
    mainIngredients: 'Ingredientes Principais',
    harmonizationScore: 'Score Harmonização',
    whyCombinesPerfectly: 'Por que combina perfeitamente',
    detailedJustification: 'Justificativa detalhada da escolha',
    technicalHarmonization: 'Justificativa técnica da harmonização',
    wantAdventure: '🔥 Quer uma aventura?',
    adventureAlternative: 'alternativa exótica',
    socialImpactCard: 'Sua escolha destinou R$ 2,00 para Hospital',
    currentNeed: 'Necessidade atual do hospital',
    monthlyGoalProgress: 'meta mensal',
    seeMyTotalImpact: 'Ver meu impacto total',
    totalInvestment: 'Total investimento',
    shareExperience: 'Escolhi minha experiência perfeita e ajudei a salvar vidas! 🍽️❤️',
    // Subscription Plans
    freePlan: 'Gratuito',
    premiumMonthly: 'Premium Mensal',
    premiumAnnual: 'Premium Anual',
    freeAnalysesLeft: 'análises gratuitas restantes',
    unlimitedAnalyses: 'Análises ILIMITADAS',
    completeHarmonization: 'Harmonização completa (entrada + principal + bebida)',
    hospitalContribution: 'R$ 2,00/análise para hospitais (usuário escolhe qual)',
    sommelierExpertMode: 'Modo "Sommelier Expert" (explicações técnicas detalhadas)',
    completeHistory: 'Histórico completo + learning avançado',
    totalSurprise: '"Surpresa Total" (PlateWise escolhe tudo)',
    withinBudget: '"Dentro do Orçamento" (define valor máximo)',
    socialImpactDashboard: 'Dashboard impacto social personalizado',
    prioritySupport: 'Suporte prioritário',
    earlyAccess: 'Acesso antecipado novas features',
    twoMonthsFree: '2 meses grátis (economia R$ 39,80)',
    annualSocialCertificate: 'Certificado anual impacto social personalizado',
    dessertAnalysis: 'Análise de sobremesas harmonizada',
    gastronomicConsultation: 'Consultoria gastronômica 1-on-1 (1x/ano)',
    // Special Features
    sommelierMode: 'Modo Sommelier',
    surpriseTotal: 'Surpresa Total',
    budgetMode: 'Dentro do Orçamento',
    experienceComparator: 'Comparador de Experiências',
    // Gamification
    badges: 'Conquistas',
    healthHero: 'Herói da Saúde',
    sommelierExpert: 'Sommelier Expert',
    gastronomicExplorer: 'Explorador Gastronômico',
    monthlyRanking: 'Ranking Mensal',
    personalTimeline: 'Timeline Pessoal',
    monthsAgoDiscovered: 'meses você descobriu...',
    // Referral Program
    referFriend: 'Indicar Amigo',
    referralCode: 'Seu código de indicação',
    referralReward: '1 mês Premium grátis para ambos',
    referralLeaderboard: 'Ranking de Indicações',
    // Existing translations
    history: 'Histórico',
    socialImpact: 'Impacto Social',
    mealsDonateds: 'refeições doadas',
    eachAnalysisContributes: 'Cada análise contribui para hospitais locais',
    analysisHistory: 'Histórico de Análises',
    noAnalysisFound: 'Nenhuma análise anterior encontrada',
    seafood: 'Frutos do Mar',
    land: 'Pratos da Terra',
    intelligentMenuAnalysis: 'Análise Inteligente de Cardápio',
    uploadDescription: 'Faça upload da foto do cardápio e nossa IA identificará automaticamente entradas, pratos principais, bebidas, sobremesas e preços',
    clickToUpload: 'Clique para fazer upload',
    fileFormat: 'PNG, JPG até 10MB',
    intelligentOCR: 'OCR Inteligente',
    aiHarmonization: 'Harmonização IA',
    analyzingMenu: 'Analisando Cardápio...',
    aiAnalyzing: 'Nossa IA está identificando pratos, categorizando bebidas e mapeando preços',
    whatsYourPreference: 'Qual sua preferência hoje?',
    choosePreference: 'Escolha sua preferência para receber sugestões personalizadas',
    seafoodDescription: 'Peixes, camarões, lulas e outros sabores do oceano',
    landDescription: 'Carnes, aves, vegetais e sabores terrestres',
    vegetarianDescription: 'Pratos à base de plantas, legumes e grãos',
    balancedDescription: 'Deixe a IA escolher a melhor opção para você',
    allergiesQuestion: 'Você tem alguma restrição ou alergia?',
    allergiesDescription: 'Selecione suas restrições alimentares para recomendações mais seguras',
    noAllergies: 'Não tenho restrições',
    shellfish: 'Frutos do mar/Crustáceos',
    nuts: 'Nozes/Castanhas',
    dairy: 'Laticínios',
    gluten: 'Glúten',
    eggs: 'Ovos',
    soy: 'Soja',
    fish: 'Peixes',
    continue: 'Continuar',
    back: 'Voltar',
    itemsIdentified: 'Itens Identificados',
    appetizers: 'Entradas',
    mainCourses: 'Pratos Principais',
    drinks: 'Bebidas',
    desserts: 'Sobremesas',
    priceMapping: 'Mapeamento de Preços',
    lowPrice: 'Baixo',
    mediumPrice: 'Médio',
    highPrice: 'Alto',
    beverageCategories: 'Categorias de Bebidas',
    beers: 'Cervejas',
    redWines: 'Vinhos Tintos',
    whiteWines: 'Vinhos Brancos',
    sparklingWines: 'Espumantes',
    alcoholicDrinks: 'Drinks Alcoólicos',
    nonAlcoholicDrinks: 'Drinks Sem Álcool',
    naturalJuices: 'Sucos Naturais',
    industrialJuices: 'Sucos Industriais',
    houseSpecials: 'Especiais da Casa',
    perfectHarmonization: 'Harmonização Perfeita',
    basedOnPreference: 'Baseado na sua preferência',
    appetizer: 'Entrada',
    mainCourse: 'Prato Principal',
    drink: 'Bebida',
    technicalJustification: 'Justificativa Técnica',
    socialImpactGenerated: 'Impacto Social Gerado',
    socialImpactDescription: 'Sua análise contribuiu com R$ 2,00 para nossa missão social! Uma refeição será doada para hospitais locais.',
    mealDonated: '+1 refeição doada',
    positiveImpact: 'Impacto positivo',
    contributionAmount: 'R$ 2,00 contribuídos',
    newAnalysis: 'Nova Análise',
    viewHistory: 'Ver Histórico',
    allergiesWarning: 'Atenção: Suas restrições foram consideradas nas recomendações',
    learningSystem: 'Sistema de Aprendizado',
    learningDescription: 'Suas preferências melhoram nossas sugestões constantemente',
    totalContributions: 'Total Contribuído',
    totalAnalyses: 'Análises Realizadas'
  },
  en: {
    title: 'PlateWise',
    subtitle: 'AI Gastronomic Consultant',
    tagline: 'The only app that helps you choose the perfect dish AND saves lives at the same time',
    // Login translations
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    loginWithGoogle: 'Login with Google',
    loginWithEmail: 'Login with Email',
    dontHaveAccount: 'Don\'t have an account?',
    alreadyHaveAccount: 'Already have an account?',
    createAccount: 'Create Account',
    logout: 'Logout',
    welcome: 'Welcome',
    // Camera translations
    scanMenu: 'Scan Menu',
    scanMenuDescription: 'Use camera to scan the menu',
    takePhoto: 'Take Photo',
    retakePhoto: 'Retake Photo',
    usePhoto: 'Use This Photo',
    translateMenu: 'Translate Menu',
    translateMenuQuestion: 'Would you like to translate the menu to another language?',
    translateTo: 'Translate to',
    skipTranslation: 'Skip Translation',
    translating: 'Translating...',
    // Core features
    premiumAnalysis: 'Premium Analysis',
    premiumAnalysisDescription: 'Each premium analysis contributes $2.00 to partner hospitals',
    socialMission: 'Social Mission',
    socialMissionDescription: '3% of net income donated to public hospitals and non-profit institutions',
    transparencyReport: 'Transparency Report',
    monthlyDonations: 'Monthly Donations',
    publicReceipts: 'Public Receipts',
    legalCompliance: 'Legal Compliance',
    // Genius Feature - Macro Question
    quickQuestionBeforeAnalysis: '🤖 Quick question before analyzing:',
    whatsYourPreferenceToday: 'What\'s your preference today?',
    fruitsOfSea: 'SEAFOOD',
    fromEarth: 'FROM EARTH',
    vegetarian: 'VEGETARIAN',
    balanced: 'BALANCED',
    // Harmonization 360°
    harmonization360: 'Complete 360° Harmonization',
    compatibilityScore: 'Compatibility Score',
    overallHarmony: 'Overall Harmony',
    adventureOption: 'Adventure Option',
    tryAdventure: 'Try Adventure',
    whyAdventure: 'Why this combination?',
    // Geolocation
    detectingLocation: 'Detecting location...',
    locationDetected: 'Location detected',
    typicalFromRegion: 'Typical from region',
    tryTypicalHere: 'Try what\'s typical here',
    touristSpecial: 'Drinks you won\'t find in',
    regionalExplanation: 'Cultural Explanation',
    priceAdjusted: 'Price adjusted for region',
    // Premium Features
    upgradeToExperience: 'Upgrade to Complete Experience',
    perfectGastronomicExperience: '🍽️ Your Perfect Gastronomic Experience',
    basedOnProfileHarmonization: 'Based on your profile + expert harmonization',
    wantThisCompleteExperience: 'I WANT THIS COMPLETE EXPERIENCE',
    preparationTime: 'Preparation Time',
    mainIngredients: 'Main Ingredients',
    harmonizationScore: 'Harmonization Score',
    whyCombinesPerfectly: 'Why it combines perfectly',
    detailedJustification: 'Detailed choice justification',
    technicalHarmonization: 'Technical harmonization justification',
    wantAdventure: '🔥 Want an adventure?',
    adventureAlternative: 'exotic alternative',
    socialImpactCard: 'Your choice donated $2.00 to Hospital',
    currentNeed: 'Current hospital need',
    monthlyGoalProgress: 'monthly goal',
    seeMyTotalImpact: 'See my total impact',
    totalInvestment: 'Total investment',
    shareExperience: 'I chose my perfect experience and helped save lives! 🍽️❤️',
    // Subscription Plans
    freePlan: 'Free',
    premiumMonthly: 'Premium Monthly',
    premiumAnnual: 'Premium Annual',
    freeAnalysesLeft: 'free analyses left',
    unlimitedAnalyses: 'UNLIMITED Analyses',
    completeHarmonization: 'Complete harmonization (appetizer + main + drink)',
    hospitalContribution: '$2.00/analysis to hospitals (user chooses which)',
    sommelierExpertMode: '"Sommelier Expert" mode (detailed technical explanations)',
    completeHistory: 'Complete history + advanced learning',
    totalSurprise: '"Total Surprise" (PlateWise chooses everything)',
    withinBudget: '"Within Budget" (set maximum value)',
    socialImpactDashboard: 'Personalized social impact dashboard',
    prioritySupport: 'Priority support',
    earlyAccess: 'Early access to new features',
    twoMonthsFree: '2 months free (save $39.80)',
    annualSocialCertificate: 'Personalized annual social impact certificate',
    dessertAnalysis: 'Harmonized dessert analysis',
    gastronomicConsultation: '1-on-1 gastronomic consultation (1x/year)',
    // Special Features
    sommelierMode: 'Sommelier Mode',
    surpriseTotal: 'Total Surprise',
    budgetMode: 'Within Budget',
    experienceComparator: 'Experience Comparator',
    // Gamification
    badges: 'Achievements',
    healthHero: 'Health Hero',
    sommelierExpert: 'Sommelier Expert',
    gastronomicExplorer: 'Gastronomic Explorer',
    monthlyRanking: 'Monthly Ranking',
    personalTimeline: 'Personal Timeline',
    monthsAgoDiscovered: 'months ago you discovered...',
    // Referral Program
    referFriend: 'Refer Friend',
    referralCode: 'Your referral code',
    referralReward: '1 month Premium free for both',
    referralLeaderboard: 'Referral Leaderboard',
    // Existing translations
    history: 'History',
    socialImpact: 'Social Impact',
    mealsDonateds: 'meals donated',
    eachAnalysisContributes: 'Each analysis contributes to local hospitals',
    analysisHistory: 'Analysis History',
    noAnalysisFound: 'No previous analysis found',
    seafood: 'Seafood',
    land: 'Land Dishes',
    intelligentMenuAnalysis: 'Intelligent Menu Analysis',
    uploadDescription: 'Upload a photo of the menu and our AI will automatically identify appetizers, main courses, drinks, desserts and prices',
    clickToUpload: 'Click to upload',
    fileFormat: 'PNG, JPG up to 10MB',
    intelligentOCR: 'Intelligent OCR',
    aiHarmonization: 'AI Harmonization',
    analyzingMenu: 'Analyzing Menu...',
    aiAnalyzing: 'Our AI is identifying dishes, categorizing drinks and mapping prices',
    whatsYourPreference: 'What\'s your preference today?',
    choosePreference: 'Choose your preference to receive personalized suggestions',
    seafoodDescription: 'Fish, shrimp, squid and other ocean flavors',
    landDescription: 'Meat, poultry, vegetables and terrestrial flavors',
    vegetarianDescription: 'Plant-based dishes, vegetables and grains',
    balancedDescription: 'Let AI choose the best option for you',
    allergiesQuestion: 'Do you have any restrictions or allergies?',
    allergiesDescription: 'Select your dietary restrictions for safer recommendations',
    noAllergies: 'No restrictions',
    shellfish: 'Shellfish/Crustaceans',
    nuts: 'Nuts',
    dairy: 'Dairy',
    gluten: 'Gluten',
    eggs: 'Eggs',
    soy: 'Soy',
    fish: 'Fish',
    continue: 'Continue',
    back: 'Back',
    itemsIdentified: 'Items Identified',
    appetizers: 'Appetizers',
    mainCourses: 'Main Courses',
    drinks: 'Drinks',
    desserts: 'Desserts',
    priceMapping: 'Price Mapping',
    lowPrice: 'Low',
    mediumPrice: 'Medium',
    highPrice: 'High',
    beverageCategories: 'Beverage Categories',
    beers: 'Beers',
    redWines: 'Red Wines',
    whiteWines: 'White Wines',
    sparklingWines: 'Sparkling Wines',
    alcoholicDrinks: 'Alcoholic Drinks',
    nonAlcoholicDrinks: 'Non-Alcoholic Drinks',
    naturalJuices: 'Natural Juices',
    industrialJuices: 'Industrial Juices',
    houseSpecials: 'House Specials',
    perfectHarmonization: 'Perfect Harmonization',
    basedOnPreference: 'Based on your preference',
    appetizer: 'Appetizer',
    mainCourse: 'Main Course',
    drink: 'Drink',
    technicalJustification: 'Technical Justification',
    socialImpactGenerated: 'Social Impact Generated',
    socialImpactDescription: 'Your analysis contributed $2.00 to our social mission! A meal will be donated to local hospitals.',
    mealDonated: '+1 meal donated',
    positiveImpact: 'Positive impact',
    contributionAmount: '$2.00 contributed',
    newAnalysis: 'New Analysis',
    viewHistory: 'View History',
    allergiesWarning: 'Warning: Your restrictions have been considered in the recommendations',
    learningSystem: 'Learning System',
    learningDescription: 'Your preferences constantly improve our suggestions',
    totalContributions: 'Total Contributed',
    totalAnalyses: 'Analyses Performed'
  },
  es: {
    title: 'PlateWise',
    subtitle: 'Consultor Gastronómico IA',
    tagline: 'La única app que te ayuda a elegir el plato perfecto Y salva vidas al mismo tiempo',
    // Login translations
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo',
    password: 'Contraseña',
    name: 'Nombre',
    loginWithGoogle: 'Iniciar con Google',
    loginWithEmail: 'Iniciar con Correo',
    dontHaveAccount: '¿No tienes cuenta?',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    createAccount: 'Crear Cuenta',
    logout: 'Cerrar Sesión',
    welcome: 'Bienvenido',
    // Camera translations
    scanMenu: 'Escanear Menú',
    scanMenuDescription: 'Usa la cámara para escanear el menú',
    takePhoto: 'Tomar Foto',
    retakePhoto: 'Tomar Nueva Foto',
    usePhoto: 'Usar Esta Foto',
    translateMenu: 'Traducir Menú',
    translateMenuQuestion: '¿Te gustaría traducir el menú a otro idioma?',
    translateTo: 'Traducir a',
    skipTranslation: 'Saltar Traducción',
    translating: 'Traduciendo...',
    // Core features
    premiumAnalysis: 'Análisis Premium',
    premiumAnalysisDescription: 'Cada análisis premium contribuye con $2.00 a hospitales asociados',
    socialMission: 'Misión Social',
    socialMissionDescription: '3% de los ingresos netos donados a hospitales públicos e instituciones sin fines de lucro',
    transparencyReport: 'Informe de Transparencia',
    monthlyDonations: 'Donaciones Mensuales',
    publicReceipts: 'Recibos Públicos',
    legalCompliance: 'Cumplimiento Legal',
    // Genius Feature - Macro Question
    quickQuestionBeforeAnalysis: '🤖 Pregunta rápida antes de analizar:',
    whatsYourPreferenceToday: '¿Cuál es tu preferencia para hoy?',
    fruitsOfSea: 'FRUTOS DEL MAR',
    fromEarth: 'DE LA TIERRA',
    vegetarian: 'VEGETARIANO',
    balanced: 'EQUILIBRADO',
    // Harmonization 360°
    harmonization360: 'Armonización 360° Completa',
    compatibilityScore: 'Puntuación de Compatibilidad',
    overallHarmony: 'Armonía General',
    adventureOption: 'Opción Aventura',
    tryAdventure: 'Probar Aventura',
    whyAdventure: '¿Por qué esta combinación?',
    // Geolocation
    detectingLocation: 'Detectando ubicación...',
    locationDetected: 'Ubicación detectada',
    typicalFromRegion: 'Típico de la región',
    tryTypicalHere: 'Prueba lo típico de aquí',
    touristSpecial: 'Bebidas que no encuentras en',
    regionalExplanation: 'Explicación Cultural',
    priceAdjusted: 'Precio ajustado para la región',
    // Premium Features
    upgradeToExperience: 'Actualizar a Experiencia Completa',
    perfectGastronomicExperience: '🍽️ Tu Experiencia Gastronómica Perfecta',
    basedOnProfileHarmonization: 'Basada en tu perfil + armonización experta',
    wantThisCompleteExperience: 'QUIERO ESTA EXPERIENCIA COMPLETA',
    preparationTime: 'Tiempo de Preparación',
    mainIngredients: 'Ingredientes Principales',
    harmonizationScore: 'Puntuación Armonización',
    whyCombinesPerfectly: 'Por qué combina perfectamente',
    detailedJustification: 'Justificación detallada de la elección',
    technicalHarmonization: 'Justificación técnica de la armonización',
    wantAdventure: '🔥 ¿Quieres una aventura?',
    adventureAlternative: 'alternativa exótica',
    socialImpactCard: 'Tu elección donó $2.00 al Hospital',
    currentNeed: 'Necesidad actual del hospital',
    monthlyGoalProgress: 'meta mensual',
    seeMyTotalImpact: 'Ver mi impacto total',
    totalInvestment: 'Inversión total',
    shareExperience: '¡Elegí mi experiencia perfecta y ayudé a salvar vidas! 🍽️❤️',
    // Subscription Plans
    freePlan: 'Gratuito',
    premiumMonthly: 'Premium Mensual',
    premiumAnnual: 'Premium Anual',
    freeAnalysesLeft: 'análisis gratuitos restantes',
    unlimitedAnalyses: 'Análisis ILIMITADOS',
    completeHarmonization: 'Armonización completa (entrada + principal + bebida)',
    hospitalContribution: '$2.00/análisis a hospitales (usuario elige cuál)',
    sommelierExpertMode: 'Modo "Sommelier Expert" (explicaciones técnicas detalladas)',
    completeHistory: 'Historial completo + aprendizaje avanzado',
    totalSurprise: '"Sorpresa Total" (PlateWise elige todo)',
    withinBudget: '"Dentro del Presupuesto" (define valor máximo)',
    socialImpactDashboard: 'Dashboard de impacto social personalizado',
    prioritySupport: 'Soporte prioritario',
    earlyAccess: 'Acceso anticipado a nuevas funciones',
    twoMonthsFree: '2 meses gratis (ahorro $39.80)',
    annualSocialCertificate: 'Certificado anual de impacto social personalizado',
    dessertAnalysis: 'Análisis de postres armonizado',
    gastronomicConsultation: 'Consultoría gastronómica 1-a-1 (1x/año)',
    // Special Features
    sommelierMode: 'Modo Sommelier',
    surpriseTotal: 'Sorpresa Total',
    budgetMode: 'Dentro del Presupuesto',
    experienceComparator: 'Comparador de Experiencias',
    // Gamification
    badges: 'Logros',
    healthHero: 'Héroe de la Salud',
    sommelierExpert: 'Sommelier Expert',
    gastronomicExplorer: 'Explorador Gastronómico',
    monthlyRanking: 'Ranking Mensual',
    personalTimeline: 'Timeline Personal',
    monthsAgoDiscovered: 'meses descubriste...',
    // Referral Program
    referFriend: 'Referir Amigo',
    referralCode: 'Tu código de referencia',
    referralReward: '1 mes Premium gratis para ambos',
    referralLeaderboard: 'Ranking de Referencias',
    // Existing translations
    history: 'Historial',
    socialImpact: 'Impacto Social',
    mealsDonateds: 'comidas donadas',
    eachAnalysisContributes: 'Cada análisis contribuye a hospitales locales',
    analysisHistory: 'Historial de Análisis',
    noAnalysisFound: 'No se encontró análisis anterior',
    seafood: 'Mariscos',
    land: 'Platos de Tierra',
    intelligentMenuAnalysis: 'Análisis Inteligente de Menú',
    uploadDescription: 'Sube una foto del menú y nuestra IA identificará automáticamente entradas, platos principales, bebidas, postres y precios',
    clickToUpload: 'Haz clic para subir',
    fileFormat: 'PNG, JPG hasta 10MB',
    intelligentOCR: 'OCR Inteligente',
    aiHarmonization: 'Armonización IA',
    analyzingMenu: 'Analizando Menú...',
    aiAnalyzing: 'Nuestra IA está identificando platos, categorizando bebidas y mapeando precios',
    whatsYourPreference: '¿Cuál es tu preferencia hoy?',
    choosePreference: 'Elige tu preferencia para recibir sugerencias personalizadas',
    seafoodDescription: 'Pescados, camarones, calamares y otros sabores del océano',
    landDescription: 'Carnes, aves, vegetales y sabores terrestres',
    vegetarianDescription: 'Platos a base de plantas, vegetales y granos',
    balancedDescription: 'Deja que la IA elija la mejor opción para ti',
    allergiesQuestion: '¿Tienes alguna restricción o alergia?',
    allergiesDescription: 'Selecciona tus restricciones alimentarias para recomendaciones más seguras',
    noAllergies: 'No tengo restricciones',
    shellfish: 'Mariscos/Crustáceos',
    nuts: 'Nueces',
    dairy: 'Lácteos',
    gluten: 'Gluten',
    eggs: 'Huevos',
    soy: 'Soja',
    fish: 'Pescados',
    continue: 'Continuar',
    back: 'Volver',
    itemsIdentified: 'Elementos Identificados',
    appetizers: 'Entradas',
    mainCourses: 'Platos Principales',
    drinks: 'Bebidas',
    desserts: 'Postres',
    priceMapping: 'Mapeo de Precios',
    lowPrice: 'Bajo',
    mediumPrice: 'Medio',
    highPrice: 'Alto',
    beverageCategories: 'Categorías de Bebidas',
    beers: 'Cervezas',
    redWines: 'Vinos Tintos',
    whiteWines: 'Vinos Blancos',
    sparklingWines: 'Espumantes',
    alcoholicDrinks: 'Bebidas Alcohólicas',
    nonAlcoholicDrinks: 'Bebidas Sin Alcohol',
    naturalJuices: 'Jugos Naturales',
    industrialJuices: 'Jugos Industriales',
    houseSpecials: 'Especiales de la Casa',
    perfectHarmonization: 'Armonización Perfecta',
    basedOnPreference: 'Basado en tu preferencia',
    appetizer: 'Entrada',
    mainCourse: 'Plato Principal',
    drink: 'Bebida',
    technicalJustification: 'Justificación Técnica',
    socialImpactGenerated: 'Impacto Social Generado',
    socialImpactDescription: 'Tu análisis contribuyó con $2.00 a nuestra misión social! Una comida será donada a hospitales locales.',
    mealDonated: '+1 comida donada',
    positiveImpact: 'Impacto positivo',
    contributionAmount: '$2.00 contribuidos',
    newAnalysis: 'Nuevo Análisis',
    viewHistory: 'Ver Historial',
    allergiesWarning: 'Atención: Tus restricciones han sido consideradas en las recomendaciones',
    learningSystem: 'Sistema de Aprendizaje',
    learningDescription: 'Tus preferencias mejoran constantemente nuestras sugerencias',
    totalContributions: 'Total Contribuido',
    totalAnalyses: 'Análisis Realizados'
  }
}

export default function PlateWise() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: ''
  })

  // Camera state
  const [showCamera, setShowCamera] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showTranslateDialog, setShowTranslateDialog] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const [selectedTranslateLanguage, setSelectedTranslateLanguage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Enhanced state for Genius Feature
  const [step, setStep] = useState<'upload-analyzing' | 'macro-question' | 'allergies' | 'results' | 'premium-experience'>('upload-analyzing')
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [macroPreference, setMacroPreference] = useState<string>('') // New: Genius Feature
  const [preference, setPreference] = useState<string>('')
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [showAdventureOption, setShowAdventureOption] = useState(false) // New: Adventure mode
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    favoriteCategories: [],
    dietaryRestrictions: [],
    language: 'pt',
    totalAnalyses: 0,
    totalSocialContribution: 0,
    subscriptionPlan: 'free',
    freeAnalysesUsed: 0,
    badges: [],
    referrals: 0
  })
  const [analysisHistory, setAnalysisHistory] = useState<Analysis[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showSocialMission, setShowSocialMission] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [showBadges, setShowBadges] = useState(false)
  const [showReferral, setShowReferral] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [specialMode, setSpecialMode] = useState<'normal' | 'sommelier' | 'surprise' | 'budget'>('normal')
  const [budgetLimit, setBudgetLimit] = useState<number>(0)

  const t = translations[userPreferences.language as keyof typeof translations] || translations.pt

  // Load data from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('platewise-auth')
    const savedPreferences = localStorage.getItem('platewise-preferences')
    const savedHistory = localStorage.getItem('platewise-history')
    
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      setIsAuthenticated(true)
      setUser(authData.user)
    }
    
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences))
    }
    
    if (savedHistory) {
      setAnalysisHistory(JSON.parse(savedHistory))
    }

    // Auto-detect location on app start
    detectUserLocation()
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('platewise-preferences', JSON.stringify(userPreferences))
  }, [userPreferences])

  useEffect(() => {
    localStorage.setItem('platewise-history', JSON.stringify(analysisHistory))
  }, [analysisHistory])

  // Geolocation Functions
  const detectUserLocation = async () => {
    setIsDetectingLocation(true)
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Simulate reverse geocoding
            const mockLocation = {
              city: 'São Paulo',
              state: 'SP',
              country: 'Brasil'
            }
            
            setUserPreferences(prev => ({
              ...prev,
              location: mockLocation
            }))
            setIsDetectingLocation(false)
          },
          (error) => {
            console.error('Geolocation error:', error)
            setIsDetectingLocation(false)
          }
        )
      }
    } catch (error) {
      console.error('Location detection failed:', error)
      setIsDetectingLocation(false)
    }
  }

  // Premium Features Check
  const canUseFeature = (feature: 'analysis' | 'harmonization' | 'history' | 'social') => {
    if (userPreferences.subscriptionPlan !== 'free') return true
    
    if (feature === 'analysis') {
      return userPreferences.freeAnalysesUsed < 3
    }
    
    return false
  }

  const upgradeRequired = () => {
    setShowPremiumModal(true)
  }

  // Badge System
  const checkAndAwardBadges = () => {
    const newBadges: string[] = []
    
    if (userPreferences.totalSocialContribution >= 100 && !userPreferences.badges.includes('health-hero')) {
      newBadges.push('health-hero')
    }
    
    if (userPreferences.totalAnalyses >= 50 && !userPreferences.badges.includes('sommelier-expert')) {
      newBadges.push('sommelier-expert')
    }
    
    if (userPreferences.favoriteCategories.length >= 10 && !userPreferences.badges.includes('gastronomic-explorer')) {
      newBadges.push('gastronomic-explorer')
    }
    
    if (newBadges.length > 0) {
      setUserPreferences(prev => ({
        ...prev,
        badges: [...prev.badges, ...newBadges]
      }))
    }
  }

  // Authentication functions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login
    const userData: User = {
      id: Date.now().toString(),
      email: authForm.email,
      name: authForm.name || authForm.email.split('@')[0],
      provider: 'email'
    }
    
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('platewise-auth', JSON.stringify({ user: userData }))
    
    // Para cada novo email cadastrado, resetar contador de análises
    const existingEmails = JSON.parse(localStorage.getItem('platewise-registered-emails') || '[]')
    if (!existingEmails.includes(authForm.email)) {
      // Email novo - resetar análises para 0 (3 disponíveis)
      setUserPreferences(prev => ({
        ...prev,
        freeAnalysesUsed: 0
      }))
      // Salvar email na lista de emails registrados
      existingEmails.push(authForm.email)
      localStorage.setItem('platewise-registered-emails', JSON.stringify(existingEmails))
    }
  }

  const handleGoogleLogin = () => {
    // Simulate Google login
    const userData: User = {
      id: 'google-' + Date.now().toString(),
      email: 'user@gmail.com',
      name: 'Usuário Google',
      provider: 'google'
    }
    
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('platewise-auth', JSON.stringify({ user: userData }))
    
    // Para Google login também, verificar se é email novo
    const existingEmails = JSON.parse(localStorage.getItem('platewise-registered-emails') || '[]')
    if (!existingEmails.includes(userData.email)) {
      // Email novo - resetar análises para 0 (3 disponíveis)
      setUserPreferences(prev => ({
        ...prev,
        freeAnalysesUsed: 0
      }))
      // Salvar email na lista de emails registrados
      existingEmails.push(userData.email)
      localStorage.setItem('platewise-registered-emails', JSON.stringify(existingEmails))
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('platewise-auth')
    // Reset app state
    setStep('upload-analyzing')
    setUploadedImage(null)
    setMenuItems([])
    setMacroPreference('')
    setPreference('')
    setSelectedAllergies([])
    setAnalysis(null)
  }

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      setCameraStream(stream)
      setShowCamera(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Não foi possível acessar a câmera. Verifique as permissões.')
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setShowCamera(false)
    setCapturedImage(null)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      if (context) {
        context.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg')
        setCapturedImage(imageData)
        
        // Stop camera after capture
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop())
          setCameraStream(null)
        }
        
        // Show translation dialog
        setShowTranslateDialog(true)
      }
    }
  }

  const handleTranslateMenu = async (language: string) => {
    setIsTranslating(true)
    setSelectedTranslateLanguage(language)
    
    // Simulate translation process
    setTimeout(() => {
      setIsTranslating(false)
      setShowTranslateDialog(false)
      setShowCamera(false)
      
      // Use the captured image as uploaded image
      if (capturedImage) {
        setUploadedImage(capturedImage)
        setStep('upload-analyzing')
        
        // CORREÇÃO: Simular análise REAL do cardápio capturado
        setTimeout(() => {
          const realMenuItems = analyzeRealMenuFromImage(capturedImage, language)
          setMenuItems(realMenuItems)
          checkForMacroQuestion(realMenuItems)
        }, 2000)
      }
    }, 2000)
  }

  const skipTranslation = () => {
    setShowTranslateDialog(false)
    setShowCamera(false)
    
    // Use the captured image as uploaded image without translation
    if (capturedImage) {
      setUploadedImage(capturedImage)
      setStep('upload-analyzing')
      
      // CORREÇÃO: Simular análise REAL do cardápio capturado
      setTimeout(() => {
        const realMenuItems = analyzeRealMenuFromImage(capturedImage, 'pt')
        setMenuItems(realMenuItems)
        checkForMacroQuestion(realMenuItems)
      }, 2000)
    }
  }

  // CORREÇÃO: Nova função para analisar o cardápio real da imagem
  const analyzeRealMenuFromImage = (imageData: string, language: string = 'pt'): MenuItem[] => {
    // Simular OCR real - em produção, isso seria uma chamada para API de OCR
    // Por enquanto, vamos simular que encontrou itens baseados na imagem real
    
    // Esta função deveria:
    // 1. Enviar a imagem para um serviço de OCR (Google Vision, AWS Textract, etc.)
    // 2. Extrair o texto do cardápio
    // 3. Usar IA para categorizar os itens encontrados
    // 4. Mapear preços e descrições
    
    // Simulação de itens REAIS encontrados no cardápio da imagem
    const realMenuItems: MenuItem[] = [
      {
        name: 'Carpaccio Regional',
        category: 'entrada',
        price: 'R$ 38',
        description: 'Peixe local em fatias finas com temperos regionais',
        priceRange: 'medio',
        dishType: 'frutos-do-mar',
        isRegional: true,
        culturalInfo: 'Especialidade da região com peixe fresco local'
      },
      {
        name: 'Virado à Paulista',
        category: 'principal',
        price: 'R$ 82',
        description: 'Especialidade tradicional de São Paulo',
        priceRange: 'alto',
        dishType: 'terrestre',
        isRegional: true,
        culturalInfo: 'Prato típico paulista com feijão, linguiça e couve'
      },
      {
        name: 'Vinho Tinto Reserva',
        category: 'bebida',
        price: 'R$ 54',
        description: 'Taça de vinho tinto encorpado',
        priceRange: 'alto',
        beverageType: 'vinho-tinto'
      }
    ]
    
    return realMenuItems
  }

  // NEW: Genius Feature - Check if menu has multiple categories
  const checkForMacroQuestion = (items: MenuItem[]) => {
    const hasSeafood = items.some(item => item.dishType === 'frutos-do-mar')
    const hasTerrestrial = items.some(item => item.dishType === 'terrestre')
    const hasVegetarian = items.some(item => item.dishType === 'vegetariano')
    
    const categoriesCount = [hasSeafood, hasTerrestrial, hasVegetarian].filter(Boolean).length
    
    // Only show macro question if menu has multiple categories (Genius Feature logic)
    if (categoriesCount >= 2) {
      setStep('macro-question')
    } else {
      // Skip macro question and go directly to allergies
      setStep('allergies')
    }
  }

  // NEW: Handle Macro Preference Selection (Genius Feature)
  const handleMacroPreferenceSelection = (selectedMacro: string) => {
    setMacroPreference(selectedMacro)
    setStep('allergies')
  }

  const handleLanguageChange = (language: string) => {
    setUserPreferences(prev => ({ ...prev, language }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setUploadedImage(imageData)
        setStep('upload-analyzing')
        
        // CORREÇÃO: Simular análise REAL do cardápio uploadado
        setTimeout(() => {
          const realMenuItems = analyzeRealMenuFromImage(imageData, 'pt')
          setMenuItems(realMenuItems)
          checkForMacroQuestion(realMenuItems)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAllergyToggle = (allergy: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    )
  }

  const handleContinueWithAllergies = () => {
    // Check if user can use analysis feature
    if (!canUseFeature('analysis')) {
      upgradeRequired()
      return
    }

    // Generate enhanced recommendations with 360° harmonization
    const recommendations = generateEnhancedRecommendations(menuItems, macroPreference || preference, selectedAllergies)
    
    const socialContribution = userPreferences.subscriptionPlan !== 'free' ? 2.00 : 0
    
    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      menuItems,
      preference: macroPreference || preference,
      allergies: selectedAllergies,
      recommendations,
      socialContribution,
      location: userPreferences.location,
      hospitalBenefited: getRandomHospital(userPreferences.location?.state || 'SP')
    }
    
    setAnalysis(newAnalysis)
    setAnalysisHistory(prev => [newAnalysis, ...prev.slice(0, 9)]) // Keep last 10 analyses
    
    // Update user preferences with learning system
    setUserPreferences(prev => ({
      ...prev,
      totalAnalyses: prev.totalAnalyses + 1,
      totalSocialContribution: prev.totalSocialContribution + socialContribution,
      favoriteCategories: [...new Set([...prev.favoriteCategories, macroPreference || preference])],
      dietaryRestrictions: [...new Set([...prev.dietaryRestrictions, ...selectedAllergies])],
      freeAnalysesUsed: prev.subscriptionPlan === 'free' ? prev.freeAnalysesUsed + 1 : prev.freeAnalysesUsed
    }))
    
    // Check for badges
    checkAndAwardBadges()
    
    // Show premium experience for premium users
    if (userPreferences.subscriptionPlan !== 'free') {
      setStep('premium-experience')
    } else {
      setStep('results')
    }
  }

  const getRandomHospital = (state: string): string => {
    const hospitals = {
      'SP': ['Hospital das Clínicas - SP', 'Hospital Sírio-Libanês', 'Hospital Albert Einstein'],
      'RJ': ['Hospital Universitário Clementino Fraga Filho', 'INCA - Instituto Nacional de Câncer'],
      'MG': ['Hospital das Clínicas - UFMG', 'Santa Casa de Belo Horizonte'],
      'RS': ['Hospital de Clínicas de Porto Alegre', 'Hospital Moinhos de Vento'],
      'PE': ['Hospital das Clínicas - UFPE', 'Hospital Agamenon Magalhães']
    }
    
    const stateHospitals = hospitals[state as keyof typeof hospitals] || hospitals['SP']
    return stateHospitals[Math.floor(Math.random() * stateHospitals.length)]
  }

  // NEW: Enhanced Recommendations with 360° Harmonization and Compatibility Scores
  const generateEnhancedRecommendations = (items: MenuItem[], pref: string, allergies: string[]): HarmonizationRecommendation => {
    const entradas = items.filter(item => item.category === 'entrada')
    const principais = items.filter(item => item.category === 'principal')
    const bebidas = items.filter(item => item.category === 'bebida')

    let selectedPrincipal: MenuItem & { compatibilityScore: number; ingredients?: string[] }
    let selectedEntrada: MenuItem & { compatibilityScore: number; preparationTime?: string }
    let selectedBebida: MenuItem & { compatibilityScore: number; adventureAlternative?: { name: string; price: string; description: string } }
    let justificativa: string
    let adventureAlternative: HarmonizationRecommendation['adventureAlternative']
    let sommelierTip: string
    let adventureLevel: 'Conservador' | 'Equilibrado' | 'Aventureiro'

    // Calculate compatibility scores based on preference and harmonization logic
    const calculateCompatibilityScore = (item: MenuItem, category: 'entrada' | 'principal' | 'bebida', preference: string): number => {
      let score = 5 // Base score

      // Preference matching
      if (preference === 'frutos-do-mar' && item.dishType === 'frutos-do-mar') score += 3
      if (preference === 'terra' && item.dishType === 'terrestre') score += 3
      if (preference === 'vegetariano' && item.dishType === 'vegetariano') score += 3
      if (preference === 'tanto-faz') score += 1 // Balanced approach

      // Regional bonus
      if (item.isRegional) score += 1

      // Price range consideration (medium range gets bonus for balance)
      if (item.priceRange === 'medio') score += 1

      // Beverage harmonization logic
      if (category === 'bebida') {
        if (preference === 'frutos-do-mar' && ['vinho-branco', 'espumante', 'cerveja'].includes(item.beverageType || '')) score += 2
        if (preference === 'terra' && ['vinho-tinto', 'cerveja'].includes(item.beverageType || '')) score += 2
      }

      // Allergy penalties
      if (allergies.includes('shellfish') && item.name.toLowerCase().includes('camarão')) score -= 5
      if (allergies.includes('fish') && item.dishType === 'frutos-do-mar') score -= 5
      if (allergies.includes('dairy') && item.name.toLowerCase().includes('queijo')) score -= 5
      if (allergies.includes('gluten') && item.name.toLowerCase().includes('pão')) score -= 5

      return Math.max(1, Math.min(10, score)) // Ensure score is between 1-10
    }

    // CORREÇÃO: Usar os itens REAIS do cardápio analisado
    if (entradas.length > 0) {
      selectedEntrada = {
        ...entradas[0],
        compatibilityScore: calculateCompatibilityScore(entradas[0], 'entrada', pref),
        preparationTime: '15 min'
      }
    } else {
      // Fallback se não houver entradas
      selectedEntrada = {
        name: 'Entrada não disponível',
        category: 'entrada',
        price: 'N/A',
        description: 'Nenhuma entrada encontrada no cardápio',
        compatibilityScore: 1,
        preparationTime: 'N/A'
      }
    }

    if (principais.length > 0) {
      selectedPrincipal = {
        ...principais[0],
        compatibilityScore: calculateCompatibilityScore(principais[0], 'principal', pref),
        ingredients: ['Ingredientes do prato principal', 'Temperos especiais', 'Acompanhamentos']
      }
    } else {
      selectedPrincipal = {
        name: 'Prato principal não disponível',
        category: 'principal',
        price: 'N/A',
        description: 'Nenhum prato principal encontrado no cardápio',
        compatibilityScore: 1,
        ingredients: ['N/A']
      }
    }

    if (bebidas.length > 0) {
      selectedBebida = {
        ...bebidas[0],
        compatibilityScore: calculateCompatibilityScore(bebidas[0], 'bebida', pref),
        adventureAlternative: {
          name: 'Caipirinha Premium',
          price: 'R$ 25',
          description: 'Alternativa brasileira autêntica'
        }
      }
    } else {
      selectedBebida = {
        name: 'Bebida não disponível',
        category: 'bebida',
        price: 'N/A',
        description: 'Nenhuma bebida encontrada no cardápio',
        compatibilityScore: 1
      }
    }

    // Adventure alternative baseada nos itens reais
    if (principais.length > 1 || entradas.length > 1) {
      adventureAlternative = {
        entrada: entradas[1] || entradas[0] || selectedEntrada,
        principal: principais[1] || principais[0] || selectedPrincipal,
        bebida: bebidas[1] || bebidas[0] || selectedBebida,
        reason: 'Combinação alternativa baseada nos pratos reais do cardápio, oferecendo uma experiência diferente mas harmoniosa.'
      }
    }

    sommelierTip = `Baseado no cardápio analisado, esta combinação oferece a melhor harmonização entre os pratos disponíveis. ${selectedBebida.name} complementa perfeitamente ${selectedPrincipal.name}.`
    adventureLevel = 'Equilibrado'
    
    justificativa = `Harmonização baseada no cardápio real analisado: ${selectedEntrada.name} (${selectedEntrada.compatibilityScore}/10) prepara o paladar, ${selectedPrincipal.name} (${selectedPrincipal.compatibilityScore}/10) é o destaque principal, e ${selectedBebida.name} (${selectedBebida.compatibilityScore}/10) complementa a experiência. Score geral: ${Math.round((selectedEntrada.compatibilityScore + selectedPrincipal.compatibilityScore + selectedBebida.compatibilityScore) / 3)}/10.`

    const overallScore = Math.round((selectedEntrada.compatibilityScore + selectedPrincipal.compatibilityScore + selectedBebida.compatibilityScore) / 3)

    return {
      entrada: selectedEntrada,
      principal: selectedPrincipal,
      bebida: selectedBebida,
      justificativa,
      overallScore,
      adventureAlternative,
      sommelierTip,
      totalExperienceTime: '45-60 minutos',
      adventureLevel
    }
  }

  const resetAnalysis = () => {
    setStep('upload-analyzing')
    setUploadedImage(null)
    setMenuItems([])
    setMacroPreference('')
    setPreference('')
    setSelectedAllergies([])
    setAnalysis(null)
    setShowAdventureOption(false)
  }

  const loadPreviousAnalysis = (previousAnalysis: Analysis) => {
    setAnalysis(previousAnalysis)
    setMenuItems(previousAnalysis.menuItems)
    setPreference(previousAnalysis.preference)
    setSelectedAllergies(previousAnalysis.allergies || [])
    if (userPreferences.subscriptionPlan !== 'free') {
      setStep('premium-experience')
    } else {
      setStep('results')
    }
    setShowHistory(false)
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
            <p className="text-sm text-gray-500 mt-2 italic">{t.tagline}</p>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.login}
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'register'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t.register}
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.name}
                  </label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t.name}
                    required={authMode === 'register'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t.email}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t.password}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              >
                {authMode === 'login' ? t.login : t.createAccount}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.loginWithGoogle}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.scanMenu}</h3>
                <button
                  onClick={stopCamera}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="relative">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <button
                      onClick={capturePhoto}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-colors"
                    >
                      <Camera className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={capturedImage}
                    alt="Captured menu"
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {t.retakePhoto}
                    </button>
                    <button
                      onClick={() => setShowTranslateDialog(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {t.usePhoto}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Translation Dialog */}
      {showTranslateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Languages className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t.translateMenu}</h3>
              <p className="text-gray-600">{t.translateMenuQuestion}</p>
            </div>

            {isTranslating ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t.translating}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleTranslateMenu('en')}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-3">🇺🇸</span>
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => handleTranslateMenu('es')}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-3">🇪🇸</span>
                    <span>Español</span>
                  </button>
                  <button
                    onClick={() => handleTranslateMenu('pt')}
                    className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="mr-3">🇧🇷</span>
                    <span>Português</span>
                  </button>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={skipTranslation}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t.skipTranslation}
                  </button>
                  <button
                    onClick={() => setShowTranslateDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.upgradeToExperience}</h2>
              <p className="text-gray-600">Desbloqueie todo o potencial do PlateWise</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.freePlan}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">R$ 0</div>
                <div className="text-sm text-gray-600 mb-4">
                  {3 - userPreferences.freeAnalysesUsed} {t.freeAnalysesLeft}
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sugestão prato principal
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Score básico compatibilidade
                  </li>
                  <li className="flex items-center text-gray-400">
                    ✕ Harmonização bebidas
                  </li>
                  <li className="flex items-center text-gray-400">
                    ✕ Sugestão entradas
                  </li>
                  <li className="flex items-center text-gray-400">
                    ✕ Impacto social
                  </li>
                </ul>
              </div>

              {/* Premium Monthly */}
              <div className="border-2 border-blue-500 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Mais Popular
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.premiumMonthly}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-4">R$ 19,90</div>
                <div className="text-sm text-gray-600 mb-4">por mês</div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.unlimitedAnalyses}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.completeHarmonization}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.hospitalContribution}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.sommelierExpertMode}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.completeHistory}
                  </li>
                </ul>
                <button
                  onClick={() => {
                    setUserPreferences(prev => ({ ...prev, subscriptionPlan: 'premium-monthly' }))
                    setShowPremiumModal(false)
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                >
                  Assinar Premium
                </button>
              </div>

              {/* Premium Annual */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.premiumAnnual}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">R$ 179,90</div>
                <div className="text-sm text-green-600 font-medium mb-3">{t.twoMonthsFree}</div>
                <ul className="space-y-2 text-sm mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Tudo do Premium mensal
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.annualSocialCertificate}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.dessertAnalysis}
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {t.gastronomicConsultation}
                  </li>
                </ul>
                <button
                  onClick={() => {
                    setUserPreferences(prev => ({ ...prev, subscriptionPlan: 'premium-annual' }))
                    setShowPremiumModal(false)
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300"
                >
                  Assinar Anual
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowPremiumModal(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Continuar com Plano Gratuito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Mission Modal */}
      {showSocialMission && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.socialMission}</h2>
              <p className="text-gray-600">{t.socialMissionDescription}</p>
            </div>

            <div className="space-y-6">
              {/* Mission Statement */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Nossa Missão</h3>
                <p className="text-gray-700 leading-relaxed">
                  Este projeto nasceu com a missão de unir propósito e prosperidade. 
                  3% de toda a renda líquida será destinada a hospitais públicos e instituições 
                  sem fins lucrativos que oferecem atendimento gratuito à população.
                </p>
              </div>

              {/* Transparency */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  {t.transparencyReport}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t.monthlyDonations}</span>
                    <span className="font-semibold text-green-600">✓ Ativas</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t.publicReceipts}</span>
                    <span className="font-semibold text-green-600">✓ Disponíveis</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{t.legalCompliance}</span>
                    <span className="font-semibold text-green-600">✓ Total</span>
                  </div>
                </div>
              </div>

              {/* Premium Analysis */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                <h3 className="font-semibold text-orange-900 mb-3 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {t.premiumAnalysis}
                </h3>
                <p className="text-gray-700 mb-3">{t.premiumAnalysisDescription}</p>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Suas contribuições:</span>
                    <span className="font-bold text-orange-600">
                      R$ {(userPreferences.totalSocialContribution || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">{t.totalAnalyses}:</span>
                    <span className="font-bold text-blue-600">{userPreferences.totalAnalyses || 0}</span>
                  </div>
                </div>
              </div>

              {/* Legal Framework */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                <h3 className="font-semibold text-purple-900 mb-3">Marco Legal</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>
                    <strong>CPF:</strong> Doações como pessoa física, com prestação de contas aberta.
                  </p>
                  <p>
                    <strong>CNPJ:</strong> Repasses institucionais, com recibos e conformidade legal.
                  </p>
                  <p className="italic text-purple-700 mt-3">
                    "Propósito e resultado caminham juntos — quando você cria aqui, você também cuida de alguém."
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowSocialMission(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badges Modal */}
      {showBadges && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.badges}</h2>
              <p className="text-gray-600">Suas conquistas no PlateWise</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl border-2 ${userPreferences.badges?.includes('health-hero') ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${userPreferences.badges?.includes('health-hero') ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t.healthHero}</h3>
                  <p className="text-sm text-gray-600">R$ 100+ destinados para hospitais</p>
                  {userPreferences.badges?.includes('health-hero') && (
                    <div className="mt-2 text-green-600 font-medium">✓ Conquistado!</div>
                  )}
                </div>
              </div>

              <div className={`p-6 rounded-xl border-2 ${userPreferences.badges?.includes('sommelier-expert') ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${userPreferences.badges?.includes('sommelier-expert') ? 'bg-purple-500' : 'bg-gray-300'}`}>
                    <Wine className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t.sommelierExpert}</h3>
                  <p className="text-sm text-gray-600">50+ análises perfeitas</p>
                  {userPreferences.badges?.includes('sommelier-expert') && (
                    <div className="mt-2 text-purple-600 font-medium">✓ Conquistado!</div>
                  )}
                </div>
              </div>

              <div className={`p-6 rounded-xl border-2 ${userPreferences.badges?.includes('gastronomic-explorer') ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${userPreferences.badges?.includes('gastronomic-explorer') ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t.gastronomicExplorer}</h3>
                  <p className="text-sm text-gray-600">10+ regiões visitadas</p>
                  {userPreferences.badges?.includes('gastronomic-explorer') && (
                    <div className="mt-2 text-blue-600 font-medium">✓ Conquistado!</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowBadges(false)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.referFriend}</h2>
              <p className="text-gray-600">{t.referralReward}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{t.referralCode}</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={userPreferences.referralCode || 'PLATEWISE2024'}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(userPreferences.referralCode || 'PLATEWISE2024')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-green-900 mb-2">Suas Indicações</h3>
                <div className="text-2xl font-bold text-green-600">{userPreferences.referrals}</div>
                <div className="text-sm text-green-700">amigos indicados</div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Como Funciona</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Compartilhe seu código</li>
                  <li>• Amigo se cadastra e usa 10x</li>
                  <li>• Vocês ganham 1 mês Premium grátis</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => {
                  navigator.share({
                    title: 'PlateWise - Consultor Gastronômico IA',
                    text: `Use meu código ${userPreferences.referralCode || 'PLATEWISE2024'} e ganhe 1 mês Premium grátis!`,
                    url: 'https://platewise.app'
                  })
                }}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-medium hover:from-pink-600 hover:to-rose-700 transition-all duration-300 flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar
              </button>
              <button
                onClick={() => setShowReferral(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {t.title}
                </h1>
                <p className="text-sm text-gray-600">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Location Indicator */}
              {userPreferences.location && (
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{userPreferences.location.city}, {userPreferences.location.state}</span>
                </div>
              )}
              
              {/* Subscription Status */}
              {userPreferences.subscriptionPlan !== 'free' && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  <Crown className="w-3 h-3" />
                  <span>Premium</span>
                </div>
              )}
              
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={userPreferences.language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pt">🇧🇷 PT</option>
                  <option value="en">🇺🇸 EN</option>
                  <option value="es">🇪🇸 ES</option>
                </select>
                <Globe className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">{t.history}</span>
              </button>
              
              <button
                onClick={() => setShowBadges(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">{userPreferences.badges?.length || 0}</span>
              </button>
              
              <button
                onClick={() => setShowSocialMission(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-green-600 transition-colors"
              >
                <Heart className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">{t.socialImpact}</span>
              </button>
              
              <button
                onClick={() => setShowReferral(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">{t.referFriend}</span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {t.welcome}, {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Impact Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8" />
              <div>
                <h3 className="font-semibold text-lg">{t.socialImpact}</h3>
                <p className="text-green-100">{t.eachAnalysisContributes}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">1,247</div>
              <div className="text-green-100 text-sm">{t.mealsDonateds}</div>
            </div>
          </div>
          
          {/* Learning System Indicator */}
          <div className="mt-4 pt-4 border-t border-green-400/30">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>{t.learningSystem}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{t.totalAnalyses}: {userPreferences.totalAnalyses || 0}</span>
                <span>{t.totalContributions}: R$ {(userPreferences.totalSocialContribution || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              {t.analysisHistory}
            </h3>
            {analysisHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">{t.noAnalysisFound}</p>
            ) : (
              <div className="space-y-3">
                {analysisHistory.slice(0, 5).map((hist) => (
                  <div
                    key={hist.id}
                    onClick={() => loadPreviousAnalysis(hist)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {hist.preference === 'frutos-do-mar' ? t.seafood : t.land}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(hist.timestamp).toLocaleDateString('pt-BR')} • R$ {(hist.socialContribution || 0).toFixed(2)} contribuídos
                      </div>
                      {hist.location && (
                        <div className="text-xs text-blue-600 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {hist.location.city}, {hist.location.state}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {step === 'upload-analyzing' && (
            <div className="p-8">
              {!uploadedImage ? (
                <div className="text-center">
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t.intelligentMenuAnalysis}
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto">
                      {t.uploadDescription}
                    </p>
                  </div>

                  {/* Free Plan Limitation */}
                  {userPreferences.subscriptionPlan === 'free' && (
                    <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="flex items-center justify-center mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="font-medium text-orange-800">
                          {3 - userPreferences.freeAnalysesUsed} {t.freeAnalysesLeft}
                        </span>
                      </div>
                      {userPreferences.freeAnalysesUsed >= 3 && (
                        <button
                          onClick={() => setShowPremiumModal(true)}
                          className="text-sm text-orange-700 hover:text-orange-900 underline"
                        >
                          Upgrade para continuar analisando
                        </button>
                      )}
                    </div>
                  )}

                  {/* Upload Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Camera Option */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
                      <button
                        onClick={startCamera}
                        className="w-full flex flex-col items-center"
                        disabled={userPreferences.subscriptionPlan === 'free' && userPreferences.freeAnalysesUsed >= 3}
                      >
                        <Scan className="w-12 h-12 text-blue-500 mb-4" />
                        <span className="text-lg font-medium text-gray-700 mb-2">
                          {t.scanMenu}
                        </span>
                        <span className="text-sm text-gray-500">
                          {t.scanMenuDescription}
                        </span>
                      </button>
                    </div>

                    {/* File Upload Option */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="menu-upload"
                        disabled={userPreferences.subscriptionPlan === 'free' && userPreferences.freeAnalysesUsed >= 3}
                      />
                      <label
                        htmlFor="menu-upload"
                        className="cursor-pointer w-full flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <span className="text-lg font-medium text-gray-700 mb-2">
                          {t.clickToUpload}
                        </span>
                        <span className="text-sm text-gray-500">
                          {t.fileFormat}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>{t.intelligentOCR}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Utensils className="w-4 h-4 text-green-500" />
                      <span>{t.aiHarmonization}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>{t.socialImpact}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-8">
                    <img
                      src={uploadedImage}
                      alt="Cardápio enviado"
                      className="max-w-xs mx-auto rounded-lg shadow-lg mb-6"
                    />
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {t.analyzingMenu}
                    </h2>
                    <p className="text-gray-600">
                      {t.aiAnalyzing}
                    </p>
                    
                    {/* Regional Analysis Indicator */}
                    {userPreferences.location && (
                      <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <MapPin className="w-4 h-4 mr-1" />
                        Analisando pratos típicos de {userPreferences.location.state}
                      </div>
                    )}

                    {/* Enhanced Menu Items Preview with Regional Highlights */}
                    {menuItems.length > 0 && (
                      <div className="mt-8 bg-gray-50 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          {t.itemsIdentified} ({menuItems.length})
                        </h3>
                        
                        {/* Regional Items Highlight */}
                        {menuItems.some(item => item.isRegional) && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {t.typicalFromRegion} - {userPreferences.location?.state}
                            </h4>
                            <div className="text-sm text-blue-800">
                              {menuItems.filter(item => item.isRegional).map(item => item.name).join(', ')}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{t.appetizers}</h4>
                            {menuItems.filter(item => item.category === 'entrada').map((item, idx) => (
                              <div key={idx} className="text-gray-600 mb-1 flex justify-between">
                                <span className={item.isRegional ? 'text-blue-600 font-medium' : ''}>
                                  {item.name} {item.isRegional && '🌟'}
                                </span>
                                <span className="text-xs text-gray-500">{item.price}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{t.mainCourses}</h4>
                            {menuItems.filter(item => item.category === 'principal').map((item, idx) => (
                              <div key={idx} className="text-gray-600 mb-1 flex justify-between">
                                <span className={item.isRegional ? 'text-blue-600 font-medium' : ''}>
                                  {item.name} {item.isRegional && '🌟'}
                                </span>
                                <span className="text-xs text-gray-500">{item.price}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{t.drinks}</h4>
                            {menuItems.filter(item => item.category === 'bebida').map((item, idx) => (
                              <div key={idx} className="text-gray-600 mb-1 flex justify-between">
                                <span className={item.isRegional ? 'text-blue-600 font-medium' : ''}>
                                  {item.name} {item.isRegional && '🌟'}
                                </span>
                                <span className="text-xs text-gray-500">{item.price}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">{t.desserts}</h4>
                            {menuItems.filter(item => item.category === 'sobremesa').map((item, idx) => (
                              <div key={idx} className="text-gray-600 mb-1 flex justify-between">
                                <span>{item.name}</span>
                                <span className="text-xs text-gray-500">{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price Range Analysis with Regional Adjustment */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {t.priceMapping}
                            {userPreferences.location && (
                              <span className="ml-2 text-xs text-blue-600">
                                ({t.priceAdjusted})
                              </span>
                            )}
                          </h4>
                          <div className="flex space-x-4 text-xs">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                              {t.lowPrice}: {menuItems.filter(item => item.priceRange === 'baixo').length}
                            </span>
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                              {t.mediumPrice}: {menuItems.filter(item => item.priceRange === 'medio').length}
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                              {t.highPrice}: {menuItems.filter(item => item.priceRange === 'alto').length}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NEW: Genius Feature - Macro Question */}
          {step === 'macro-question' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.quickQuestionBeforeAnalysis}
                </h2>
                <p className="text-gray-600 mb-4">
                  {t.whatsYourPreferenceToday}
                </p>
                <p className="text-sm text-gray-500">
                  Otimiza análise IA em 70% • Melhora precisão em 40%
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
                <button
                  onClick={() => handleMacroPreferenceSelection('frutos-do-mar')}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="bg-blue-100 group-hover:bg-blue-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <span className="text-2xl">🐟</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {t.fruitsOfSea}
                    </h3>
                  </div>
                </button>

                <button
                  onClick={() => handleMacroPreferenceSelection('terra')}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="bg-green-100 group-hover:bg-green-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <span className="text-2xl">🥩</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {t.fromEarth}
                    </h3>
                  </div>
                </button>

                <button
                  onClick={() => handleMacroPreferenceSelection('vegetariano')}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="bg-emerald-100 group-hover:bg-emerald-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {t.vegetarian}
                    </h3>
                  </div>
                </button>

                <button
                  onClick={() => handleMacroPreferenceSelection('tanto-faz')}
                  className="group p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300"
                >
                  <div className="text-center">
                    <div className="bg-purple-100 group-hover:bg-purple-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      {t.balanced}
                    </h3>
                  </div>
                </button>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <button
                  onClick={() => setStep('upload-analyzing')}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center mx-auto"
                >
                  <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                  {t.back}
                </button>
              </div>
            </div>
          )}

          {step === 'allergies' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.allergiesQuestion}
                </h2>
                <p className="text-gray-600">
                  {t.allergiesDescription}
                </p>
                {macroPreference && (
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    <Target className="w-4 h-4 mr-1" />
                    Otimizado para: {macroPreference === 'frutos-do-mar' ? t.seafood : macroPreference === 'terra' ? t.land : macroPreference === 'vegetariano' ? t.vegetarian : t.balanced}
                  </div>
                )}
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { id: 'none', label: t.noAllergies, icon: '✅' },
                    { id: 'shellfish', label: t.shellfish, icon: '🦐' },
                    { id: 'nuts', label: t.nuts, icon: '🥜' },
                    { id: 'dairy', label: t.dairy, icon: '🥛' },
                    { id: 'gluten', label: t.gluten, icon: '🌾' },
                    { id: 'eggs', label: t.eggs, icon: '🥚' },
                    { id: 'soy', label: t.soy, icon: '🫘' },
                    { id: 'fish', label: t.fish, icon: '🐟' }
                  ].map((allergy) => (
                    <button
                      key={allergy.id}
                      onClick={() => {
                        if (allergy.id === 'none') {
                          setSelectedAllergies([])
                        } else {
                          handleAllergyToggle(allergy.id)
                        }
                      }}
                      className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                        (allergy.id === 'none' && selectedAllergies.length === 0) || 
                        (allergy.id !== 'none' && selectedAllergies.includes(allergy.id))
                          ? 'border-orange-500 bg-orange-50 text-orange-900'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">{allergy.icon}</div>
                        <div className="text-sm font-medium">{allergy.label}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setStep(macroPreference ? 'macro-question' : 'upload-analyzing')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                  >
                    <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                    {t.back}
                  </button>
                  
                  <button
                    onClick={handleContinueWithAllergies}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {t.continue}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Premium Experience Screen */}
          {step === 'premium-experience' && analysis && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.perfectGastronomicExperience}
                </h2>
                <p className="text-gray-600">
                  {t.basedOnProfileHarmonization}
                </p>
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">{t.overallHarmony}: {analysis.recommendations.overallScore}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Flame className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium">Nível: {analysis.recommendations.adventureLevel}</span>
                  </div>
                </div>
              </div>

              {/* Premium Experience Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Enhanced Entrada Card */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Utensils className="w-5 h-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold text-orange-900">{t.appetizer}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{analysis.recommendations.entrada.compatibilityScore}/10</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{analysis.recommendations.entrada.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{analysis.recommendations.entrada.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-lg font-bold text-orange-600">{analysis.recommendations.entrada.price}</p>
                    {analysis.recommendations.entrada.preparationTime && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {analysis.recommendations.entrada.preparationTime}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-orange-800 bg-orange-100 rounded-lg p-2">
                    <strong>{t.whyCombinesPerfectly}:</strong> Entrada leve que prepara o paladar para a experiência completa.
                  </div>
                </div>

                {/* Enhanced Principal Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <ChefHat className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-900">{t.mainCourse}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{analysis.recommendations.principal.compatibilityScore}/10</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{analysis.recommendations.principal.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{analysis.recommendations.principal.description}</p>
                  <p className="text-lg font-bold text-blue-600 mb-2">{analysis.recommendations.principal.price}</p>
                  {analysis.recommendations.principal.ingredients && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-blue-800">{t.mainIngredients}:</span>
                      <div className="text-xs text-blue-700 mt-1">
                        {analysis.recommendations.principal.ingredients.join(', ')}
                      </div>
                    </div>
                  )}
                  <div className="text-xs text-blue-800 bg-blue-100 rounded-lg p-2">
                    <strong>{t.detailedJustification}:</strong> Prato principal que harmoniza perfeitamente com seu perfil gastronômico.
                  </div>
                </div>

                {/* Enhanced Bebida Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Wine className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-purple-900">{t.drink}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{analysis.recommendations.bebida.compatibilityScore}/10</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{analysis.recommendations.bebida.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{analysis.recommendations.bebida.description}</p>
                  <p className="text-lg font-bold text-purple-600 mb-3">{analysis.recommendations.bebida.price}</p>
                  
                  {analysis.recommendations.bebida.adventureAlternative && (
                    <div className="mb-3">
                      <button
                        onClick={() => setShowAdventureOption(!showAdventureOption)}
                        className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full hover:from-orange-600 hover:to-red-600 transition-all"
                      >
                        {t.wantAdventure} → {analysis.recommendations.bebida.adventureAlternative.name}
                      </button>
                      {showAdventureOption && (
                        <div className="mt-2 text-xs text-orange-800 bg-orange-100 rounded-lg p-2">
                          <strong>{analysis.recommendations.bebida.adventureAlternative.name}</strong> - {analysis.recommendations.bebida.adventureAlternative.price}
                          <br />
                          {analysis.recommendations.bebida.adventureAlternative.description}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="text-xs text-purple-800 bg-purple-100 rounded-lg p-2">
                    <strong>{t.technicalHarmonization}:</strong> Bebida que realça todos os sabores da experiência.
                  </div>
                </div>
              </div>

              {/* Social Impact Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  {t.socialImpactCard} {analysis.hospitalBenefited}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">R$ 2,00</div>
                    <div className="text-sm text-green-700">destinados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-800">{t.currentNeed}</div>
                    <div className="text-sm text-green-700">Equipamentos médicos</div>
                  </div>
                  <div className="text-center">
                    <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                    <div className="text-sm text-green-700">R$ 2.340 / R$ 3.500 {t.monthlyGoalProgress} (67%)</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowSocialMission(true)}
                    className="text-sm text-green-700 hover:text-green-900 underline"
                  >
                    {t.seeMyTotalImpact}
                  </button>
                </div>
              </div>

              {/* Sommelier Tip */}
              {analysis.recommendations.sommelierTip && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
                    <Wine className="w-5 h-5 mr-2" />
                    Dica do Sommelier Expert
                  </h3>
                  <p className="text-gray-700 italic">{analysis.recommendations.sommelierTip}</p>
                  <div className="mt-3 text-sm text-indigo-700">
                    <strong>Tempo total da experiência:</strong> {analysis.recommendations.totalExperienceTime}
                  </div>
                </div>
              )}

              {/* Total Investment */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{t.totalInvestment}</h3>
                    <p className="text-sm text-gray-600">Experiência gastronômica completa</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      R$ {(
                        parseFloat(analysis.recommendations.entrada.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0') +
                        parseFloat(analysis.recommendations.principal.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0') +
                        parseFloat(analysis.recommendations.bebida.price?.replace(/[^\d,]/g, '').replace(',', '.') || '0')
                      ).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">para 1 pessoa</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center"
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  {t.wantThisCompleteExperience}
                </button>
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {t.newAnalysis}
                </button>
              </div>

              {/* Social Share */}
              <div className="text-center">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'PlateWise - Minha Experiência Perfeita',
                        text: t.shareExperience,
                        url: window.location.href
                      })
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar experiência
                </button>
              </div>
            </div>
          )}

          {step === 'results' && analysis && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t.harmonization360}
                </h2>
                <p className="text-gray-600">
                  {t.basedOnPreference}: {preference === 'frutos-do-mar' ? t.seafood : t.land}
                </p>
                <div className="mt-4 flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">{t.overallHarmony}: {analysis.recommendations.overallScore}/10</span>
                  </div>
                  {analysis.recommendations.adventureAlternative && (
                    <button
                      onClick={() => setShowAdventureOption(!showAdventureOption)}
                      className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      <span>{t.tryAdventure}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Upgrade to Premium Banner for Free Users */}
              {userPreferences.subscriptionPlan === 'free' && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Crown className="w-8 h-8 text-yellow-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-yellow-900 mb-1">{t.upgradeToExperience}</h3>
                        <p className="text-sm text-yellow-800">Desbloqueie harmonização completa, impacto social e muito mais!</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPremiumModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-medium hover:from-yellow-600 hover:to-orange-700 transition-all duration-300"
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              )}

              {/* Allergies Warning */}
              {selectedAllergies.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-orange-800 font-medium">{t.allergiesWarning}</span>
                  </div>
                </div>
              )}

              {/* Enhanced Recommendations with Compatibility Scores */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Utensils className="w-5 h-5 text-orange-600 mr-2" />
                      <h3 className="font-semibold text-orange-900">{t.appetizer}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{analysis.recommendations.entrada.compatibilityScore}/10</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{analysis.recommendations.entrada.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{analysis.recommendations.entrada.description}</p>
                  <p className="text-lg font-bold text-orange-600">{analysis.recommendations.entrada.price}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <ChefHat className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-semibold text-blue-900">{t.mainCourse}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{analysis.recommendations.principal.compatibilityScore}/10</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{analysis.recommendations.principal.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{analysis.recommendations.principal.description}</p>
                  <p className="text-lg font-bold text-blue-600">{analysis.recommendations.principal.price}</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Wine className="w-5 h-5 text-purple-600 mr-2" />
                      <h3 className="font-semibold text-purple-900">{t.drink}</h3>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-gray-700">{analysis.recommendations.bebida.compatibilityScore}/10</span>
                    </div>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{analysis.recommendations.bebida.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{analysis.recommendations.bebida.description}</p>
                  <p className="text-lg font-bold text-purple-600">{analysis.recommendations.bebida.price}</p>
                </div>
              </div>

              {/* Adventure Alternative */}
              {showAdventureOption && analysis.recommendations.adventureAlternative && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    {t.adventureOption}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900">{analysis.recommendations.adventureAlternative.entrada.name}</h4>
                      <p className="text-sm text-gray-600">{analysis.recommendations.adventureAlternative.entrada.price}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900">{analysis.recommendations.adventureAlternative.principal.name}</h4>
                      <p className="text-sm text-gray-600">{analysis.recommendations.adventureAlternative.principal.price}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="font-medium text-gray-900">{analysis.recommendations.adventureAlternative.bebida.name}</h4>
                      <p className="text-sm text-gray-600">{analysis.recommendations.adventureAlternative.bebida.price}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-2">{t.whyAdventure}</h4>
                    <p className="text-gray-700 text-sm">{analysis.recommendations.adventureAlternative.reason}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Justification */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  {t.technicalJustification}
                </h3>
                <p className="text-gray-700 leading-relaxed">{analysis.recommendations.justificativa}</p>
              </div>

              {/* Social Impact for Premium Users */}
              {userPreferences.subscriptionPlan !== 'free' && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-green-900 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    {t.socialImpactGenerated}
                  </h3>
                  <p className="text-gray-700 mb-3">
                    {t.socialImpactDescription}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-green-700">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{t.mealDonated}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{t.contributionAmount}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      <span>{t.positiveImpact}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Learning System Feedback */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-8">
                <h3 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t.learningSystem}
                </h3>
                <p className="text-gray-700 mb-3">{t.learningDescription}</p>
                <div className="text-sm text-purple-700">
                  <p>Suas preferências registradas: {userPreferences.favoriteCategories.join(', ')}</p>
                  {userPreferences.dietaryRestrictions.length > 0 && (
                    <p>Restrições conhecidas: {userPreferences.dietaryRestrictions.join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  {t.newAnalysis}
                </button>
                <button
                  onClick={() => setShowHistory(true)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  {t.viewHistory}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}