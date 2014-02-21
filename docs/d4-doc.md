# d4 - 0.1.0

## `../src/base.js`

* [``][0]
* [``][0]

## `../src/base.js`

### ``

[\#][0] [Ⓣ][1]

API:  
var columnChart = d4.columnChart()  
.margin({  
top: 15,  
right: 10,  
bottom: 30,  
left: 0  
})  
.mixin({  
'grid': d4.features.grid  
}, 0)  
.using('bars', function(bars){  
bars  
.x(function(d){  
cumulativeX += d\[0\];  
return this.x(cumulativeX - d\[0\]);  
})  
.width(function(d){  
return this.x(d\[0\]);  
})  
})

d3.select(e\[0\])  
.datum(preparedValues)  
.call(columnChart);

---

### ``

[\#][0] [Ⓣ][1]

global d3: false  
global d4: false

---



[0]: #
[1]: #../src/base.js