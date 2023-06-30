let svg = d3.select("details")
    .append("svg")


function getArrGraph(arrObject, fieldX, fieldY){
    let groupObj = d3.group(arrObject, d => d[fieldX]);
    let arrGroup = []
    for(let entry of groupObj){
        let info = {
            "labelX":"",
            "countPlace":0,
            "valueMin":-1,
            "valueMax":-1
        }
        info.labelX = entry[0];
        info.countPlace = entry[1].length
        let minMax = d3.extent(entry[1].map(d => d[fieldY]))
        info.valueMin = minMax[0];
        info.valueMax = minMax[1];
        arrGroup.push(info);
    }
    return arrGroup;
}


function drawGraph() {
    let oxData = document.getElementById("ox")
    let oyData = document.getElementById("oy")
    let inputsX = oxData.getElementsByTagName("input")
    let inputsY = oyData.getElementsByTagName("input")
    function GetXCheckedValue(){
        for(let i = 0; i<inputsX.length; i++){
            if(inputsX[i].checked)
                return inputsX[i].value
        }
    }
    if (!(inputsY[0].checked || inputsY[1].checked || inputsY[2].checked)){
        alert("Выберите значение(-я) по осям!")
    }
    else{
        let valX = GetXCheckedValue()
        let arrGraph = getArrGraph(placeOfInterest.toArray(), valX, "attendance")
        let marginX = 50;
        let marginY = 50;
        let height = 400;
        let width = 800;

        // очищаем svg перед построением
        svg.attr("height", 500)
            .attr("width", 800)
            .style("border", "solid thin red")
        svg.selectAll("*").remove();
        let coeff1 = 0;
        let coeff2 = 0
        if(inputsY[0].checked || inputsY[1].checked){
            coeff2 = (!inputsY[0].checked && inputsY[1].checked) ? d3.max(arrGraph.map(d => d.valueMin)) : d3.max(arrGraph.map(d => d.valueMax))
            coeff1 = d3.min(arrGraph.map(d => d.valueMin))
        }
        else{
            coeff2 = d3.max(arrGraph.map(d => d.countPlace))
            coeff1 = d3.min(arrGraph.map(d => d.countPlace))
        }
        // определяем минимальное и максимальное значение по оси OY
        let min = coeff1 * 0.95;
        let max = coeff2 * 1.05;
        let xAxisLen = width - 2 * marginX;
        let yAxisLen = height - 2 * marginY;

        // определяем шкалы для осей
        let scaleX = d3.scaleBand()
            .domain(arrGraph.map(function(d) {
                    return d.labelX;
                })
            )
            .range([0, xAxisLen]);

        let scaleY = d3.scaleLinear()
            .domain([min, max])
            .range([yAxisLen, 0]);
        // создаем оси
        let axisX = d3.axisBottom(scaleX); // горизонтальная

        let axisY = d3.axisLeft(scaleY);// вертикальная

        function drawDotGraph(arrValue, field, color){
            svg.selectAll(".dot")
                .data(arrValue)
                .enter()
                .append("circle")
                .attr("r", 5)
                .attr("cx", function(d) { return scaleX(d.labelX); })
                .attr("cy", function(d) { return  scaleY(d[field]); })
                .attr("transform",
                    `translate(${marginX + scaleX.bandwidth()/2}, ${marginY})`)
                .style("fill", color)
        }

        // отображаем ось OX, устанавливаем подписи оси ОX и угол их наклона
        svg.append("g")
            .attr("transform", `translate(${marginX}, ${height - marginY})`)
            .call(axisX)
            .attr("class", "x-axis")
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-45)";
            });

        // отображаем ось OY
        svg.append("g")
            .attr("transform", `translate(${marginX}, ${marginY})`)
            .attr("class", "y-axis")
            .call(axisY);

        // создаем набор вертикальных линий для сетки
        d3.selectAll("g.x-axis g.tick")
            .append("line") // добавляем линию
            .classed("grid-line", true) // добавляем класс
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", - (yAxisLen));

        // создаем горизонтальные линии сетки
        d3.selectAll("g.y-axis g.tick")
            .append("line")
            .classed("grid-line", true)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", xAxisLen)
            .attr("y2", 0);

        if(inputsY[0].checked)
            drawDotGraph(arrGraph, "valueMax", "red")
        if(inputsY[1].checked)
            drawDotGraph(arrGraph, "valueMin", "blue")
        if(inputsY[2].checked)
            drawDotGraph(arrGraph, "countPlace", "green")
    }

}

document.getElementById("drawGraph").addEventListener("click", drawGraph)