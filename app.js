///////////////////////////////////////////BUDGET CONTROLLER////////////////////////////////////////////////////////////////BUDGET CONTROLLER
//Creating Data structures
const budgetController = (function() {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
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
    data.allItems[type].forEach(cur => {
      sum = sum + cur.value;
      data.total[type] = sum;
    });
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
    expensesList: ".expenses__list"
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
                    <div class="item" id="income-${object.id}">
                      <div class="item__description">${object.description}</div>
      
                      <div class="item__value">+ ${object.value}</div>
                      <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                      </div>
      
                    </div>`;
      } else if (type === "exp") {
        DomNode = DOMselectors.expensesList;
        HTML = `     
                      <div class="item" id="expense-${object.id}">
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

    //passing DOMselectors to other modules
    exposeDOMstrings: function() {
      return DOMselectors;
    }
  };
})();
//////////////////////////////////////////////////////////CONTROLLER//////////////////////////////////////////////////////////////////CONTROLLER
const controller = (function(budgetCtrl, UIctrl) {
  const DOM = UIupdater.exposeDOMstrings();
  const createEventListeners = function() {
    document.querySelector(DOM.addButton).addEventListener("click", addItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addItem();
      }
    });
  };

  const updateBudget = function() {
    // 1. Calculate Budget
    budgetController.calculateBudget();
    // 2. Return Budget
    let budgetCollections = budgetController.getBudget();
    //3. Display changes in UI
    console.log(budgetCollections);
  };

  const addItem = function() {
    let input;
    let newItem;
    // 1! get input data and store it in Object with getInput from UIupdater module !!!!!!!!!!!!!!!!!!!!!
    input = UIupdater.getInput();
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add Item to the Budget Data Structure -> pass input Object as arguments !!!!!!!!!!!!!!!!!!!!!!!!
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Update the UI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      UIupdater.displayNewItem(newItem, input.type);
      UIupdater.clearInputs();
      //4. Calculate the Budget !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      updateBudget();
      //5. Update The UI again (budget) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
