import UIKit
import Charts

class DashboardViewController: UIViewController {
    
    // MARK: - Properties
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    
    private let headerView = UIView()
    private let totalBalanceLabel = UILabel()
    private let balanceAmountLabel = UILabel()
    private let currencySelector = UISegmentedControl(items: ["COP", "USD"])
    
    private let statsContainerView = UIView()
    private let totalExpensesCardView = UIView()
    private let expensesCountCardView = UIView()
    private let accountsCountCardView = UIView()
    
    private let accountsTableView = UITableView()
    private var accounts: [Account] = []
    
    private let pieChartView = PieChartView()
    private var expensesByCategory: [String: Double] = [:]
    
    // MARK: - Lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
        setupConstraints()
        setupNavigationBar()
        
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
        
        // Scroll view setup
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        contentView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        // Header view setup
        setupHeaderView()
        
        // Stats cards setup
        setupStatsCards()
        
        // Accounts table setup
        setupAccountsTable()
        
        // Chart setup
        setupPieChart()
    }
    
    private func setupHeaderView() {
        headerView.translatesAutoresizingMaskIntoConstraints = false
        headerView.backgroundColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        headerView.layer.cornerRadius = 12
        headerView.clipsToBounds = true
        
        totalBalanceLabel.translatesAutoresizingMaskIntoConstraints = false
        totalBalanceLabel.text = "Balance Total"
        totalBalanceLabel.textColor = .white
        totalBalanceLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        
        balanceAmountLabel.translatesAutoresizingMaskIntoConstraints = false
        balanceAmountLabel.textColor = .white
        balanceAmountLabel.font = UIFont.systemFont(ofSize: 28, weight: .bold)
        
        currencySelector.translatesAutoresizingMaskIntoConstraints = false
        currencySelector.selectedSegmentIndex = CurrencyManager.shared.selectedCurrency == "COP" ? 0 : 1
        currencySelector.addTarget(self, action: #selector(currencyChanged(_:)), for: .valueChanged)
        
        headerView.addSubview(totalBalanceLabel)
        headerView.addSubview(balanceAmountLabel)
        headerView.addSubview(currencySelector)
        contentView.addSubview(headerView)
    }
    
    private func setupStatsCards() {
        statsContainerView.translatesAutoresizingMaskIntoConstraints = false
        
        // Total expenses card
        totalExpensesCardView.translatesAutoresizingMaskIntoConstraints = false
        totalExpensesCardView.backgroundColor = .systemBackground
        totalExpensesCardView.layer.cornerRadius = 12
        totalExpensesCardView.layer.shadowColor = UIColor.black.cgColor
        totalExpensesCardView.layer.shadowOffset = CGSize(width: 0, height: 2)
        totalExpensesCardView.layer.shadowRadius = 4
        totalExpensesCardView.layer.shadowOpacity = 0.1
        
        let expensesIcon = UIImageView(image: UIImage(systemName: "creditcard.fill"))
        expensesIcon.translatesAutoresizingMaskIntoConstraints = false
        expensesIcon.tintColor = .systemRed
        
        let expensesTitle = UILabel()
        expensesTitle.translatesAutoresizingMaskIntoConstraints = false
        expensesTitle.text = "Gastos del Mes"
        expensesTitle.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        expensesTitle.textColor = .secondaryLabel
        
        let expensesAmount = UILabel()
        expensesAmount.translatesAutoresizingMaskIntoConstraints = false
        expensesAmount.font = UIFont.systemFont(ofSize: 20, weight: .bold)
        expensesAmount.tag = 101 // Tag for updating later
        
        totalExpensesCardView.addSubview(expensesIcon)
        totalExpensesCardView.addSubview(expensesTitle)
        totalExpensesCardView.addSubview(expensesAmount)
        
        // Expenses count card
        expensesCountCardView.translatesAutoresizingMaskIntoConstraints = false
        expensesCountCardView.backgroundColor = .systemBackground
        expensesCountCardView.layer.cornerRadius = 12
        expensesCountCardView.layer.shadowColor = UIColor.black.cgColor
        expensesCountCardView.layer.shadowOffset = CGSize(width: 0, height: 2)
        expensesCountCardView.layer.shadowRadius = 4
        expensesCountCardView.layer.shadowOpacity = 0.1
        
        let transactionsIcon = UIImageView(image: UIImage(systemName: "arrow.left.arrow.right"))
        transactionsIcon.translatesAutoresizingMaskIntoConstraints = false
        transactionsIcon.tintColor = .systemGreen
        
        let transactionsTitle = UILabel()
        transactionsTitle.translatesAutoresizingMaskIntoConstraints = false
        transactionsTitle.text = "Transacciones"
        transactionsTitle.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        transactionsTitle.textColor = .secondaryLabel
        
        let transactionsCount = UILabel()
        transactionsCount.translatesAutoresizingMaskIntoConstraints = false
        transactionsCount.font = UIFont.systemFont(ofSize: 20, weight: .bold)
        transactionsCount.tag = 102 // Tag for updating later
        
        expensesCountCardView.addSubview(transactionsIcon)
        expensesCountCardView.addSubview(transactionsTitle)
        expensesCountCardView.addSubview(transactionsCount)
        
        // Accounts count card
        accountsCountCardView.translatesAutoresizingMaskIntoConstraints = false
        accountsCountCardView.backgroundColor = .systemBackground
        accountsCountCardView.layer.cornerRadius = 12
        accountsCountCardView.layer.shadowColor = UIColor.black.cgColor
        accountsCountCardView.layer.shadowOffset = CGSize(width: 0, height: 2)
        accountsCountCardView.layer.shadowRadius = 4
        accountsCountCardView.layer.shadowOpacity = 0.1
        
        let accountsIcon = UIImageView(image: UIImage(systemName: "wallet.pass.fill"))
        accountsIcon.translatesAutoresizingMaskIntoConstraints = false
        accountsIcon.tintColor = .systemBlue
        
        let accountsTitle = UILabel()
        accountsTitle.translatesAutoresizingMaskIntoConstraints = false
        accountsTitle.text = "Cuentas"
        accountsTitle.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        accountsTitle.textColor = .secondaryLabel
        
        let accountsCount = UILabel()
        accountsCount.translatesAutoresizingMaskIntoConstraints = false
        accountsCount.font = UIFont.systemFont(ofSize: 20, weight: .bold)
        accountsCount.tag = 103 // Tag for updating later
        
        accountsCountCardView.addSubview(accountsIcon)
        accountsCountCardView.addSubview(accountsTitle)
        accountsCountCardView.addSubview(accountsCount)
        
        // Add cards to stats container
        statsContainerView.addSubview(totalExpensesCardView)
        statsContainerView.addSubview(expensesCountCardView)
        statsContainerView.addSubview(accountsCountCardView)
        
        contentView.addSubview(statsContainerView)
        
        // Constraints for card elements
        NSLayoutConstraint.activate([
            // Expenses card internal constraints
            expensesIcon.topAnchor.constraint(equalTo: totalExpensesCardView.topAnchor, constant: 16),
            expensesIcon.leadingAnchor.constraint(equalTo: totalExpensesCardView.leadingAnchor, constant: 16),
            expensesIcon.widthAnchor.constraint(equalToConstant: 24),
            expensesIcon.heightAnchor.constraint(equalToConstant: 24),
            
            expensesTitle.topAnchor.constraint(equalTo: expensesIcon.bottomAnchor, constant: 8),
            expensesTitle.leadingAnchor.constraint(equalTo: totalExpensesCardView.leadingAnchor, constant: 16),
            expensesTitle.trailingAnchor.constraint(equalTo: totalExpensesCardView.trailingAnchor, constant: -16),
            
            expensesAmount.topAnchor.constraint(equalTo: expensesTitle.bottomAnchor, constant: 4),
            expensesAmount.leadingAnchor.constraint(equalTo: totalExpensesCardView.leadingAnchor, constant: 16),
            expensesAmount.trailingAnchor.constraint(equalTo: totalExpensesCardView.trailingAnchor, constant: -16),
            expensesAmount.bottomAnchor.constraint(equalTo: totalExpensesCardView.bottomAnchor, constant: -16),
            
            // Transactions card internal constraints
            transactionsIcon.topAnchor.constraint(equalTo: expensesCountCardView.topAnchor, constant: 16),
            transactionsIcon.leadingAnchor.constraint(equalTo: expensesCountCardView.leadingAnchor, constant: 16),
            transactionsIcon.widthAnchor.constraint(equalToConstant: 24),
            transactionsIcon.heightAnchor.constraint(equalToConstant: 24),
            
            transactionsTitle.topAnchor.constraint(equalTo: transactionsIcon.bottomAnchor, constant: 8),
            transactionsTitle.leadingAnchor.constraint(equalTo: expensesCountCardView.leadingAnchor, constant: 16),
            transactionsTitle.trailingAnchor.constraint(equalTo: expensesCountCardView.trailingAnchor, constant: -16),
            
            transactionsCount.topAnchor.constraint(equalTo: transactionsTitle.bottomAnchor, constant: 4),
            transactionsCount.leadingAnchor.constraint(equalTo: expensesCountCardView.leadingAnchor, constant: 16),
            transactionsCount.trailingAnchor.constraint(equalTo: expensesCountCardView.trailingAnchor, constant: -16),
            transactionsCount.bottomAnchor.constraint(equalTo: expensesCountCardView.bottomAnchor, constant: -16),
            
            // Accounts card internal constraints
            accountsIcon.topAnchor.constraint(equalTo: accountsCountCardView.topAnchor, constant: 16),
            accountsIcon.leadingAnchor.constraint(equalTo: accountsCountCardView.leadingAnchor, constant: 16),
            accountsIcon.widthAnchor.constraint(equalToConstant: 24),
            accountsIcon.heightAnchor.constraint(equalToConstant: 24),
            
            accountsTitle.topAnchor.constraint(equalTo: accountsIcon.bottomAnchor, constant: 8),
            accountsTitle.leadingAnchor.constraint(equalTo: accountsCountCardView.leadingAnchor, constant: 16),
            accountsTitle.trailingAnchor.constraint(equalTo: accountsCountCardView.trailingAnchor, constant: -16),
            
            accountsCount.topAnchor.constraint(equalTo: accountsTitle.bottomAnchor, constant: 4),
            accountsCount.leadingAnchor.constraint(equalTo: accountsCountCardView.leadingAnchor, constant: 16),
            accountsCount.trailingAnchor.constraint(equalTo: accountsCountCardView.trailingAnchor, constant: -16),
            accountsCount.bottomAnchor.constraint(equalTo: accountsCountCardView.bottomAnchor, constant: -16)
        ])
    }
    
    private func setupAccountsTable() {
        accountsTableView.translatesAutoresizingMaskIntoConstraints = false
        accountsTableView.backgroundColor = .systemBackground
        accountsTableView.layer.cornerRadius = 12
        accountsTableView.clipsToBounds = true
        accountsTableView.layer.shadowColor = UIColor.black.cgColor
        accountsTableView.layer.shadowOffset = CGSize(width: 0, height: 2)
        accountsTableView.layer.shadowRadius = 4
        accountsTableView.layer.shadowOpacity = 0.1
        
        accountsTableView.delegate = self
        accountsTableView.dataSource = self
        accountsTableView.register(AccountCell.self, forCellReuseIdentifier: "AccountCell")
        accountsTableView.isScrollEnabled = false
        
        // Add a header
        let headerView = UIView(frame: CGRect(x: 0, y: 0, width: accountsTableView.frame.width, height: 40))
        headerView.backgroundColor = .systemBackground
        
        let headerLabel = UILabel()
        headerLabel.text = "Mis Cuentas"
        headerLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        headerLabel.translatesAutoresizingMaskIntoConstraints = false
        headerView.addSubview(headerLabel)
        
        NSLayoutConstraint.activate([
            headerLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 16),
            headerLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -16),
            headerLabel.centerYAnchor.constraint(equalTo: headerView.centerYAnchor)
        ])
        
        accountsTableView.tableHeaderView = headerView
        
        contentView.addSubview(accountsTableView)
    }
    
    private func setupPieChart() {
        pieChartView.translatesAutoresizingMaskIntoConstraints = false
        pieChartView.layer.cornerRadius = 12
        pieChartView.clipsToBounds = true
        pieChartView.backgroundColor = .systemBackground
        pieChartView.layer.shadowColor = UIColor.black.cgColor
        pieChartView.layer.shadowOffset = CGSize(width: 0, height: 2)
        pieChartView.layer.shadowRadius = 4
        pieChartView.layer.shadowOpacity = 0.1
        
        pieChartView.legend.enabled = true
        pieChartView.legend.horizontalAlignment = .center
        pieChartView.legend.verticalAlignment = .bottom
        pieChartView.legend.orientation = .horizontal
        pieChartView.legend.formSize = 10
        pieChartView.legend.font = UIFont.systemFont(ofSize: 12)
        
        pieChartView.holeColor = .systemBackground
        pieChartView.holeRadiusPercent = 0.5
        pieChartView.transparentCircleRadiusPercent = 0.55
        
        pieChartView.rotationEnabled = true
        pieChartView.highlightPerTapEnabled = true
        
        // Add a header for the chart
        let headerView = UIView(frame: CGRect(x: 0, y: 0, width: view.frame.width - 32, height: 40))
        headerView.backgroundColor = .systemBackground
        
        let headerLabel = UILabel()
        headerLabel.text = "Gastos por Categoría"
        headerLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        headerLabel.translatesAutoresizingMaskIntoConstraints = false
        headerView.addSubview(headerLabel)
        
        NSLayoutConstraint.activate([
            headerLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 16),
            headerLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -16),
            headerLabel.centerYAnchor.constraint(equalTo: headerView.centerYAnchor)
        ])
        
        contentView.addSubview(headerView)
        contentView.addSubview(pieChartView)
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Scroll view constraints
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // Content view constraints
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor),
            
            // Header view constraints
            headerView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 16),
            headerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            headerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            headerView.heightAnchor.constraint(equalToConstant: 150),
            
            totalBalanceLabel.topAnchor.constraint(equalTo: headerView.topAnchor, constant: 24),
            totalBalanceLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 24),
            totalBalanceLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -24),
            
            balanceAmountLabel.topAnchor.constraint(equalTo: totalBalanceLabel.bottomAnchor, constant: 8),
            balanceAmountLabel.leadingAnchor.constraint(equalTo: headerView.leadingAnchor, constant: 24),
            balanceAmountLabel.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -24),
            
            currencySelector.topAnchor.constraint(equalTo: balanceAmountLabel.bottomAnchor, constant: 16),
            currencySelector.trailingAnchor.constraint(equalTo: headerView.trailingAnchor, constant: -24),
            currencySelector.widthAnchor.constraint(equalToConstant: 120),
            currencySelector.heightAnchor.constraint(equalToConstant: 32),
            
            // Stats container constraints
            statsContainerView.topAnchor.constraint(equalTo: headerView.bottomAnchor, constant: 16),
            statsContainerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            statsContainerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            statsContainerView.heightAnchor.constraint(equalToConstant: 100),
            
            // Card constraints within stats container
            totalExpensesCardView.topAnchor.constraint(equalTo: statsContainerView.topAnchor),
            totalExpensesCardView.leadingAnchor.constraint(equalTo: statsContainerView.leadingAnchor),
            totalExpensesCardView.widthAnchor.constraint(equalTo: statsContainerView.widthAnchor, multiplier: 0.32),
            totalExpensesCardView.bottomAnchor.constraint(equalTo: statsContainerView.bottomAnchor),
            
            expensesCountCardView.topAnchor.constraint(equalTo: statsContainerView.topAnchor),
            expensesCountCardView.leadingAnchor.constraint(equalTo: totalExpensesCardView.trailingAnchor, constant: 8),
            expensesCountCardView.widthAnchor.constraint(equalTo: statsContainerView.widthAnchor, multiplier: 0.32),
            expensesCountCardView.bottomAnchor.constraint(equalTo: statsContainerView.bottomAnchor),
            
            accountsCountCardView.topAnchor.constraint(equalTo: statsContainerView.topAnchor),
            accountsCountCardView.leadingAnchor.constraint(equalTo: expensesCountCardView.trailingAnchor, constant: 8),
            accountsCountCardView.trailingAnchor.constraint(equalTo: statsContainerView.trailingAnchor),
            accountsCountCardView.bottomAnchor.constraint(equalTo: statsContainerView.bottomAnchor),
            
            // Accounts table constraints
            accountsTableView.topAnchor.constraint(equalTo: statsContainerView.bottomAnchor, constant: 16),
            accountsTableView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            accountsTableView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            accountsTableView.heightAnchor.constraint(equalToConstant: 240),
            
            // Pie chart constraints
            pieChartView.topAnchor.constraint(equalTo: accountsTableView.bottomAnchor, constant: 40),
            pieChartView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            pieChartView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            pieChartView.heightAnchor.constraint(equalToConstant: 300),
            pieChartView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -16)
        ])
    }
    
    private func setupNavigationBar() {
        title = "Dashboard"
        
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
        
        // Load accounts
        accounts = DatabaseManager.shared.fetchAllAccounts()
        accountsTableView.reloadData()
        
        // Calculate total balance in selected currency
        updateBalanceDisplay()
        
        // Get monthly summary
        let summary = DatabaseManager.shared.getMonthlySummary(month: month, year: year)
        expensesByCategory = summary.expensesByCategory
        
        // Update stats cards
        if let expensesAmountLabel = view.viewWithTag(101) as? UILabel {
            let totalExpenses = summary.totalExpenses
            expensesAmountLabel.text = CurrencyManager.shared.formatAmount(totalExpenses)
        }
        
        if let transactionsCountLabel = view.viewWithTag(102) as? UILabel {
            transactionsCountLabel.text = "\(summary.expenseCount)"
        }
        
        if let accountsCountLabel = view.viewWithTag(103) as? UILabel {
            accountsCountLabel.text = "\(accounts.count)"
        }
        
        // Update chart
        updatePieChart()
    }
    
    private func updateBalanceDisplay() {
        let selectedCurrency = CurrencyManager.shared.selectedCurrency
        var totalBalance: Double = 0
        
        for account in accounts {
            if account.currency == selectedCurrency {
                totalBalance += account.balance
            } else {
                let convertedBalance = DatabaseManager.shared.convertCurrency(
                    amount: account.balance,
                    fromCurrency: account.currency,
                    toCurrency: selectedCurrency
                )
                totalBalance += convertedBalance
            }
        }
        
        balanceAmountLabel.text = CurrencyManager.shared.formatAmount(totalBalance)
    }
    
    private func updatePieChart() {
        guard !expensesByCategory.isEmpty else {
            pieChartView.data = nil
            pieChartView.noDataText = "Sin datos para mostrar"
            return
        }
        
        var entries: [PieChartDataEntry] = []
        var colors: [UIColor] = []
        
        let colorPalette: [UIColor] = [
            .systemBlue, .systemRed, .systemGreen, .systemOrange,
            .systemPurple, .systemTeal, .systemYellow, .systemIndigo
        ]
        
        var colorIndex = 0
        
        for (category, amount) in expensesByCategory {
            entries.append(PieChartDataEntry(value: amount, label: category))
            colors.append(colorPalette[colorIndex % colorPalette.count])
            colorIndex += 1
        }
        
        let dataSet = PieChartDataSet(entries: entries, label: "")
        dataSet.colors = colors
        dataSet.sliceSpace = 2
        dataSet.valueFont = UIFont.systemFont(ofSize: 12)
        dataSet.valueTextColor = .label
        
        let formatter = NumberFormatter()
        formatter.numberStyle = .percent
        formatter.maximumFractionDigits = 1
        formatter.multiplier = 1
        dataSet.valueFormatter = DefaultValueFormatter(formatter: formatter)
        
        let data = PieChartData(dataSet: dataSet)
        pieChartView.data = data
        pieChartView.highlightValues(nil)
    }
    
    // MARK: - Action methods
    
    @objc private func currencyChanged(_ sender: UISegmentedControl) {
        let currency = sender.selectedSegmentIndex == 0 ? "COP" : "USD"
        CurrencyManager.shared.selectedCurrency = currency
    }
    
    @objc private func currencyDidChange() {
        updateBalanceDisplay()
        accountsTableView.reloadData()
    }
}

// MARK: - UITableViewDelegate & UITableViewDataSource

extension DashboardViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return min(accounts.count, 4) // Limit to 4 accounts on dashboard
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "AccountCell", for: indexPath) as! AccountCell
        let account = accounts[indexPath.row]
        
        cell.configure(with: account)
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 60
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        // TODO: Navigate to account details
    }
}

// MARK: - Account Cell

class AccountCell: UITableViewCell {
    private let nameLabel = UILabel()
    private let balanceLabel = UILabel()
    private let currencyLabel = UILabel()
    private let iconView = UIImageView()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupViews() {
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        nameLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        
        balanceLabel.translatesAutoresizingMaskIntoConstraints = false
        balanceLabel.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        balanceLabel.textAlignment = .right
        
        currencyLabel.translatesAutoresizingMaskIntoConstraints = false
        currencyLabel.font = UIFont.systemFont(ofSize: 12, weight: .regular)
        currencyLabel.textColor = .secondaryLabel
        currencyLabel.textAlignment = .right
        
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconView.image = UIImage(systemName: "wallet.pass.fill")
        iconView.tintColor = .systemBlue
        iconView.contentMode = .scaleAspectFit
        
        contentView.addSubview(iconView)
        contentView.addSubview(nameLabel)
        contentView.addSubview(balanceLabel)
        contentView.addSubview(currencyLabel)
        
        NSLayoutConstraint.activate([
            iconView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            iconView.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            iconView.widthAnchor.constraint(equalToConstant: 30),
            iconView.heightAnchor.constraint(equalToConstant: 30),
            
            nameLabel.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            nameLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor),
            nameLabel.widthAnchor.constraint(equalTo: contentView.widthAnchor, multiplier: 0.5),
            
            balanceLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            balanceLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 10),
            balanceLabel.leadingAnchor.constraint(equalTo: nameLabel.trailingAnchor, constant: 8),
            
            currencyLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            currencyLabel.topAnchor.constraint(equalTo: balanceLabel.bottomAnchor, constant: 2),
            currencyLabel.leadingAnchor.constraint(equalTo: nameLabel.trailingAnchor, constant: 8)
        ])
    }
    
    func configure(with account: Account) {
        nameLabel.text = account.name
        balanceLabel.text = account.formattedBalance()
        currencyLabel.text = account.currency
        
        // Check account type and set appropriate icon
        if account.name.lowercased().contains("ahorro") {
            iconView.image = UIImage(systemName: "banknote.fill")
            iconView.tintColor = .systemGreen
        } else if account.name.lowercased().contains("invers") {
            iconView.image = UIImage(systemName: "chart.line.uptrend.xyaxis")
            iconView.tintColor = .systemPurple
        } else if account.name.lowercased().contains("corriente") {
            iconView.image = UIImage(systemName: "wallet.pass.fill")
            iconView.tintColor = .systemBlue
        } else {
            iconView.image = UIImage(systemName: "creditcard.fill")
            iconView.tintColor = .systemOrange
        }
        
        // Set balance color based on amount
        if account.balance >= 0 {
            balanceLabel.textColor = .systemGreen
        } else {
            balanceLabel.textColor = .systemRed
        }
    }
}