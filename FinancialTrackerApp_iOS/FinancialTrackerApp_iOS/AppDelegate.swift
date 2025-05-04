import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Create window
        window = UIWindow(frame: UIScreen.main.bounds)
        
        // Set up main tab bar controller as root
        let mainTabBarController = MainTabBarController()
        window?.rootViewController = mainTabBarController
        window?.makeKeyAndVisible()
        
        return true
    }
}