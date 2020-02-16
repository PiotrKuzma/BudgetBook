///////////////////////////////////////////BUDGET CONTROLLER////////////////////////////////////////////////////////////////BUDGET CONTROLLER
//Creating Data structures
const budgetController = (function() {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }
  }
  Expense.prototype.calcPerc = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPerc = function () {
    return this.percentage;
  }

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.total[type] = sum;
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    perc: -1
  };

  return {
    addItem: function(type, desc, val) {
      let newItem;
      let ID;
      //setting new Item ID basing on the array length
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Checking what is the type of operation (inc, exp) and using appropraite class
      if (type === "exp") {
        newItem = new Expense(ID, desc, val);
      } else if (type === "inc") {
        newItem = new Income(ID, desc, val);
      }
      //pushing created Item to data Object with type = obj key (no if statement needed)
      data.allItems[type].push(newItem);
      //giving other modules access to this new Item
      return newItem;
    },

    deleteItem: function(type, id) {
      let index;
      let idCollection;
      idCollection = data.allItems[type].map(function(current) {
        return current.id;
      });
      index = idCollection.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calc total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      //calc the available budget
      data.budget = data.total.inc - data.total.exp;
      if (data.total.inc > 0) {
        //calc percentage of income spent
        data.perc = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.perc = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur){
        cur.calcPerc(data.total.inc);
      })
    },

    getPercentages: function () {
      const allPercentages = data.allItems.exp.map(function(cur) {
        return cur.getPerc();
      })
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.total.inc,
        totalExpenses: data.total.exp,
        percentage: data.perc
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

////////////////////////////////////////////////////////////UI UPDATE////////////////////////////////////////////////////////////////UI UPDATE
const UIupdater = (function() {
  const DOMselectors = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addButton: ".add__button",
    incomeList: ".income__list",
    expensesList: ".expenses__list",
    budget: ".budget__value",
    income: ".budget__income--value",
    expenses: ".budget__expenses--value",
    expensesPerc: ".budget__expenses--percentage",
    container: ".container"
  };

  return {
    //getting type of operation (expenses or income). This function will return object storing 3 values.
    getInput: function() {
      return {
        type: document.querySelector(DOMselectors.inputType).value,
        description: document.querySelector(DOMselectors.inputDescription)
          .value,
        value: parseFloat(document.querySelector(DOMselectors.inputValue).value)
      };
    },

    displayNewItem: function(object, type) {
      let HTML;
      let DomNode;

      if (type === "inc") {
        DomNode = DOMselectors.incomeList;
        HTML = `
                    <div class="item" id="inc-${object.id}">
                      <div class="item__description">${object.description}</div>
      
                      <div class="item__value">+ ${object.value}</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
      
                    </div>`;
      } else if (type === "exp") {
        DomNode = DOMselectors.expensesList;
        HTML = `     
                      <div class="item" id="exp-${object.id}">
                        <div class="item__description">${object.description}</div>
                          
                        <div class="item__value">- ${object.value}</div>
                        <div class="item__percentage">%%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                          
                      </div>`;
      }
      document.querySelector(DomNode).insertAdjacentHTML("beforeend", HTML);
    },

    deleteFromUI: function(selectionID) {
      let el = document.getElementById(selectionID);
      el.parentNode.removeChild(el);
    },

    clearInputs: function() {
      let fields;
      let fieldsConverted;
      fields = document.querySelectorAll(
        DOMselectors.inputDescription + "," + DOMselectors.inputValue
      );
      fieldsConverted = Array.prototype.slice.call(fields);
      fieldsConverted.forEach(currVal => {
        currVal.value = "";
      });
    },

    displayBudget: function(obj) {
      document.querySelector(DOMselectors.budget).textContent = obj.budget;
      document.querySelector(DOMselectors.income).textContent = obj.totalIncome;
      document.querySelector(DOMselectors.expenses).textContent =
        obj.totalExpenses;

      if (obj.percentage > 0) {
        document.querySelector(DOMselectors.expensesPerc).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMselectors.expensesPerc).textContent = "--";
      }
    },

    //passing DOMselectors to other modules
    exposeDOMstrings: function() {
      return DOMselectors;
    }
  };
})();
///////////////////////////////////////////////////////APP CONTROLLER/////////////////////////////////////////////////////////////APP CONTROLLER
const controller = (function(budgetCtrl, UIctrl) {
  const DOM = UIupdater.exposeDOMstrings();
  const createEventListeners = function() {
    document.querySelector(DOM.addButton).addEventListener("click", addItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addItem();
      }
    });
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  const updateBudget = function() {
    // 1. Calculate Budget
    budgetController.calculateBudget();
    // 2. Return Budget
    let budget = budgetController.getBudget();
    //3. Display changes in UI
    UIupdater.displayBudget(budget);
  };

  const updatePercentages = function() {
    //1. Calculate percentages
    budgetController.calculatePercentages();
    //2. Read from Budget controller
    const percentages = budgetController.getPercentages();
    //3. Update UI
    console.log(percentages);
  };

  const addItem = function() {
    let input;
    let newItem;
    // 1! get input data and store it in Object with getInput from UIupdater module !!!!!!!!!!!!!!!!!!!!!!!
    input = UIupdater.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add Item to the Budget Data Structure -> pass input Object as arguments !!!!!!!!!!!!!!!!!!!!!!!!
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Update the UI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      UIupdater.displayNewItem(newItem, input.type);
      UIupdater.clearInputs();
      //4. Calculate the Budget !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      updateBudget();
      //6. Update The UI again (Percentages) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function(event) {
    let itemID;
    let split;
    let type;
    let ID;
    itemID = event.target.parentNode.parentNode.parentNode.id;

    if (itemID) {
      split = itemID.split("-");
      type = split[0];
      ID = parseInt(split[1]);

      //1. Delete from Data structure
      budgetController.deleteItem(type, ID);

      //2. Delete from UI
      UIupdater.deleteFromUI(itemID);
      //3. Update Budget
      updateBudget();
    }
  };

  return {
    initialize: function() {
      console.log("App started");
      createEventListeners();
    }
  };
})(budgetController, UIupdater);

controller.initialize();
