function el( className ) {
  return document.querySelector( '.js-' + className );
}

var mde = new SimpleMDE({ element: el( 'markdown-editor' ) } );
