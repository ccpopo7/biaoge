
export enum Category {
  Clothing = '服饰内衣',
  Beauty = '美妆护肤',
  Jewelry = '珠宝文玩',
  Food = '食品饮料',
  ShoesBags = '鞋靴箱包',
  Home = '智能家居',
  Electronics = '3C数码',
  PersonalCare = '个护家清',
  Baby = '母婴宠物',
  Sports = '运动户外',
  WatchesAccessories = '钟表配饰',
  FreshFood = '生鲜',
  BooksEducation = '图书教育',
  GiftsCreative = '礼品文创',
  FlowersGardening = '鲜花园艺',
  ToysInstruments = '玩具乐器',
  SecondHand = '二手商品',
  VirtualRecharge = '虚拟充值',
  Automotive = '汽车整车',
  LocalLife = '本地生活',
  Luxury = '奢侈品',
  MedicalHealth = '医疗健康',
  HealthSupplements = '滋补保健',
  Alcohol = '酒类',
  Other = '其他'
}

export enum Platform {
  Douyin = '抖音',
  Kuaishou = '快手',
  Taobao = '淘宝',
  Video号 = '视频号',
  Pinduoduo = '拼多多',
  PrivateDomain = '私域直播',
  Other = '其他'
}

export interface Sample {
  id: string;
  name: string; // 产品名称
  brandName: string; // 厂家品牌名称
  imageUrl: string;
  category: Category;
  entryDate: string; // ISO Date string
  
  // Warehouse Info
  locationCode: string; // e.g., A-01-02 (Shelf-Row-Bin)
  stockQuantity: number; // 数量
  trackingNumber?: string; // 快递单号
  
  // Live Stream Info
  price: number; // Selling price
  commissionRate: number; // Percentage (e.g., 20 for 20%)
  mechanism: string; // e.g., "Buy 1 Get 1", "Gift with purchase"
  platform: Platform;
  selectionCount: number; // How many times it has been picked for live
  specs: string; // 规格 e.g., "500ml", "Red/L"
  
  // New Business & Merchant Info
  businessContact: string; // 商务对接人
  merchantContact: string; // 商家对接人
  merchantPhone: string; // 商家电话
  procurementPrice?: number; // 集采价
  includeShippingFee?: boolean; // 是否包含运费 (Procurement side)
  
  isFreeShipping: boolean; // 是否包邮 (Live side)
  assistantAnchor: string; // 助播
}

export type SampleFilter = {
  search: string;
  category: Category | 'All';
  platform: Platform | 'All';
  dateRange: 'All' | 'Today' | 'Week' | 'Month';
}
