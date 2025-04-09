export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.indexedDB) {
      const request = indexedDB.open("Contralyze", 22); // Increment version if changes are made

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Specific configuration for each store
        if (!db.objectStoreNames.contains("company")) {
          db.createObjectStore("company", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("departments")) {
          db.createObjectStore("departments", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("suppliers")) {
          db.createObjectStore("suppliers", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("clients")) {
          db.createObjectStore("clients", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("requisitionsDashboard")) {
          db.createObjectStore("requisitionsDashboard", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("requisitions")) {
          const requisitionsStore = db.createObjectStore("requisitions", {
            keyPath: "id",
          });
          requisitionsStore.createIndex("requisition_uid", "requisition_uid", {
            unique: true,
          }); // Index for searching by requisition_uid
        } else {
          const requisitionsStore = request.transaction.objectStore(
            "requisitions"
          );
          if (!requisitionsStore.indexNames.contains("requisition_uid")) {
            requisitionsStore.createIndex(
              "requisition_uid",
              "requisition_uid",
              { unique: true }
            );
          }
        }

        if (!db.objectStoreNames.contains("budgets")) {
          db.createObjectStore("budgets", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("budgetsStatics")) {
          db.createObjectStore("budgetsStatics", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("infoCards")) {
          db.createObjectStore("infoCards", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("transactionStatics")) {
          db.createObjectStore("transactionStatics", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("departmentsStatics")) {
          db.createObjectStore("departmentsStatics", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("lastTransactions")) {
          db.createObjectStore("lastTransactions", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("lastActivity")) {
          db.createObjectStore("lastActivity", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("yearsAvailable")) {
          db.createObjectStore("yearsAvailable", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("categories")) {
          db.createObjectStore("categories", { keyPath: "id" });
        }

        // New object store for transactions
        if (!db.objectStoreNames.contains("transactions")) {
          const transactionsStore = db.createObjectStore("transactions", {
            keyPath: "id",
          });
          transactionsStore.createIndex("transaction_uid", "transaction_uid", {
            unique: true,
          });
        }

        // New object store for invoices
        if (!db.objectStoreNames.contains("invoices")) {
          const invoicesStore = db.createObjectStore("invoices", {
            keyPath: "id",
          });
          invoicesStore.createIndex("invoice_uid", "invoice_uid", {
            unique: true,
          });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      reject(new Error("IndexedDB is not available in this environment"));
    }
  });
};

export const saveCompanyToDB = (company) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["company"], "readwrite");
        const store = transaction.objectStore("company");

        store.put(company);

        transaction.oncomplete = () => {
          console.log("Company saved to IndexedDB:", company); // Log to verify saved data
          resolve();
        };
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getCompanyFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["company"], "readonly");
        const store = transaction.objectStore("company");

        const request = store.get(1); // Si la clave es fija o debes manejar múltiples entradas

        request.onsuccess = (event) => {
          resolve(event.target.result || null); // Retorna `null` si no hay datos
        };
        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};


export const saveUsersToDB = (users) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["users"], "readwrite");
        const store = transaction.objectStore("users");

        users.forEach((user) => {
          store.put(user);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getUsersFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["users"], "readonly");
        const store = transaction.objectStore("users");

        const users = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            users.push(cursor.value);
            cursor.continue();
          } else {
            resolve(users);
          }
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const saveDepartmentsToDB = (departments) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["departments"], "readwrite");
        const store = transaction.objectStore("departments");

        departments.forEach((user) => {
          store.put(user);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getDepartmentsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["departments"], "readonly");
        const store = transaction.objectStore("departments");

        const departments = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            departments.push(cursor.value);
            cursor.continue();
          } else {
            resolve(departments);
          }
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const saveClientsToDB = (clients) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["clients"], "readwrite");
      const store = transaction.objectStore("clients");

      clients.forEach((client) => {
        store.put(client);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getClientsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["clients"], "readonly");
        const store = transaction.objectStore("clients");

        const clients = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            clients.push(cursor.value);
            cursor.continue();
          } else {
            resolve(clients);
          }
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const saveSuppliersToDB = (suppliers) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["suppliers"], "readwrite");
        const store = transaction.objectStore("suppliers");

        suppliers.forEach((supplier) => {
          store.put(supplier);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getSuppliersFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["suppliers"], "readonly");
        const store = transaction.objectStore("suppliers");

        const suppliers = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            suppliers.push(cursor.value);
            cursor.continue();
          } else {
            resolve(suppliers);
          }
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

// requisitions
export const saveRequisitionsDashboardToDB = (dashboardData) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(
          ["requisitionsDashboard"],
          "readwrite"
        );
        const store = transaction.objectStore("requisitionsDashboard");

        store.put(dashboardData);

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getRequisitionsDashboardFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(
          ["requisitionsDashboard"],
          "readonly"
        );
        const store = transaction.objectStore("requisitionsDashboard");

        const request = store.get(1); // Recupera el objeto con id = 1

        request.onsuccess = (event) => {
          resolve(event.target.result || {}); // Devuelve el objeto o un objeto vacío
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const saveRequisitionsToDB = (requisitions) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["requisitions"], "readwrite");
      const store = transaction.objectStore("requisitions");

      requisitions.forEach((requisition) => {
        store.put(requisition);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getRequisitionByUIDFromDB = (requisition_uid) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["requisitions"], "readonly");
        const store = transaction.objectStore("requisitions");
        const index = store.index("requisition_uid");

        const request = index.get(requisition_uid);

        request.onsuccess = (event) => {
          const result = event.target.result;
          if (result) {
            resolve(result);
          } else {
            console.log("Requisition not found"); // Log para depuración
            resolve(null);
          }
        };

        request.onerror = (error) => {
          console.error("Error retrieving requisition:", error); // Log para depuración
          reject(error);
        };
      })
      .catch((error) => {
        console.error("Error opening database:", error); // Log para depuración
        reject(error);
      });
  });
};

export const getRequisitionsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["requisitions"], "readonly");
      const store = transaction.objectStore("requisitions");

      const requisitions = [];
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          requisitions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(requisitions);
        }
      };

      request.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const updateRequisitionInDB = (requisition) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["requisitions"], "readwrite");
        const store = transaction.objectStore("requisitions");

        // Usar el índice para buscar por requisition_uid
        const index = store.index("requisition_uid");
        const request = index.get(requisition.requisition_uid);

        request.onsuccess = (event) => {
          const existingRequisition = event.target.result;
          if (existingRequisition) {
            // Fusionar los cambios con el objeto existente
            const updatedRequisition = { ...existingRequisition, ...requisition };
            store.put(updatedRequisition);
            resolve(updatedRequisition);
          } else {
            console.warn("Requisition not found in IndexedDB:", requisition.requisition_uid);
            resolve(null);
          }
        };

        request.onerror = (error) => {
          console.error("Error updating requisition in IndexedDB:", error);
          reject(error);
        };
      })
      .catch((error) => {
        console.error("Error opening database:", error);
        reject(error);
      });
  });
};


// budgets statics
export const saveBudgetsStaticsToDB = (budgetsStatics) => {
  console.log("Received budgetsStatics:", budgetsStatics); // Log inicial
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["budgetsStatics"], "readwrite");
      const store = transaction.objectStore("budgetsStatics");

      if (!Array.isArray(budgetsStatics)) {
        console.error("budgetsStatics is not an array:", budgetsStatics);
        return reject(new Error("budgetsStatics must be an array"));
      }

      budgetsStatics.forEach((budget, index) => {
        console.log(`Saving budgetStatics [${index}]:`, budget); // Log para depuración
        store.put(budget);
      });

      transaction.oncomplete = () => {
        console.log("All budgetStatics have been saved successfully."); // Log para confirmar éxito
        resolve();
      };
      transaction.onerror = (error) => {
        console.error("Error saving budgetStatics to IndexedDB:", error); // Log para errores
        reject(error);
      };
    }).catch((error) => {
      console.error("Error opening IndexedDB:", error); // Log para errores al abrir la base de datos
      reject(error);
    });
  });
};

export const getBudgetsStaticsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["budgetsStatics"], "readonly");
      const store = transaction.objectStore("budgetsStatics");

      const budgetsStatics = [];
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          budgetsStatics.push(cursor.value);
          cursor.continue();
        } else {
          resolve(budgetsStatics);
        }
      };

      request.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

// info cards dashboard
export const saveInfoCardsToDB = (infoCards) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["infoCards"], "readwrite");
        const store = transaction.objectStore("infoCards");

        infoCards.forEach((infoCard) => {
          console.log("Saving infoCard:", infoCard); // Log para depuración
          store.put(infoCard);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getInfoCardsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["infoCards"], "readonly");
        const store = transaction.objectStore("infoCards");

        const infoCards = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            console.log("Retrieved infoCard from IndexedDB:", cursor.value); // Log para depuración
            infoCards.push(cursor.value);
            cursor.continue();
          } else {
            console.log("All infoCards retrieved from IndexedDB:", infoCards); // Confirmación de éxito
            resolve(infoCards);
          }
        };

        request.onerror = (error) => {
          console.error("Error retrieving infoCards from IndexedDB:", error); // Log de error
          reject(error);
        };
      })
      .catch((error) => {
        console.error("Error opening IndexedDB:", error); // Log de error al abrir la base de datos
        reject(error);
      });
  });
};

// transaction statics
export const saveTransactionStaticsToDB = (transactionStatics) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["transactionStatics"], "readwrite");
      const store = transaction.objectStore("transactionStatics");

      transactionStatics.forEach((transactionStatic) => {
        store.put(transactionStatic);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getTransactionStaticsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["transactionStatics"], "readonly");
      const store = transaction.objectStore("transactionStatics");

      const transactionStatics = [];
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          transactionStatics.push(cursor.value);
          cursor.continue();
        } else {
          resolve(transactionStatics);
        }
      };

      request.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

// department statics
export const saveDepartmentStaticsToDB = (departmentStatics) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["departmentsStatics"], "readwrite");
      const store = transaction.objectStore("departmentsStatics");

      departmentStatics.forEach((departmentStatic) => {
        store.put(departmentStatic);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getDepartmentStaticsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["departmentsStatics"], "readonly");
      const store = transaction.objectStore("departmentsStatics");

      const departmentStatics = [];
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          departmentStatics.push(cursor.value);
          cursor.continue();
        } else {
          resolve(departmentStatics);
        }
      };

      request.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

// last transactions
export const saveLastTransactionsToDB = (lastTransactions) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["lastTransactions"], "readwrite");
      const store = transaction.objectStore("lastTransactions");

      lastTransactions.forEach((transaction) => {
        store.put(transaction);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getLastTransactionsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["lastTransactions"], "readonly");
      const store = transaction.objectStore("lastTransactions");

      const lastTransactions = [];
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          lastTransactions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(lastTransactions);
        }
      };

      request.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

//  last activity
export const saveLastActivityToDB = (lastActivity) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["lastActivity"], "readwrite");
      const store = transaction.objectStore("lastActivity");

      store.put(lastActivity);

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getLastActivityFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["lastActivity"], "readonly");
        const store = transaction.objectStore("lastActivity");

        const request = store.get("lastactivity_Depto"); // Usa el mismo ID que usaste al guardar

        request.onsuccess = (event) => {
          console.log("Retrieved from IndexedDB:", event.target.result); // Verifica los datos recuperados
          resolve(event.target.result || {}); // Devuelve el objeto o un objeto vacío
        };

        request.onerror = (error) => {
          console.error("Error retrieving last activity from IndexedDB:", error);
          reject(error);
        };
      })
      .catch((error) => {
        console.error("Error opening IndexedDB:", error);
        reject(error);
      });
  });
};

// years available
export const saveYearsAvailableToDB = (yearsAvailable) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["yearsAvailable"], "readwrite");
      const store = transaction.objectStore("yearsAvailable");

      store.put(yearsAvailable);

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getYearsAvailableFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["yearsAvailable"], "readonly");
      const store = transaction.objectStore("yearsAvailable");

      const request = store.get('years_available'); // Cambia el ID según sea necesario

      request.onsuccess = (event) => {
        resolve(event.target.result || {}); // Devuelve el objeto o un objeto vacío
      };

      request.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

//budgets
export const saveBudgetsToDB = (budgets) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["budgets"], "readwrite");
        const store = transaction.objectStore("budgets");

        budgets.forEach((supplier) => {
          store.put(supplier);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getBudgetsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["budgets"], "readonly");
        const store = transaction.objectStore("budgets");

        const budgets = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            budgets.push(cursor.value);
            cursor.continue();
          } else {
            resolve(budgets);
          }
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

//Categories
export const saveCategoriesToDB = (categories) => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["categories"], "readwrite");
        const store = transaction.objectStore("categories");

        categories.forEach((category) => {
          store.put(category);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

export const getCategoriesFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["categories"], "readonly");
        const store = transaction.objectStore("categories");

        const categories = [];
        const request = store.openCursor();

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            categories.push(cursor.value);
            cursor.continue();
          } else {
            resolve(categories);
          }
        };

        request.onerror = (error) => reject(error);
      })
      .catch((error) => reject(error));
  });
};

// Transactions
export const saveTransactionsToDB = async (transactions) => {
  try {
    const db = await openDB();
    const tx = db.transaction("transactions", "readwrite");
    const store = tx.objectStore("transactions");

    // Limpiar store existente
    await store.clear();

    // Guardar nuevas transactions
    transactions.forEach((transaction) => {
      store.add(transaction);
    });

    await tx.complete;
    return true;
  } catch (error) {
    console.error("Error saving transactions to IndexedDB:", error);
    return false;
  }
};

export const getTransactionsFromDB = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction("transactions", "readonly");
      const store = tx.objectStore("transactions");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getTransactionByUIDFromDB = (transaction_uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction("transactions", "readonly");
      const store = tx.objectStore("transactions");
      const index = store.index("transaction_uid");
      const request = index.get(transaction_uid);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Invoices
export const saveInvoicesToDB = async (invoices) => {
  try {
    const db = await openDB();
    const tx = db.transaction("invoices", "readwrite");
    const store = tx.objectStore("invoices");

    // Limpiar store existente
    await store.clear();

    // Guardar nuevas invoices
    invoices.forEach((invoice) => {
      store.add(invoice);
    });

    await tx.complete;
    return true;
  } catch (error) {
    console.error("Error saving invoices to IndexedDB:", error);
    return false;
  }
};

export const getInvoicesFromDB = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction("invoices", "readonly");
      const store = tx.objectStore("invoices");
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export const getInvoiceByUIDFromDB = (invoice_uid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const tx = db.transaction("invoices", "readonly");
      const store = tx.objectStore("invoices");
      const index = store.index("invoice_uid");
      const request = index.get(invoice_uid);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};