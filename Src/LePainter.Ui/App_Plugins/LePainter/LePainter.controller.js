angular.module("umbraco").controller("LePainter",
    function ($scope, assetsService, $http, $timeout) {

        // Here we can apply settings and styles on the current grid row element
        var updateSettingStyle = function (obj, element) {

            /* Native Grid Styles Config */
            if (element.data("initStyles")) {
                angular.forEach(element.data("initStyles").split(','), function (style, styleIndex) {
                    element.css(style, "");
                });
            }
            var styles = [];
            angular.forEach(obj.styles, function (style, styleIndex) {
                element.css(styleIndex, style);
                styles.push(styleIndex);
            });
            element.data("initStyles", styles.join(','));

            /* Native Grid Config Config */
            if (!element.data("originalClass")) {
                element.data("originalClass", element.attr("class"));
            }
            element.removeClass();
            if (obj.config && Object.keys(obj.config).length > 0) {
                angular.forEach(Object.keys(obj.config), function (key, index) {
                    if (key) {
                        element.attr(key, obj.config[key]);
                    }
                });
            }
            element.addClass(element.data("originalClass"));

        }

        // Watch the grid's model
        var watchGridSettings = function () {
            $timeout(function () {
                $scope.$watch(function () {
                    var grids = [];
                    angular.forEach(angular.element($(".usky-grid")), function (value, key) {
                        grids.push($(value).scope().model.value)
                    });
                    return grids;
                },
                    function (newValue, oldValue) {
                        angular.forEach(newValue, function (value, key) {
                            if (value) {
                                if (value.sections) {
                                    angular.forEach(value.sections, function (section, sectionIndex) {
                                        angular.forEach(section.rows, function (row, rowIndex) {
                                            updateSettingStyle(row, $(".usky-grid:eq(" + key + ") .usky-column:eq(" + sectionIndex + ") .usky-row:eq(" + rowIndex + ")"))
                                            angular.forEach(row.areas, function (area, areaIndex) {
                                                updateSettingStyle(area, $(".usky-grid:eq(" + key + ") .usky-column:eq(" + sectionIndex + ") .usky-row:eq(" + rowIndex + ") .mainTd.usky-cell:eq(" + areaIndex + ")"));
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

        // Style needed to improve the grid user experience 
        if ($scope.model.config && $scope.model.config.cssBackendPath && $scope.model.config.cssBackendPath != "") {
            assetsService.loadCss($scope.model.config.cssBackendPath);
        }

    });