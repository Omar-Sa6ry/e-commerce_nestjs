import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  COMPANY = 'company',
}
export const AllRoles: Role[] = Object.values(Role);

export enum Permission {
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  EDIT_USER_ROLE = 'edit_user_role',

  RESET_PASSWORD = 'RESET_PASSWORD',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  LOGOUT = 'LOGOUT',

  // Company
  CREATE_COMPANY = 'create_company',
  UPDATE_COMPANY = 'update_company',
  DELETE_COMPANY = 'delete_company',
  VIEW_COMPANY = 'view_company',
  ADD_EMPLOYEE = 'add_employee',
  DELETE_EMPLOYEE = 'delete_employee',

  // Category
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',

  // Product
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',

  // Product Details
  CREATE_PRODUCT_DETAILS = 'create_product_details',
  UPDATE_PRODUCT_DETAILS = 'update_product_details',
  DELETE_PRODUCT_DETAILS = 'delete_product_details',
}

export enum Size {
  SMALL = 'small',
  XSMALL = 'x small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'x large',
}

export enum Currency {
  AED = 'aed', // United Arab Emirates Dirham
  AFN = 'afn', // Afghan Afghani
  ALL = 'all', // Albanian Lek
  AMD = 'amd', // Armenian Dram
  ANG = 'ang', // Netherlands Antillean Guilder
  AOA = 'aoa', // Angolan Kwanza
  ARS = 'ars', // Argentine Peso
  AUD = 'aud', // Australian Dollar
  AWG = 'awg', // Aruban Florin
  AZN = 'azn', // Azerbaijani Manat
  BAM = 'bam', // Bosnia and Herzegovina Convertible Mark
  BBD = 'bbd', // Barbadian Dollar
  BDT = 'bdt', // Bangladeshi Taka
  BGN = 'bgn', // Bulgarian Lev
  BHD = 'bhd', // Bahraini Dinar
  BIF = 'bif', // Burundian Franc
  BMD = 'bmd', // Bermudian Dollar
  BND = 'bnd', // Brunei Dollar
  BOB = 'bob', // Bolivian Boliviano
  BRL = 'brl', // Brazilian Real
  BSD = 'bsd', // Bahamian Dollar
  BTN = 'btn', // Bhutanese Ngultrum
  BWP = 'bwp', // Botswanan Pula
  BYN = 'byn', // Belarusian Ruble
  BZD = 'bzd', // Belize Dollar
  CAD = 'cad', // Canadian Dollar
  CDF = 'cdf', // Congolese Franc
  CHF = 'chf', // Swiss Franc
  CLP = 'clp', // Chilean Peso
  CNY = 'cny', // Chinese Yuan
  COP = 'cop', // Colombian Peso
  CRC = 'crc', // Costa Rican Colón
  CUP = 'cup', // Cuban Peso
  CVE = 'cve', // Cape Verdean Escudo
  CZK = 'czk', // Czech Koruna
  DJF = 'djf', // Djiboutian Franc
  DKK = 'dkk', // Danish Krone
  DOP = 'dop', // Dominican Peso
  DZD = 'dzd', // Algerian Dinar
  EGP = 'egp', // Egyptian Pound
  ERN = 'ern', // Eritrean Nakfa
  ETB = 'etb', // Ethiopian Birr
  EUR = 'eur', // Euro
  FJD = 'fjd', // Fijian Dollar
  FKP = 'fkp', // Falkland Islands Pound
  GBP = 'gbp', // British Pound Sterling
  GEL = 'gel', // Georgian Lari
  GGP = 'ggp', // Guernsey Pound
  GHS = 'ghs', // Ghanaian Cedi
  GIP = 'gip', // Gibraltar Pound
  GMD = 'gmd', // Gambian Dalasi
  GNF = 'gnf', // Guinean Franc
  GTQ = 'gtq', // Guatemalan Quetzal
  GYD = 'gyd', // Guyanaese Dollar
  HKD = 'hkd', // Hong Kong Dollar
  HNL = 'hnl', // Honduran Lempira
  HRK = 'hrk', // Croatian Kuna
  HTG = 'htg', // Haitian Gourde
  HUF = 'huf', // Hungarian Forint
  IDR = 'idr', // Indonesian Rupiah
  ILS = 'ils', // Israeli New Shekel
  IMP = 'imp', // Isle of Man Pound
  INR = 'inr', // Indian Rupee
  IQD = 'iqd', // Iraqi Dinar
  IRR = 'irr', // Iranian Rial
  ISK = 'isk', // Icelandic Króna
  JEP = 'jep', // Jersey Pound
  JMD = 'jmd', // Jamaican Dollar
  JOD = 'jod', // Jordanian Dinar
  JPY = 'jpy', // Japanese Yen
  KES = 'kes', // Kenyan Shilling
  KGS = 'kgs', // Kyrgystani Som
  KHR = 'khr', // Cambodian Riel
  KMF = 'kmf', // Comorian Franc
  KPW = 'kpw', // North Korean Won
  KRW = 'krw', // South Korean Won
  KWD = 'kwd', // Kuwaiti Dinar
  KYD = 'kyd', // Cayman Islands Dollar
  KZT = 'kzt', // Kazakhstani Tenge
  LAK = 'lak', // Laotian Kip
  LBP = 'lbp', // Lebanese Pound
  LKR = 'lkr', // Sri Lankan Rupee
  LRD = 'lrd', // Liberian Dollar
  LSL = 'lsl', // Lesotho Loti
  LYD = 'lyd', // Libyan Dinar
  MAD = 'mad', // Moroccan Dirham
  MDL = 'mdl', // Moldovan Leu
  MGA = 'mga', // Malagasy Ariary
  MKD = 'mkd', // Macedonian Denar
  MMK = 'mmk', // Myanmar Kyat
  MNT = 'mnt', // Mongolian Tugrik
  MOP = 'mop', // Macanese Pataca
  MRU = 'mru', // Mauritanian Ouguiya
  MUR = 'mur', // Mauritian Rupee
  MVR = 'mvr', // Maldivian Rufiyaa
  MWK = 'mwk', // Malawian Kwacha
  MXN = 'mxn', // Mexican Peso
  MYR = 'myr', // Malaysian Ringgit
  MZN = 'mzn', // Mozambican Metical
  NAD = 'nad', // Namibian Dollar
  NGN = 'ngn', // Nigerian Naira
  NIO = 'nio', // Nicaraguan Córdoba
  NOK = 'nok', // Norwegian Krone
  NPR = 'npr', // Nepalese Rupee
  NZD = 'nzd', // New Zealand Dollar
  OMR = 'omr', // Omani Rial
  PAB = 'pab', // Panamanian Balboa
  PEN = 'pen', // Peruvian Sol
  PGK = 'pgk', // Papua New Guinean Kina
  PHP = 'php', // Philippine Peso
  PKR = 'pkr', // Pakistani Rupee
  PLN = 'pln', // Polish Złoty
  PYG = 'pyg', // Paraguayan Guarani
  QAR = 'qar', // Qatari Rial
  RON = 'ron', // Romanian Leu
  RSD = 'rsd', // Serbian Dinar
  RUB = 'rub', // Russian Ruble
  RWF = 'rwf', // Rwandan Franc
  SAR = 'sar', // Saudi Riyal
  SBD = 'sbd', // Solomon Islands Dollar
  SCR = 'scr', // Seychellois Rupee
  SDG = 'sdg', // Sudanese Pound
  SEK = 'sek', // Swedish Krona
  SGD = 'sgd', // Singapore Dollar
  SHP = 'shp', // Saint Helena Pound
  SLL = 'sll', // Sierra Leonean Leone
  SOS = 'sos', // Somali Shilling
  SRD = 'srd', // Surinamese Dollar
  SSP = 'ssp', // South Sudanese Pound
  STN = 'stn', // São Tomé and Príncipe Dobra
  SYP = 'syp', // Syrian Pound
  SZL = 'szl', // Swazi Lilangeni
  THB = 'thb', // Thai Baht
  TJS = 'tjs', // Tajikistani Somoni
  TMT = 'tmt', // Turkmenistani Manat
  TND = 'tnd', // Tunisian Dinar
  TOP = 'top', // Tongan Pa’anga
  TRY = 'try', // Turkish Lira
  TTD = 'ttd', // Trinidad and Tobago Dollar
  TWD = 'twd', // New Taiwan Dollar
  TZS = 'tzs', // Tanzanian Shilling
  UAH = 'uah', // Ukrainian Hryvnia
  UGX = 'ugx', // Ugandan Shilling
  USD = 'usd', // United States Dollar
  UYU = 'uyu', // Uruguayan Peso
  UZS = 'uzs', // Uzbekistani Som
  VES = 'ves', // Venezuelan Bolívar Soberano
  VND = 'vnd', // Vietnamese Dong
  VUV = 'vuv', // Vanuatu Vatu
  WST = 'wst', // Samoan Tala
  XAF = 'xaf', // Central African CFA Franc
  XCD = 'xcd', // East Caribbean Dollar
  XOF = 'xof', // West African CFA Franc
  XPF = 'xpf', // CFP Franc
  YER = 'yer', // Yemeni Rial
  ZAR = 'zar', // South African Rand
  ZMW = 'zmw', // Zambian Kwacha
  ZWL = 'zwl', // Zimbabwean Dollar
}

registerEnumType(Permission, {
  name: 'Permission',
  description: 'Detailed permissions in the system',
});

registerEnumType(Role, {
  name: 'Role',
  description: 'User roles in the system',
});

registerEnumType(Size, {
  name: 'Size',
  description: 'Detailed Product Size in the system',
});
