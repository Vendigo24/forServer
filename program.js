let placeOfInterest = {
    'name':["Эйфелева башня","Колизей", "Афинский акрополь", "Биг Бен", "Пизанская башня", "Стоунхендж","Берлинская стена", "Парк Тиволи", "Кельнский собор","Саграда Фамилия",
        "Собор Святого Иакова","Леголэнд", "Версальский дворец","Атомиум", "Собор Святого Бавона", "Кекенхоф", "Лувр", "Замок Де Хаар"],
    'country':["Франция", "Италия", "Греция", "Великобритания", "Италия", "Великобритания", "Германия", "Дания", "Германия", "Испания", "Испания", "Дания", "Франция", "Бельгия",  "Бельгия", "Нидерланды", "Франция", "Нидерланды"],
    'city':["Париж", "Рим", "Афины", "Лондон", "Пиза", "Уилтшер", "Берлин", "Копенгаген", "Кельн", "Барселона", "Сантьяго-де-Компостела", "Копенгаген", "Версаль", "Брюссель", "Гент", "Лиссе", "Париж", "Утрехт"],
    'date':[1889, 80, "", 1859, 1173, "", 1961, 1843, 1248, 1882, 1075, 1968, 1661, 1958, 1274, 1949, 1793, 1892],
    'attendance': [6000, 3500, 550, 850, 750, 10, 15, 350, 55, 178, 165, 400, 250, 53, 340, 1000, 5000, 350],

    keys: function(){
       let keys = [];
       for(let key in this){
           if(typeof(this[key]) !== "function"){
               keys.push(key)
           }
       }
       return keys
    },

    print: function(){
        let keys = this.keys()
        let html = "<table><tr><th>Название</th><th>Страна</th><th>Город</th><th>Год построения</th><th>Посещаемость (тыс. чел. в год)</th></tr>"
        for(let i = 0; i<this[keys[0]].length; i++){
            html += "<tr>"
            for(let key in keys){
                html += `<td>${this[keys[key]][i]}</td>`
            }
            html += "</tr>"
        }
        html += "</table>";
        return html
    },

    toArray: function(){
        let array = []
        let keys = this.keys()
        for(let i = 0; i<this[keys[0]].length; i++){
            let info = {}
            for(let key in keys){
                info[keys[key]] = this[keys[key]][i]
            }
            array.push(info)
        }
        return array
    }
}

let placeOfInterestFilter = {
    __proto__ : placeOfInterest,
    getResultLogOpr : function(valueLeft, opr, valueRight) {
        if (opr === 'in') {
            return valueLeft.toLowerCase().indexOf(valueRight.toLowerCase()) > -1;
        }
        else if(opr === 'in array'){
            return valueLeft <= +valueRight[1] && valueLeft >= +valueRight[0];
        }
    },

    where : function(args){
        let keysThis = this.keys();
        let indexTrue = [];
        for (let i = 0; i < this[args[0].key].length; i ++) {
            let flag = true
            let val = this
            args.forEach(function(logOpr){
                //alert(val.getResultLogOpr(val[logOpr["key"]][i],logOpr["operations"],logOpr["value"]))
                if (!val.getResultLogOpr(val[logOpr["key"]][i],logOpr["operations"],logOpr["value"])) {
                    flag = false
                }
            })
            if(flag){
                indexTrue.push(i);
            }
        }

        for (let k in keysThis) {
            let newValue = [];
            for (let i in indexTrue) {
                newValue.push(this[keysThis[k]][indexTrue[i]]);
            }
            this[keysThis[k]] = newValue;
        }
        return true;
    }
}

let placeOfInterestSort={
    __proto__: placeOfInterest,
    change : function(k, p) {
        let allKey = this.keys();
        for(let key in allKey) {
            let w = this[allKey[key]][k];
            this[allKey[key]][k] = this[allKey[key]][p];
            this[allKey[key]][p] = w;
        }
    },

    isCompareOrder : function(n, arrCompare) {
        for(let k = 0; k < arrCompare.length; k += 2) {
            if((this[arrCompare[k]][n] > this[arrCompare[k]][n + 1] && arrCompare[k+1] === "asc") ||
                (this[arrCompare[k]][n] < this[arrCompare[k]][n + 1] && arrCompare[k+1] === "desc")) {
                return true;
            } else if(this[arrCompare[k]][n] === this[arrCompare[k]][n + 1]){
                continue;
            } else {
                return false;
            }
        }
        return false
    },

    sorted : function(args) {
        let n = this[args[0]].length;
        for(let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i; j++) {
                if (this.isCompareOrder(j, args)) {
                    this.change(j, j + 1);
                }
            }
        }
        return true;
    }
}


function hideOption(){
    let firstSortOption = 0;
    let firstLevel = document.getElementById("first_sort")
    let secondLevel = document.getElementById("second_sort")

    function hideOptionHelper(select, prevIndex, newIndex){
        select.options[prevIndex].hidden = false;
        select.options[newIndex].hidden = true;
        return newIndex
    }

    function changeOptions(){
        firstSortOption = hideOptionHelper(
            secondLevel,
            firstSortOption,
            +firstLevel.value
        )
    }

    firstLevel.addEventListener("change", changeOptions)
}
function applySort(){
    let levels = [];
    let keys = placeOfInterestSort.keys()
    let firstLevel = document.getElementById("first_sort").selectedIndex
    levels.push(keys[firstLevel])
    let secondLevel = document.getElementById("second_sort")
    levels.push((document.getElementById("checkbox1").checked) ? "desc" : "asc")
    levels.push(keys[secondLevel.selectedIndex])
    levels.push((document.getElementById("checkbox2").checked) ? "desc" : "asc")
    placeOfInterestSort.sorted(levels)
    let tables = document.getElementsByClassName("places")
    let newTable = tables[0].cloneNode(true)
    newTable.innerHTML = placeOfInterestSort.print()
    let parent = tables[0].parentNode
    parent.replaceChild(newTable, tables[0])
}
function applyFilter(){
    let operations = [];

let filterForm = document.getElementById("filter");
let labels = filterForm.getElementsByTagName("label");
for(let i = 0; i<labels.length; i++) {
    let inputs = labels[i].getElementsByTagName("input")
    let operation = {
        'key':'',
        'operations':'',
        'value':''
    };
    if (inputs.length === 1) {
        operation.key = inputs[0].name;
        operation.operations = "in";
        operation.value = inputs[0].value;
        if(inputs[0].value !== '')
            operations.push(operation)
    }
    else {
        operation.key = inputs[0].name.substring(0, inputs[0].name.length - 4);
        operation.operations = "in array";
        let from = (!inputs[0].value) ? -Infinity : +inputs[0].value;
        let till = (!inputs[1].value) ? Infinity : +inputs[1].value;
        operation.value = [from, till];
        operations.push(operation)
    }
}
    placeOfInterestFilter.where(operations)
    let tables = document.getElementsByClassName("places")
    let newTable = tables[0].cloneNode(true)
    newTable.innerHTML = placeOfInterestFilter.print()
    let parent = tables[0].parentNode
    parent.replaceChild(newTable, tables[0])
}
function assign(){
    document.getElementById("filterButton").addEventListener("click", applyFilter)
    document.getElementById("sortButton").addEventListener("click", applySort)
    hideOption()
}

document.write(placeOfInterest.print())
let table = document.getElementsByTagName("table")
let element = table[1]
element.classList.add("places")
assign()