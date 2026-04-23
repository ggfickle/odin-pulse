export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  updatedAt: string;
  assetType: "stock" | "crypto" | "index";
}

export interface MarketListResponse {
  items: MarketQuote[];
  refreshedAt: string;
}
