import UIKit

class AccountsViewController: UIViewController {
    
    // MARK: - Properties
    private let tableView = UITableView()
    private let emptyStateView = UIView()
    private var accounts: [Account] = []
    
    private let totalBalanceView = UIView()
    private let totalBalanceLabel = UILabel()
    private let balanceAmountLabel = UILabel()
    
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
    
    // MARK: - Lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
        setupConstraints()
        setupNavigationBar()
        
        // Add action to add button
        addButton.addTarget(self, action: #selector(addAccountTapped), for: .touchUpInside)
        
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
        
        // Set up total balance view
        totalBalanceView.translatesAutoresizingMaskIntoConstraints = false
        totalBalanceView.backgroundColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        totalBalanceView.layer.cornerRadius = 12
        
        totalBalanceLabel.translatesAutoresizingMaskIntoConstraints = false
        totalBalanceLabel.text = "Balance Total en Todas las Cuentas"
        totalBalanceLabel.textColor = .white
        totalBalanceLabel.font = UIFont.systemFont(ofSize: 14, weight: .medium)
        
        balanceAmountLabel.translatesAutoresizingMaskIntoConstraints = false
        balanceAmountLabel.textColor = .white
        balanceAmountLabel.font = UIFont.systemFont(ofSize: 24, weight: .bold)
        
        totalBalanceView.addSubview(totalBalanceLabel)
        totalBalanceView.addSubview(balanceAmountLabel)
        
        // Set up table view
        tableView.translatesAutoresizingMaskIntoConstraints = false
        tableView.delegate = self
        tableView.dataSource = self
        tableView.register(AccountDetailCell.self, forCellReuseIdentifier: "AccountDetailCell")
        tableView.separatorStyle = .none
        tableView.backgroundColor = .systemGroupedBackground
        
        // Set up empty state view
        emptyStateView.translatesAutoresizingMaskIntoConstraints = false
        emptyStateView.isHidden = true
        
        let emptyImage = UIImageView(image: UIImage(systemName: "wallet.pass"))
        emptyImage.translatesAutoresizingMaskIntoConstraints = false
        emptyImage.contentMode = .scaleAspectFit
        emptyImage.tintColor = .secondaryLabel
        
        let emptyLabel = UILabel()
        emptyLabel.translatesAutoresizingMaskIntoConstraints = false
        emptyLabel.text = "No hay cuentas registradas"
        emptyLabel.textAlignment = .center
        emptyLabel.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        emptyLabel.textColor = .secondaryLabel
        
        let addFirstAccountButton = UIButton(type: .system)
        addFirstAccountButton.translatesAutoresizingMaskIntoConstraints = false
        addFirstAccountButton.setTitle("Agregar Primera Cuenta", for: .normal)
        addFirstAccountButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        addFirstAccountButton.addTarget(self, action: #selector(addAccountTapped), for: .touchUpInside)
        
        emptyStateView.addSubview(emptyImage)
        emptyStateView.addSubview(emptyLabel)
        emptyStateView.addSubview(addFirstAccountButton)
        
        NSLayoutConstraint.activate([
            emptyImage.centerXAnchor.constraint(equalTo: emptyStateView.centerXAnchor),
            emptyImage.centerYAnchor.constraint(equalTo: emptyStateView.centerYAnchor, constant: -40),
            emptyImage.widthAnchor.constraint(equalToConstant: 80),
            emptyImage.heightAnchor.constraint(equalToConstant: 80),
            
            emptyLabel.topAnchor.constraint(equalTo: emptyImage.bottomAnchor, constant: 16),
            emptyLabel.leadingAnchor.constraint(equalTo: emptyStateView.leadingAnchor, constant: 20),
            emptyLabel.trailingAnchor.constraint(equalTo: emptyStateView.trailingAnchor, constant: -20),
            
            addFirstAccountButton.topAnchor.constraint(equalTo: emptyLabel.bottomAnchor, constant: 24),
            addFirstAccountButton.centerXAnchor.constraint(equalTo: emptyStateView.centerXAnchor)
        ])
        
        // Add views to view hierarchy
        view.addSubview(totalBalanceView)
        view.addSubview(tableView)
        view.addSubview(emptyStateView)
        view.addSubview(addButton)
    }
    
    private func setupConstraints() {
        NSLayoutConstraint.activate([
            // Total balance view constraints
            totalBalanceView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            totalBalanceView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            totalBalanceView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            totalBalanceView.heightAnchor.constraint(equalToConstant: 100),
            
            totalBalanceLabel.topAnchor.constraint(equalTo: totalBalanceView.topAnchor, constant: 20),
            totalBalanceLabel.leadingAnchor.constraint(equalTo: totalBalanceView.leadingAnchor, constant: 20),
            totalBalanceLabel.trailingAnchor.constraint(equalTo: totalBalanceView.trailingAnchor, constant: -20),
            
            balanceAmountLabel.topAnchor.constraint(equalTo: totalBalanceLabel.bottomAnchor, constant: 8),
            balanceAmountLabel.leadingAnchor.constraint(equalTo: totalBalanceView.leadingAnchor, constant: 20),
            balanceAmountLabel.trailingAnchor.constraint(equalTo: totalBalanceView.trailingAnchor, constant: -20),
            
            // Table view constraints
            tableView.topAnchor.constraint(equalTo: totalBalanceView.bottomAnchor, constant: 16),
            tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            // Empty state view constraints
            emptyStateView.topAnchor.constraint(equalTo: totalBalanceView.bottomAnchor, constant: 16),
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
        title = "Cuentas"
        
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
        accounts = DatabaseManager.shared.fetchAllAccounts()
        
        // Show/hide empty state
        emptyStateView.isHidden = !accounts.isEmpty
        tableView.isHidden = accounts.isEmpty
        
        // Update total balance
        updateTotalBalance()
        
        // Reload table view
        tableView.reloadData()
    }
    
    private func updateTotalBalance() {
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
    
    // MARK: - Action methods
    
    @objc private func addAccountTapped() {
        let addAccountVC = AddAccountViewController()
        let navController = UINavigationController(rootViewController: addAccountVC)
        present(navController, animated: true)
    }
    
    @objc private func currencyDidChange() {
        updateTotalBalance()
        tableView.reloadData()
    }
}

// MARK: - UITableViewDelegate & UITableViewDataSource

extension AccountsViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return accounts.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "AccountDetailCell", for: indexPath) as! AccountDetailCell
        let account = accounts[indexPath.row]
        
        cell.configure(with: account)
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 140
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let account = accounts[indexPath.row]
        let detailVC = AccountDetailViewController(account: account)
        navigationController?.pushViewController(detailVC, animated: true)
    }
    
    func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let deleteAction = UIContextualAction(style: .destructive, title: "Eliminar") { [weak self] (_, _, completion) in
            guard let self = self else { return }
            
            let account = self.accounts[indexPath.row]
            
            do {
                try DatabaseManager.shared.deleteAccount(account: account)
                
                self.accounts.remove(at: indexPath.row)
                tableView.deleteRows(at: [indexPath], with: .automatic)
                
                self.updateTotalBalance()
                
                // Show empty state if needed
                self.emptyStateView.isHidden = !self.accounts.isEmpty
                self.tableView.isHidden = self.accounts.isEmpty
                
                completion(true)
            } catch {
                let alert = UIAlertController(
                    title: "Error",
                    message: "No se puede eliminar una cuenta con gastos asociados. Elimine los gastos primero.",
                    preferredStyle: .alert
                )
                
                alert.addAction(UIAlertAction(title: "Aceptar", style: .default))
                self.present(alert, animated: true)
                
                completion(false)
            }
        }
        
        let editAction = UIContextualAction(style: .normal, title: "Editar") { [weak self] (_, _, completion) in
            guard let self = self else { return }
            
            let account = self.accounts[indexPath.row]
            let editVC = EditAccountViewController(account: account)
            let navController = UINavigationController(rootViewController: editVC)
            self.present(navController, animated: true)
            
            completion(true)
        }
        
        editAction.backgroundColor = .systemBlue
        
        return UISwipeActionsConfiguration(actions: [deleteAction, editAction])
    }
}

// MARK: - AccountDetailCell

class AccountDetailCell: UITableViewCell {
    private let containerView = UIView()
    private let nameLabel = UILabel()
    private let balanceLabel = UILabel()
    private let currencyLabel = UILabel()
    private let iconView = UIImageView()
    private let createdAtLabel = UILabel()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        setupViews()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func setupViews() {
        backgroundColor = .systemGroupedBackground
        selectionStyle = .none
        
        containerView.translatesAutoresizingMaskIntoConstraints = false
        containerView.backgroundColor = .systemBackground
        containerView.layer.cornerRadius = 12
        containerView.layer.shadowColor = UIColor.black.cgColor
        containerView.layer.shadowOffset = CGSize(width: 0, height: 2)
        containerView.layer.shadowRadius = 4
        containerView.layer.shadowOpacity = 0.1
        
        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        nameLabel.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        
        balanceLabel.translatesAutoresizingMaskIntoConstraints = false
        balanceLabel.font = UIFont.systemFont(ofSize: 24, weight: .bold)
        
        currencyLabel.translatesAutoresizingMaskIntoConstraints = false
        currencyLabel.font = UIFont.systemFont(ofSize: 14, weight: .regular)
        currencyLabel.textColor = .secondaryLabel
        
        iconView.translatesAutoresizingMaskIntoConstraints = false
        iconView.image = UIImage(systemName: "wallet.pass.fill")
        iconView.tintColor = .systemBlue
        iconView.contentMode = .scaleAspectFit
        
        createdAtLabel.translatesAutoresizingMaskIntoConstraints = false
        createdAtLabel.font = UIFont.systemFont(ofSize: 12, weight: .regular)
        createdAtLabel.textColor = .tertiaryLabel
        
        contentView.addSubview(containerView)
        containerView.addSubview(iconView)
        containerView.addSubview(nameLabel)
        containerView.addSubview(balanceLabel)
        containerView.addSubview(currencyLabel)
        containerView.addSubview(createdAtLabel)
        
        NSLayoutConstraint.activate([
            containerView.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 8),
            containerView.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 16),
            containerView.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -16),
            containerView.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -8),
            
            iconView.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 16),
            iconView.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            iconView.widthAnchor.constraint(equalToConstant: 36),
            iconView.heightAnchor.constraint(equalToConstant: 36),
            
            nameLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 20),
            nameLabel.leadingAnchor.constraint(equalTo: iconView.trailingAnchor, constant: 12),
            nameLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            
            balanceLabel.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 12),
            balanceLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            balanceLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),
            
            currencyLabel.topAnchor.constraint(equalTo: balanceLabel.bottomAnchor, constant: 4),
            currencyLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            
            createdAtLabel.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -16),
            createdAtLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16)
        ])
    }
    
    func configure(with account: Account) {
        nameLabel.text = account.name
        balanceLabel.text = account.formattedBalance()
        currencyLabel.text = "Moneda: \(account.currency)"
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .none
        createdAtLabel.text = "Creada: \(dateFormatter.string(from: account.createdAt))"
        
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

// MARK: - AddAccountViewController (Placeholder)

class AddAccountViewController: UIViewController {
    // This would be implemented with form fields for adding a new account
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Agregar Cuenta"
        
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

// MARK: - EditAccountViewController (Placeholder)

class EditAccountViewController: UIViewController {
    private let account: Account
    
    init(account: Account) {
        self.account = account
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = "Editar Cuenta"
        
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

// MARK: - AccountDetailViewController (Placeholder)

class AccountDetailViewController: UIViewController {
    private let account: Account
    
    init(account: Account) {
        self.account = account
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBackground
        title = account.name
    }
}