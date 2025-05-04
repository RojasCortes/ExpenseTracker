import Foundation
import CoreData

class DatabaseManager {
    
    static let shared = DatabaseManager()
    
    // MARK: - Core Data stack
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "FinancialTrackerDataModel")
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Error al inicializar CoreData: \(error), \(error.userInfo)")
            }
        })
        return container
    }()
    
    lazy var viewContext: NSManagedObjectContext = {
        return persistentContainer.viewContext
    }()
    
    // MARK: - Core Data Saving support
    
    func saveContext() {
        if viewContext.hasChanges {
            do {
                try viewContext.save()
            } catch {
                let error = error as NSError
                print("Error al guardar los datos: \(error), \(error.userInfo)")
            }
        }
    }
    
    // MARK: - Database setup and initialization
    
    func setupDatabase() {
        createDataModelIfNeeded()
        
        // Check if we need to add sample data
        let fetchRequest: NSFetchRequest<Account> = Account.fetchRequest()
        
        do {
            let count = try viewContext.count(for: fetchRequest)
            if count == 0 {
                createSampleData()
            }
        } catch {
            print("Error verificando datos existentes: \(error)")
        }
    }
    
    private func createDataModelIfNeeded() {
        let modelURL = Bundle.main.url(forResource: "FinancialTrackerDataModel", withExtension: "momd")
        if modelURL == nil {
            // Create data model programmatically if .xcdatamodeld file doesn't exist
            
            guard let modelDescription = NSManagedObjectModel.mergedModel(from: [Bundle.main]) else {
                fatalError("No se pudo crear el modelo de datos")
            }
            
            // Define Account entity
            let accountEntity = NSEntityDescription()
            accountEntity.name = "Account"
            accountEntity.managedObjectClassName = "Account"
            
            let accountIdAttribute = NSAttributeDescription()
            accountIdAttribute.name = "id"
            accountIdAttribute.attributeType = .integer64AttributeType
            accountIdAttribute.isOptional = false
            
            let accountNameAttribute = NSAttributeDescription()
            accountNameAttribute.name = "name"
            accountNameAttribute.attributeType = .stringAttributeType
            accountNameAttribute.isOptional = false
            
            let accountBalanceAttribute = NSAttributeDescription()
            accountBalanceAttribute.name = "balance"
            accountBalanceAttribute.attributeType = .doubleAttributeType
            accountBalanceAttribute.isOptional = false
            
            let accountCurrencyAttribute = NSAttributeDescription()
            accountCurrencyAttribute.name = "currency"
            accountCurrencyAttribute.attributeType = .stringAttributeType
            accountCurrencyAttribute.isOptional = false
            
            let accountCreatedAtAttribute = NSAttributeDescription()
            accountCreatedAtAttribute.name = "createdAt"
            accountCreatedAtAttribute.attributeType = .dateAttributeType
            accountCreatedAtAttribute.isOptional = false
            
            accountEntity.properties = [
                accountIdAttribute,
                accountNameAttribute,
                accountBalanceAttribute,
                accountCurrencyAttribute,
                accountCreatedAtAttribute
            ]
            
            // Define Expense entity
            let expenseEntity = NSEntityDescription()
            expenseEntity.name = "Expense"
            expenseEntity.managedObjectClassName = "Expense"
            
            let expenseIdAttribute = NSAttributeDescription()
            expenseIdAttribute.name = "id"
            expenseIdAttribute.attributeType = .integer64AttributeType
            expenseIdAttribute.isOptional = false
            
            let expenseAmountAttribute = NSAttributeDescription()
            expenseAmountAttribute.name = "amount"
            expenseAmountAttribute.attributeType = .doubleAttributeType
            expenseAmountAttribute.isOptional = false
            
            let expenseCurrencyAttribute = NSAttributeDescription()
            expenseCurrencyAttribute.name = "currency"
            expenseCurrencyAttribute.attributeType = .stringAttributeType
            expenseCurrencyAttribute.isOptional = false
            
            let expenseDateAttribute = NSAttributeDescription()
            expenseDateAttribute.name = "date"
            expenseDateAttribute.attributeType = .dateAttributeType
            expenseDateAttribute.isOptional = false
            
            let expenseCategoryAttribute = NSAttributeDescription()
            expenseCategoryAttribute.name = "category"
            expenseCategoryAttribute.attributeType = .stringAttributeType
            expenseCategoryAttribute.isOptional = false
            
            let expenseDescriptionAttribute = NSAttributeDescription()
            expenseDescriptionAttribute.name = "expenseDescription"
            expenseDescriptionAttribute.attributeType = .stringAttributeType
            expenseDescriptionAttribute.isOptional = true
            
            let expenseCreatedAtAttribute = NSAttributeDescription()
            expenseCreatedAtAttribute.name = "createdAt"
            expenseCreatedAtAttribute.attributeType = .dateAttributeType
            expenseCreatedAtAttribute.isOptional = false
            
            // Define relationship between Account and Expense
            let accountToExpenses = NSRelationshipDescription()
            accountToExpenses.name = "expenses"
            accountToExpenses.destinationEntity = expenseEntity
            accountToExpenses.minCount = 0
            accountToExpenses.maxCount = 0 // many
            accountToExpenses.deleteRule = .cascadeDeleteRule
            
            let expenseToAccount = NSRelationshipDescription()
            expenseToAccount.name = "account"
            expenseToAccount.destinationEntity = accountEntity
            expenseToAccount.minCount = 1
            expenseToAccount.maxCount = 1
            expenseToAccount.deleteRule = .nullifyDeleteRule
            
            accountToExpenses.inverseRelationship = expenseToAccount
            expenseToAccount.inverseRelationship = accountToExpenses
            
            accountEntity.properties.append(accountToExpenses)
            
            expenseEntity.properties = [
                expenseIdAttribute,
                expenseAmountAttribute,
                expenseCurrencyAttribute,
                expenseDateAttribute,
                expenseCategoryAttribute,
                expenseDescriptionAttribute,
                expenseCreatedAtAttribute,
                expenseToAccount
            ]
            
            // Set entities in model
            modelDescription.entities = [accountEntity, expenseEntity]
            
            // Ensure model is installed
            persistentContainer.managedObjectModel = modelDescription
        }
    }
    
    private func createSampleData() {
        // Create sample accounts
        let account1 = Account(context: viewContext)
        account1.id = 1
        account1.name = "Cuenta de Ahorros"
        account1.balance = 2500000
        account1.currency = "COP"
        account1.createdAt = Date()
        
        let account2 = Account(context: viewContext)
        account2.id = 2
        account2.name = "Cuenta Corriente"
        account2.balance = 1200000
        account2.currency = "COP"
        account2.createdAt = Date()
        
        let account3 = Account(context: viewContext)
        account3.id = 3
        account3.name = "Inversiones"
        account3.balance = 500
        account3.currency = "USD"
        account3.createdAt = Date()
        
        // Create sample expenses
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        
        let expense1 = Expense(context: viewContext)
        expense1.id = 1
        expense1.amount = 150000
        expense1.currency = "COP"
        expense1.date = dateFormatter.date(from: "2023-05-01") ?? Date()
        expense1.category = "Alimentación"
        expense1.expenseDescription = "Compras semanales"
        expense1.createdAt = Date()
        expense1.account = account1
        
        let expense2 = Expense(context: viewContext)
        expense2.id = 2
        expense2.amount = 250000
        expense2.currency = "COP"
        expense2.date = dateFormatter.date(from: "2023-05-02") ?? Date()
        expense2.category = "Vivienda"
        expense2.expenseDescription = "Pago de arriendo"
        expense2.createdAt = Date()
        expense2.account = account2
        
        let expense3 = Expense(context: viewContext)
        expense3.id = 3
        expense3.amount = 100
        expense3.currency = "USD"
        expense3.date = dateFormatter.date(from: "2023-05-03") ?? Date()
        expense3.category = "Entretenimiento"
        expense3.expenseDescription = "Suscripciones"
        expense3.createdAt = Date()
        expense3.account = account3
        
        saveContext()
    }
    
    // MARK: - Account operations
    
    func fetchAllAccounts() -> [Account] {
        let fetchRequest: NSFetchRequest<Account> = Account.fetchRequest()
        
        do {
            return try viewContext.fetch(fetchRequest)
        } catch {
            print("Error fetching accounts: \(error)")
            return []
        }
    }
    
    func createAccount(name: String, initialBalance: Double, currency: String) -> Account {
        let account = Account(context: viewContext)
        
        // Get highest ID
        let fetchRequest: NSFetchRequest<Account> = Account.fetchRequest()
        fetchRequest.fetchLimit = 1
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "id", ascending: false)]
        
        do {
            let results = try viewContext.fetch(fetchRequest)
            let nextId = results.first?.id ?? 0
            account.id = nextId + 1
        } catch {
            account.id = 1
        }
        
        account.name = name
        account.balance = initialBalance
        account.currency = currency
        account.createdAt = Date()
        
        saveContext()
        return account
    }
    
    func updateAccount(account: Account, name: String? = nil, balance: Double? = nil, currency: String? = nil) {
        if let name = name {
            account.name = name
        }
        
        if let balance = balance {
            account.balance = balance
        }
        
        if let currency = currency {
            account.currency = currency
        }
        
        saveContext()
    }
    
    func deleteAccount(account: Account) throws {
        // Check if account has expenses
        let expenses = account.expenses?.allObjects as? [Expense] ?? []
        
        if !expenses.isEmpty {
            throw NSError(domain: "com.financialtracker", code: 400, userInfo: [
                NSLocalizedDescriptionKey: "No se puede eliminar una cuenta con gastos. Elimine los gastos primero."
            ])
        }
        
        viewContext.delete(account)
        saveContext()
    }
    
    // MARK: - Expense operations
    
    func fetchExpenses(forMonth month: Int? = nil, year: Int? = nil, category: String? = nil, account: Account? = nil) -> [Expense] {
        let fetchRequest: NSFetchRequest<Expense> = Expense.fetchRequest()
        
        var predicates: [NSPredicate] = []
        
        if let month = month, let year = year {
            let calendar = Calendar.current
            let startDateComponents = DateComponents(year: year, month: month, day: 1)
            let endDateComponents = DateComponents(year: year, month: month + 1, day: 1)
            
            guard let startDate = calendar.date(from: startDateComponents),
                  let endDate = calendar.date(from: endDateComponents) else {
                return []
            }
            
            let datePredicate = NSPredicate(format: "date >= %@ AND date < %@", startDate as NSDate, endDate as NSDate)
            predicates.append(datePredicate)
        }
        
        if let category = category {
            let categoryPredicate = NSPredicate(format: "category == %@", category)
            predicates.append(categoryPredicate)
        }
        
        if let account = account {
            let accountPredicate = NSPredicate(format: "account == %@", account)
            predicates.append(accountPredicate)
        }
        
        if !predicates.isEmpty {
            fetchRequest.predicate = NSCompoundPredicate(andPredicateWithSubpredicates: predicates)
        }
        
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "date", ascending: false)]
        
        do {
            return try viewContext.fetch(fetchRequest)
        } catch {
            print("Error fetching expenses: \(error)")
            return []
        }
    }
    
    func createExpense(amount: Double, currency: String, date: Date, category: String, description: String?, account: Account) -> Expense {
        let expense = Expense(context: viewContext)
        
        // Get highest ID
        let fetchRequest: NSFetchRequest<Expense> = Expense.fetchRequest()
        fetchRequest.fetchLimit = 1
        fetchRequest.sortDescriptors = [NSSortDescriptor(key: "id", ascending: false)]
        
        do {
            let results = try viewContext.fetch(fetchRequest)
            let nextId = results.first?.id ?? 0
            expense.id = nextId + 1
        } catch {
            expense.id = 1
        }
        
        expense.amount = amount
        expense.currency = currency
        expense.date = date
        expense.category = category
        expense.expenseDescription = description
        expense.createdAt = Date()
        expense.account = account
        
        // Update account balance
        account.balance -= amount
        
        saveContext()
        return expense
    }
    
    func updateExpense(expense: Expense, amount: Double? = nil, currency: String? = nil, date: Date? = nil, category: String? = nil, description: String? = nil, account: Account? = nil) {
        // Restore old account balance if amount changes or account changes
        if let oldAmount = expense.amount, let oldAccount = expense.account, (amount != nil || account != nil) {
            oldAccount.balance += oldAmount
        }
        
        if let amount = amount {
            expense.amount = amount
        }
        
        if let currency = currency {
            expense.currency = currency
        }
        
        if let date = date {
            expense.date = date
        }
        
        if let category = category {
            expense.category = category
        }
        
        if let description = description {
            expense.expenseDescription = description
        }
        
        if let account = account {
            expense.account = account
        }
        
        // Update new account balance
        if let account = expense.account, let amount = expense.amount {
            account.balance -= amount
        }
        
        saveContext()
    }
    
    func deleteExpense(expense: Expense) {
        // Restore account balance
        if let account = expense.account, let amount = expense.amount {
            account.balance += amount
        }
        
        viewContext.delete(expense)
        saveContext()
    }
    
    // MARK: - Summary operations
    
    func getMonthlySummary(month: Int, year: Int) -> (totalExpenses: Double, expensesByCategory: [String: Double], expenseCount: Int) {
        let expenses = fetchExpenses(forMonth: month, year: year)
        
        let totalExpenses = expenses.reduce(0) { $0 + $1.amount }
        
        var expensesByCategory: [String: Double] = [:]
        
        for expense in expenses {
            let category = expense.category ?? "Sin categoría"
            if let existingAmount = expensesByCategory[category] {
                expensesByCategory[category] = existingAmount + expense.amount
            } else {
                expensesByCategory[category] = expense.amount
            }
        }
        
        return (totalExpenses, expensesByCategory, expenses.count)
    }
    
    // MARK: - Currency conversion
    
    func convertCurrency(amount: Double, fromCurrency: String, toCurrency: String) -> Double {
        // Simple exchange rate: 1 USD = 4000 COP
        let usdToCopRate: Double = 4000
        
        if fromCurrency == toCurrency {
            return amount
        }
        
        if fromCurrency == "USD" && toCurrency == "COP" {
            return amount * usdToCopRate
        } else if fromCurrency == "COP" && toCurrency == "USD" {
            return amount / usdToCopRate
        }
        
        return amount
    }
}