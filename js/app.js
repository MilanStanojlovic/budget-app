//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum = sum + current.value;
        });

        data.total[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc:[]
        },
        total: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            } 
            
            //create new item based on inc or exp type
            if(type === 'inc'){
                newItem = new Income(ID, desc, val);
            }else if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            }

            //push it into array
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        calculateBudget: function(){
            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // 2. Calculate the budget: income - expenses
            data.budget = data.total.inc - data.total.exp;

            // 3. Calculate the percentage of income that is spent
            if(data.total.inc > 0 ){
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.total.inc,
                totalExpenses: data.total.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
        }
    }

})();

//UI CONTROLLER
var uiController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    }

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, // Returns inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type){
            var html, newHtml, element;

            //1. Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //2. Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ' ,' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        getDOMstrings: function(){
            return DOMstrings;
        }
    };

})();

//GLOBAL APPLICATION CONTROLLER
var controller = (function(budgetCtrl, uiCtrl){

    var setupEventListners = function (){

        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // event for ENTER keypress 
        document.addEventListener('keypress', function  (event){
         if(event.keyCode === 13 || event.which ===  13){
                 ctrlAddItem();
            }
        });

    }

    var updateBudget = function(){
        // 1. Calculate the budget 
        budgetController.calculateBudget();
        // 2. Return the budget
        var budget = budgetController.getBudget();
        // 2. Display the budget on the UI
        console.log(budget);
    };

    var ctrlAddItem = function(){

        var input, newItem;
        // 1. Get the field input data
        var input = uiCtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
        // 2. Add item to the budget controller
        var newItem = budgetController.addItem(input.type, input.description, input.value);
        // 3. Add new item to the UI
        uiCtrl.addListItem(newItem, input.type);
        // 4. Clear the fields
        uiCtrl.clearFields();
        // 5. Calculate and update budget
        updateBudget();
        }
    };

    return {
        init: function(){
            console.log('Application has started.');
            setupEventListners();
        }
    };


})(budgetController, uiController);

controller.init();