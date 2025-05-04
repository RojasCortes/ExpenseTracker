import UIKit

class AddAccountViewController: UIViewController {
    
    // MARK: - Properties
    private let nameTextField = UITextField()
    private let balanceTextField = UITextField()
    private let currencySegmentedControl = UISegmentedControl(items: ["COP", "USD"])
    private let descriptionTextField = UITextField()
    
    // MARK: - Lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
        setupConstraints()
        setupNavigationBar()
    }
    
    // MARK: - Setup methods
    
    private func setupViews() {
        view.backgroundColor = .systemBackground
        
        // Set up text fields
        let fieldsToSetup: [(UITextField, String, UIImage)] = [
            (nameTextField, "Nombre de la cuenta", UIImage(systemName: "creditcard")!),
            (balanceTextField, "Saldo inicial", UIImage(systemName: "dollarsign.circle")!),
            (descriptionTextField, "Descripción (opcional)", UIImage(systemName: "text.alignleft")!)
        ]
        
        for (textField, placeholder, icon) in fieldsToSetup {
            textField.translatesAutoresizingMaskIntoConstraints = false
            textField.placeholder = placeholder
            textField.borderStyle = .roundedRect
            textField.leftViewMode = .always
            
            let iconView = UIImageView(image: icon)
            iconView.tintColor = .systemGray
            iconView.contentMode = .scaleAspectFit
            iconView.frame = CGRect(x: 0, y: 0, width: 20, height: 20)
            
            let leftView = UIView(frame: CGRect(x: 0, y: 0, width: 30, height: 20))
            iconView.center = leftView.center
            leftView.addSubview(iconView)
            
            textField.leftView = leftView
            
            view.addSubview(textField)
        }
        
        // Configure balance text field for numbers
        balanceTextField.keyboardType = .decimalPad
        
        // Currency selector
        currencySegmentedControl.translatesAutoresizingMaskIntoConstraints = false
        currencySegmentedControl.selectedSegmentIndex = CurrencyManager.shared.selectedCurrency == "COP" ? 0 : 1
        view.addSubview(currencySegmentedControl)
        
        // Add labels
        let nameLabel = createLabel(withText: "Nombre de la Cuenta")
        let balanceLabel = createLabel(withText: "Saldo Inicial")
        let currencyLabel = createLabel(withText: "Moneda")
        let descriptionLabel = createLabel(withText: "Descripción")
        
        for label in [nameLabel, balanceLabel, currencyLabel, descriptionLabel] {
            view.addSubview(label)
        }
        
        // Add account type selector
        let accountTypeLabel = createLabel(withText: "Tipo de Cuenta")
        view.addSubview(accountTypeLabel)
        
        let accountTypeSegmentedControl = UISegmentedControl(items: ["Corriente", "Ahorros", "Efectivo", "Inversión"])
        accountTypeSegmentedControl.translatesAutoresizingMaskIntoConstraints = false
        accountTypeSegmentedControl.selectedSegmentIndex = 0
        view.addSubview(accountTypeSegmentedControl)
        
        // Save button
        let saveButton = UIButton(type: .system)
        saveButton.translatesAutoresizingMaskIntoConstraints = false
        saveButton.setTitle("Guardar Cuenta", for: .normal)
        saveButton.setTitleColor(.white, for: .normal)
        saveButton.backgroundColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        saveButton.layer.cornerRadius = 10
        saveButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        saveButton.addTarget(self, action: #selector(saveButtonTapped), for: .touchUpInside)
        
        view.addSubview(saveButton)
        
        // Setup constraints for labels, fields and buttons
        NSLayoutConstraint.activate([
            // Name label and field
            nameLabel.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            nameLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            nameLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            nameTextField.topAnchor.constraint(equalTo: nameLabel.bottomAnchor, constant: 8),
            nameTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            nameTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            nameTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Account type label and selector
            accountTypeLabel.topAnchor.constraint(equalTo: nameTextField.bottomAnchor, constant: 16),
            accountTypeLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            accountTypeLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            accountTypeSegmentedControl.topAnchor.constraint(equalTo: accountTypeLabel.bottomAnchor, constant: 8),
            accountTypeSegmentedControl.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            accountTypeSegmentedControl.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            accountTypeSegmentedControl.heightAnchor.constraint(equalToConstant: 44),
            
            // Balance label and field
            balanceLabel.topAnchor.constraint(equalTo: accountTypeSegmentedControl.bottomAnchor, constant: 16),
            balanceLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            balanceLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            balanceTextField.topAnchor.constraint(equalTo: balanceLabel.bottomAnchor, constant: 8),
            balanceTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            balanceTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            balanceTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Currency label and control
            currencyLabel.topAnchor.constraint(equalTo: balanceTextField.bottomAnchor, constant: 16),
            currencyLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            currencyLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            currencySegmentedControl.topAnchor.constraint(equalTo: currencyLabel.bottomAnchor, constant: 8),
            currencySegmentedControl.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            currencySegmentedControl.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            currencySegmentedControl.heightAnchor.constraint(equalToConstant: 44),
            
            // Description label and field
            descriptionLabel.topAnchor.constraint(equalTo: currencySegmentedControl.bottomAnchor, constant: 16),
            descriptionLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            descriptionLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            
            descriptionTextField.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 8),
            descriptionTextField.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            descriptionTextField.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            descriptionTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Save button
            saveButton.topAnchor.constraint(equalTo: descriptionTextField.bottomAnchor, constant: 30),
            saveButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            saveButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            saveButton.heightAnchor.constraint(equalToConstant: 50)
        ])
    }
    
    private func createLabel(withText text: String) -> UILabel {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.text = text
        label.font = UIFont.systemFont(ofSize: 16, weight: .medium)
        return label
    }
    
    private func setupConstraints() {
        // Main constraints are set in setupViews for simplicity
    }
    
    private func setupNavigationBar() {
        title = "Agregar Cuenta"
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: self,
            action: #selector(cancelTapped)
        )
    }
    
    // MARK: - Action methods
    
    @objc private func cancelTapped() {
        dismiss(animated: true)
    }
    
    @objc private func saveButtonTapped() {
        // Validate fields
        guard let name = nameTextField.text, !name.isEmpty,
              let balanceText = balanceTextField.text, !balanceText.isEmpty,
              let balanceValue = Double(balanceText.replacingOccurrences(of: ",", with: ".")) else {
            showAlert(title: "Error", message: "Por favor complete todos los campos requeridos con valores válidos.")
            return
        }
        
        // Get selected currency
        let currency = currencySegmentedControl.selectedSegmentIndex == 0 ? "COP" : "USD"
        
        // Create account
        _ = DatabaseManager.shared.createAccount(
            name: name,
            balance: balanceValue,
            currency: currency,
            description: descriptionTextField.text
        )
        
        // Dismiss and notify
        dismiss(animated: true) {
            // Post notification to refresh accounts list
            NotificationCenter.default.post(name: NSNotification.Name("AccountAdded"), object: nil)
        }
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}