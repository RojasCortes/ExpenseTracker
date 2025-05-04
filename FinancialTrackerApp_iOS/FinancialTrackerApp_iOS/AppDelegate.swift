import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Initialize database
        DatabaseManager.shared.setupDatabase()
        
        window = UIWindow(frame: UIScreen.main.bounds)
        
        let mainViewController = MainTabBarController()
        window?.rootViewController = mainViewController
        window?.makeKeyAndVisible()
        
        return true
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Save any unsaved data
        DatabaseManager.shared.saveContext()
    }
}