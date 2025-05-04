import UIKit

class ExpensesViewController: UIViewController {
    
    // MARK: - Properties
    private let tableView = UITableView()
    private let emptyStateView = UIView()
    private var expenses: [Expense] = []
    
    private let addButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setImage(UIImage(systemName: "plus.circle.fill"), for: .normal)
        button.tintColor = .white
        button.backgroundColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        button.layer.cornerRadius = 28
        button.imageView?.contentMode = .scaleAspectFit
        button.contentVerticalAlignment = .fill
        button.contentHorizontalAlignment = .fill
        button.imageEdgeInsets = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
        return button
    }()
    
    private let headerView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = UIColor(red: 0.95, green: 0.95, blue: 0.97, alpha: 1.0)
        return view
    }()
    
    private let totalLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = "Total de Gastos"
        label.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        label.textColor = .secondaryLabel
        return label
    }()
    
    private let amountLabel: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.font = UIFont.systemFont(ofSize: 20, weight: .bold)
        label.textColor = .label
        return label
    }()
    
    private let filterButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setTitle("Filtrar", for: .normal)
        button.setImage(UIImage(systemName: "line.horizontal.3.decrease.circle"), for: .normal)
        button.titleLabel?.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        return button
    }()
    
    // MARK: - Lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
        setupConstraints()
        setupNavigationBar()
        
        // Add action to add button
        addButton.addTarget(self, action: #selector(addExpenseTapped), for: .touchUpInside)
        filterButton.addTarget(self, action: #selector(filterTapped), for: .touchUpInside)
        
        // Subscribe to currency change notifications
        NotificationCenter.default.addObserver(self, selector: #selector(currencyDidChange), name: .currencyDidChange, object: nil)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        loadData()
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - Setup methods
    
    private func setupViews() {
        view.backgroundColor = .systemBackground
        
        // Set up table view
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(ExpenseCell.self, forCellReuseIdentifier: "ExpenseCell")
        tableView.tableFooterView = UIView() // Hide empty cells
        
        // Set up header view
        headerView.addSubview(totalLabel)
        headerView.addSubview(amountLabel)
        headerView.addSubview(filterButton)
        
        // Set up empty state view
        emptyStateView.translatesAutoresizingMaskIntoConstraints = false
        emptyStateView.isHidden = true
        
        let emptyImage = UIImageView(image: UIImage(systemName: "doc.text"))
        emptyImage.translatesAutoresizingMaskIntoConstraints = false
        emptyImage.contentMode = .scaleAspectFit
        emptyImage.tintColor = .secondaryLabel
        
        let emptyLabel = UILabel()
        emptyLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyLabel.text = "No hay gastos registrados"
        emptyLabel.textAlignment = .center
        emptyLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        emptyLabel.textColor = .secondaryLabel
        
        let addFirstExpenseButton = UIButton(type: .system)
        addFirstExpenseButton.translatesAutoresizingMaskIntoConstraints = false
        addFirstExpenseButton.setTitle("Agregar Primer Gasto", for: .normal)
        addFirstExpenseButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        addFirstExpenseButton.addTarget(self, action: #selector(addExpenseTapped), for: .touchUpInside)
        
        emptyStateView.addSubview(emptyImage)
        emptyStateView.addSubview(emptyLabel)
        emptyStateView.addSubview(addFirstExpenseButton)
        
        NSLayoutConstraint.activate([
            emptyImage.centerXAnchor.constraint(equalTo: emptyStateView.centerXAnchor),
            emptyImage.centerYAnchor.constraint(equalTo: emptyStateView.centerYAnchor, constant: -40),
            emptyImage.widthAnchor.constraint(equalToConstant: 80),
            emptyImage.heightAnchor.constraint(equalToConstant: 80),
            
            emptyLabel.topAnchor.constraint(equalTo: emptyImage.bottomAnchor, constant: 16),
            emptyLabel.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor, constant: 20),
            emptyLabel.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor, constant: -20),
            
            addFirstExpenseButton.topAnchor.constraint(equalTo: emptyLabel.bottomAnchor, constant: 24),
            addFirstExpenseButton.centerXAnchor.constraint(equalTo: emptyStateView.centerXAnchor)
        ])
        
        // Add views to view hierarchy
        view.addSubview(headerView)
        view.addSubview(tableView)
        view.addSubview(emptyStateView)
        view.addSubview(addButton)
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Header view constraints
            headerView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            headerView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            headerView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            headerView.heightAnchor.constraint(equalToConstant: 60),
            
            totalLabel.topAnchor.constraint(equalTo: headerView.topAnchor, constant: 10),
            totalLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 16),
            
            amountLabel.topAnchor.constraint(equalTo: totalLabel.bottomAnchor, constant: 2),
            amountLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 16),
            
            filterButton.centerYAnchor.constraint(equalTo: headerView.centerYAnchor),
            filterButton.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -16),
            
            // Table view constraints
            tableView.topAnchor.constraint(equalTo: headerView.bottomAnchor),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // Empty state view constraints
            emptyStateView.topAnchor.constraint(equalTo: headerView.bottomAnchor),
            emptyStateView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            emptyStateView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            emptyStateView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // Add button constraints
            addButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -24),
            addButton.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.bottomAnchor, constant: -24),
            addButton.widthAnchor.constraint(equalToConstant: 56),
            addButton.heightAnchor.constraint(equalToConstant: 56)
        ])
    }
    
    private func setupNavigationBar() {
        title = "Gastos"
        
        if #available(iOS 15.0, *) {
            let appearance = UINavigationBarAppearance()
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = .systemBackground
            appearance.titleTextAttributes = [.foregroundColor: UIColor.label]
            navigationController?.navigationBar.standardAppearance = appearance
            navigationController?.navigationBar.scrollEdgeAppearance = appearance
        }
    }
    
    // MARK: - Data loading methods
    
    private func loadData() {
        // Get current month and year
        let currentDate = Date()
        let calendar = Calendar.current
        let month = calendar.component(.month, from: currentDate)
        let year = calendar.component(.year, from: currentDate)
        
        // Load expenses for current month by default
        expenses = DatabaseManager.shared.fetchExpenses(forMonth: month, year: year)
        
        // Update total amount
        updateTotalAmount()
        
        // Show/hide empty state
        emptyStateView.isHidden = !expenses.isEmpty
        tableView.isHidden = expenses.isEmpty
        
        // Reload table view
        tableView.reloadData()
    }
    
    private func updateTotalAmount() {
        let selectedCurrency = CurrencyManager.shared.selectedCurrency
        var totalAmount: Double = 0
        
        for expense in expenses {
            if expense.currency == selectedCurrency {
                totalAmount += expense.amount
            } else {
                let convertedAmount = DatabaseManager.shared.convertCurrency(
                    amount: expense.amount,
                    fromCurrency: expense.currency,
                    toCurrency: selectedCurrency
                )
                totalAmount += convertedAmount
            }
        }
        
        amountLabel.text = CurrencyManager.shared.formatAmount(totalAmount)
    }
    
    // MARK: - Action methods
    
    @objc private func addExpenseTapped() {
        let addExpenseVC = AddExpenseViewController()
        let navController = UINavigationController(rootViewController: addExpenseVC)
        present(navController, animated: true)
    }
    
    @objc private func filterTapped() {
        let alert = UIAlertController(title: "Filtrar Gastos", message: nil, preferredStyle: .actionSheet)
        
        alert.addAction(UIAlertAction(title: "Todos", style: .default) { [weak self] _ in
            self?.expenses = DatabaseManager.shared.fetchExpenses()
            self?.updateTotalAmount()
            self?.tableView.reloadData()
        })
        
        alert.addAction(UIAlertAction(title: "Este Mes", style: .default) { [weak self] _ in
            let currentDate = Date()
            let calendar = Calendar.current
            let month = calendar.component(.month, from: currentDate)
            let year = calendar.component(.year, from: currentDate)
            
            self?.expenses = DatabaseManager.shared.fetchExpenses(forMonth: month, year: year)
            self?.updateTotalAmount()
            self?.tableView.reloadData()
        })
        
        alert.addAction(UIAlertAction(title: "Por Categoría", style: .default) { [weak self] _ in
            self?.showCategoryFilter()
        })
        
        alert.addAction(UIAlertAction(title: "Por Cuenta", style: .default) { [weak self] _ in
            self?.showAccountFilter()
        })
        
        alert.addAction(UIAlertAction(title: "Cancelar", style: .cancel))
        
        if let popoverController = alert.popoverPresentationController {
            popoverController.sourceView = filterButton
            popoverController.sourceRect = filterButton.bounds
        }
        
        present(alert, animated: true)
    }
    
    private func showCategoryFilter() {
        // Get all unique categories
        let fetchedExpenses = DatabaseManager.shared.fetchExpenses()
        let categories = Set(fetchedExpenses.compactMap { $0.category }).sorted()
        
        let alert = UIAlertController(title: "Filtrar por Categoría", message: nil, preferredStyle: .actionSheet)
        
        for category in categories {
            alert.addAction(UIAlertAction(title: category, style: .default) { [weak self] _ in
                self?.expenses = DatabaseManager.shared.fetchExpenses(category: category)
                self?.updateTotalAmount()
                self?.tableView.reloadData()
            })
        }
        
        alert.addAction(UIAlertAction(title: "Cancelar", style: .cancel))
        
        if let popoverController = alert.popoverPresentationController {
            popoverController.sourceView = filterButton
            popoverController.sourceRect = filterButton.bounds
        }
        
        present(alert, animated: true)
    }
    
    private func showAccountFilter() {
        // Get all accounts
        let accounts = DatabaseManager.shared.fetchAllAccounts()
        
        let alert = UIAlertController(title: "Filtrar por Cuenta", message: nil, preferredStyle: .actionSheet)
        
        for account in accounts {
            alert.addAction(UIAlertAction(title: account.name, style: .default) { [weak self] _ in
                self?.expenses = DatabaseManager.shared.fetchExpenses(account: account)
                self?.updateTotalAmount()
                self?.tableView.reloadData()
            })
        }
        
        alert.addAction(UIAlertAction(title: "Cancelar", style: .cancel))
        
        if let popoverController = alert.popoverPresentationController {
            popoverController.sourceView = filterButton
            popoverController.sourceRect = filterButton.bounds
        }
        
        present(alert, animated: true)
    }
    
    @objc private func currencyDidChange() {
        updateTotalAmount()
        tableView.reloadData()
    }
}

// MARK: - UITableViewDelegate & UITableViewDataSource

extension ExpensesViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return expenses.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ExpenseCell", for: indexPath) as! ExpenseCell
        let expense = expenses[indexPath.row]
        
        cell.configure(with: expense)
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 72
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let expense = expenses[indexPath.row]
        let detailVC = ExpenseDetailViewController(expense: expense)
        navigationController?.pushViewController(detailVC, animated: true)
    }
    
    func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let deleteAction = UIContextualAction(style: .destructive, title: "Eliminar") { [weak self] (_, _, completion) in
            guard let self = self else { return }
            
            let expense = self.expenses[indexPath.row]
            DatabaseManager.shared.deleteExpense(expense: expense)
            
            self.expenses.remove(at: indexPath.row)
            tableView.deleteRows(at: [indexPath], with: .automatic)
            
            self.updateTotalAmount()
            
            // Show empty state if needed
            self.emptyStateView.isHidden = !self.expenses.isEmpty
            self.tableView.isHidden = self.expenses.isEmpty
            
            completion(true)
        }
        
        let editAction = UIContextualAction(style: .normal, title: "Editar") { [weak self] (_, _, completion) in
            guard let self = self else { return }
            
            let expense = self.expenses[indexPath.row]
            let editVC = EditExpenseViewController(expense: expense)
            let navController = UINavigationController(rootViewController: editVC)
            self.present(navController, animated: true)
            
            completion(true)
        }
        
        editAction.backgroundColor = .systemBlue
        
        return UISwipeActionsConfiguration(actions: [deleteAction, editAction])
    }
}

// MARK: - Expense Cell

class ExpenseCell: UITableViewCell {
    private let categoryLabel = UILabel()
    private let dateLabel = UILabel()
    private let amountLabel = UILabel()
    private let descriptionLabel = UILabel()
    private let accountLabel = UILabel()
    private let categoryIconView = UIView()
    private let categoryIcon = UILabel()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupViews() {
        accessoryType = .disclosureIndicator
        
        categoryIconView.translatesAutoresizingMaskIntoConstraints = false
        categoryIconView.backgroundColor = .systemBlue
        categoryIconView.layer.cornerRadius = 18
        
        categoryIcon.translatesAutoresizingMaskIntoConstraints = false
        categoryIcon.textColor = .white
        categoryIcon.font = UIFont.systemFont(ofSize: 14, weight: .semibold)
        categoryIcon.textAlignment = .center
        
        categoryLabel.translatesAutoresizingMaskIntoConstraints = false
        categoryLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        
        dateLabel.translatesAutoresizingMaskIntoConstraints = false
        dateLabel.font = UIFont.systemFont(ofSize: 12, weight: .regular)
        dateLabel.textColor = .secondaryLabel
        
        amountLabel.translatesAutoresizingMaskIntoConstraints = false
        amountLabel.font = UIFont.systemFont(ofSize: 18, weight: .bold)
        amountLabel.textAlignment = .right
        
        descriptionLabel.translatesAutoresizingMaskIntoConstraints = false
        descriptionLabel.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        descriptionLabel.textColor = .secondaryLabel
        descriptionLabel.numberOfLines = 1
        
        accountLabel.translatesAutoresizingMaskIntoConstraints = false
        accountLabel.font = UIFont.systemFont(ofSize: 12, weight: .regular)
        accountLabel.textColor = .tertiaryLabel
        accountLabel.textAlignment = .right
        
        categoryIconView.addSubview(categoryIcon)
        contentView.addSubview(categoryIconView)
        contentView.addSubview(categoryLabel)
        contentView.addSubview(dateLabel)
        contentView.addSubview(amountLabel)
        contentView.addSubview(descriptionLabel)
        contentView.addSubview(accountLabel)
        
        NSLayoutConstraint.activate([
            categoryIconView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            categoryIconView.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            categoryIconView.widthAnchor.constraint(equalToConstant: 36),
            categoryIconView.heightAnchor.constraint(equalToConstant: 36),
            
            categoryIcon.centerXAnchor.constraint(equalTo: categoryIconView.centerXAnchor),
            categoryIcon.centerYAnchor.constraint(equalTo: categoryIconView.centerYAnchor),
            
            categoryLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 12),
            categoryLabel.leadingAnchor.constraint(equalTo: categoryIconView.trailingAnchor, constant: 12),
            
            dateLabel.topAnchor.constraint(equalTo: categoryLabel.bottomAnchor, constant: 4),
            dateLabel.leadingAnchor.constraint(equalTo: categoryIconView.trailingAnchor, constant: 12),
            
            descriptionLabel.leadingAnchor.constraint(equalTo: categoryIconView.trailingAnchor, constant: 12),
            descriptionLabel.topAnchor.constraint(equalTo: dateLabel.bottomAnchor, constant: 2),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.centerXAnchor, constant: 40),
            
            amountLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            amountLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -40),
            amountLabel.leadingAnchor.constraint(equalTo: contentView.centerXAnchor),
            
            accountLabel.topAnchor.constraint(equalTo: amountLabel.bottomAnchor, constant: 4),
            accountLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -40),
            accountLabel.leadingAnchor.constraint(equalTo: contentView.centerXAnchor)
        ])
    }
    
    func configure(with expense: Expense) {
        categoryLabel.text = expense.category
        dateLabel.text = expense.formattedDate()
        amountLabel.text = expense.formattedAmount()
        descriptionLabel.text = expense.expenseDescription ?? "-"
        accountLabel.text = expense.account?.name ?? "Sin cuenta"
        
        // Get first letter of category
        if let firstLetter = expense.category.first {
            categoryIcon.text = String(firstLetter).uppercased()
        } else {
            categoryIcon.text = "G"
        }
        
        // Set category icon background color based on category
        let category = expense.category.lowercased()
        if category.contains("aliment") {
            categoryIconView.backgroundColor = .systemOrange
        } else if category.contains("vivienda") || category.contains("arriendo") {
            categoryIconView.backgroundColor = .systemGreen
        } else if category.contains("transporte") {
            categoryIconView.backgroundColor = .systemBlue
        } else if category.contains("servicio") {
            categoryIconView.backgroundColor = .systemIndigo
        } else if category.contains("salud") {
            categoryIconView.backgroundColor = .systemRed
        } else if category.contains("entreten") {
            categoryIconView.backgroundColor = .systemPurple
        } else if category.contains("educa") {
            categoryIconView.backgroundColor = .systemTeal
        } else {
            categoryIconView.backgroundColor = .systemGray
        }
    }
}

// MARK: - AddExpenseViewController (Placeholder)

class AddExpenseViewController: UIViewController {
    // This would be implemented with form fields for adding a new expense
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Agregar Gasto"
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: self,
            action: #selector(cancelTapped)
        )
    }
    
    @objc private func cancelTapped() {
        dismiss(animated: true)
    }
}

// MARK: - EditExpenseViewController (Placeholder)

class EditExpenseViewController: UIViewController {
    private let expense: Expense
    
    init(expense: Expense) {
        self.expense = expense
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Editar Gasto"
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: self,
            action: #selector(cancelTapped)
        )
    }
    
    @objc private func cancelTapped() {
        dismiss(animated: true)
    }
}

// MARK: - ExpenseDetailViewController (Placeholder)

class ExpenseDetailViewController: UIViewController {
    private let expense: Expense
    
    init(expense: Expense) {
        self.expense = expense
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Detalle de Gasto"
    }
}