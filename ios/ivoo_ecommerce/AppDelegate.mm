#import "AppDelegate.h"

// 1. Importaciones esenciales
#import <Firebase.h> 
#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // 2. Configuración de Firebase (Debe ir antes de super)
  [FIRApp configure];

  // 3. Configuración de React Native
  self.moduleName = @"ivoo";
  self.dependencyProvider = [RCTAppDependencyProvider new];
  
  // Props iniciales personalizadas
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// 4. MÉTODO CRUCIAL: Define dónde está el código JavaScript
- (NSURL *)bundleURL
{
#if DEBUG
  // En desarrollo, busca el servidor Metro (localhost:8081)
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  // En producción (Release), busca el archivo main.jsbundle compilado
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// 5. MÉTODO DE COMPATIBILIDAD: Para versiones que aún usan el Bridge
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

@end