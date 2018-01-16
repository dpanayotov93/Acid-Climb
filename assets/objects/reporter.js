/**
 * The Reporter module for the highlighter. This one is to be used inside the reporting service for generating the heatmap
 * @property {Object<Highlighter>} parent - The Selector's parent - the Highlighter object that instantiated it
 * @property {string} dataSource - The element on the page from which the respondents' data should be extracted
 * @property {Number} waitTime - How much iterations to wait for the data to appear (1 = 3 seconds)
 * @property {Array<Rectangles>} requestData - The extracted data from the page that will be send to the PHP file
 * @property {Boolean} areEventsAdded - Switch to indicate whether the canvas events have already been added
 * @property {Boolean || Rectangle} foundMatch - Either false if the mouse does not hover a rectangle or contains the rectangle's coordinates for the hover check
 * @property {string} matchColor - The original color of the matched element during hovering
 * @property {Number} hoverLevel - Indicates the level to hover onto if the heatmap has been filtered by level
 * @property {Object} ctx - The canvas context
 * @property {Array<Rectangles>} levels - The generated from the PHP array of intersecting rectangles 
 * @property {Array<Rectangles>} originalLevels - Backup of the generated from the PHP array of intersecting rectangles 
 * @property {Array<string>} colorMap - A map of colors to be used for the different heat levels of the interactions
 * @property {Object} legend - The legend object for the heatmap
 * @property {Array<Object>} legend.levels - The levels in the legend list
 * @property {Object} legend.container - The container element for the legend list
 * @property {Object} legend.element - The legend list element
 * @property {Object} legend.header - The title of the legend
 * @property {Object} legend.subtitle - The subtitle of the legend
 * @property {Object} legend.reset - The reset button of the legend list
 * @property {Object} respFilter - The Respondent Filter object for the heatmap
 * @property {Object} respFilter.data - Array to hold the chosen Respondent IDs for the Respondent Filter
 * @property {Object} respFilter.container - The container element for the Respondent Filter
 * @property {Object} respFilter.list - The list of chosen respondents for the Respondent Filter
 * @property {Object} respFilter.element - The Respondent Filter element
 * @property {Object} respFilter.entry - The Respondent Filter input element
 * @property {Object} respFilter.header - The title of the Respondent Filter
 * @property {Object} respFilter.subtitle - The subtitle of the Respondent Filter 
 * @property {Object} respFilter.button - The filter button of the Respondent Filter 
 * @property {Object} respFilter.reset - The reset button of the Respondent Filter 
 * @property {Object} options - The options panel for the heatmap
 * @property {Object} options.element - The container element for the heatmap options
 * @property {Object} options.exportImage - The export button for the heatmap image exporting
 * @property {Object} options.exportData - The export button for the heatmap data exporting
 */
function Reporter(highlighter, dataSource) {
    this.parent = highlighter;
    this.dataSource = dataSource;
    this.waitTime = 3;
    this.requestData = [];    
    this.areEventsAdded = false;
    this.foundMatch = false;
    this.matchColor = null;
    this.hoverLevel = null;
    this.ctx = null;
    this.levels = null;
    this.originalLevels = null;
    this.colorMap = null;
    this.legend = {
        levels: [],
        container: null,
        element: null,
        header: null,
        subtitle: null,
        reset: null
    };
    this.respFilter = {
        data: [],
        container: null,
        list: null,        
        element: null,
        entry: null,
        header: null,
        subtitle: null,   
        button: null,
        reset: null
    };
    this.options = {
        element: null,
        exportImage: null,
        exportData: null
    };
    this.tooltip = {
        element: document.createElement('div')
    }

    /**
     * Extracts the data from the page
     */
    this.extractRequestData = function() {
        var self = this;
        var dataSources = null;
        var loadCheckerCounter = 0;

        // var ctx = this.parent.canvas.getContext('2d');
        this.ctx = this.parent.canvas.getContext('2d');
        this.ctx.font = "70px monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = '#ff0303';
        this.ctx.fillRect(0, this.parent.canvas.width / 2 - 100, this.parent.canvas.width, 250);    
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText("Generating heatmap", this.parent.canvas.width / 2, this.parent.canvas.height / 2);        

        var loadChecker = setInterval(function() {
            console.info(loadCheckerCounter, self.waitTime);
            if(loadCheckerCounter === self.waitTime) {
                console.warn('NO DATA!');
                self.ctx.font = "70px monospace";
                self.ctx.textAlign = "center";
                self.ctx.fillStyle = '#ff0303';                
                self.ctx.fillRect(0, self.parent.canvas.width / 2 - 100, self.parent.canvas.width, 250);   
                self.ctx.fillStyle = '#fff';
                self.ctx.fillText("No available data yet!", self.parent.canvas.width / 2, self.parent.canvas.height / 2);   
                clearInterval(loadChecker);            
            }
            if(document.querySelectorAll(self.dataSource).length > 0) {
                clearInterval(loadChecker);
                dataSources = document.querySelectorAll(self.dataSource);
                self.combineResponses(dataSources);                
            } else {
                loadCheckerCounter += 1;
            }
        }, 3000);
    };

    /**
     * Combines the responses of all respondents into a single Array
     * @param {Object} dataSource - The extracted response data from the page
     */
    this.combineResponses = function(dataSources) {
        for(var i = 0; i < dataSources.length; i += 1) {
            var currentData = JSON.parse(dataSources[i].innerHTML);

            Array.prototype.push.apply(this.requestData, currentData);
        }

        console.log(this.requestData.length);

        this.calculateIntersections();       
    }

    /**
     * Send the extracted data to the PHP file and then records the response into the levels array
     */
    this.calculateIntersections = function() {
        var self = this;
        var requestData = JSON.stringify(this.requestData);
        var xmlhttp = new XMLHttpRequest();

        console.time('request');
        console.log(requestData);

        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) { 
                console.info(this.responseText);                 
                console.timeEnd('request');                
                var levels = JSON.parse(this.responseText)                
                /*
                for(var i = 0; i < levels.length; i += 1) {
                    var level = levels[i];

                    if(level.length === 0) {                        
                        var index = levels.indexOf(level);
                        console.log(levels, level, index);

                        levels = levels.splice(index, 1);
                    }
                }
    
                console.log(levels);
                */
                self.levels = levels;    
                self.generateHeatmap();
            }
        };

        xmlhttp.open("POST", "https://lib.surveys.gfk.com/4/DEV/Dimitar/Highlighter/demo/intersector.1.0.php", true); // + "?data=" + requestData, true);
        xmlhttp.send(requestData);
    }; 

    /**
     * Draws the heatmap from the generated levels array
     */
    this.generateHeatmap = function() {
        this.ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.parent.concept.image, 0, 0, this.parent.concept.width, this.parent.concept.height);
        this.ctx.globalAlpha = 0.8;

        this.colorMap = this.generateColorMap(this.levels.length);

        for(var i = 0; i < this.levels.length; i += 1) {
            var level = this.levels[i];
                        
            this.ctx.fillStyle = this.colorMap[i];
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = this.shadeRGBColor(this.colorMap[i], -.3);

            for(var j = 0; j < level.length; j += 1) {
                var rectangle = level[j];                

                this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height); 
                this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height); 
            }            
        }

        this.ctx.globalAlpha = 0.1;
        this.ctx.drawImage(this.parent.concept.image, 0, 0, this.parent.concept.width, this.parent.concept.height);

        if(this.legend.element === null) {            
            this.createLegend();
        }

        if(this.respFilter.element === null) {            
            this.createRespFilter();
        }        

        if(this.options.element === null) {            
            this.createOptions();
        }

        if(!this.areEventsAdded) {            
            this.setEvents();
        }
    };

    /**
     * Draws only a specific level of intersections activated by clicking the respective level in the legend
     * @param  {number} n - The number of the level to draw
     */
    this.drawLevel = function(n) {
        var level = this.levels[n];

        this.ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(this.parent.concept.image, 0, 0, this.parent.concept.width, this.parent.concept.height);
        this.ctx.globalAlpha = 0.8;
  
        this.ctx.fillStyle = this.colorMap[n];
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.shadeRGBColor(this.colorMap[n], -.3);

        for(var i = 0; i < level.length; i += 1) {
            var rectangle = level[i];                

            this.ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height); 
            this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height); 
        }         

        this.ctx.globalAlpha = 0.1;
        this.ctx.drawImage(this.parent.concept.image, 0, 0, this.parent.concept.width, this.parent.concept.height);        
    };

    /**
     * Creates a legend for the heatmap where each item calls the drawing of that specific level only
     * @return {[type]} [description]
     */
    this.createLegend = function() {
         var self = this;    

         this.legend.container = document.querySelector('table table + p + p .reportal_hide_print').parentNode;
         this.legend.element = document.createElement('ul');
         this.legend.element.id = 'heatmap-legend';
         this.legend.element.style.padding = '0';         

         this.legend.container.appendChild(this.legend.element);

         this.legend.header = document.createElement('h1'); 
         this.legend.header.innerHTML = '<hr><br>HEATMAP LEGEND';
         this.legend.element.appendChild(this.legend.header);        

         this.legend.subtitle = document.createElement('p');
         this.legend.subtitle.innerHTML = 'Click to show only one level';
         this.legend.element.appendChild(this.legend.subtitle);       

         for(var i = 0; i < this.levels.length; i += 1) {
            var level = this.levels[i];
            
            this.legend.levels[i] = document.createElement('li');

            this.legend.levels[i].innerHTML = 'Level ' + i;
            this.legend.levels[i].classList.add('level');
            this.legend.levels[i].style.background = this.colorMap[i];
            this.legend.levels[i].setAttribute('level', i);
            
            this.legend.levels[i].onclick = function(e) {
                var n = this.getAttribute('level');

                self.hoverLevel = parseInt(n);

                for(var j = 0; j < self.legend.levels.length; j += 1) {
                    var currentLevel = self.legend.levels[j];
                    currentLevel.classList.remove('active');
                }

                this.classList.add('active');

                self.drawLevel(n);
             };            

            this.legend.element.appendChild(this.legend.levels[i]);
         }

         this.legend.reset = document.createElement('li');
         this.legend.reset.innerHTML = '<strong>Reset</strong>';
         this.legend.reset.classList.add('level');
         this.legend.reset.classList.add('reset');

         this.legend.reset.onclick = function() {
            for(var i = 0; i < self.legend.levels.length; i += 1) {
                var currentLevel = self.legend.levels[i];

                self.hoverLevel = null;
                currentLevel.classList.remove('active');
            }            

            self.generateHeatmap();
         };   

         this.legend.element.appendChild(this.legend.reset);         
    };

    this.createRespFilter = function() {
        var self = this;

        this.respFilter.container = document.querySelector('table table + p + p .reportal_hide_print').parentNode;

        this.respFilter.element = document.createElement('div');
        this.respFilter.element.id = 'filter-respondents';

        this.respFilter.header = document.createElement('h1');
        this.respFilter.header.innerHTML = '<hr><br>RESPONDENTS FILTER';

        this.respFilter.subtitle = document.createElement('p');
        this.respFilter.subtitle.innerHTML = 'Enter each Respondent ID by which<br>you want to filter the heatmap<br>and hit <strong><u>SPACE</u></strong> to add it to the list';

        this.respFilter.list = document.createElement('textarea');
        this.respFilter.list.id = 'resp-filter-list';

        this.respFilter.entry = document.createElement('input');
        this.respFilter.entry.type = 'text';
        this.respFilter.entry.onkeyup = function() {
            if(this.value[this.value.length - 1] === ' ') {
                self.addRespondentToFilter(self, this);               
            }
        };

        this.respFilter.button = document.createElement('div');
        this.respFilter.button.innerHTML = 'Filter';
        this.respFilter.button.onclick = function() {
            self.filterRespondents(self);
        };

        this.respFilter.reset = document.createElement('div');
        this.respFilter.reset.innerHTML = 'Reset';      
        this.respFilter.reset.classList.add('reset');  
        this.respFilter.reset.onclick = function() {
            if(self.respFilter.data.length > 0) {
                self.resetRespondents(self);
            }
        };
        
        this.respFilter.element.appendChild(this.respFilter.header);
        this.respFilter.element.appendChild(this.respFilter.subtitle);
        this.respFilter.element.appendChild(this.respFilter.entry);
        this.respFilter.element.appendChild(this.respFilter.list);
        this.respFilter.element.appendChild(this.respFilter.button);
        this.respFilter.element.appendChild(this.respFilter.reset);

        this.respFilter.container.appendChild(this.respFilter.element);
    };

    this.addRespondentToFilter = function(self, input) {
        var value = parseInt(input.value.trim());
        
        if(!isNaN(value)) {
            self.respFilter.data.push(value);
            self.respFilter.list.innerHTML = self.respFilter.data.toString();
            self.respFilter.list.style.height = '';
            self.respFilter.list.style.height = self.respFilter.list.scrollHeight + 'px';
        }

        input.value = ''; 
    };

    this.resetRespondents = function(self) {
        self.respFilter.list.innerHTML = '';
        self.respFilter.data = [];
        self.levels = self.originalLevels;

        for(var i = 0; i < self.legend.levels.length; i += 1) {
            var currentLevel = self.legend.levels[i];

            self.hoverLevel = null;
            currentLevel.classList.remove('active');
        };

        self.generateHeatmap();
    };

    this.filterRespondents = function(self) {
        var levels = [];

        if(self.respFilter.data.length > 0) {
            for(var i = 0 ; i < self.levels.length; i +=1) {
                var level = self.levels[i];

                levels[i] = level.filter(function(lvl) {     
                    var len = 1;
                    var respondents = null;

                    respondents = lvl.respondents;
                    if(lvl.respondents.length > 1) {
                        respondents = lvl.respondents.split(',');  
                        len = respondents.length;              
                    }

                    for(var j = 0; j < len; j += 1) {
                        var respid = null;

                        if(len === 1) {
                            respid = parseInt(respondents);
                        } else {
                           respid = parseInt(respondents[j]);                            
                        }
                        
                        if(self.respFilter.data.indexOf(respid) !== -1) {
                            return lvl;                            
                        }
                    }
                });
            }

            self.originalLevels = self.levels;
            self.levels = levels;

            self.generateHeatmap();
        }        
    };

    /**
     * Creates the options menu for the heatmap
     */
    this.createOptions = function() {
        var self = this;
        var parent = document.querySelector(this.parent.canvasLocation);

        this.options.element = document.createElement('div');
        this.options.element.id = 'heatmap-options';

        this.options.exportImage = document.createElement('a');
        this.options.exportImage.innerHTML = 'Export as image';
        this.options.exportImage.id = 'export-heatmap';        
        this.options.exportImage.classList.add('option');
        this.options.exportImage.onclick = function(e) {
            self.exportImage(e);
        };

        this.options.exportData = document.createElement('a');
        this.options.exportData.innerHTML = 'Export data';
        this.options.exportData.id = 'export-data';        
        this.options.exportData.classList.add('option');
        this.options.exportData.onclick = function() {
            self.exportData();
        };

        this.options.element.appendChild(this.options.exportImage);
        // this.options.element.appendChild(this.options.exportData);

        parent.parentNode.insertBefore(this.options.element, parent);
    };

    this.exportImage = function(e) {
        var source = this.parent.canvas.toDataURL('image/jpeg');        
        var date = new Date();

        this.options.exportImage.download = 'heatmap-export-' + date.getTime() + '.jpg';
        e.target.href = source;
        console.log(this);
    };

    this.exportData = function() {
        // TODO: Implement
        console.info('TODO: Implement');
    };

    this.setEvents = function() {
        var self = this;

        this.parent.canvas.addEventListener('mousemove', function (e) { self.onMouseMove(e); }); // Desktop
        this.parent.canvas.addEventListener('touchmove', function (e) { self.onMouseMove(e); }); // Mobile
    };

    this.onMouseMove = function(e) {
        e.preventDefault();

        var coordinates = this.getMouseCoordinates(e);

            this.positionTooltip(e);

        if(this.foundMatch.x > coordinates.x || this.foundMatch.y > coordinates.y
            || (this.foundMatch.x + this.foundMatch.width) < coordinates.x
            || (this.foundMatch.y + this.foundMatch.height) < coordinates.y
        ) {
            if(this.hoverLevel === null) {
                this.generateHeatmap();
            } else {
                this.drawLevel(this.hoverLevel);
            }

            this.tooltip.element.remove();
            this.foundMatch = false;
        }

        for(var i = this.levels.length - 1; i >= 0; i -= 1) {
            if (this.hoverLevel !== null && i !== this.hoverLevel) {
                continue;
            }

            var level = this.levels[i];

            if(this.foundMatch) {
                break;
            }

            for(var j = level.length - 1; j >= 0 ; j -= 1) {
                var rectangle = level[j];

                if(rectangle.x < coordinates.x && rectangle.y < coordinates.y
                    && (rectangle.x + rectangle.width) > coordinates.x
                    && (rectangle.y + rectangle.height) > coordinates.y
                    && (rectangle.x !== this.foundMatch.x && rectangle.y !== this.foundMatch.y && rectangle.width !== this.foundMatch.width && rectangle.height !== this.foundMatch.height)
                ) {
                    this.ctx.globalAlpha = 0.8;
                    this.ctx.lineWidth = 8;
                    this.ctx.strokeStyle = 'red';
                    this.ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
                    this.foundMatch = rectangle;
                    this.matchColor = this.colorMap[i];

                    this.setTooltip(rectangle, e, i, j);
                    break;
                }
            }
        }
    };

    this.setTooltip = function(rectangle, e, i, j) {
        var respondentsLength = rectangle.respondents.length > 1 ? rectangle.respondents.split(',').length : 1;

        this.tooltip.element.classList.add('tooltip');
        this.tooltip.element.innerHTML = 
            '<center>Area ' + i + '-' + j + '</center>' +
            '<span><strong>Concept dimensions</strong><br>' + this.parent.concept.originalWidth + 'px' + ' x ' + this.parent.concept.originalHeight + 'px' + '</span>' +
            '<div><span class="tooltip-level"></span><strong>Level</strong>: ' + i + '</div>' +
            '<div><strong>Position in level</strong>: ' + j + '</div>' +
            '<div><strong>X</strong>: ' + rectangle.x + '</div>' +
            '<div><strong>Y</strong>: ' + rectangle.y + '</div>' +
            '<div><strong>Width</strong>: ' + rectangle.width + '</div>' +
            '<div><strong>Height</strong>: ' + rectangle.height + '</div>' +
            '<div><strong>Respondents count</strong>: ' + respondentsLength + '</div>' +
            '<div><strong>Respondents IDs</strong>: ' + rectangle.respondents + '</div>';

        document.body.appendChild(this.tooltip.element);

        document.querySelector('.tooltip center').style.background = this.colorMap[i];
        document.querySelector('.tooltip-level').style.background = this.colorMap[i];
    };

    this.positionTooltip = function(e) {
        this.tooltip.element.style.top = e.clientY - 150 + 'px';
        this.tooltip.element.style.left = e.clientX + 100 + 'px';
    };

    /**
     * Gets the mouse or touch X and Y coordinates in the canvas [TODO: MOVE TO THE PARENT CLASS!!!]
     * @param  {Object} e - The click event data
     * @return {Object} The X and Y coordinates of the mouse
     */
    this.getMouseCoordinates = function(e) {
        var canvasBounds = this.parent.canvas.getBoundingClientRect();
        var currentPosition = null;

        if(e.touches) {
            currentPosition = {
                x: (e.touches[0].clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left) * this.parent.canvas.width,
                y: (e.touches[0].clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top) * this.parent.canvas.height
            }
        } else {
            currentPosition = {
                x: (e.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left) * this.parent.canvas.width,
                y: (e.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top) * this.parent.canvas.height
            }            
        }
        
        this.lastMousePosition = currentPosition;
        return currentPosition;    
    };    

    /**
     * [generateColorMap description]
     * @param  {number} size - The number of levels for which to generate colors
     * @return {Array<string>} A map of colors to be used for the different heat levels of the interactions
     */
    this.generateColorMap = function(size) {
        var min = 1000,
            max = 10000, //40000
            range = max - min,
            delta = range / size,
            map = [];            
            
            for(var i = 0; i < size; i += 1) {
                var kelvin = delta * (i + 1),
                    color = this.colorTemperatureToRGB(kelvin);

                color = 'rgb(' + parseInt(color.r).toString() + ',' + parseInt(color.g).toString() + ',' + parseInt(color.b).toString() + ')';
                map.push(color);                
            }

            map.reverse();
            return map;
    };

    this.shadeRGBColor = function(color, percent) {
        var f=color.split(",");
        var t=percent<0?0:255;
        var p=percent<0?percent*-1:percent;
        var R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);

        return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
    }

    /**
     * Converts a temperature in Kelvin to an RGB color
     * @param  {number} kelvin - The temperature in Kelvin
     * @return {Object<number>} - The R, G and B values of the generated color
     */
    this.colorTemperatureToRGB = function(kelvin) {
        var temp = kelvin / 100;
        var red, green, blue;

        if(temp <= 66){ 
            red = 255;             
            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;
            
            if(temp <= 19){
                blue = 0;
            } else {
                blue = temp - 10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            }
        } else {
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);
            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492 );
            blue = 255;
        }

        return {
            r : this.clamp(red,   0, 255),
            g : this.clamp(green, 0, 255),
            b : this.clamp(blue,  0, 255)
        };
    };

    /**
     * Clamps a number between a minimum and a maximum value
     * @param  {number} x - The number to clamp
     * @param  {number} min - The minimal value for the clamping
     * @param  {number} max - The maximum value for the clamping
     * @return {number} The clamped number
     */
    this.clamp = function(x, min, max)  {
        if(x < min){ return min; }
        if(x > max){ return max; }

        return x;        
    }

    this.extractRequestData(); // Autostart on object instancing
}