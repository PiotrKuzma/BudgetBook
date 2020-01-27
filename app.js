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

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    }
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
        value: document.querySelector(DOMselectors.inputValue).value
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
        DomNode = DOMselectors.expenseList;
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

  const addItem = function() {
    let input;
    let newItem;
    // 1! get input data and store it in Object with getInput from UIupdater module !!!!!!!!!!!!!!!!!!!!!
    input = UIupdater.getInput();

    //2. Add Item to the Budget Data Structure -> pass input Object as arguments !!!!!!!!!!!!!!!!!!!!!!!!
    newItem = budgetCtrl.addItem(input.type, input.description, input.value);

    //3. Update the UI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    UIupdater.displayNewItem(newItem, input.type);
    //4. Calculate the Budget !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    //5. Update The UI again (budget) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  };

  return {
    initialize: function() {
      console.log("App started");
      createEventListeners();
    }
  };
})(budgetController, UIupdater);

controller.initialize();
