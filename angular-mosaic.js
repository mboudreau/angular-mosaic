(function ( window, angular, undefined ) {
angular.module('codinghitchhiker.mosaic', [])
	.directive('mosaic', function ($rootScope, $window, $interval) {
		return {
			restrict: 'AE',
			template: '<div class="layout"></div><div ng-repeat="column in columns" class="column column{{::$index+1}}"><div ng-repeat="lhs in column" class="item item{{::$index+1}}"><div mosaic-transclude></div></div></div>',
			transclude: true,
			priority: 1001,
			compile: function ($element, $attr) {
				var expression = $attr.mosaic;
				$element.addClass('mosaic');

				// Get left hand side, and right hand side elements
				var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)$/);
				if (!match) {
					throw "Expected expression in form of '_item_ in _collection_' but got '" + expression + "'.";
				}
				var lhs = match[1];
				var rhs = match[2];

				// Replace lhs in the template for the ngRepeat
				$element.html($element.html().replace('ng-repeat="lhs in column"', 'ng-repeat="' + lhs + ' in column"'));

				return function ($scope, $element) {

					// Watch the data for changes
					$scope.$watchCollection(rhs, function (newVal, oldVal) {
						updateColumns(newVal !== oldVal);
					});

					var lastWidth = 0, columnCount = 0;

					// Find layout element
					var layout = $element.children()[0];
					if (layout.className != 'layout') {
						throw "Layout element is not the first child element of Mosaic.  Template failure.";
					}

					function updateColumns(force) {
						// Make sure we're not re-rendering for no reason
						if (($window.innerWidth !== lastWidth && layout.offsetWidth !== columnCount) || force) {
							lastWidth = $window.innerWidth;
							$element.removeClass('col-' + columnCount);
							columnCount = layout.offsetWidth;
							$element.addClass('col-' + columnCount);
							var columns = [];

							//TODO: add caching solution for models, if possible

							angular.forEach($scope.$eval(rhs), function (value, index) {
								index = index % columnCount;
								if (!columns[index]) {
									columns[index] = [];
								}
								columns[index].push(value);
							});

							$scope.columns = columns;
						}
					}

					var timer = null;

					function onResize() {
						// Need to delay slightly or else the barrage of resize events
						// makes the updateColumns function go nuts
						if (timer) {
							$interval.cancel(timer);
						}
						timer = $interval(updateColumns, 50, 1);
					}

					// Listen for resize event
					angular.element($window).bind('resize', onResize);

					// Clean up
					$scope.$on("$destroy", function () {
						angular.element($window).unbind('resize', onResize);
					});
				}
			}
		};
	}).directive('mosaicTransclude', function () {
		return {
			restrict: 'EAC',
			link: function ($scope, $element, $attrs, controller, $transclude) {
				if (!$transclude) {
					throw minErr('ngTransclude')('orphan',
							'Illegal use of ngTransclude directive in the template! ' +
							'No parent directive that requires a transclusion found. ' +
							'Element: {0}',
						startingTag($element));
				}

				$transclude($scope, function (clone) {
					$element.empty();
					$element.append(clone);
				});
			}
		}
	});
})( window, window.angular );
