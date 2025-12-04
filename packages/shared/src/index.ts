// Shared TypeScript types for Cloud Capital

export enum UserRole {
  USER = 'USER',
  SUBADMIN = 'SUBADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  PRE_APPROVED = 'PRE_APPROVED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum TaskType {
  DEPOSIT_MANUAL = 'DEPOSIT_MANUAL',
  DEPOSIT_AUTO = 'DEPOSIT_AUTO',
  WITHDRAWAL = 'WITHDRAWAL',
  LIQUIDATION = 'LIQUIDATION',
}

export enum InvestmentClass {
  BRONCE = 'BRONCE',
  PLATA = 'PLATA',
  BASIC = 'BASIC',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  username: string;
  role: UserRole;
  capitalUSDT: number;
  currentBalanceUSDT: number;
  investmentClass: InvestmentClass;
  referralsCount?: number;
  referralCode?: string;
  btcDepositAddress?: string;
  btcWithdrawAddress?: string;
  whatsappNumber?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  username: string;
  referralCode: string;
}

export interface AuthResponse {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface TransactionDTO {
  id: string;
  type: string;
  amountUSDT: number;
  amountBTC?: number;
  btcPrice?: number;
  reference?: string;
  status: string;
  createdAt: string;
}

export interface TaskDTO {
  id: string;
  type: TaskType;
  status: TaskStatus;
  amountUSD: number;
  reference?: string;
  proof?: string;
  approvedByAdmin?: string;
  liquidationDetails?: LiquidationDetails;
  user: {
    id: string;
    email: string;
    name: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LiquidationDetails {
  initialCapital: number;
  totalBalance: number;
  totalProfit: number;
  penaltyProfitRate: number;
  penaltyCapitalRate: number;
  destination: string;
}

export interface DepositRequest {
  amount: number;
  bank?: string;
  name?: string;
  cedula?: string;
  proof?: string;
}

export interface WithdrawalRequest {
  amountBTC: number;
  walletAddress: string;
}

export interface ReinvestRequest {
  amountBTC: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
