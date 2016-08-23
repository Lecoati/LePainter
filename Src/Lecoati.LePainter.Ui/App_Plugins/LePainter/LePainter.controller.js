﻿angular.module("umbraco").controller("LePainter",
    function ($scope, assetsService, $http, $timeout) {

        // Here we can apply settings and styles on the current grid row element
        var updateSettingStyle = function (obj, element) {

			var newClasses = [];	// Allow for multiple "class" elements 
			var isActive = false;
            		/* Native Grid Config Config */
			
			// 7.4.x class styling.  Retain "active state"
			if( element.attr("class").indexOf("-active") >= 0 || element.attr("class").indexOf("-active-child") >= 0 )
			{
				isActive = true;
				var currentClasses = element.attr("class");
				element.removeClass();
				element.addClass(element.data("originalClass"));
				if( currentClasses.indexOf("-active") >= 0 )
				{
					element.addClass("-active" );					
				}
				if( currentClasses.indexOf("-active-child") >= 0 )
				{
					element.addClass("-active-child" );					
				}
			}
			
			if( !isActive )
			{
				if (!element.data("originalClass")) {
					element.data("originalClass", element.attr("class"));
					newClasses.push(element.attr("class"));
				} else {
					newClasses.push(element.data("originalClass"));
				}
				element.removeClass();
				if (obj.config && Object.keys(obj.config).length > 0) {
					angular.forEach(Object.keys(obj.config), function (key, index) {
						if (key) {
							if (key == "class") {
								newClasses.push(obj.config[key]);
							}
							else
							{
								element.attr(key, obj.config[key]);
							}
						}
					});
				}
				element.addClass(newClasses.join(' '));
			}
			
			
            /* Native Grid Styles Config */
            if (element.data("initStyles")) {
                angular.forEach(element.data("initStyles").split(','), function (style, styleIndex) {
                    element.css(style, "");
                });
            }
		if( !isActive )
		{
	            var styles = [];
	            var innerObj = {
	                styles: {}
	            };

	            angular.forEach(obj.styles, function (style, styleIndex) {
	                var checkInnerStyles = styleIndex.split("inner-row-");

	                if (checkInnerStyles.length > 1) {
	                    innerObj.styles[checkInnerStyles[1]] = style;
	                }
	                else {
	                    element.css(styleIndex, style);
	                    styles.push(styleIndex);
	                }
	            });
	            element.data("initStyles", styles.join(','));
	            if (Object.keys(innerObj.styles).length > 0) {
	                updateSettingStyle(innerObj, element.find(".umb-row-inner"))
	            }
	    }
        }

        // Watch the grid's model
        var watchGridSettings = function () {
            $timeout(function () {
                $scope.$watch(function () {
                    var grids = [];
                    angular.forEach(angular.element($(".umb-grid")), function (value, key) {
                        grids.push(angular.element(value).scope().model.value)
                    });
                    return grids;
                },
                    function (newValue, oldValue) {
                        angular.forEach(newValue, function (value, key) {
                            if (value) {
                                if (value.sections) {
                                    angular.forEach(value.sections, function (section, sectionIndex) {
                                        angular.forEach(section.rows, function (row, rowIndex) {
                                            updateSettingStyle(row, $(".umb-grid:eq(" + key + ") .umb-column:eq(" + sectionIndex + ") .umb-row:eq(" + rowIndex + ")"))
                                            angular.forEach(row.areas, function (area, areaIndex) {
                                                updateSettingStyle(area, $(".umb-grid:eq(" + key + ") .umb-column:eq(" + sectionIndex + ") .umb-row:eq(" + rowIndex + ") .mainTd.umb-cell:eq(" + areaIndex + ")"));
                                            })
                                        });
                                    });
                                }
                            }
                        });
                    }
                 , true);
            }, 500);
        }

        // Needed after save&published to start the grid's model watching again
        var unsubscribe = $scope.$on("formSubmitted", function () {
            watchGridSettings();
        });

        watchGridSettings();

		function isMyScriptLoaded(url) {
			if (url) {
				var scripts = document.getElementsByTagName('script');
				for (var i = scripts.length; i--;) {
					if (scripts[i].src.indexOf(url) != -1) return true;
				}
			}
			return false;
		}
		
        // Style needed to improve the grid user experience 
        if ($scope.model.config && $scope.model.config.cssBackendPath && $scope.model.config.cssBackendPath != "") {
			var assetPaths = $scope.model.config.cssBackendPath.split(",");
			
			angular.forEach(assetPaths, function(assetPath) {
				assetPath = assetPath.replace(" ", "");
				
				if(assetPath.indexOf(".css") != -1) {
					assetsService.loadCss(assetPath);
				}
				else if(assetPath.indexOf(".js") != -1) {
					if(assetsService.loadedAssets[assetPath]) {
						delete assetsService.loadedAssets[assetPath];
					}
					assetsService.loadJs(assetPath);
				}
			});
        }

    });