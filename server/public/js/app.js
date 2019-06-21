function main() {
  CSSPlugin.defaultTransformPerspective = 400

  TweenMax.to(".green", 3, {
    rotationX:360,
    scale: 2
  })
  TweenMax.to(".red", 3, {rotationY:360})

  TweenMax.to(".blue", 3, {x:100, y:100, scale:2, skewX:45, rotation:180})

  console.log('main')
  TweenMax.to("#title", 1, {x:100})
}

main()