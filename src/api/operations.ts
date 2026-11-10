// Operaciones GraphQL del backend de Finis (ver backend-finis/schema.graphqls).

export const LOGIN = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

export const REGISTER = /* GraphQL */ `
  mutation Register($name: String, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

export const LOGOUT = /* GraphQL */ `
  mutation Logout($refreshToken: String) {
    logout(refreshToken: $refreshToken)
  }
`

export const ME = /* GraphQL */ `
  query Me {
    me {
      id
      name
      email
      familyRole
      family {
        id
        name
        members {
          role
          joinedAt
          user {
            id
            name
            email
          }
        }
      }
    }
  }
`

export const MONTHLY_SUMMARY = /* GraphQL */ `
  query MonthlySummary(
    $month: Int!
    $year: Int!
    $ownerId: ID
    $wholeFamily: Boolean
  ) {
    monthlySummary(
      month: $month
      year: $year
      ownerId: $ownerId
      wholeFamily: $wholeFamily
    ) {
      month
      year
      totalIncome
      totalExpense
      balance
      transactionCount
      byCategory {
        categoryId
        categoryName
        type
        total
        previousTotal
        variationPercent
        transactionCount
      }
    }
  }
`

export const SPENDING_TREND = /* GraphQL */ `
  query SpendingTrend($ownerId: ID, $wholeFamily: Boolean, $months: Int) {
    spendingTrendByCategory(
      ownerId: $ownerId
      wholeFamily: $wholeFamily
      months: $months
    ) {
      categoryId
      year
      month
      total
      count
    }
  }
`

export const TRANSACTIONS = /* GraphQL */ `
  query Transactions(
    $month: Int!
    $year: Int!
    $limit: Int!
    $ownerId: ID
    $wholeFamily: Boolean
  ) {
    transactions(
      month: $month
      year: $year
      limit: $limit
      offset: 0
      ownerId: $ownerId
      wholeFamily: $wholeFamily
    ) {
      id
      amount
      type
      occurredAt
      dateOnly
      description
      rawDescription
      notes
      source
      merchantId
      installment {
        number
        total
      }
      merchant {
        id
        name
      }
      category {
        id
        name
      }
      owner {
        id
        name
      }
      card {
        id
        alias
        bank
        last4
      }
    }
  }
`

export const CATEGORIES = /* GraphQL */ `
  query Categories {
    categories {
      id
      userId
      name
      type
      isGlobal
    }
  }
`

export const CREATE_TRANSACTION = /* GraphQL */ `
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id
    }
  }
`

export const DELETE_TRANSACTION = /* GraphQL */ `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`

export const BUDGET_REPORT = /* GraphQL */ `
  query BudgetReport($month: Int!, $year: Int!) {
    budgetReport(month: $month, year: $year) {
      categoryId
      categoryName
      amountLimit
      spent
      remaining
      percentUsed
      exceeded
      transactionCount
    }
    budgets(month: $month, year: $year) {
      id
      categoryId
    }
  }
`

export const CREATE_BUDGET = /* GraphQL */ `
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
      id
    }
  }
`

export const DELETE_BUDGET = /* GraphQL */ `
  mutation DeleteBudget($id: ID!) {
    deleteBudget(id: $id)
  }
`

export const MY_CARDS = /* GraphQL */ `
  query MyCards {
    myCards {
      id
      bank
      kind
      last4
      alias
    }
  }
`

export const ADD_CARD = /* GraphQL */ `
  mutation AddCard(
    $bank: String!
    $kind: CardKind!
    $last4: String!
    $alias: String
  ) {
    addCard(bank: $bank, kind: $kind, last4: $last4, alias: $alias) {
      id
    }
  }
`

export const DELETE_CARD = /* GraphQL */ `
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id)
  }
`

export const CREATE_FAMILY = /* GraphQL */ `
  mutation CreateFamily($name: String!) {
    createFamily(name: $name) {
      id
    }
  }
`

export const CREATE_FAMILY_INVITE = /* GraphQL */ `
  mutation CreateFamilyInvite($role: FamilyRole!) {
    createFamilyInvite(role: $role) {
      code
      role
      expiresAt
    }
  }
`

export const ACCEPT_FAMILY_INVITE = /* GraphQL */ `
  mutation AcceptFamilyInvite($code: String!) {
    acceptFamilyInvite(code: $code) {
      id
    }
  }
`

export const REMOVE_FAMILY_MEMBER = /* GraphQL */ `
  mutation RemoveFamilyMember($userId: ID!) {
    removeFamilyMember(userId: $userId) {
      id
    }
  }
`

export const LEAVE_FAMILY = /* GraphQL */ `
  mutation LeaveFamily {
    leaveFamily
  }
`

export const CREATE_CATEGORY = /* GraphQL */ `
  mutation CreateCategory($name: String!, $type: String!, $isGlobal: Boolean) {
    createCategory(name: $name, type: $type, isGlobal: $isGlobal) {
      id
    }
  }
`

export const MERCHANTS_LIST = /* GraphQL */ `
  query MerchantsList {
    merchants {
      id
      groupId
      defaultCategoryId
      name
      mappingRules {
        rawBankString
      }
    }
    merchantGroups {
      id
      name
    }
  }
`

export const MERCHANT_GROUPS = /* GraphQL */ `
  query MerchantGroups {
    merchantGroups {
      id
      name
    }
  }
`

export const CREATE_MERCHANT_GROUP = /* GraphQL */ `
  mutation CreateMerchantGroup($name: String!) {
    createMerchantGroup(name: $name) {
      id
    }
  }
`

export const RENAME_MERCHANT = /* GraphQL */ `
  mutation RenameMerchant($input: RenameMerchantInput!) {
    renameMerchant(input: $input) {
      merchant {
        id
        name
      }
      updatedTransactions
    }
  }
`
