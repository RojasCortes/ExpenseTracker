import UIKit

class AddExpenseViewController: UIViewController {
    
    // MARK: - Properties
    private let scrollView = UIScrollView()
    private let contentView = UIView()
    
    private let amountTextField = UITextField()
    private let dateTextField = UITextField()
    private let categoryTextField = UITextField()
    private let descriptionTextField = UITextField()
    private let accountTextField = UITextField()
    private let currencySegmentedControl = UISegmentedControl(items: ["COP", "USD"])
    
    private let datePicker = UIDatePicker()
    private let categoryPicker = UIPickerView()
    private let accountPicker = UIPickerView()
    
    private var categories = ["Alimentación", "Vivienda", "Transporte", "Servicios", "Salud", "Entretenimiento", "Educación", "Otros"]
    private var accounts: [Account] = []
    private var selectedAccountIndex = 0
    private var selectedCategoryIndex = 0
    
    // MARK: - Lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupViews()
        setupConstraints()
        setupNavigationBar()
        
        // Load accounts
        accounts = DatabaseManager.shared.fetchAllAccounts()
        
        // Setup pickers
        setupPickers()
    }
    
    // MARK: - Setup methods
    
    private func setupViews() {
        view.backgroundColor = .systemBackground
        
        // Set up scroll view and content view
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        contentView.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(scrollView)
        scrollView.addSubview(contentView)
        
        // Set up text fields and controls
        let fieldsToSetup: [(UITextField, String, UIImage)] = [
            (amountTextField, "Monto", UIImage(systemName: "dollarsign.circle")!),
            (dateTextField, "Fecha", UIImage(systemName: "calendar")!),
            (categoryTextField, "Categoría", UIImage(systemName: "tag")!),
            (descriptionTextField, "Descripción (opcional)", UIImage(systemName: "text.alignleft")!),
            (accountTextField, "Cuenta", UIImage(systemName: "wallet.pass")!)
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
            
            contentView.addSubview(textField)
        }
        
        // Configure amount text field for numbers
        amountTextField.keyboardType = .decimalPad
        
        // Currency selector
        currencySegmentedControl.translatesAutoresizingMaskIntoConstraints = false
        currencySegmentedControl.selectedSegmentIndex = CurrencyManager.shared.selectedCurrency == "COP" ? 0 : 1
        contentView.addSubview(currencySegmentedControl)
        
        // Add labels
        let amountLabel = createLabel(withText: "Monto")
        let dateLabel = createLabel(withText: "Fecha")
        let categoryLabel = createLabel(withText: "Categoría")
        let descriptionLabel = createLabel(withText: "Descripción")
        let accountLabel = createLabel(withText: "Cuenta")
        let currencyLabel = createLabel(withText: "Moneda")
        
        for label in [amountLabel, dateLabel, categoryLabel, descriptionLabel, accountLabel, currencyLabel] {
            contentView.addSubview(label)
        }
        
        // Save button
        let saveButton = UIButton(type: .system)
        saveButton.translatesAutoresizingMaskIntoConstraints = false
        saveButton.setTitle("Guardar Gasto", for: .normal)
        saveButton.setTitleColor(.white, for: .normal)
        saveButton.backgroundColor = UIColor(red: 0.0, green: 0.47, blue: 1.0, alpha: 1.0)
        saveButton.layer.cornerRadius = 10
        saveButton.titleLabel?.font = UIFont.systemFont(ofSize: 16, weight: .semibold)
        saveButton.addTarget(self, action: #selector(saveButtonTapped), for: .touchUpInside)
        
        contentView.addSubview(saveButton)
        
        // Setup constraints for labels and fields
        NSLayoutConstraint.activate([
            // Amount label and field
            amountLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 20),
            amountLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            amountLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            
            amountTextField.topAnchor.constraint(equalTo: amountLabel.bottomAnchor, constant: 8),
            amountTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            amountTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            amountTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Currency label and control
            currencyLabel.topAnchor.constraint(equalTo: amountTextField.bottomAnchor, constant: 16),
            currencyLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            currencyLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            
            currencySegmentedControl.topAnchor.constraint(equalTo: currencyLabel.bottomAnchor, constant: 8),
            currencySegmentedControl.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            currencySegmentedControl.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            currencySegmentedControl.heightAnchor.constraint(equalToConstant: 44),
            
            // Date label and field
            dateLabel.topAnchor.constraint(equalTo: currencySegmentedControl.bottomAnchor, constant: 16),
            dateLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            dateLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            
            dateTextField.topAnchor.constraint(equalTo: dateLabel.bottomAnchor, constant: 8),
            dateTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            dateTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            dateTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Category label and field
            categoryLabel.topAnchor.constraint(equalTo: dateTextField.bottomAnchor, constant: 16),
            categoryLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            categoryLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            
            categoryTextField.topAnchor.constraint(equalTo: categoryLabel.bottomAnchor, constant: 8),
            categoryTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            categoryTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            categoryTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Description label and field
            descriptionLabel.topAnchor.constraint(equalTo: categoryTextField.bottomAnchor, constant: 16),
            descriptionLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            
            descriptionTextField.topAnchor.constraint(equalTo: descriptionLabel.bottomAnchor, constant: 8),
            descriptionTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            descriptionTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            descriptionTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Account label and field
            accountLabel.topAnchor.constraint(equalTo: descriptionTextField.bottomAnchor, constant: 16),
            accountLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            accountLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            
            accountTextField.topAnchor.constraint(equalTo: accountLabel.bottomAnchor, constant: 8),
            accountTextField.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            accountTextField.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            accountTextField.heightAnchor.constraint(equalToConstant: 44),
            
            // Save button
            saveButton.topAnchor.constraint(equalTo: accountTextField.bottomAnchor, constant: 30),
            saveButton.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20),
            saveButton.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20),
            saveButton.heightAnchor.constraint(equalToConstant: 50),
            saveButton.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -20)
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
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            
            contentView.topAnchor.constraint(equalTo: scrollView.topAnchor),
            contentView.leadingAnchor.constraint(equalTo: scrollView.leadingAnchor),
            contentView.trailingAnchor.constraint(equalTo: scrollView.trailingAnchor),
            contentView.bottomAnchor.constraint(equalTo: scrollView.bottomAnchor),
            contentView.widthAnchor.constraint(equalTo: scrollView.widthAnchor)
        ])
    }
    
    private func setupNavigationBar() {
        title = "Agregar Gasto"
        
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .cancel,
            target: self,
            action: #selector(cancelTapped)
        )
    }
    
    private func setupPickers() {
        // Set up date picker
        datePicker.datePickerMode = .date
        if #available(iOS 13.4, *) {
            datePicker.preferredDatePickerStyle = .wheels
        }
        dateTextField.inputView = datePicker
        dateTextField.text = DateUtils.shared.formatDateForDisplay(Date())
        
        // Set up category picker
        categoryPicker.delegate = self
        categoryPicker.dataSource = self
        categoryTextField.inputView = categoryPicker
        categoryTextField.text = categories[0]
        
        // Set up account picker
        accountPicker.delegate = self
        accountPicker.dataSource = self
        accountTextField.inputView = accountPicker
        if !accounts.isEmpty {
            accountTextField.text = accounts[0].name
        } else {
            accountTextField.text = "No hay cuentas disponibles"
        }
        
        // Add toolbar with Done button to all pickers
        let toolBar = UIToolbar()
        toolBar.sizeToFit()
        
        let doneButton = UIBarButtonItem(
            barButtonSystemItem: .done,
            target: self,
            action: #selector(doneTapped)
        )
        
        let flexSpace = UIBarButtonItem(
            barButtonSystemItem: .flexibleSpace,
            target: nil,
            action: nil
        )
        
        toolBar.setItems([flexSpace, doneButton], animated: false)
        
        dateTextField.inputAccessoryView = toolBar
        categoryTextField.inputAccessoryView = toolBar
        accountTextField.inputAccessoryView = toolBar
    }
    
    // MARK: - Action methods
    
    @objc private func cancelTapped() {
        dismiss(animated: true)
    }
    
    @objc private func doneTapped() {
        // Handle date selection
        if dateTextField.isFirstResponder {
            dateTextField.text = DateUtils.shared.formatDateForDisplay(datePicker.date)
        }
        
        view.endEditing(true)
    }
    
    @objc private func saveButtonTapped() {
        // Validate fields
        guard let amountText = amountTextField.text, !amountText.isEmpty,
              let amountValue = Double(amountText.replacingOccurrences(of: ",", with: ".")),
              !accounts.isEmpty else {
            showAlert(title: "Error", message: "Por favor complete todos los campos requeridos.")
            return
        }
        
        // Get selected currency
        let currency = currencySegmentedControl.selectedSegmentIndex == 0 ? "COP" : "USD"
        
        // Get selected account
        let selectedAccount = accounts[selectedAccountIndex]
        
        // Create expense
        _ = DatabaseManager.shared.createExpense(
            amount: amountValue,
            currency: currency,
            date: datePicker.date,
            category: categories[selectedCategoryIndex],
            description: descriptionTextField.text,
            account: selectedAccount
        )
        
        // Dismiss and notify
        dismiss(animated: true) {
            // Post notification to refresh expense list
            NotificationCenter.default.post(name: NSNotification.Name("ExpenseAdded"), object: nil)
        }
    }
    
    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
}

// MARK: - UIPickerViewDelegate & UIPickerViewDataSource

extension AddExpenseViewController: UIPickerViewDelegate, UIPickerViewDataSource {
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        if pickerView == categoryPicker {
            return categories.count
        } else if pickerView == accountPicker {
            return accounts.count
        }
        return 0
    }
    
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        if pickerView == categoryPicker {
            return categories[row]
        } else if pickerView == accountPicker {
            return accounts[row].name
        }
        return nil
    }
    
    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        if pickerView == categoryPicker {
            categoryTextField.text = categories[row]
            selectedCategoryIndex = row
        } else if pickerView == accountPicker {
            accountTextField.text = accounts[row].name
            selectedAccountIndex = row
        }
    }
}