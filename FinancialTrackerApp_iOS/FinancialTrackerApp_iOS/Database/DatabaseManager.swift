import Foundation
import CoreData

class DatabaseManager {
    static let shared = DatabaseManager()
    
    // In-memory storage for development
    private var accounts: [Account] = []
    private var expenses: [Expense] = []
    
    private init() {
        // Add some sample data for testing
        setupSampleData()
    }
    
    // MARK: - Account CRUD operations
    
    func createAccount(name: String, balance: Double, currency: String, description: String? = nil) -> Account {
        let account = Account(name: name, balance: balance, currency: currency, description: description)
        accounts.append(account)
        return account
    }
    
    func fetchAllAccounts() -> [Account] {
        return accounts
    }
    
    func fetchAccount(byId id: UUID) -> Account? {
        return accounts.first { $0.id == id }
    }
    
    func updateAccount(account: Account, name: String, balance: Double, currency: String, description: String?) {
        account.name = name
        account.balance = balance
        account.currency = currency
        account.description = description
    }
    
    func deleteAccount(account: Account) throws {
        // Check if account has expenses
        let accountExpenses = expenses.filter { $0.account?.id == account.id }
        if !accountExpenses.isEmpty {
            throw NSError(domain: "FinancialTrackerErrorDomain", code: 1, userInfo: [
                NSLocalizedDescriptionKey: "No se puede eliminar una cuenta con gastos asociados"
            ])
        }
        
        accounts.removeAll { $0.id == account.id }
    }
    
    // MARK: - Expense CRUD operations
    
    func createExpense(amount: Double, currency: String, date: Date, category: String, description: String? = nil, account: Account? = nil) -> Expense {
        let expense = Expense(amount: amount, currency: currency, date: date, category: category, description: description, account: account)
        
        // Update account balance if provided
        if let account = account {
            // Convert expense amount to account currency if needed
            let expenseAmount = expense.convertedAmount(to: account.currency)
            account.updateBalance(-expenseAmount)
        }
        
        expenses.append(expense)
        return expense
    }
    
    func fetchExpenses(forMonth month: Int? = nil, year: Int? = nil, category: String? = nil, account: Account? = nil) -> [Expense] {
        var filteredExpenses = expenses
        
        // Filter by date if month and year provided
        if let month = month, let year = year {
            let calendar = Calendar.current
            filteredExpenses = filteredExpenses.filter { expense in
                let expenseMonth = calendar.component(.month, from: expense.date)
                let expenseYear = calendar.component(.year, from: expense.date)
                return expenseMonth == month && expenseYear == year
            }
        }
        
        // Filter by category if provided
        if let category = category {
            filteredExpenses = filteredExpenses.filter { $0.category == category }
        }
        
        // Filter by account if provided
        if let account = account {
            filteredExpenses = filteredExpenses.filter { $0.account?.id == account.id }
        }
        
        // Sort by date (newest first)
        return filteredExpenses.sorted { $0.date > $1.date }
    }
    
    func fetchExpense(byId id: UUID) -> Expense? {
        return expenses.first { $0.id == id }
    }
    
    func updateExpense(expense: Expense, amount: Double, currency: String, date: Date, category: String, description: String?, account: Account?) {
        // If account is changing, update balances
        if expense.account != account {
            // Revert effect on old account
            if let oldAccount = expense.account {
                let oldAmount = expense.convertedAmount(to: oldAccount.currency)
                oldAccount.updateBalance(oldAmount)
            }
            
            // Apply effect to new account
            if let newAccount = account {
                let newAmount = CurrencyManager.shared.convertAmount(amount, from: currency, to: newAccount.currency)
                newAccount.updateBalance(-newAmount)
            }
        } else if let existingAccount = expense.account {
            // Account is the same but amount might have changed
            let oldAmount = expense.convertedAmount(to: existingAccount.currency)
            let newAmount = CurrencyManager.shared.convertAmount(amount, from: currency, to: existingAccount.currency)
            existingAccount.updateBalance(oldAmount - newAmount)
        }
        
        // Update expense properties
        expense.amount = amount
        expense.currency = currency
        expense.date = date
        expense.category = category
        expense.expenseDescription = description
        expense.account = account
    }
    
    func deleteExpense(expense: Expense) {
        // Revert effect on account
        if let account = expense.account {
            let amount = expense.convertedAmount(to: account.currency)
            account.updateBalance(amount)
        }
        
        expenses.removeAll { $0.id == expense.id }
    }
    
    // MARK: - Reporting and summaries
    
    func getMonthlySummary(month: Int, year: Int) -> MonthlyFinancialSummary {
        let monthlyExpenses = fetchExpenses(forMonth: month, year: year)
        
        let totalExpenses = monthlyExpenses.reduce(0) { total, expense in
            let selectedCurrency = CurrencyManager.shared.selectedCurrency
            return total + expense.convertedAmount(to: selectedCurrency)
        }
        
        // Group expenses by category
        var expensesByCategory: [String: Double] = [:]
        for expense in monthlyExpenses {
            let selectedCurrency = CurrencyManager.shared.selectedCurrency
            let amount = expense.convertedAmount(to: selectedCurrency)
            
            if let existingAmount = expensesByCategory[expense.category] {
                expensesByCategory[expense.category] = existingAmount + amount
            } else {
                expensesByCategory[expense.category] = amount
            }
        }
        
        // Group expenses by day
        var expensesByDay: [Int: Double] = [:]
        let calendar = Calendar.current
        
        for expense in monthlyExpenses {
            let day = calendar.component(.day, from: expense.date)
            let selectedCurrency = CurrencyManager.shared.selectedCurrency
            let amount = expense.convertedAmount(to: selectedCurrency)
            
            if let existingAmount = expensesByDay[day] {
                expensesByDay[day] = existingAmount + amount
            } else {
                expensesByDay[day] = amount
            }
        }
        
        return MonthlyFinancialSummary(
            totalExpenses: totalExpenses,
            expenseCount: monthlyExpenses.count,
            expensesByCategory: expensesByCategory,
            expensesByDay: expensesByDay
        )
    }
    
    // MARK: - Currency conversion helper
    
    func convertCurrency(amount: Double, fromCurrency: String, toCurrency: String) -> Double {
        return CurrencyManager.shared.convertAmount(amount, from: fromCurrency, to: toCurrency)
    }
    
    // MARK: - Sample Data (for development)
    
    private func setupSampleData() {
        // Create some sample accounts
        let account1 = createAccount(name: "Cuenta Corriente", balance: 2500000, currency: "COP")
        let account2 = createAccount(name: "Ahorros", balance: 5000000, currency: "COP")
        let account3 = createAccount(name: "Inversiones", balance: 2000, currency: "USD")
        
        // Create some sample expenses
        let currentDate = Date()
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: currentDate)
        let currentYear = calendar.component(.year, from: currentDate)
        
        let categories = ["Alimentación", "Vivienda", "Transporte", "Servicios", "Salud", "Entretenimiento", "Educación"]
        
        // Create expenses for the current month
        for i in 1...20 {
            let day = min(i, 28)
            var dateComponents = DateComponents()
            dateComponents.year = currentYear
            dateComponents.month = currentMonth
            dateComponents.day = day
            
            let date = calendar.date(from: dateComponents) ?? currentDate
            let category = categories[i % categories.count]
            let account = [account1, account2, account3][i % 3]
            let amount = Double((i + 1) * 50000) // Some random amount
            
            _ = createExpense(
                amount: amount,
                currency: account.currency,
                date: date,
                category: category,
                description: "Gasto de prueba \(i)",
                account: account
            )
        }
    }
}