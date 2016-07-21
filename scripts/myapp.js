(function () {
	//global object as namespace for any future need
	window.myapp = window.myapp || {};

	//execute code once everything is loaded
	window.onload = function () {
		//code here

		//create viz.json object 
		var myapp = window.myapp,
		    username = "ernestomb",
		    mapname = "Madrid Demographics",
		    diJSON = myapp.viz(username, mapname);

		//create dashboard
		cartodb.deepInsights.createDashboard('#dashboard', diJSON, {
	        no_cdn: false
	    }, function (err, dashboard) {

	    // Dasboard object
	    myapp.dashboard = dashboard;
	    console.log(dashboard)

	    // DI map
	    myapp.map = dashboard.getMap();
	    console.log(myapp.map)

	    // CDB map to add layers and so
	    myapp.Cmap = myapp.map.map;
	    console.log(myapp.Cmap)

	    // Get the widgets container so we can add custom ones
	    myapp.wcontainer = cdb.$('#' + dashboard._dashboard.dashboardView.$el.context.id + ' .CDB-Widget-canvasInner').get(0);

	    /* function to add widgets
	     * The options are described at: https://github.com/CartoDB/deep-insights.js/blob/master/doc/api.md
	     * BONUS: "sourceId" option lets you bound a widget to a node instead a of a layer ---> sourceId: mynode.id
	     */
	    myapp.addWidget = function (type, layer_index, options) {
	        try {
	            var layer = myapp.layers[layer_index];
	            switch (type) {
	            case 'category':
	                dashboard.createCategoryWidget(options, layer);
	                break;
	            case 'formula':
	                dashboard.createFormulaWidget(options, layer);
	                break;
	            case 'histogram':
	                dashboard.createHistogramWidget(options, layer);
	                break;
	            case 'timeseries':
	                dashboard.createTimeSeriesWidget(options, layer);
	                break;
	            }
	            myapp.widgets = dashboard.getWidgets();
	            myapp.widgetsdata = myapp.widgets.map(function (a) {
	                return a.dataviewModel
	            });
	            return 'OK';
	        } catch (error) {
	            return error;
	        }
	    }

	    /* Function to remove widgets based on the index in myapp.widgets array */
	    myapp.removeWidget = function (index) {
        myapp.widgets[index].remove();
        myapp.widgets = dashboard.getWidgets();
        myapp.widgetsdata = myapp.widgets.map(function (a) {
          return a.dataviewModel
        });
	    
    	}

    	/* Function to add nodes. We will need the nodes to associate widgets to layers
    	 */
    	myapp.addNode = function (options) {
    	    return myapp.map.analysis.analyse(options);
    	};

    	// Adding a source node for our layer
    	myapp.addNode({
    	    "id": "a0",
    	    "type": "source",
    	    "params": {
    	        "query": "SELECT * FROM mad_obs"
    	    },
    	    "options": {
    	        "table_name": "mad_obs"
    	    }
    	});

    	// Adding a layer to 'a0' node
    	myapp.Cmap.createCartoDBLayer({
    	    "source": 'a0',
    	    "name": 'Demographics',
    	    "cartocss": '/** Log-start scale */ @color0: #245668; @color1: #0f7279; @color2: #0d8f81; @color3: #39ab7e; @color4: #6ec574; @color5: #a9dc67; @color6: #edef5d; #mad_obs{polygon-opacity: 0.9; polygon-fill: @color0; line-opacity: 1; line-width: 0.5; line-color: lighten(@color0,5); [pol_density_norm>0.0032031678686663466]{polygon-fill: @color0; line-color: lighten(@color0,5); } [pol_density_norm>3.3504354284966062]{polygon-fill: @color1; line-color: lighten(@color1,5); } [pol_density_norm>7.309370915466278]{polygon-fill: @color2; line-color: lighten(@color2,5); } [pol_density_norm>12.15471635634918]{polygon-fill: @color3; line-color: lighten(@color3,5); } [pol_density_norm>18.40145308689086]{polygon-fill: @color4; line-color: lighten(@color4,5); } [pol_density_norm>27.20573401474345]{polygon-fill: @color5; line-color: lighten(@color5,5); } [pol_density_norm>42.2567516731377]{polygon-fill: @color6; line-color: lighten(@color6,5); } }'
    	});

    	// naming the layers array object
    	window.myapp.layers = myapp.map.getLayers();
    	console.log(myapp.layers)

    	// adding widgets to the dashboard, using the wrapped functions above
    	myapp.addWidget('formula', 1, {
    		"source":{"id":'a0'}, // this is the node to which we want to append the widget
    		"column":'pop_total',
    		"title":'Total Population selected',
    		"operation":'sum'
    	});

  	 	myapp.addWidget('histogram', 1, {
  			"source":{"id":'a0'},
  			"column":'pop_16_norm',
  			"title":'% population aged < 16',
  			"bins":10
  		})

    	myapp.addWidget('histogram', 1, {
    		"source":{"id":'a0'},
    		"column":'pop_64_norm',
    		"title":'% population > 64',
    		"bins":10
    	})

  	 	myapp.addWidget('histogram', 1, {
  			"source":{"id":'a0'},
  			"column":'pol_density_norm',
  			"title":'Population Density (0-100)',
  			"bins":4
  		})


	 	 	myapp.addWidget('histogram', 1, {
	 			"source":{"id":'a0'},
	 			"column":'fem_ratio',
	 			"title":'Women/Men ratio',
	 			"bins":5
	 		})

    	myapp.addWidget('formula', 1, {
    		"source":{"id":'a0'}, // this is the node to which we want to append the widget
    		"column":'fem',
    		"title":'Average number of women per census tract',
    		"operation":'avg'
    	});

    	myapp.addWidget('formula', 1, {
    		"source":{"id":'a0'}, // this is the node to which we want to append the widget
    		"column":'masc',
    		"title":'Average number of men per census tract',
    		"operation":'avg'
    	});

	  });

	};

})();