export type TransactionType =
  | 'EXPENSE'
  | 'INCOME'
  | 'REFUND'
  | 'TRANSFER'
  | 'INSTALLMENT'

export type FamilyRole = 'PARENT' | 'CHILD'
export type CardKind = 'DEBIT' | 'CREDIT'

export interface FamilyMember {
  role: FamilyRole
  joinedAt: string
  user: { id: string; name: string; email: string }
}

export interface Usuario {
  id: string
  name: string
  email: string
  familyRole: FamilyRole | null
  family: { id: string; name: string; members: FamilyMember[] } | null
}

export interface CategoryMonthlyTotal {
  categoryId: string
  categoryName: string
  type: string
  total: string
  previousTotal: string
  variationPercent: number | null
  transactionCount: number
}

export interface MonthlySummary {
  month: number
  year: number
  totalIncome: string
  totalExpense: string
  balance: string
  transactionCount: number
  byCategory: CategoryMonthlyTotal[]
}

export interface SpendingTrend {
  categoryId: string
  year: number
  month: number
  total: string
  count: number
}

export interface Movimiento {
  id: string
  amount: string
  type: TransactionType
  occurredAt: string
  dateOnly: boolean
  description: string | null
  rawDescription: string | null
  notes: string | null
  source: string
  merchantId: string | null
  installment: { number: number; total: number } | null
  merchant: { id: string; name: string } | null
  category: { id: string; name: string } | null
  owner: { id: string; name: string }
  card: { id: string; alias: string | null; bank: string; last4: string } | null
}

export interface Categoria {
  id: string
  userId: string | null
  name: string
  type: string
  isGlobal: boolean
}

export interface Comercio {
  id: string
  groupId: string | null
  defaultCategoryId: string | null
  name: string
  mappingRules: { rawBankString: string }[]
}

export interface GrupoComercio {
  id: string
  name: string
}

/** Alcance de los datos: de quién se ven (spec §4.4). */
export type Alcance = { ownerId: string | null; wholeFamily: boolean }

export interface BudgetReportItem {
  categoryId: string
  categoryName: string | null
  amountLimit: number
  spent: number
  remaining: number
  percentUsed: number
  exceeded: boolean
  transactionCount: number
}

export interface Tarjeta {
  id: string
  bank: string
  kind: CardKind
  last4: string
  alias: string | null
}

export type Periodo = {
  month: number
  year: number
}
