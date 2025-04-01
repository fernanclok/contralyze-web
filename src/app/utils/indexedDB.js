export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.indexedDB) {
      const request = indexedDB.open("Contralyze", 8); // Incrementa la versión si haces cambios

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Configuración específica para cada almacén
        if (!db.objectStoreNames.contains("company")) {
          db.createObjectStore("company", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("users")) {
          db.createObjectStore("users", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("departments")) {
          db.createObjectStore("departments", { keyPath: "id"});
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
          const requisitionsStore = db.createObjectStore("requisitions", { keyPath: "id" });
          requisitionsStore.createIndex("requisition_uid", "requisition_uid", { unique: true }); // Índice para búsquedas por requisition_uid
        } else {
          const requisitionsStore = request.transaction.objectStore("requisitions");
          if (!requisitionsStore.indexNames.contains("requisition_uid")) {
            requisitionsStore.createIndex("requisition_uid", "requisition_uid", { unique: true });
          }
        }

        if (!db.objectStoreNames.contains("budgets")) {
          db.createObjectStore("budgets", { keyPath: "id" });
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
    openDB().then((db) => {
      const transaction = db.transaction(["company"], "readwrite");
      const store = transaction.objectStore("company");

        store.put(company);   

        transaction.oncomplete = () => {
          console.log("Company saved to IndexedDB:", company); // Log para verificar los datos guardados
          resolve();
        };
        transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getCompanyFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["company"], "readonly");
      const store = transaction.objectStore("company");

      const request = store.get(1);

      request.onsuccess = (event) => {
        resolve(event.target.result || {}); // Devuelve el objeto o un objeto vacío
      };

      request.onerror = (error) => reject(error);
    })
    .catch((error) => reject(error));
});
}

export const saveUsersToDB = (users) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["users"], "readwrite");
      const store = transaction.objectStore("users");

      users.forEach((user) => {
        store.put(user);
      })

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  })
}

export const getUsersFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
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
    }).catch((error) => reject(error));
  });
};

export const saveDepartmentsToDB = (departments) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["departments"], "readwrite");
      const store = transaction.objectStore("departments");

      departments.forEach((user) => {
        store.put(user);
      })

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  })
}

export const getDepartmentsFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
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
    }).catch((error) => reject(error));
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
      openDB().then((db) => {
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
      }).catch((error) => reject(error));
    });
  };

  export const saveSuppliersToDB = (suppliers) => {
    return new Promise((resolve, reject) => {
      openDB().then((db) => {
        const transaction = db.transaction(["suppliers"], "readwrite");
        const store = transaction.objectStore("suppliers");
  
        suppliers.forEach((supplier) => {
          store.put(supplier);
        });
  
        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      }).catch((error) => reject(error));
    });
  };

  export const getSuppliersFromDB = () => {
    return new Promise((resolve, reject) => {
      openDB().then((db) => {
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
      }).catch((error) => reject(error));
    });
  };

// requisitions
export const saveRequisitionsDashboardToDB = (dashboardData) => {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const transaction = db.transaction(["requisitionsDashboard"], "readwrite");
      const store = transaction.objectStore("requisitionsDashboard");

        store.put(dashboardData);   

      transaction.oncomplete = () => resolve();
      transaction.onerror = (error) => reject(error);
    }).catch((error) => reject(error));
  });
};

export const getRequisitionsDashboardFromDB = () => {
  return new Promise((resolve, reject) => {
    openDB()
      .then((db) => {
        const transaction = db.transaction(["requisitionsDashboard"], "readonly");
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
          console.log("Saving requisition:", requisition); // Log para depuración
          store.put(requisition);
        });
  
        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      }).catch((error) => reject(error));
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

  //budgets
  export const saveBudgetsToDB = (budgets) => {
    return new Promise((resolve, reject) => {
      openDB().then((db) => {
        const transaction = db.transaction(["budgets"], "readwrite");
        const store = transaction.objectStore("budgets");
  
        budgets.forEach((supplier) => {
          store.put(supplier);
        });
  
        transaction.oncomplete = () => resolve();
        transaction.onerror = (error) => reject(error);
      }).catch((error) => reject(error));
    });
  };

  export const getBudgetsFromDB = () => {
    return new Promise((resolve, reject) => {
      openDB().then((db) => {
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
      }).catch((error) => reject(error));
    });
  };
  