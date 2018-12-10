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

    var data = {
        allItems: {
            exp: [],
            inc:[]
        },
        total: {
            exp: 0,
            inc: 0
        }
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
                newItem = new Expense(ID, desc, val);
            }else if(type === 'exp'){
                newItem = new Income(ID, desc, val);
            }

            //push it into array
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
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
        inputBtn: '.add__btn'
    }

    return {
        getInput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, // Returns inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: document.querySelector(DOMstrings.inputValue).value,
            };
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

    var ctrlAddItem = function(){

        var input, newItem;
        // 1. Get the field input data
        var input = uiCtrl.getInput();
        
        // 2. Add item to the budget controller
        var newItem = budgetController.addItem(input.type, input.description, input.value);

        // 3. Add new item to the UI
        // 4. Calculate the budget 
        // 5. Display the budget
 
    };

    return {
        init: function(){
            console.log('Application has started.');
            setupEventListners();
        }
    };


})(budgetController, uiController);

controller.init();