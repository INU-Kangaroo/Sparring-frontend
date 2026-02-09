//
//  SparringApp.swift
//  Sparring
//
//  Created by 박은산 on 2/7/26.
//

import SwiftUI
import CoreData

@main
struct SparringApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}
