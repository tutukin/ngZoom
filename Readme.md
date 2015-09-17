# Simple image zoomer for AngularJS 1.4

## Synopsis

somewhere in html:

```html
  <div id="imgContainer"
    zoom="http://lorempixel.com/200/300/sports/1/"
    zoom-full="http://lorempixel.com/600/900/sports/1/"
  ></div>
```

somewhere in css:

```css
#imgContainer .zoom .lens {
  border:2px solid #ccc;
  border-radius: 50% 50%;
}
```

See examples.

## TODO

1. Write docs
1. Implement min-scale, max-scale attributes
