# Mosaic
### A simple, responsive, [masonry](http://masonry.desandro.com/) like tile/grid system for Angular.

Works with [Bootstrap](http://getbootstrap.com/). Works with IE8 and above, must include [Respond.js](https://github.com/scottjehl/Respond) for IE8 to work:

```
	<!--[if lt IE 9]>
	  <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->
```

Getting Started
======

To install Angular Mosaic, you can simply use bower: 

```
bower install angular-mosaic --save
```

Mosaic works very similarly to [ng-repeat](https://code.angularjs.org/1.3.4/docs/api/ng/directive/ngRepeat), except that it doesn't repeat the element that it's on, instead it uses the transcluded element(s) within mosaic.  A quick example of this:

```
$scope.entities = ['one', 'two', 'three', 'four']
```

Then in your template file, add a simple iterator

```
	<ul mosaic="entity in entities">
		<li>{{entity}}</li>
	</ul>
```

This will work the same as an ng-repeat since it will only have one column because the css file hasn't been set.  For Mosaic to be compatible with all browsers and to exclude the need for javascript to duplicate css media queries logic, a 'layout' element is added within Mosaic.  Depending on the width of this layout element, it will set the amount of columns to display within mosaic