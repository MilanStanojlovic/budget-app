//BUDGET CONTROLLER
var budgetController = (function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

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

        deleteItem: function(type, id){
            var ids, index;

            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
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

        calculatePercentages: function(){
            /**
             * a=20
             * b=10
             * c=40
             * income=100
             * a=20/100 = 20%
             * b=10/100 = 10%
             * c=40/100 = 40%
             */
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.total.inc);
            });
        },

        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.total.inc,
                totalExpenses: data.total.exp,
                percentage: data.percentage
            };
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
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        // + or - before the number
        //exactly 2 decimal points 20.00, 120.00
        //comma separating thousands 1,000.00
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length-3) + ',' +int.substr(int.length-3, 3);//input 23531, output 23,531
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

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

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //2. Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));

            //3. Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        deleteListItem: function(selectorID){
            var el= document.getElementById(selectorID);
            el.parentNode.removeChild(el);
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

        displayBudget: function(obj){
            var type;
            if(obj.budget > 0){ 
                type ='inc' 
            }else{
                type = 'exp';
            } 
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            var nodeListForEach = function(list, callback){
                for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };  

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    }; 

    updatePercentages = function(){
        // 1. Calculate the percentages
        budgetController.calculatePercentages();
        // 2. Reat percentages from budget controller
        var percentages = budgetController.getPercentages();

        // 3. Update the UI 
        uiController.displayPercentages(percentages);

    };

    var updateBudget = function(){
        // 1. Calculate the budget 
        budgetController.calculateBudget();
        // 2. Return the budget
        var budget = budgetController.getBudget();
        // 3. Display the budget on the UI
        uiController.displayBudget(budget);
        
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

        // 6. Calculate and update percentages
        updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

        if(itemID){
            //income-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete Item from Data struct
            budgetController.deleteItem(type, ID);

            // 2. Delete item from the UI
            uiController.deleteListItem(itemID);

            // 3. Update new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }

    };

    return {
        init: function(){
            console.log('Application has started.');
            uiController.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListners();
        }
    };


})(budgetController, uiController);

controller.init();